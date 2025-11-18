import React, { useState } from 'react';

const LoginScreen = ({ onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && roomId.trim()) {
      onJoinRoom(username, roomId);
    }
  };

  return (
    <div className="login-screen">
      <h1>🎯 Scrum Poker</h1>
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ваше имя"
            maxLength="20"
          />
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ID комнаты"
            maxLength="20"
          />
          <button type="submit">Присоединиться</button>
        </form>
        <p className="hint">
          Если комнаты не существует, она будет создана автоматически
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;