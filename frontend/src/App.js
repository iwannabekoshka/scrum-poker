import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import LoginScreen from './components/LoginScreen.js';
import GameScreen from './components/GameScreen.js';
import TaskSidebar from './components/TaskSidebar.js';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const {
    isConnected,
    roomUsers,
    roomState,
    allVoted,
    tasks,
    currentTask,
    taskError,
    resetTrigger, // Получаем resetTrigger
    joinRoom,
    vote,
    revealVotes,
    resetVotes,
    addTask,
    deleteTask,
    selectTask,
    clearTaskError
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
        Статус: {isConnected ? '✅ Подключено' : '❌ Отключено'}
        {allVoted && <span style={{marginLeft: '10px', color: 'green'}}>✓ Все проголосовали</span>}
        <button onClick={handleReturnToLogin} className="return-btn">
          Выйти
        </button>
      </div>

      {taskError && (
        <div className="error-notification">
          {taskError}
          <button onClick={clearTaskError} className="close-error">×</button>
        </div>
      )}
      
      <div className="main-layout">
        <div className="game-area">
          <GameScreen
            roomId={roomId}
            roomUsers={roomUsers}
            roomState={roomState}
            allVoted={allVoted}
            currentTask={currentTask}
            resetTrigger={resetTrigger} // Передаем resetTrigger
            onVote={vote}
            onReveal={revealVotes}
            onReset={resetVotes}
          />
        </div>
        
        <div className="sidebar-area">
          <TaskSidebar
            tasks={tasks}
            currentTask={currentTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onSelectTask={selectTask}
          />
        </div>
      </div>      
    </div>
  );
}

export default App;