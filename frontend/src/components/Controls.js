import React from 'react';

const Controls = ({ onReveal, onReset, revealed, allVoted }) => {  
  return (
    <div className="controls">
      <button
        className="control-btn reveal-btn"
        onClick={onReveal}
        disabled={revealed || !allVoted}
      >
        {allVoted ? 'Показать карты' : 'Ожидаем голосов...'}
      </button>
      <button
        className="control-btn reset-btn"
        onClick={onReset}
        disabled={!revealed}
      >
        Новое голосование
      </button>
    </div>
  );
};

export default Controls;