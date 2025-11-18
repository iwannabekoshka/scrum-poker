import { Room } from '../models/Room.js';

export class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    const room = new Room(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }

  addUserToRoom(roomId, user) {
    const room = this.getRoom(roomId);
    if (room) {
      room.users.set(user.id, user);
    }
    return room;
  }

  removeUserFromRoom(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.users.delete(socketId);
      if (room.users.size === 0) {
        this.deleteRoom(roomId);
      }
    }
    return room;
  }

  userVote(roomId, socketId, vote) {
    const room = this.getRoom(roomId);
    if (room && room.users.has(socketId)) {
      const user = room.users.get(socketId);
      user.vote = vote;
      user.voted = true;
    }
    return room;
  }

  revealVotes(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.revealed = true;
    }
    return room;
  }

  resetVotes(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.revealed = false;
      for (let user of room.users.values()) {
        user.vote = null;
        user.voted = false;
      }
    }
    return room;
  }

  getAllUsers(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      return Array.from(room.users.values());
    }
    return [];
  }
}