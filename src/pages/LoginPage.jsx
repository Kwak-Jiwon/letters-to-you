import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [projectId, setProjectId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // localStorage에서 ID에 해당하는 프로젝트 정보를 가져옵니다.
    const storedDataString = localStorage.getItem(projectId);

    if (!storedDataString) {
      alert('존재하지 않는 ID입니다.');
      return;
    }

    const storedData = JSON.parse(storedDataString);

    // 저장된 비밀번호와 입력한 비밀번호가 일치하는지 확인합니다.
    if (storedData.pw === password) {
      // 로그인 성공! sessionStorage에 로그인 상태와 ID를 저장합니다.
      sessionStorage.setItem('auth', JSON.stringify({ loggedIn: true, projectId: projectId }));
      alert('로그인 성공!');
      navigate(`/messages/${projectId}`); // 메시지 페이지로 이동
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="page-container">
      <h1>편지 확인하기</h1>
      <p>프로젝트 생성 시 설정한 ID와 비밀번호를 입력해주세요.</p>
      
      <div className="form-group">
        <label>프로젝트 ID</label>
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button className="main-button" onClick={handleLogin}>입장하기</button>
    </div>
  );
}

export default LoginPage;