import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomState, setRoomState] = useState({ revealed: false, task: '' });
  const [allVoted, setAllVoted] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskError, setTaskError] = useState('');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Добавляем состояние текущего пользователя

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
      
      // Находим текущего пользователя по socket.id
      const currentUser = users.find(user => user.id === socketRef.current.id);
      if (currentUser) {
        console.log('👤 Current user identified:', currentUser.name);
        setCurrentUser(currentUser);
      }
      
      const allVotedCheck = users.length > 0 && users.every(user => user.voted);
      console.log('All voted after user joined:', allVotedCheck);
      setAllVoted(allVotedCheck);
    });

    socketRef.current.on('user-voted', (data) => {
      console.log('🗳️ User voted data:', data);
      
      if (data && data.users) {
        setRoomUsers(data.users);
        
        // Обновляем текущего пользователя
        const currentUser = data.users.find(user => user.id === socketRef.current.id);
        if (currentUser) {
          setCurrentUser(currentUser);
        }
        
        const allVotedCheck = data.users.length > 0 && data.users.every(user => user.voted);
        console.log('All voted check (new format):', allVotedCheck);
        setAllVoted(allVotedCheck);
      } else if (Array.isArray(data)) {
        setRoomUsers(data);
        
        // Обновляем текущего пользователя
        const currentUser = data.find(user => user.id === socketRef.current.id);
        if (currentUser) {
          setCurrentUser(currentUser);
        }
        
        const allVotedCheck = data.length > 0 && data.every(user => user.voted);
        console.log('All voted check (array format):', allVotedCheck);
        setAllVoted(allVotedCheck);
      } else {
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
      
      // Обновляем текущего пользователя
      const currentUser = users.find(user => user.id === socketRef.current.id);
      if (currentUser) {
        setCurrentUser(currentUser);
      }
      
      setRoomState(prev => ({ ...prev, revealed: true }));
      setAllVoted(true);
    });

    socketRef.current.on('votes-reset', (users) => {
      console.log('🔄 Votes reset');
      setRoomUsers(users);
      
      // Обновляем текущего пользователя
      const currentUser = users.find(user => user.id === socketRef.current.id);
      if (currentUser) {
        setCurrentUser(currentUser);
      }
      
      setRoomState(prev => ({ ...prev, revealed: false }));
      setAllVoted(false);
      setResetTrigger(prev => prev + 1);
    });

    socketRef.current.on('room-state', (state) => {
      console.log('🏠 Room state:', state);
      setRoomState(state);
    });

    socketRef.current.on('user-left', (users) => {
      console.log('👋 User left, remaining users:', users);
      setRoomUsers(users);
      
      // Обновляем текущего пользователя
      const currentUser = users.find(user => user.id === socketRef.current.id);
      if (currentUser) {
        setCurrentUser(currentUser);
      }
      
      const allVotedCheck = users.length > 0 && users.every(user => user.voted);
      console.log('All voted after user left:', allVotedCheck);
      setAllVoted(allVotedCheck);
    });

    socketRef.current.on('tasks-updated', (tasks) => {
      console.log('📋 Tasks updated:', tasks);
      setTasks(tasks);
    });

    socketRef.current.on('task-added', (data) => {
      console.log('➕ Task added:', data);
      setTasks(data.tasks);
    });

    socketRef.current.on('task-deleted', (data) => {
      console.log('➖ Task deleted:', data);
      setTasks(data.tasks);
      setCurrentTask(data.currentTask);
    });

    socketRef.current.on('task-selected', (data) => {
      console.log('🎯 Task selected:', data);
      setCurrentTask(data.task);
      setRoomUsers(data.users);
      
      // Обновляем текущего пользователя
      const currentUser = data.users.find(user => user.id === socketRef.current.id);
      if (currentUser) {
        setCurrentUser(currentUser);
      }
      
      setAllVoted(false);
      setResetTrigger(prev => prev + 1);
    });

    socketRef.current.on('task-error', (errorMessage) => {
      console.log('❌ Task error:', errorMessage);
      setTaskError(errorMessage);
      setTimeout(() => setTaskError(''), 5000);
    });

    socketRef.current.on('task-time-updated', (data) => {
      console.log('⏱ Task time updated:', data);

      if (data?.tasks) {
        setTasks(data.tasks);
      }

      if (data?.task) {
        setCurrentTask((prev) =>
          prev && prev.id === data.task.id ? data.task : prev
        );
      }
    });

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
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

  const addTask = (taskData) => {
    console.log('Adding task:', taskData);
    socketRef.current.emit('add-task', taskData);
  };

  const deleteTask = (taskId) => {
    console.log('Deleting task:', taskId);
    socketRef.current.emit('delete-task', taskId);
  };

  const selectTask = (taskId) => {
    console.log('Selecting task:', taskId);
    socketRef.current.emit('select-task', taskId);
  };

  const updateTaskTime = (taskId, time) => {
    console.log('Updating task time:', taskId, time);
    socketRef.current.emit('update-task-time', { taskId, time });
  };

  const clearTaskError = () => {
    setTaskError('');
  };

  return {
    isConnected,
    roomUsers,
    roomState,
    allVoted,
    tasks,
    currentTask,
    taskError,
    resetTrigger,
    currentUser, // Возвращаем currentUser
    joinRoom,
    vote,
    revealVotes,
    resetVotes,
    addTask,
    deleteTask,
    selectTask,
    updateTaskTime,
    clearTaskError
  };
};