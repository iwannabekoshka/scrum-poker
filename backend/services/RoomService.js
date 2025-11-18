import { Room } from "../models/Room.js";
import { Task } from '../models/Task.js';

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
      const normalizedNewName = user.name.trim().toLowerCase();
      const isNameTaken = Array.from(room.users.values()).some(
        (existingUser) => existingUser.name.trim().toLowerCase() === normalizedNewName
      );

      if (isNameTaken) {
        throw new Error('Имя уже занято в этой комнате');
      }

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

  addTask(roomId, taskTitle, youtrackUrl) {
    const room = this.getRoom(roomId);
    if (room) {
      const taskId = Date.now().toString(); // Простой ID на основе времени
      const task = new Task(taskId, taskTitle, youtrackUrl);
      room.tasks.push(task);
      return task;
    }
    return null;
  }

  deleteTask(roomId, taskId) {
    const room = this.getRoom(roomId);
    if (room) {
      // Нельзя удалить задачу, если она текущая и идет голосование
      if (
        room.currentTask &&
        room.currentTask.id === taskId &&
        !room.revealed
      ) {
        throw new Error("Cannot delete task that is currently being voted on");
      }

      room.tasks = room.tasks.filter((task) => task.id !== taskId);

      // Если удаляемая задача была текущей, сбрасываем currentTask
      if (room.currentTask && room.currentTask.id === taskId) {
        room.currentTask = null;
      }

      return true;
    }
    return false;
  }

  selectTask(roomId, taskId) {
    const room = this.getRoom(roomId);
    if (room) {
      const task = room.tasks.find((t) => t.id === taskId);
      if (task) {
        room.currentTask = task;
        // При выборе новой задачи сбрасываем голосование
        this.resetVotes(roomId);
        return task;
      }
    }
    return null;
  }

  getTasks(roomId) {
    const room = this.getRoom(roomId);
    return room ? room.tasks : [];
  }

  getCurrentTask(roomId) {
    const room = this.getRoom(roomId);
    return room ? room.currentTask : null;
  }

  updateTaskTime(roomId, taskId, timeValue) {
    const room = this.getRoom(roomId);
    if (!room) {
      return null;
    }

    const task = room.tasks.find((t) => t.id === taskId);
    if (!task) {
      return null;
    }

    task.time = timeValue;

    if (room.currentTask && room.currentTask.id === taskId) {
      room.currentTask.time = timeValue;
    }

    return task;
  }
}
