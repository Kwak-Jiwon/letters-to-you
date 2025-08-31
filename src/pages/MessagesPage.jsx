import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageCard from '../components/MessageCard';
import { dummyMessages } from '../data/dummyMessages';

function MessagesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // ...로그인 확인 로직은 그대로...
  }, [projectId, navigate]);

  return (
    // 바로 이 부분의 className이 "messages-page-container"가 맞는지 확인하세요!
    <div className="messages-page-container">
      <h1>
        <span role="img" aria-label="heart">💌</span> 도착한 메시지 <span role="img" aria-label="heart">💌</span>
      </h1>
      <p className="subtitle">소중한 마음들이 당신을 기다리고 있어요.</p>
      
      <div className="message-grid">
        {dummyMessages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}

export default MessagesPage;