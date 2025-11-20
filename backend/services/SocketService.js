import { parse } from "cookie";

import { RoomService } from './RoomService.js';
import { User } from '../models/User.js';

export class SocketService {
  constructor(io) {
    this.io = io;
    this.roomService = new RoomService();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-room', (roomId, username) => {
        this.handleJoinRoom(socket, roomId, username);
      });

      socket.on('vote', (vote) => {
        this.handleVote(socket, vote);
      });

      socket.on('reveal-votes', () => {
        this.handleRevealVotes(socket);
      });

      socket.on('reset-votes', () => {
        this.handleResetVotes(socket);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('add-task', (taskData) => {
        this.handleAddTask(socket, taskData);
      });

      socket.on('delete-task', (taskId) => {
        this.handleDeleteTask(socket, taskId);
      });

      socket.on('select-task', (taskId) => {
        this.handleSelectTask(socket, taskId);
      });

      socket.on('update-task-time', (payload) => {
        this.handleUpdateTaskTime(socket, payload);
      });

      socket.on('change-scale', (scaleKey) => {
        this.handleChangeScale(socket, scaleKey);
      });

      socket.on('import-tasks', (payload) => {
        this.handleImportTasks(socket, payload);
      });

      socket.on('throw-emoji', (payload) => {
        this.handleThrowEmoji(socket, payload);
      });
    });
  }

  handleJoinRoom(socket, roomId, username) {
    const normalizedRoomId = roomId?.trim();
    const normalizedUsername = username?.trim();

    if (!normalizedRoomId || !normalizedUsername) {
      socket.emit('join-error', 'Комната и имя обязательны');
      return;
    }

    console.log(`User ${socket.id} joining room ${normalizedRoomId} as ${normalizedUsername}`);
    
    let room = this.roomService.getRoom(normalizedRoomId);
    if (!room) {
      room = this.roomService.createRoom(normalizedRoomId);
    }

    const cookies = parse(socket.request.headers.cookie || "No cookies");
    const isAdmin = Boolean(cookies.isAdmin);

    const user = new User(socket.id, normalizedUsername, isAdmin);

    try {
      this.roomService.addUserToRoom(normalizedRoomId, user);
    } catch (error) {
      socket.emit('join-error', error.message || 'Не удалось присоединиться к комнате');
      return;
    }

    socket.join(normalizedRoomId);
    socket.roomId = normalizedRoomId;
    socket.username = normalizedUsername;

    const users = this.roomService.getAllUsers(normalizedRoomId);
    const tasks = this.roomService.getTasks(normalizedRoomId);
    const currentTask = this.roomService.getCurrentTask(normalizedRoomId);
    
    console.log(`Room ${roomId} now has users:`, users.map(u => u.name));
    
    this.io.to(normalizedRoomId).emit('user-joined', users);
    this.io.to(normalizedRoomId).emit('tasks-updated', tasks);
    this.emitRoomState(normalizedRoomId);

    if (currentTask) {
      socket.emit('current-task', currentTask);
    }
  }

  handleVote(socket, vote) {
    const roomId = socket.roomId;
    console.log(`Vote received from ${socket.id} in room ${roomId}: ${vote}`);
    
    if (!roomId) {
      console.log(`ERROR: No roomId for socket ${socket.id}`);
      return;
    }

    const room = this.roomService.getRoom(roomId);
    if (room && !room.revealed) {
      this.roomService.userVote(roomId, socket.id, vote);
      
      const users = this.roomService.getAllUsers(roomId);
      const allVoted = users.every(user => user.voted);
      
      console.log(`User ${socket.username} voted ${vote}. All voted: ${allVoted}`);
      
      // ФИКС: Отправляем обновленный список пользователей
      this.io.to(roomId).emit('user-voted', {
        username: socket.username,
        users: users
      });
      
      if (allVoted) {
        console.log(`All users voted in room ${roomId}`);
        this.io.to(roomId).emit('all-voted');
      }
    }
  }

  handleRevealVotes(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    this.roomService.revealVotes(roomId);
    const users = this.roomService.getAllUsers(roomId);
    this.io.to(roomId).emit('votes-revealed', users);

    const currentTask = this.roomService.getCurrentTask(roomId);
    if (currentTask) {
      const numericVotes = users
        .map((user) => {
          const value = Number(user.vote);
          return Number.isFinite(value) ? value : null;
        })
        .filter((value) => value !== null);

      if (numericVotes.length > 0) {
        const sum = numericVotes.reduce((acc, value) => acc + value, 0);
        const average = sum / numericVotes.length;
        const updatedTask = this.roomService.updateTaskTime(
          roomId,
          currentTask.id,
          Number(average.toFixed(2))
        );

        if (updatedTask) {
          const tasks = this.roomService.getTasks(roomId);
          this.io.to(roomId).emit('task-time-updated', {
            task: updatedTask,
            tasks,
          });
        }
      }
    }
  }

  handleResetVotes(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    this.roomService.resetVotes(roomId);
    const users = this.roomService.getAllUsers(roomId);
    this.io.to(roomId).emit('votes-reset', users);
  }

  handleDisconnect(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    this.roomService.removeUserFromRoom(roomId, socket.id);
    const users = this.roomService.getAllUsers(roomId);
    
    this.io.to(roomId).emit('user-left', users);
  }

  handleAddTask(socket, taskData) {
    const roomId = socket.roomId;
    if (!roomId) return;

    const { title, youtrackUrl } = taskData;
    const task = this.roomService.addTask(roomId, title, youtrackUrl);
    
    if (task) {
      const tasks = this.roomService.getTasks(roomId);
      this.io.to(roomId).emit('task-added', { task, tasks });
    }
  }

  handleDeleteTask(socket, taskId) {
    const roomId = socket.roomId;
    if (!roomId) return;

    try {
      const success = this.roomService.deleteTask(roomId, taskId);
      if (success) {
        const tasks = this.roomService.getTasks(roomId);
        const currentTask = this.roomService.getCurrentTask(roomId);
        
        this.io.to(roomId).emit('task-deleted', { 
          taskId, 
          tasks,
          currentTask 
        });
      }
    } catch (error) {
      socket.emit('task-error', error.message);
    }
  }

  handleSelectTask(socket, taskId) {
    const roomId = socket.roomId;
    if (!roomId) return;

    const task = this.roomService.selectTask(roomId, taskId);
    if (task) {
      const users = this.roomService.getAllUsers(roomId);
      
      this.io.to(roomId).emit('task-selected', { 
        task,
        users 
      });
      
      this.emitRoomState(roomId);
    }
  }

  handleUpdateTaskTime(socket, payload) {
    const roomId = socket.roomId;
    if (!roomId) return;

    const { taskId, time } = payload || {};
    if (!taskId) {
      socket.emit('task-error', 'Task ID is required to update time');
      return;
    }

    const normalizedTime =
      time === null || time === '' ? null : Number(time);

    if (normalizedTime !== null && !Number.isFinite(normalizedTime)) {
      socket.emit('task-error', 'Время должно быть числом');
      return;
    }

    const updatedTask = this.roomService.updateTaskTime(
      roomId,
      taskId,
      normalizedTime
    );

    if (!updatedTask) {
      socket.emit('task-error', 'Не удалось обновить время задачи');
      return;
    }

    const tasks = this.roomService.getTasks(roomId);
    this.io.to(roomId).emit('task-time-updated', {
      task: updatedTask,
      tasks,
    });
  }

  handleChangeScale(socket, scaleKey) {
    const roomId = socket.roomId;
    if (!roomId) {
      return;
    }

    try {
      const normalizedScaleKey =
        typeof scaleKey === 'string' ? scaleKey : String(scaleKey || '').trim();
      if (!normalizedScaleKey) {
        throw new Error('Не передан ключ шкалы');
      }

      this.roomService.changeScale(roomId, normalizedScaleKey);
      this.emitRoomState(roomId);
    } catch (error) {
      socket.emit('scale-change-error', error.message || 'Не удалось сменить шкалу');
    }
  }

  handleImportTasks(socket, payload) {
    const roomId = socket.roomId;
    if (!roomId) {
      return;
    }

    const rawTasks = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.tasks)
        ? payload.tasks
        : [];

    if (rawTasks.length === 0) {
      socket.emit(
        'task-error',
        'Данный .csv файл не соответствует формату'
      );
      return;
    }

    const normalizedTasks = rawTasks
      .map((task) => {
        if (!task) {
          return null;
        }
        const title = typeof task.title === 'string' ? task.title.trim() : '';
        const youtrackUrl =
          typeof task.youtrackUrl === 'string'
            ? task.youtrackUrl.trim()
            : '';
        const id =
          typeof task.id === 'string' && task.id.trim().length > 0
            ? task.id.trim()
            : null;

        if (!title) {
          return null;
        }

        return {
          id,
          title,
          youtrackUrl
        };
      })
      .filter(Boolean);

    if (normalizedTasks.length === 0) {
      socket.emit(
        'task-error',
        'Данный .csv файл не соответствует формату'
      );
      return;
    }

    const tasks = this.roomService.replaceTasks(roomId, normalizedTasks);

    if (!tasks) {
      socket.emit(
        'task-error',
        'Не удалось обновить список задач'
      );
      return;
    }

    this.roomService.resetVotes(roomId);
    const users = this.roomService.getAllUsers(roomId);

    this.io.to(roomId).emit('tasks-updated', tasks);
    this.io.to(roomId).emit('current-task', null);
    this.io.to(roomId).emit('votes-reset', users);
    this.emitRoomState(roomId);
  }

  emitRoomState(roomId) {
    const room = this.roomService.getRoom(roomId);
    if (!room) {
      return;
    }

    const currentTask = this.roomService.getCurrentTask(roomId);
    const scale = this.roomService.getScale(roomId);
    const availableScales = this.roomService.getAvailableScales();

    this.io.to(roomId).emit('room-state', {
      revealed: room.revealed,
      task: currentTask ? currentTask.title : 'Крутая задача',
      scaleKey: scale.key,
      scaleValues: scale.values,
      availableScales
    });
  }

  handleThrowEmoji(socket, payload) {
    const roomId = socket.roomId;
    if (!roomId) {
      return;
    }

    const targetUserId =
      typeof payload?.targetUserId === 'string' ? payload.targetUserId.trim() : null;

    if (!targetUserId) {
      return;
    }

    const room = this.roomService.getRoom(roomId);
    if (!room || !room.users.has(targetUserId)) {
      return;
    }

    const emoji =
      typeof payload?.emoji === 'string' && payload.emoji.trim().length > 0
        ? payload.emoji
        : null;

    const event = {
      id: `${Date.now()}-${Math.random()}`,
      targetUserId,
      emoji,
      senderUserId: socket.id,
      senderName: socket.username || null
    };

    this.io.to(roomId).emit('emoji-thrown', event);
  }
}