import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen.js';
import RoomPage from './pages/RoomPage.js';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleJoinRoom = (username, roomId) => {
    if (!roomId) {
      return;
    }

    navigate(`/room/${encodeURIComponent(roomId)}`, {
      state: { username }
    });
  };

  return (
    <LoginScreen
      onJoinRoom={handleJoinRoom}
      requireRoomId={true}
      submitLabel="Перейти в комнату"
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;