import React, { useState, useRef } from 'react'; // useRef 추가
import { useParams } from 'react-router-dom';

function WritePage() {
  const { projectId } = useParams();

  // 1. 편지 내용 관련 state
  const [authorName, setAuthorName] = useState('');
  const [messageText, setMessageText] = useState('');

  // 2. 사진 첨부 관련 state
  const [attachedImage, setAttachedImage] = useState(null); // File 객체 또는 URL
  const imageInputRef = useRef(null); // 파일 인풋 DOM에 접근하기 위한 Ref

  // 3. 음성 메시지 관련 state
  const [attachedAudio, setAttachedAudio] = useState(null); // File 객체 또는 URL
  const [isRecording, setIsRecording] = useState(false); // 녹음 중인지 여부
  const [recordedAudioURL, setRecordedAudioURL] = useState(null); // 녹음된 오디오 URL
  const audioInputRef = useRef(null); // 오디오 인풋 DOM에 접근하기 위한 Ref
  const mediaRecorderRef = useRef(null); // MediaRecorder 인스턴스 저장
  const audioChunksRef = useRef([]); // 녹음된 오디오 데이터 조각들

  // 4. 사진 파일 변경 핸들러
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedImage(e.target.files[0]); // 파일 객체 저장
      // 실제 프로젝트에서는 이 파일을 서버(Firebase Storage)에 업로드합니다.
      console.log('선택된 이미지 파일:', e.target.files[0].name);
    }
  };

  // 5. 음성 파일 변경 핸들러
  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedAudio(e.target.files[0]); // 파일 객체 저장
      console.log('선택된 오디오 파일:', e.target.files[0].name);
      setRecordedAudioURL(null); // 파일 선택 시 녹음된 오디오 초기화
    }
  };

  // 6. 녹음 시작 핸들러
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
        setRecordedAudioURL(audioUrl); // 녹음된 오디오 URL 저장
        setAttachedAudio(audioBlob); // Blob 자체도 저장 (나중에 서버 전송용)
        stream.getTracks().forEach(track => track.stop()); // 마이크 사용 중지
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAttachedAudio(null); // 녹음 시작 시 기존 첨부 오디오 초기화
    } catch (err) {
      console.error('녹음을 시작할 수 없습니다:', err);
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
    }
  };

  // 7. 녹음 중지 핸들러
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 8. 편지 전송 핸들러 (지금은 콘솔에만 출력)
  const handleSubmitMessage = () => {
    console.log('--- 편지 전송 ---');
    console.log('작성자 이름:', authorName);
    console.log('편지 내용:', messageText);
    console.log('첨부된 이미지:', attachedImage ? attachedImage.name : '없음');
    console.log('첨부된 오디오:', attachedAudio ? (attachedAudio.name || '녹음된 오디오') : '없음');
    console.log('프로젝트 ID:', projectId);

    alert('소중한 마음이 전달되었습니다! (실제 저장 기능은 백엔드 필요)');
    // 나중에는 이 데이터를 Firebase로 전송합니다.
    // 전송 후에는 보통 ThanksPage로 이동시킵니다.
  };

  return (
    <div className="page-container">
      {/* 나중에는 projectId를 이용해 DB에서 환영 메시지를 가져와 보여줍니다. */}
      <div className="welcome-message-box">
        <h2>주인공의 한마디 💌</h2>
        <p>"여기에 주인공이 쓴 환영 메시지가 표시됩니다."</p>
      </div>

      <h2>편지 작성하기</h2>
      <div className="form-group">
        <label htmlFor="authorName">작성자 이름</label>
        <input
          id="authorName"
          type="text"
          placeholder="당신의 이름을 남겨주세요."
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="messageText">편지 내용</label>
        <textarea
          id="messageText"
          placeholder="따뜻한 마음을 담아 편지를 작성해주세요."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        ></textarea>
      </div>

      {/* 9. 사진 첨부 UI */}
      <div className="form-group">
        <label>사진 첨부 (선택 사항)</label>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          style={{ display: 'none' }} // 실제 인풋은 숨기고 버튼으로 트리거
          onChange={handleImageChange}
        />
        <button className="main-button" onClick={() => imageInputRef.current.click()}>
          사진 선택
        </button>
        {attachedImage && <span style={{ marginLeft: '10px' }}>{attachedImage.name || '선택됨'}</span>}
      </div>

      {/* 10. 음성 메시지 첨부 UI */}
      <div className="form-group">
        <label>음성 메시지 (선택 사항)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* 음성 파일 가져오기 */}
          <input
            type="file"
            accept="audio/*"
            ref={audioInputRef}
            style={{ display: 'none' }}
            onChange={handleAudioChange}
          />
          <button className="main-button" onClick={() => audioInputRef.current.click()}>
            음성 파일 가져오기
          </button>

          {/* 녹음 버튼 */}
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
        
        {/* 녹음 중 상태 표시 */}
        {isRecording && <p style={{ color: 'red', marginTop: '10px' }}>녹음 중... 🔴</p>}

        {/* 선택/녹음된 오디오 미리듣기 */}
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

      <p style={{ marginTop: '1rem', color: '#888' }}>Project ID: {projectId}</p>
    </div>
  );
}

export default WritePage;