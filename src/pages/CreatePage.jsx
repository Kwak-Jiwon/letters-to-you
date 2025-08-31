import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 중복 확인을 위한 가짜 ID 목록 (원래는 DB에서 확인해야 함)
const fakeUsedIds = ['love', 'happy', 'birthday'];

function CreatePage() {
  const [projectId, setProjectId] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false); // ID 중복 확인 여부
  const navigate = useNavigate();

  // ID 중복 확인 핸들러
  const handleCheckId = () => {
    if (!projectId) {
      alert('사용할 ID를 입력해주세요.');
      return;
    }
    if (fakeUsedIds.includes(projectId)) {
      alert('이미 사용 중인 ID입니다. 다른 ID를 입력해주세요.');
      setIsIdChecked(false);
    } else {
      alert('사용 가능한 ID입니다!');
      setIsIdChecked(true);
    }
  };

  // ID 입력값이 바뀔 때마다 중복 확인 상태 초기화
  const handleIdChange = (e) => {
    setProjectId(e.target.value);
    setIsIdChecked(false);
  };

  // 프로젝트 생성 핸들러
  const handleCreateProject = () => {
    if (!isIdChecked) {
      alert('ID 중복 확인을 먼저 해주세요.');
      return;
    }
    if (!password || !welcomeMessage) {
      alert('비밀번호와 환영 메시지를 모두 입력해주세요.');
      return;
    }

    // 백엔드 대신 브라우저의 localStorage에 프로젝트 정보 저장
    const projectData = {
      id: projectId,
      pw: password,
      welcome: welcomeMessage,
    };
    localStorage.setItem(projectId, JSON.stringify(projectData));

    console.log('저장된 프로젝트 정보:', projectData);
    navigate(`/share/${projectId}`);
  };

  return (
    <div className="page-container">
      <h1>나만의 추억 상자 만들기</h1>
      
      <div className="form-group">
        <label>프로젝트 ID</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="사용할 ID를 입력하세요 (예: my-love)"
            value={projectId}
            onChange={handleIdChange}
          />
          <button className="main-button" onClick={handleCheckId}>
            중복 확인
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>비밀번호 설정</label>
        <input
          type="password"
          placeholder="나중에 편지를 확인할 때 사용할 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>환영 메시지</label>
        <input
          type="text"
          placeholder="친구들에게 보여줄 메시지를 적어주세요."
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
        />
      </div>

      <button className="main-button" onClick={handleCreateProject}>
        공유 링크 생성하기
      </button>
    </div>
  );
}

export default CreatePage;