import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios import
import { API_URL } from '../apiConfig'; // API URL import

function CreatePage() {
  const [name, setName] = useState(''); // API에 맞는 필드명으로 변경
  const [accessCode, setAccessCode] = useState(''); // API에 맞는 필드명으로 변경
  const [eventDate, setEventDate] = useState(''); // eventDate 필드 추가

  const navigate = useNavigate();

  const handleCreateProject = async () => { // async 추가
    if (!name || !accessCode || !eventDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/recipients`, {
        name: name,
        accessCode: accessCode,
        eventDate: eventDate,
      });

      // API 호출 성공 시
      const slug = response.data.recipient.slug;
      console.log('생성된 Recipient 정보:', response.data);
      alert('프로젝트가 성공적으로 생성되었습니다!');
      navigate(`/share/${slug}`); // API가 돌려준 slug 값으로 공유 페이지 이동

    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다. 서버 로그를 확인해보세요.');
    }
  };

  return (
    <div className="page-container">
      <h1>나만의 추억 상자 만들기</h1>
      
      <div className="form-group">
        <label>주인공 이름 (ID)</label>
        <input
          type="text"
          placeholder="주인공의 이름 또는 사용할 ID"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>비밀번호 설정</label>
        <input
          type="password"
          placeholder="나중에 편지를 확인할 때 사용할 비밀번호"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>기념일 날짜</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
      </div>

      <button className="main-button" onClick={handleCreateProject}>
        공유 링크 생성하기
      </button>
    </div>
  );
}

export default CreatePage;