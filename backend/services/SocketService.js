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
    console.log(`Room ${roomId} now has users:`, users.map(u => u.name));
    
    this.io.to(roomId).emit('user-joined', users);
    this.io.to(roomId).emit('room-state', {
      revealed: room.revealed,
      task: room.task
    });
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
    
    // ФИКС: Отправляем обновленный список при отключении
    this.io.to(roomId).emit('user-left', users);
  }
}