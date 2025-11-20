import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import EmojiThrowLayer from './EmojiThrowLayer.js';

const UserCard = forwardRef(
  ({ user, revealed, isCurrentUser, onClick }, ref) => (
    <div
      ref={ref}
      className={`user ${user.voted ? 'voted' : ''} ${
        isCurrentUser ? 'current-user' : ''
      }`}
      onClick={onClick}
    >
      <div className="user-name">
        {user.emoji}
        <br />
        {user.name} {isCurrentUser && <span className="you-badge"> (Вы)</span>}
      </div>
      {user.voted && (
        <div className="user-vote">
          {revealed ? user.vote : '✓'}
        </div>
      )}
    </div>
  )
);

UserCard.displayName = 'UserCard';

const UserList = ({ users, revealed, currentUser, onThrowEmoji, emojiEvent }) => {
  const userRefs = useRef(new Map());
  const throwLayerRef = useRef(null);

  const handleUserClick = useCallback((user) => {
    if (!user?.id || typeof onThrowEmoji !== 'function') {
      return;
    }

    if (user.isAdmin) {
      alert("Не на того напал :)");
      return;
    }

    // TODO: добавить выбор емоджи для броска
    // TODO: добавить синхронизацию эмоджи между юзерами (размер не синкается)
    onThrowEmoji(user.id, null);
  }, [onThrowEmoji]);

  useEffect(() => {
    if (!emojiEvent?.targetUserId || !throwLayerRef.current?.throwAt) {
      return;
    }

    const userNode = userRefs.current.get(emojiEvent.targetUserId);
    if (!userNode) {
      return;
    }

    const targetRect = userNode.getBoundingClientRect();
    throwLayerRef.current.throwAt(targetRect, emojiEvent.emoji);
  }, [emojiEvent]);

  return (
    <>
      <div className="users-list">
        {users.map((user) => (
          <UserCard
            key={user.id}
            ref={(node) => {
              if (node) {
                userRefs.current.set(user.id, node);
              } else {
                userRefs.current.delete(user.id);
              }
            }}
            user={user}
            revealed={revealed}
            isCurrentUser={currentUser && user.id === currentUser.id}
            onClick={() => handleUserClick(user)}
          />
        ))}
      </div>
      <EmojiThrowLayer ref={throwLayerRef} />
    </>
  );
};

export default UserList;