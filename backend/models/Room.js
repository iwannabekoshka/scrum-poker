import { DEFAULT_SCALE_KEY } from "../constants/cardScales.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map();
    this.revealed = false;
    this.currentTask = null;
    this.tasks = []; // Массив задач
    this.scaleKey = DEFAULT_SCALE_KEY;
  }
}