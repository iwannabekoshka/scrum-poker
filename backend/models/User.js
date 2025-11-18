export class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.vote = null;
    this.voted = false;
  }
}