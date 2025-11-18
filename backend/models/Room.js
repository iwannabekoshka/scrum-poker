export class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map();
    this.revealed = false;
    this.currentTask = null;
    this.tasks = []; // Массив задач
  }
}