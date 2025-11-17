const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Хранилище комнат
const rooms = new Map();

app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/room/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO логика
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Присоединение к комнате
  socket.on('join-room', (roomId, username) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        revealed: false,
        task: 'Оцените задачу'
      });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      name: username,
      vote: null,
      voted: false
    });

    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    // Уведомляем всех в комнате
    io.to(roomId).emit('user-joined', Array.from(room.users.values()));
    io.to(roomId).emit('room-state', {
      revealed: room.revealed,
      task: room.task
    });
  });

  // Голосование
  socket.on('vote', (vote) => {
    const room = rooms.get(socket.roomId);
    if (room && !room.revealed) {
      const user = room.users.get(socket.id);
      if (user) {
        user.vote = vote;
        user.voted = true;
        
        io.to(socket.roomId).emit('user-voted', user.name);
        
        // Проверяем, все ли проголосовали
        const allVoted = Array.from(room.users.values()).every(user => user.voted);
        if (allVoted) {
          io.to(socket.roomId).emit('all-voted');
        }
      }
    }
  });

  // Показать результаты
  socket.on('reveal-votes', () => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.revealed = true;
      io.to(socket.roomId).emit('votes-revealed', Array.from(room.users.values()));
    }
  });

  // Сброс голосования
  socket.on('reset-votes', () => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.revealed = false;
      room.users.forEach(user => {
        user.vote = null;
        user.voted = false;
      });
      
      io.to(socket.roomId).emit('votes-reset', Array.from(room.users.values()));
    }
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.id);
        
        // Если комната пустая, удаляем её
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
        } else {
          io.to(socket.roomId).emit('user-left', Array.from(room.users.values()));
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});