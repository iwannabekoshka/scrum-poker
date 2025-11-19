import React, { useState, useEffect } from 'react';
import UserList from './UserList.js';
import VotingCards from './VotingCards.js';
import Controls from './Controls.js';

const GameScreen = ({ 
  roomId, 
  roomUsers, 
  roomState, 
  allVoted, 
  currentTask, 
  resetTrigger,
  currentUser, // Добавляем currentUser
  onVote, 
  onReveal, 
  onReset,
  scaleKey,
  scaleValues,
  availableScales,
  onScaleChange,
  scaleError,
  onClearScaleError
}) => {
  const [taskTitle, setTaskTitle] = useState('Оцените задачу');
  const formatTime = (time) => {
    if (time === null || time === undefined || time === '') {
      return '—';
    }
    return Number(time).toFixed(2).replace(/\.?0+$/, '');
  };

  useEffect(() => {
    if (currentTask) {
      setTaskTitle(currentTask.title);
    } else {
      setTaskTitle('Оцените задачу');
    }
  }, [currentTask]);

  const hasActiveVotes = roomUsers.some((user) => user.voted);

  return (
    <div className="game-screen">
      <header className="game-header">
        <h2>Комната: <span className="room-id">{roomId}</span></h2>
        <div className="task">{taskTitle}</div>
        <div className="task-time">
          ⏱ Оценка: {currentTask ? formatTime(currentTask.time) : '—'}
        </div>
        <div className="connection-status">
          Участников: {roomUsers.length}
          {allVoted && !roomState.revealed && ' • Все проголосовали!'}
        </div>
      </header>

      <UserList 
        users={roomUsers} 
        revealed={roomState.revealed} 
        currentUser={currentUser} // Передаем currentUser
      />

      <VotingCards 
        onVote={onVote} 
        revealed={roomState.revealed}
        resetTrigger={resetTrigger}
        scaleKey={scaleKey}
        scaleValues={scaleValues}
        availableScales={availableScales}
        onScaleChange={onScaleChange}
        scaleChangeDisabled={hasActiveVotes}
        scaleError={scaleError}
        onClearScaleError={onClearScaleError}
      />

      <Controls
        onReveal={onReveal}
        onReset={onReset}
        revealed={roomState.revealed}
        allVoted={allVoted}
      />
    </div>
  );
};

export default GameScreen;