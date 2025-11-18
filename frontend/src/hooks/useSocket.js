import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomState, setRoomState] = useState({ revealed: false, task: '' });
  const [allVoted, setAllVoted] = useState(false);

  useEffect(() => {
    console.log('🔌 Initializing socket connection...');
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('user-joined', (users) => {
      console.log('👥 Users updated:', users);
      setRoomUsers(users);
      // При подключении новых пользователей пересчитываем allVoted
      const allVotedCheck = users.length > 0 && users.every(user => user.voted);
      console.log('All voted after user joined:', allVotedCheck);
      setAllVoted(allVotedCheck);
    });

    socketRef.current.on('user-voted', (data) => {
      console.log('🗳️ User voted data:', data);
      
      // ФИКС: Обрабатываем разные форматы данных
      if (data && data.users) {
        // Новый формат: { username, users }
        setRoomUsers(data.users);
        const allVotedCheck = data.users.length > 0 && data.users.every(user => user.voted);
        console.log('All voted check (new format):', allVotedCheck);
        setAllVoted(allVotedCheck);
      } else if (Array.isArray(data)) {
        // Старый формат: массив пользователей
        setRoomUsers(data);
        const allVotedCheck = data.length > 0 && data.every(user => user.voted);
        console.log('All voted check (array format):', allVotedCheck);
        setAllVoted(allVotedCheck);
      } else {
        // Только имя пользователя - пересчитываем на основе текущего состояния
        console.log('User voted (name only):', data);
        const allVotedCheck = roomUsers.length > 0 && roomUsers.every(user => user.voted);
        console.log('All voted check (current state):', allVotedCheck);
        setAllVoted(allVotedCheck);
      }
    });

    socketRef.current.on('all-voted', () => {
      console.log('🎉 All users voted!');
      setAllVoted(true);
    });

    socketRef.current.on('votes-revealed', (users) => {
      console.log('🃏 Votes revealed');
      setRoomUsers(users);
      setRoomState(prev => ({ ...prev, revealed: true }));
      setAllVoted(true); // После раскрытия все равно считаем что все проголосовали
    });

    socketRef.current.on('votes-reset', (users) => {
      console.log('🔄 Votes reset');
      setRoomUsers(users);
      setRoomState(prev => ({ ...prev, revealed: false }));
      setAllVoted(false);
    });

    socketRef.current.on('room-state', (state) => {
      console.log('🏠 Room state:', state);
      setRoomState(state);
    });

    socketRef.current.on('user-left', (users) => {
      console.log('👋 User left, remaining users:', users);
      setRoomUsers(users);
      // При уходе пользователя перепроверяем allVoted
      const allVotedCheck = users.length > 0 && users.every(user => user.voted);
      console.log('All voted after user left:', allVotedCheck);
      setAllVoted(allVotedCheck);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      socketRef.current.disconnect();
    };
  }, []);

  // ФИКС: Добавляем roomUsers в зависимости useEffect для корректного обновления
  useEffect(() => {
    // При изменении roomUsers пересчитываем allVoted
    const allVotedCheck = roomUsers.length > 0 && roomUsers.every(user => user.voted);
    console.log('roomUsers changed, allVoted recalculated:', allVotedCheck);
    setAllVoted(allVotedCheck);
  }, [roomUsers]);

  const joinRoom = (roomId, username) => {
    console.log(`Joining room ${roomId} as ${username}`);
    socketRef.current.emit('join-room', roomId, username);
  };

  const vote = (voteValue) => {
    console.log(`Voting: ${voteValue}`);
    socketRef.current.emit('vote', voteValue);
  };

  const revealVotes = () => {
    console.log('Revealing votes');
    socketRef.current.emit('reveal-votes');
  };

  const resetVotes = () => {
    console.log('Resetting votes');
    socketRef.current.emit('reset-votes');
  };

  return {
    isConnected,
    roomUsers,
    roomState,
    allVoted,
    joinRoom,
    vote,
    revealVotes,
    resetVotes
  };
};