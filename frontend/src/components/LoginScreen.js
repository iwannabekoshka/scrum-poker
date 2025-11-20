import React, { useEffect, useState } from 'react';

const LoginScreen = ({
  onJoinRoom,
  defaultRoomId = '',
  defaultUsername = '',
  requireRoomId = true,
  title = '🃏 Scrum Poker',
  errorMessage = '',
  submitLabel = 'Присоединиться'
}) => {
  const [username, setUsername] = useState(defaultUsername);
  const [roomId, setRoomId] = useState(defaultRoomId);

  useEffect(() => {
    setRoomId(defaultRoomId);
  }, [defaultRoomId]);

  useEffect(() => {
    setUsername(defaultUsername);
  }, [defaultUsername]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const roomValue = requireRoomId ? roomId.trim() : defaultRoomId.trim();

    if (!trimmedUsername) {
      return;
    }

    if (requireRoomId && !roomValue) {
      return;
    }

    onJoinRoom(trimmedUsername, roomValue);
  };

  return (
    <div className="login-screen">
      <h1>{title}</h1>
      <div className="login-form">
        {errorMessage && <div className="form-error">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ваше имя"
            maxLength="20"
            autoFocus
          />
          {requireRoomId ? (
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ID комнаты"
              maxLength="20"
            />
          ) : (
            <div className="room-id-indicator">
              Комната: <strong>{defaultRoomId}</strong>
            </div>
          )}
          <button type="submit">{submitLabel}</button>
        </form>
        {requireRoomId && (
          <p className="hint">
            Если комнаты не существует, она будет создана автоматически
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;