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
  onReset 
}) => {
  const [taskTitle, setTaskTitle] = useState('Оцените задачу');

  useEffect(() => {
    if (currentTask) {
      setTaskTitle(currentTask.title);
    } else {
      setTaskTitle('Оцените задачу');
    }
  }, [currentTask]);

  return (
    <div className="game-screen">
      <header className="game-header">
        <h2>Комната: <span className="room-id">{roomId}</span></h2>
        <div className="task">{taskTitle}</div>
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