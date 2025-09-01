import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../apiConfig';


function LoginPage() {
  const [projectId, setProjectId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => { // async 추가
    if (!projectId || !password) {
      alert('ID와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/recipients/login`, {
        slug: projectId, // API 명세에 맞게 slug 사용
        accessCode: password, // API 명세에 맞게 accessCode 사용
      });

      const { token } = response.data;

      // API 명세대로 토큰을 localStorage에 저장합니다.
      localStorage.setItem('token', token);
      
      alert('로그인 성공!');
      navigate(`/messages/${projectId}`); // 메시지 페이지로 이동

    } catch (error) {
      console.error('로그인 실패:', error);
      alert('ID 또는 비밀번호가 일치하지 않습니다.');
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