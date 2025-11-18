import React, { useState, useEffect } from 'react';
import UserList from './UserList.js';
import VotingCards from './VotingCards.js';
import Controls from './Controls.js';

const GameScreen = ({ roomId, roomUsers, roomState, onVote, onReveal, onReset }) => {
  const [allVoted, setAllVoted] = useState(false);

  useEffect(() => {
    const voted = roomUsers.filter(user => user.voted).length;
    setAllVoted(voted > 0 && voted === roomUsers.length);
  }, [roomUsers]);

  return (
    <div className="game-screen">
      <header className="game-header">
        <h2>Комната: <span className="room-id">{roomId}</span></h2>
        <div className="task">{roomState.task}</div>
        <div className="connection-status">
          Участников: {roomUsers.length}<br/>
          {allVoted && !roomState.revealed && ' • Все проголосовали!'}
        </div>
      </header>

      <UserList users={roomUsers} revealed={roomState.revealed} />

      <VotingCards 
        onVote={onVote} 
        revealed={roomState.revealed}
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