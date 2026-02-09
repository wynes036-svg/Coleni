const socket = io();

let currentRoom = null;
let currentUser = null;
let mediaRecorder = null;
let audioChunks = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const profilePhotoInput = document.getElementById('profile-photo-input');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomIdInput = document.getElementById('room-id-input');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usersList = document.getElementById('users-list');
const shareLinkBtn = document.getElementById('share-link-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const stickerBtn = document.getElementById('sticker-btn');
const giftBtn = document.getElementById('gift-btn');
const voiceBtn = document.getElementById('voice-btn');
const stickerPicker = document.getElementById('sticker-picker');
const giftPicker = document.getElementById('gift-picker');

// Check for room in URL
const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = urlParams.get('room');
if (roomFromUrl) {
  roomIdInput.value = roomFromUrl;
}

// Create Room
createRoomBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert('Please enter your name');
    return;
  }

  const response = await fetch('/api/create-room', { method: 'POST' });
  const { roomId, link } = await response.json();
  
  currentUser = username;
  currentRoom = roomId;
  
  joinRoom(roomId, username);
  
  alert(`Room created! Share this link with friends:\n${link}`);
});

// Join Room
joinRoomBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const roomId = roomIdInput.value.trim();
  
  if (!username || !roomId) {
    alert('Please enter your name and room code');
    return;
  }
  
  currentUser = username;
  currentRoom = roomId;
  joinRoom(roomId, username);
});

function joinRoom(roomId, username) {
  const profilePhoto = profilePhotoInput.files[0];
  
  if (profilePhoto) {
    const reader = new FileReader();
    reader.onload = (e) => {
      socket.emit('join-room', { roomId, username, profilePhoto: e.target.result });
      showChatScreen();
    };
    reader.readAsDataURL(profilePhoto);
  } else {
    socket.emit('join-room', { roomId, username, profilePhoto: null });
    showChatScreen();
  }
}

function showChatScreen() {
  loginScreen.classList.remove('active');
  chatScreen.classList.add('active');
}

// Send Message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  socket.emit('send-message', {
    roomId: currentRoom,
    message,
    type: 'text'
  });
  
  messageInput.value = '';
}

// Stickers
stickerBtn.addEventListener('click', () => {
  stickerPicker.classList.toggle('hidden');
  giftPicker.classList.add('hidden');
});

document.querySelectorAll('.sticker').forEach(sticker => {
  sticker.addEventListener('click', () => {
    const stickerEmoji = sticker.dataset.sticker;
    socket.emit('send-message', {
      roomId: currentRoom,
      message: stickerEmoji,
      type: 'sticker'
    });
    stickerPicker.classList.add('hidden');
  });
});

// Gifts
giftBtn.addEventListener('click', () => {
  giftPicker.classList.toggle('hidden');
  stickerPicker.classList.add('hidden');
});

document.querySelectorAll('.gift').forEach(gift => {
  gift.addEventListener('click', () => {
    const giftEmoji = gift.dataset.gift;
    socket.emit('send-message', {
      roomId: currentRoom,
      message: giftEmoji,
      type: 'gift'
    });
    giftPicker.classList.add('hidden');
  });
});

// Voice Recording
voiceBtn.addEventListener('click', toggleRecording);

async function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    voiceBtn.classList.remove('recording');
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('voice', audioBlob);
        
        const response = await fetch('/api/upload-voice', {
          method: 'POST',
          body: formData
        });
        
        const { filename } = await response.json();
        
        socket.emit('send-message', {
          roomId: currentRoom,
          message: 'Voice Note',
          type: 'voice',
          data: filename
        });
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      voiceBtn.classList.add('recording');
    } catch (err) {
      alert('Microphone access denied');
    }
  }
}

// Share Link
shareLinkBtn.addEventListener('click', () => {
  const link = `${window.location.origin}/?room=${currentRoom}`;
  navigator.clipboard.writeText(link);
  alert('Coleni link copied to clipboard!');
});

// Settings
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('active');
});

document.querySelector('.close').addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

// Update Profile Photo
document.getElementById('update-profile-photo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      socket.emit('update-profile', { profilePhoto: event.target.result });
    };
    reader.readAsDataURL(file);
  }
});

// Update Background
document.getElementById('update-background').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      messagesContainer.style.backgroundImage = `url(${event.target.result})`;
      socket.emit('update-background', { roomId: currentRoom, background: event.target.result });
    };
    reader.readAsDataURL(file);
  }
});

document.querySelectorAll('.bg-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const bg = btn.dataset.bg;
    messagesContainer.style.backgroundColor = bg;
    messagesContainer.style.backgroundImage = 'none';
    socket.emit('update-background', { roomId: currentRoom, background: bg });
  });
});

// Socket Events
socket.on('user-joined', ({ user, users }) => {
  updateUsersList(users);
  addSystemMessage(`${user.username} joined the chat`);
});

socket.on('user-left', ({ userId, users }) => {
  updateUsersList(users);
});

socket.on('load-messages', (messages) => {
  messages.forEach(msg => displayMessage(msg));
});

socket.on('new-message', (msg) => {
  displayMessage(msg);
});

socket.on('background-updated', (background) => {
  if (background.startsWith('#')) {
    messagesContainer.style.backgroundColor = background;
    messagesContainer.style.backgroundImage = 'none';
  } else {
    messagesContainer.style.backgroundImage = `url(${background})`;
  }
});

function updateUsersList(users) {
  usersList.innerHTML = users.map(user => `
    <div class="user-item">
      <img src="${user.profilePhoto}" class="user-avatar" alt="${user.username}">
      <span>${user.username}</span>
    </div>
  `).join('');
}

function displayMessage(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  let content = '';
  
  if (msg.type === 'text') {
    content = `<div class="message-text">${msg.message}</div>`;
  } else if (msg.type === 'sticker') {
    content = `<div class="message-sticker">${msg.message}</div>`;
  } else if (msg.type === 'gift') {
    content = `<div class="message-gift">${msg.message}</div>`;
  } else if (msg.type === 'voice') {
    content = `
      <div class="message-voice">
        <audio controls src="/uploads/voice/${msg.data}"></audio>
      </div>
    `;
  }
  
  messageDiv.innerHTML = `
    <img src="${msg.profilePhoto || '/default-avatar.png'}" class="message-avatar" alt="${msg.user}">
    <div class="message-content">
      <div class="message-username">${msg.user}</div>
      ${content}
      <div class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.style.textAlign = 'center';
  messageDiv.style.color = '#999';
  messageDiv.style.fontSize = '12px';
  messageDiv.style.margin = '10px 0';
  messageDiv.textContent = text;
  messagesContainer.appendChild(messageDiv);
}
