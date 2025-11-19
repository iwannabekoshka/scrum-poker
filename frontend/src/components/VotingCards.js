import React, { useState, useEffect } from 'react';

const VotingCards = ({
  onVote,
  revealed,
  resetTrigger,
  scaleKey,
  scaleValues,
  availableScales,
  onScaleChange,
  scaleChangeDisabled,
  scaleError,
  onClearScaleError = () => {}
}) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = Array.isArray(scaleValues) ? scaleValues : [];
  const scaleOptions = Array.isArray(availableScales) ? availableScales : [];
  const selectedScaleKey = scaleKey ?? (scaleOptions[0]?.key ?? '');

    // Сбрасываем выбранную карточку при новом голосовании
  useEffect(() => {
    if (resetTrigger) {
      setSelectedCard(null);
    }
  }, [resetTrigger]);

  // Также сбрасываем при изменении revealed (на случай, если resetTrigger не сработал)
  useEffect(() => {
    if (!revealed) {
      setSelectedCard(null);
    }
  }, [revealed]);

  useEffect(() => {
    setSelectedCard(null);
  }, [scaleKey]);

  const handleCardClick = (cardValue) => {
    if (revealed) return;
    
    console.log(`Card clicked: ${cardValue}`);
    if (selectedCard === cardValue) {
      setSelectedCard(null);
      onVote(null);
      return;
    }

    setSelectedCard(cardValue);
    onVote(cardValue);
  };

  const getScalePreview = (values = []) => {
    const preview = values.slice(0, 5).join(', ');
    const hasMore = values.length > 5 ? '…' : '';
    return `${preview}${hasMore}`;
  };

  const handleScaleChange = (event) => {
    const { value } = event.target;

    if (!value || scaleChangeDisabled) {
      return;
    }

    if (scaleKey === value) {
      return;
    }

    onScaleChange(value);
    onClearScaleError();
  };

  return (
    <div className="voting-section">
      <h3>Выберите карту:</h3>
      <div className="cards">
        {cards.length > 0 ? (
          cards.map((cardValue) => (
            <button
              key={cardValue}
              className={`card ${selectedCard === cardValue ? 'selected' : ''}`}
              onClick={() => handleCardClick(cardValue)}
              disabled={revealed}
            >
              {cardValue}
            </button>
          ))
        ) : (
          <div className="no-cards">Нет доступных значений шкалы</div>
        )}
      </div>

      <div className="scale-selector">
        <label htmlFor="scale-select">Шкала карточек</label>
        <select
          id="scale-select"
          value={selectedScaleKey}
          onChange={handleScaleChange}
          disabled={scaleChangeDisabled || scaleOptions.length === 0}
        >
          {scaleOptions.length === 0 && (
            <option value="">Загрузка шкал...</option>
          )}
          {scaleOptions.length > 0 &&
            scaleOptions.map((scale) => (
              <option key={scale.key} value={scale.key}>
                {`${scale.label} (${getScalePreview(scale.values || [])})`}
              </option>
            ))}
        </select>
        {scaleChangeDisabled && (
          <small>Сменить шкалу нельзя, пока есть активные голоса</small>
        )}
        {scaleError && (
          <div className="scale-error">
            <span>{scaleError}</span>
            <button
              type="button"
              className="scale-error-close"
              onClick={onClearScaleError}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingCards;