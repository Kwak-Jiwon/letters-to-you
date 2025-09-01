import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageCard from '../components/MessageCard';
import axios from 'axios';
import { API_URL } from '../apiConfig';

function MessagesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('로그아웃되었습니다.');
    navigate('/login');
  };

  // 🔽 생략되었던 이 부분이 가장 중요합니다!
  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(true);
      setError(null);
      console.log('편지 목록 조회를 시작합니다...');

      const token = localStorage.getItem('token');
      if (!token || token === 'undefined') {
        console.error('유효한 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      console.log('사용할 토큰:', token);

      try {
        const response = await axios.get(`${API_URL}/api/recipients/${projectId}/letters`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          timeout: 10000,
        });
        
        console.log('서버로부터 성공적으로 데이터를 받았습니다:', response.data);
        setLetters(response.data.letters || []);

      } catch (err) {
        console.error('편지 목록 조회 중 에러 발생:', err);
        if (err.code === 'ECONNABORTED') {
          setError('서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('인증에 실패했습니다. 다시 로그인해주세요.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('편지를 불러오는 데 실패했습니다.');
        }
      } finally {
        console.log('편지 목록 조회를 마칩니다.');
        setLoading(false);
      }
    };

    fetchLetters();
  }, [projectId, navigate]);
  // 🔼 여기까지가 생략된 부분이었습니다.

  if (loading) {
    return <div className="page-container"><h2>편지를 불러오는 중... 💌</h2></div>;
  }

  if (error) {
    return <div className="page-container"><h2>오류가 발생했습니다</h2><p>{error}</p></div>;
  }

  return (
    <div className="messages-page-container">
      <button 
        onClick={handleLogout} 
        className="main-button logout-button"
      >
        로그아웃
      </button>

      <h1>💌 도착한 메시지 💌</h1>
      <p className="subtitle">소중한 마음들이 당신을 기다리고 있어요.</p>
      
      <div className="message-grid">
        {letters.length === 0 ? (
          <p>아직 도착한 편지가 없어요. 친구들에게 링크를 공유해보세요!</p>
        ) : (
          letters.map((letter) => (
            <MessageCard key={letter.id} message={letter} />
          ))
        )}
      </div>
    </div>
  );
}

export default MessagesPage;