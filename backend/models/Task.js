export class Task {
  constructor(id, title, youtrackUrl) {
    this.id = id;
    this.title = title;
    this.youtrackUrl = youtrackUrl;
    this.createdAt = new Date();
  }
}