export class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map();
    this.revealed = false;
    this.task = 'id-1111 Крутая задача';
  }
}