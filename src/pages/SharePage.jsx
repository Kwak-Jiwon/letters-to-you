import React from 'react';
import { useParams, Link } from 'react-router-dom';

function SharePage() {
  const { projectId } = useParams();
  const shareUrl = `${window.location.origin}/project/${projectId}`;

  const handleCopyClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('클립보드에 링크가 복사되었어요!');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="page-container">
      <h1>프로젝트 생성 완료! ✨</h1>
      <p>아래 링크를 친구들에게 공유해서 메시지를 받아보세요.</p>
      
      <div className="share-link-box">
        {shareUrl}
      </div>

      <button onClick={handleCopyClipBoard} className="main-button">
        링크 복사하기
      </button>

      <Link to={`/project/${projectId}`} style={{marginTop: '1rem', display: 'block'}}>
        내 프로젝트 페이지로 가보기
      </Link>
    </div>
  );
}

export default SharePage;