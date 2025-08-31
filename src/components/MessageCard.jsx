import React from 'react';
import './MessageCard.css';

// 이제 message prop을 필수로 받으므로, 내부의 예시 데이터는 삭제합니다.
function MessageCard({ message }) {
  const { author, text, imageUrl, audioUrl } = message;

  return (
    <div className="card">
      {/* imageUrl이 있을 때만 img 태그를 보여줍니다. */}
      {imageUrl && <img src={imageUrl} alt="첨부된 이미지" className="card-image" />}
      
      <div className="card-content">
        <p className="card-text">"{text}"</p>

        {/* audioUrl이 있을 때만 audio 태그를 보여줍니다. */}
        {audioUrl && (
          <audio controls className="card-audio">
            <source src={audioUrl} type="audio/mpeg" />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        )}
        <p className="card-author">- {author} 드림 -</p>
      </div>
    </div>
  );
}

export default MessageCard;