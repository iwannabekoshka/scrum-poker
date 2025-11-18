import React, { useState } from 'react';

const cards = [
  { value: '0', display: '0' },
  { value: '1', display: '1' },
  { value: '2', display: '2' },
  { value: '3', display: '3' },
  { value: '5', display: '5' },
  { value: '8', display: '8' },
  { value: '13', display: '13' },
  { value: '20', display: '20' },
  { value: '40', display: '40' },
  { value: '100', display: '100' },
  { value: '?', display: '?' },
  { value: 'coffee', display: '☕' }
];

const VotingCards = ({ onVote, revealed }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardValue) => {
    if (revealed) return;
    
    console.log(`Card clicked: ${cardValue}`);
    setSelectedCard(cardValue);
    onVote(cardValue);
  };

  return (
    <div className="voting-section">
      <h3>Выберите карту:</h3>
      <div className="cards">
        {cards.map(card => (
          <button
            key={card.value}
            className={`card ${selectedCard === card.value ? 'selected' : ''}`}
            onClick={() => handleCardClick(card.value)}
            disabled={revealed}
          >
            {card.display}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingCards;