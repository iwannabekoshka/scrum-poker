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
    });
  }

  handleJoinRoom(socket, roomId, username) {
    console.log(`User ${socket.id} joining room ${roomId} as ${username}`);
    
    let room = this.roomService.getRoom(roomId);
    if (!room) {
      room = this.roomService.createRoom(roomId);
    }

    const user = new User(socket.id, username);
    this.roomService.addUserToRoom(roomId, user);

    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    const users = this.roomService.getAllUsers(roomId);
    const tasks = this.roomService.getTasks(roomId);
    const currentTask = this.roomService.getCurrentTask(roomId);
    
    console.log(`Room ${roomId} now has users:`, users.map(u => u.name));
    
    this.io.to(roomId).emit('user-joined', users);
    this.io.to(roomId).emit('tasks-updated', tasks);
    this.io.to(roomId).emit('room-state', {
      revealed: room.revealed,
      task: currentTask ? currentTask.title : 'Оцените задачу'
    });

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
      
      this.io.to(roomId).emit('room-state', {
        revealed: false,
        task: task.title
      });
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
}