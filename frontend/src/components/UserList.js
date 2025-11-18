import React, { forwardRef, useCallback, useRef } from 'react';
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
        {user.name}
        {isCurrentUser && <span className="you-badge"> (Вы)</span>}
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

const UserList = ({ users, revealed, currentUser }) => {
  const userRefs = useRef(new Map());
  const throwLayerRef = useRef(null);

  const handleUserClick = useCallback((user) => {
    const userNode = userRefs.current.get(user.id);
    if (!userNode || !throwLayerRef.current?.throwAt) {
      return;
    }

    const targetRect = userNode.getBoundingClientRect();
    throwLayerRef.current.throwAt(targetRect, user.emoji);
  }, []);

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