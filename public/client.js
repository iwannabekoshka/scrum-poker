const socket = io();

// Элементы DOM
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const joinBtn = document.getElementById('join-btn');
const roomIdSpan = document.getElementById('room-id');
const usersList = document.getElementById('users-list');
const cards = document.querySelectorAll('.card');
const revealBtn = document.getElementById('reveal-btn');
const resetBtn = document.getElementById('reset-btn');
const taskSpan = document.getElementById('task');

let currentRoom = null;
let selectedCard = null;

// Присоединение к комнате
joinBtn.addEventListener('click', joinRoom);
roomInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
});
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
});

function joinRoom() {
    const username = usernameInput.value.trim();
    const roomId = roomInput.value.trim();
    
    if (!username || !roomId) {
        alert('Введите имя и ID комнаты');
        return;
    }
    
    currentRoom = roomId;
    socket.emit('join-room', roomId, username);
}

// Обработчики карт
cards.forEach(card => {
    card.addEventListener('click', () => {
        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }
        
        card.classList.add('selected');
        selectedCard = card;
        
        const vote = card.dataset.value;
        socket.emit('vote', vote);
    });
});

// Кнопки управления
revealBtn.addEventListener('click', () => {
    socket.emit('reveal-votes');
});

resetBtn.addEventListener('click', () => {
    socket.emit('reset-votes');
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
});

// Socket.IO события
socket.on('user-joined', (users) => {
    loginScreen.classList.remove('active');
    gameScreen.classList.add('active');
    roomIdSpan.textContent = currentRoom;
    updateUsersList(users);
});

socket.on('user-left', (users) => {
    updateUsersList(users);
});

socket.on('user-voted', (username) => {
    showNotification(`${username} проголосовал(а)`);
});

socket.on('all-voted', () => {
    revealBtn.disabled = false;
    showNotification('Все участники проголосовали!');
});

socket.on('votes-revealed', (users) => {
    updateUsersList(users, true);
    revealBtn.disabled = true;
    resetBtn.disabled = false;
});

socket.on('votes-reset', (users) => {
    updateUsersList(users, false);
    revealBtn.disabled = true;
    resetBtn.disabled = true;
});

socket.on('room-state', (state) => {
    taskSpan.textContent = state.task;
    if (state.revealed) {
        resetBtn.disabled = false;
    }
});

// Вспомогательные функции
function updateUsersList(users, showVotes = false) {
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = `user ${user.voted ? 'voted' : ''}`;
        
        let voteText = '';
        if (showVotes && user.voted) {
            voteText = `<div class="vote">${user.vote}</div>`;
        } else if (user.voted) {
            voteText = '<div class="vote">✓</div>';
        }
        
        userEl.innerHTML = `
            <div class="name">${user.name}</div>
            ${voteText}
        `;
        
        usersList.appendChild(userEl);
    });
}

function showNotification(message) {
    // Простая реализация уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}