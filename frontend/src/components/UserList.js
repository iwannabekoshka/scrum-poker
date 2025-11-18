import React from 'react';

const UserList = ({ users, revealed }) => {
  console.log('UserList rendered - users:', users, 'revealed:', revealed);
  
  return (
    <div className="users-list">
      {users.map(user => (
        <div key={user.id} className={`user ${user.voted ? 'voted' : ''}`}>
          <div className="user-name">
            {user.name} 
            <span style={{fontSize: '0.8em', color: '#666', marginLeft: '5px'}}>
              ({user.voted ? 'проголосовал' : 'не голосовал'})
            </span>
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