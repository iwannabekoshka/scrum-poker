import React, { useState, useEffect } from 'react';
import UserList from './UserList.js';
import VotingCards from './VotingCards.js';
import Controls from './Controls.js';
import { setCipboard } from '../utils/setClipboard.js';

const GameScreen = ({ 
  roomId, 
  roomUsers, 
  roomState, 
  allVoted, 
  currentTask, 
  resetTrigger,
  currentUser,
  onVote, 
  onReveal, 
  onReset,
  scaleKey,
  scaleValues,
  availableScales,
  onScaleChange,
  scaleError,
  onClearScaleError,
  onThrowEmoji,
  emojiEvent
}) => {
  const [taskTitle, setTaskTitle] = useState('Крутая задача');
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
      setTaskTitle('Крутая задача');
    }
  }, [currentTask]);

  const hasActiveVotes = roomUsers.some((user) => user.voted);

  async function onCopyLink(e) {
    const roomUrl = window.location.href;

    try {
      await setCipboard(roomUrl);
      alert("Ссылка скопирована!")
    } catch (error) {
      alert("Произошла ошибка при копировании")
    }
  }

  return (
    <div className="game-screen">
      <header className="game-header">
        <h2>
          Комната: <span className="room-id">{roomId}</span>

          <button 
            className="button-icon" 
            title="Копировать ссылку комнаты"
            onClick={onCopyLink}>🔗</button>
        </h2>

        <div className="connection-status">
          Участников: {roomUsers.length}
          {allVoted && !roomState.revealed && ' • Все проголосовали!'}
        </div>
      </header>

      <UserList 
        users={roomUsers} 
        revealed={roomState.revealed} 
        currentUser={currentUser} // Передаем currentUser
        onThrowEmoji={onThrowEmoji}
        emojiEvent={emojiEvent}
      />

      <div class="task-section">
        <div id="table">
          <div className="task-title">{taskTitle}</div>

          <div className="task-time">
            ⏱ Оценка: {currentTask ? formatTime(currentTask.time) : '—'}
          </div>

          {currentTask && currentTask.youtrackUrl && (
            <div className="task-url">
              <a 
                href={currentTask.youtrackUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                🔗 YouTrack
              </a>
            </div>
          )}
        </div>
      </div>

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