import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import LoginScreen from '../components/LoginScreen.js';
import GameScreen from '../components/GameScreen.js';
import TaskSidebar from '../components/TaskSidebar.js';

const RoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledUsername = location.state?.username || '';
  const [hasJoined, setHasJoined] = useState(Boolean(prefilledUsername));
  const [lastTriedUsername, setLastTriedUsername] = useState(prefilledUsername);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  const {
    isConnected,
    roomUsers,
    roomState,
    allVoted,
    tasks,
    currentTask,
    taskError,
    resetTrigger,
    currentUser,
    joinError,
    scaleError,
    joinRoom,
    vote,
    revealVotes,
    resetVotes,
    addTask,
    deleteTask,
    selectTask,
    updateTaskTime,
    clearTaskError,
    clearJoinError,
    changeScale,
    clearScaleError
  } = useSocket();

  const handleJoinRoom = useCallback(
    (username) => {
      if (!roomId) {
        return;
      }

      setHasJoined(true);
      setLastTriedUsername(username);
      clearJoinError();
      joinRoom(roomId, username);
    },
    [roomId, joinRoom, clearJoinError]
  );

  useEffect(() => {
    if (
      !autoJoinAttempted &&
      prefilledUsername &&
      roomId
    ) {
      setAutoJoinAttempted(true);
      handleJoinRoom(prefilledUsername);
    }
  }, [autoJoinAttempted, prefilledUsername, roomId, handleJoinRoom]);

  useEffect(() => {
    if (joinError) {
      setHasJoined(false);
    }
  }, [joinError]);

  const handleLeaveRoom = () => {
    navigate('/', { replace: true });
  };

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  if (!hasJoined) {
    return (
      <LoginScreen
        onJoinRoom={(username) => handleJoinRoom(username)}
        requireRoomId={false}
        defaultRoomId={roomId}
        defaultUsername={lastTriedUsername}
        title="Вход в комнату"
        errorMessage={joinError}
        submitLabel="Войти"
      />
    );
  }

  return (
    <div className="app">
      <div className="connection-indicator">
        <div className="user-info">
          Вы: <strong>{currentUser?.name || lastTriedUsername}</strong>
        </div>
        Статус: {isConnected ? '✅ Подключено' : '❌ Отключено'}
        {allVoted && (
          <span style={{ marginLeft: '10px', color: 'green' }}>✓ Все проголосовали</span>
        )}
        <button onClick={handleLeaveRoom} className="return-btn">
          Выйти
        </button>
      </div>

      {taskError && (
        <div className="error-notification">
          {taskError}
          <button onClick={clearTaskError} className="close-error">
            ×
          </button>
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
            resetTrigger={resetTrigger}
            currentUser={currentUser}
            onVote={vote}
            onReveal={revealVotes}
            onReset={resetVotes}
            scaleKey={roomState.scaleKey}
            scaleValues={roomState.scaleValues}
            availableScales={roomState.availableScales}
            onScaleChange={changeScale}
            scaleError={scaleError}
            onClearScaleError={clearScaleError}
          />
        </div>

        <div className="sidebar-area">
          <TaskSidebar
            tasks={tasks}
            currentTask={currentTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onSelectTask={selectTask}
            onUpdateTaskTime={updateTaskTime}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;

