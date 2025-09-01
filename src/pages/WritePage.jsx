import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../apiConfig';

function WritePage() {
  const { projectId } = useParams();

  // States for letter content
  const [authorName, setAuthorName] = useState('');
  const [messageText, setMessageText] = useState('');

  // States for file attachments
  const [attachedImage, setAttachedImage] = useState(null); // 사용자가 직접 첨부하는 사진
  const imageInputRef = useRef(null);
  const [attachedAudio, setAttachedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- 🔽 셀카 기능 관련 state 및 ref 🔽 ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captureTriggered, setCaptureTriggered] = useState(false);
  const [attachedSelfie, setAttachedSelfie] = useState(null); // 자동으로 찍힌 셀카 파일

  // State for toast notification
  const [toastMessage, setToastMessage] = useState('');

  // 페이지 로드 시 카메라 권한 미리 요청
  useEffect(() => {
    const requestCameraPermission = async () => {
      console.log('카메라 권한을 미리 요청합니다...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('카메라 권한을 미리 확보했습니다.');
      } catch (err) {
        console.error('카메라 권한 요청 실패:', err);
        alert('카메라 권한이 거부되어 표정 스냅샷 기능을 사용할 수 없습니다. 이 기능을 사용하시려면 브라우저 설정에서 카메라 접근을 허용해주세요.');
      }
    };
    requestCameraPermission();
  }, []);

  // 토스트 알림 함수
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedImage(e.target.files[0]);
      console.log('선택된 이미지 파일:', e.target.files[0].name);
    }
  };

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedAudio(e.target.files[0]);
      console.log('선택된 오디오 파일:', e.target.files[0].name);
      setRecordedAudioURL(null);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioURL(audioUrl);
        setAttachedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAttachedAudio(null);
    } catch (err) {
      console.error('녹음을 시작할 수 없습니다:', err);
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTextAreaChange = (e) => {
    setMessageText(e.target.value);
    if (!captureTriggered && e.target.value.length >= 10) {
      setCaptureTriggered(true);
      const randomDelay = Math.random() * 15000; // 0~15초 사이 랜덤 딜레이
      console.log(`${(randomDelay / 1000).toFixed(1)}초 후에 셀카를 촬영합니다.`);
      setTimeout(() => {
        captureSelfie();
      }, randomDelay);
    }
  };

  // 셀카 촬영 함수 (안정성 강화 버전)
  const captureSelfie = async () => {
    console.log('[1] 셀카 촬영을 시작합니다.');
    let stream;
    try {
      const video = videoRef.current;
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (video) {
        video.srcObject = stream;
        video.play(); // 비디오를 명시적으로 재생합니다.
      }
    } catch (err) {
      console.error('카메라에 접근할 수 없습니다:', err);
      return;
    }

    await new Promise(resolve => {
      const video = videoRef.current;
      if (video) {
        console.log('[2] 비디오 재생 신호를 기다립니다...');
        video.onplaying = () => {
          console.log('[3] 비디오 재생 신호를 받았습니다!');
          resolve();
        };
      } else {
        console.error('[오류] videoRef가 없습니다.');
        resolve();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('[4] 0.2초 대기 후, 스크린샷을 촬영합니다.');

    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log('[5] 카메라를 끕니다.');
    stream.getTracks().forEach(track => track.stop());

    canvas.toBlob((blob) => {
      if (!blob) return;
      const selfieFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setAttachedSelfie(selfieFile);
      showToast('📸 깜짝 셀카가 촬영되었습니다!');
      console.log('[6] 셀카가 성공적으로 첨부되었습니다.');
    }, 'image/jpeg');
  };
  
  // 편지 전송 함수 (셀카 첨부 로직 추가)
  const handleSubmitMessage = async () => {
    if (!authorName || !messageText) {
      alert('이름과 편지 내용을 모두 작성해주세요.');
      return;
    }
    const formData = new FormData();
    formData.append('slug', projectId);
    formData.append('authorName', authorName);
    formData.append('messageText', messageText);

    if (attachedImage) {
      formData.append('image', attachedImage);
    }
    if (attachedAudio) {
      formData.append('audio', attachedAudio, 'recorded_audio.webm');
    }
    if (attachedSelfie) {
      formData.append('selfie', attachedSelfie);
      formData.append('selfieCapturedAt', new Date().toISOString());
    }

    try {
      const response = await axios.post(`${API_URL}/api/letters`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('편지 전송 성공:', response.data);
      alert('소중한 마음이 성공적으로 전달되었습니다!');
    } catch (error) {
      console.error('편지 전송 실패:', error.response ? error.response.data : error.message);
      alert(`편지 전송에 실패했습니다: ${error.response ? error.response.data.message : '서버에 문제가 발생했습니다.'}`);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-message-box">
        <h2>주인공의 한마디 💌</h2>
        <p>"여기에 주인공이 쓴 환영 메시지가 표시됩니다."</p>
      </div>

      <h2>편지 작성하기</h2>
      <div className="form-group">
        <label htmlFor="authorName">작성자 이름</label>
        <input
          id="authorName" type="text" placeholder="당신의 이름을 남겨주세요."
          value={authorName} onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="messageText">편지 내용</label>
        <textarea
          id="messageText"
          placeholder="따뜻한 마음을 담아 편지를 작성해주세요. (10자 이상 작성 시 잠시 후 셀카가 촬영됩니다!)"
          value={messageText}
          onChange={handleTextAreaChange}
        ></textarea>
      </div>

      <div className="form-group">
        <label>사진 첨부 (선택 사항)</label>
        <input
          type="file" accept="image/*" ref={imageInputRef}
          style={{ display: 'none' }} onChange={handleImageChange}
        />
        <button className="main-button" onClick={() => imageInputRef.current.click()}>
          사진 선택
        </button>
        {attachedImage && <span style={{ marginLeft: '10px' }}>{attachedImage.name || '선택됨'}</span>}
      </div>

      <div className="form-group">
        <label>음성 메시지 (선택 사항)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="file" accept="audio/*" ref={audioInputRef}
            style={{ display: 'none' }} onChange={handleAudioChange}
          />
          <button className="main-button" onClick={() => audioInputRef.current.click()}>
            음성 파일 가져오기
          </button>
          {!isRecording ? (
            <button className="main-button" onClick={startRecording}>
              지금 녹음하기
            </button>
          ) : (
            <button className="main-button stop-recording-button" onClick={stopRecording}>
              녹음 중지
            </button>
          )}
        </div>
        {isRecording && <p style={{ color: 'red', marginTop: '10px' }}>녹음 중... 🔴</p>}
        {(attachedAudio && !isRecording) && (
          <div style={{ marginTop: '15px' }}>
            <p>첨부된 오디오:</p>
            <audio controls src={recordedAudioURL || URL.createObjectURL(attachedAudio)} className="card-audio"></audio>
          </div>
        )}
      </div>

      <button className="main-button" onClick={handleSubmitMessage} style={{ marginTop: '2rem' }}>
        소중한 마음 보내기
      </button>

      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>

      <p style={{ marginTop: '1rem', color: '#888' }}>Project ID: {projectId}</p>
    </div>
  );
}

export default WritePage;

