import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import WritePage from './pages/WritePage';
import LoginPage from './pages/LoginPage';
import MessagesPage from './pages/MessagesPage';
import SharePage from './pages/SharePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/share/:projectId" element={<SharePage />} />
          <Route path="/project/:projectId" element={<WritePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/messages/:projectId" element={<MessagesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;