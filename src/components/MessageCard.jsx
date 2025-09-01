import React from 'react';
import './MessageCard.css';
import { API_URL } from '../apiConfig'; // API_URL import

function MessageCard({ message }) {
  // API 응답 필드명에 맞게 수정: imagePath, audioPath
  const { authorName, messageText, imagePath, audioPath } = message;

  // 전체 이미지/오디오 URL 생성
  const fullImageUrl = imagePath ? `${API_URL}${imagePath}` : null;
  const fullAudioUrl = audioPath ? `${API_URL}${audioPath}` : null;

  return (
    <div className="card">
      {fullImageUrl && <img src={fullImageUrl} alt="첨부된 이미지" className="card-image" />}
      
      <div className="card-content">
        <p className="card-text">"{messageText}"</p>

        {fullAudioUrl && (
          <audio controls className="card-audio">
            <source src={fullAudioUrl} type="audio/mpeg" />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        )}
        {/* API 응답 필드명에 맞게 수정: authorName */}
        <p className="card-author">- {authorName} 드림 -</p>
      </div>
    </div>
  );
}

export default MessageCard;