export class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.vote = null;
    this.voted = false;
    this.emoji = this.getRandomEmoji();
  }

  getRandomEmoji() {
    // Диапазоны для конкретных категорий emoji
    const emojiRanges = [
      // Лица, смайлики
      [0x1f600, 0x1f64f], // Emoticons

      // Животные, насекомые
      [0x1f400, 0x1f43f], // Animal Symbols
      [0x1f980, 0x1f99f], // Animal Symbols (насекомые, ракообразные)

      // Растения, фрукты
      // [0x1f330, 0x1f33f], // Food & Drink (растения, орехи)
      // [0x1f340, 0x1f35f], // Food & Drink (фрукты, овощи, растения)

      // Еда
      // [0x1f32d, 0x1f32f], // Hot Food
      // [0x1f360, 0x1f37f], // Food & Drink (еда и напитки)
      // [0x1f950, 0x1f96f], // Supplemental Symbols (еда)
    ];

    // Случайный выбор диапазона
    const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];

    // Генерация случайного кода в выбранном диапазоне
    const codePoint =
      Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

    return String.fromCodePoint(codePoint);
  }
}
