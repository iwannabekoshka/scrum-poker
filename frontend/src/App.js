import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import LoginScreen from './components/LoginScreen.js';
import GameScreen from './components/GameScreen.js';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const {
    isConnected,
    roomUsers,
    roomState,
    joinRoom,
    vote,
    revealVotes,
    resetVotes
  } = useSocket();

  const handleJoinRoom = (username, roomId) => {
    setUsername(username);
    setRoomId(roomId);
    joinRoom(roomId, username);
    setCurrentScreen('game');
  };

  const handleReturnToLogin = () => {
    setCurrentScreen('login');
    setRoomId('');
    setUsername('');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onJoinRoom={handleJoinRoom} />;
  }

  return (
    <div className="app">
      <div className="connection-indicator">
        Статус: {isConnected ? 'Подключено' : 'Отключено'}, User: {username}
        <button onClick={handleReturnToLogin} className="return-btn">
          Выйти
        </button>
      </div>
      
      <GameScreen
        roomId={roomId}
        roomUsers={roomUsers}
        roomState={roomState}
        onVote={vote}
        onReveal={revealVotes}
        onReset={resetVotes}
      />
    </div>
  );
}

export default App;