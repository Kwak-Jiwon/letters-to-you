import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="page-container">
      <h1>너와 나의 추억 상자</h1>
      <p>친구들과 함께하는 특별한 기념일 페이지를 만들어보세요.</p>
      <Link to="/create">
        <button className="main-button">내 추억 상자 만들러 가기</button>
      </Link>
    </div>
  );
}

export default HomePage;