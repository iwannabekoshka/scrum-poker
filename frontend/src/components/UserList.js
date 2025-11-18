import React from 'react';

const UserList = ({ users, revealed, currentUser }) => {
  console.log('UserList rendered - users:', users, 'revealed:', revealed, 'currentUser:', currentUser);
  
  return (
    <div className="users-list">
      {users.map(user => (
        <div 
          key={user.id} 
          className={`user ${user.voted ? 'voted' : ''} ${currentUser && user.id === currentUser.id ? 'current-user' : ''}`}
        >
          <div className="user-name">
            {user.name} 
            {currentUser && user.id === currentUser.id && (
              <span className="you-badge"> (Вы)</span>
            )}
          </div>
          {user.voted && (
            <div className="user-vote">
              {revealed ? user.vote : '✓'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;