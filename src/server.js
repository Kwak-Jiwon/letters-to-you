// src/server.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const publicUrl = process.env.PUBLIC_URL || 'http://localhost:5173';

// 기본 미들웨어
app.use(cors({
  origin: [publicUrl, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// 업로드 폴더 준비
const uploadsRoot = path.join(__dirname, '../uploads');
const imagesRoot = path.join(uploadsRoot, 'images');
const audioRoot = path.join(uploadsRoot, 'audio');
fs.mkdirSync(imagesRoot, { recursive: true });
fs.mkdirSync(audioRoot, { recursive: true });

// 정적 제공 (개발용)
app.use('/media', express.static(uploadsRoot));

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.fieldname === 'audio';
    cb(null, isAudio ? audioRoot : imagesRoot);
  },
  filename: (req, file, cb) => {
    const id = randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/x-m4a'];
    const ok = (file.fieldname === 'image' && imageTypes.includes(file.mimetype)) ||
               (file.fieldname === 'audio' && audioTypes.includes(file.mimetype));
    if (!ok) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

// 간단 슬러그 생성 (겹치면 재시도)
async function makeUniqueSlug() {
  let slug = randomUUID().slice(0, 8);
  while (await prisma.recipient.findUnique({ where: { slug } })) {
    slug = randomUUID().slice(0, 8);
  }
  return slug;
}

// 수신자 인증 미들웨어
function requireRecipientAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.recipientId = payload.recipientId;
    req.recipientSlug = payload.slug;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 제출 스팸 방지 (IP당 5분에 5회)
const letterLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// 1) 수신자 생성
app.post('/api/recipients', async (req, res) => {
  try {
    const { name, eventDate, accessCode } = req.body || {};
    if (!name || !accessCode) {
      return res.status(400).json({ error: 'name and accessCode are required' });
    }

    const slug = await makeUniqueSlug();
    const hash = await bcrypt.hash(accessCode, 10);

    const created = await prisma.recipient.create({
      data: {
        name,
        accessCodeHash: hash,
        slug,
        eventDate: eventDate ? new Date(eventDate) : null
      }
    });

    const shareUrl = `${publicUrl}/r/${created.slug}`;

    res.json({
      recipient: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        eventDate: created.eventDate,
        createdAt: created.createdAt
      },
      shareUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipient' });
  }
});

// 2) 수신자 로그인 → 토큰 발급
app.post('/api/recipients/login', async (req, res) => {
  try {
    const { slug, accessCode } = req.body || {};
    if (!slug || !accessCode) return res.status(400).json({ error: 'slug and accessCode are required' });

    const r = await prisma.recipient.findUnique({ where: { slug } });
    if (!r) return res.status(404).json({ error: 'Recipient not found' });

    const ok = await bcrypt.compare(accessCode, r.accessCodeHash);
    if (!ok) return res.status(401).json({ error: 'Access denied' });

    const token = jwt.sign({ recipientId: r.id, slug: r.slug }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, recipient: { name: r.name, slug: r.slug } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3) 편지 제출 (공개 폼)
app.post('/api/letters', letterLimiter, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { slug, authorName, messageText } = req.body || {};
    if (!slug) return res.status(400).json({ error: 'slug is required' });

    const recipient = await prisma.recipient.findUnique({ where: { slug } });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    const imageFile = req.files?.image?.[0] || null;
    const audioFile = req.files?.audio?.[0] || null;

    if (!authorName && !messageText && !imageFile && !audioFile) {
      return res.status(400).json({ error: 'At least one of authorName, messageText, image, audio is required' });
    }

    const imagePath = imageFile ? `/media/images/${path.basename(imageFile.path)}` : null;
    const audioPath = audioFile ? `/media/audio/${path.basename(audioFile.path)}` : null;

    const created = await prisma.letter.create({
      data: {
        recipientId: recipient.id,
        authorName: authorName || '익명',
        messageText: messageText || null,
        imagePath,
        audioPath
      }
    });

    res.json({
      letter: {
        id: created.id,
        authorName: created.authorName,
        messageText: created.messageText,
        imagePath: created.imagePath,
        audioPath: created.audioPath,
        createdAt: created.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit letter' });
  }
});

// 4) 수신자 전용 – 편지 목록
app.get('/api/recipients/:slug/letters', requireRecipientAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    if (slug !== req.recipientSlug) return res.status(403).json({ error: 'Forbidden' });

    const recipient = await prisma.recipient.findUnique({ where: { slug } });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    const letters = await prisma.letter.findMany({
      where: { recipientId: recipient.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ letters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch letters' });
  }
});

app.listen(port, () => {
  console.log(`API on http://localhost:${port}`);
});
