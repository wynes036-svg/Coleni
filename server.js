const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Create uploads directory with proper error handling
try {
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
  }
  if (!fs.existsSync('uploads/voice')) {
    fs.mkdirSync('uploads/voice', { recursive: true });
  }
  if (!fs.existsSync('uploads/profiles')) {
    fs.mkdirSync('uploads/profiles', { recursive: true });
  }
  if (!fs.existsSync('uploads/backgrounds')) {
    fs.mkdirSync('uploads/backgrounds', { recursive: true });
  }
} catch (err) {
  console.log('Note: Could not create uploads directory, using temp storage');
}

// Storage for voice notes
const voiceStorage = multer.diskStorage({
  destination: 'uploads/voice/',
  filename: (req, file, cb) => {
    cb(null, `voice-${Date.now()}.webm`);
  }
});

const upload = multer({ storage: voiceStorage });

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Generate shareable Coleni link
app.post('/api/create-room', (req, res) => {
  const roomId = `coleni-${uuidv4().slice(0, 8)}`;
  rooms.set(roomId, {
    users: [],
    messages: [],
    backgrounds: new Map()
  });
  res.json({ roomId, link: `${req.protocol}://${req.get('host')}/?room=${roomId}` });
});

// Upload voice note
app.post('/api/upload-voice', upload.single('voice'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username, profilePhoto }) => {
    socket.join(roomId);
    
    const user = {
      id: socket.id,
      username,
      profilePhoto: profilePhoto || '/default-avatar.png'
    };
    
    users.set(socket.id, { ...user, roomId });
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [], messages: [], backgrounds: new Map() });
    }
    
    const room = rooms.get(roomId);
    room.users.push(user);
    
    io.to(roomId).emit('user-joined', { user, users: room.users });
    socket.emit('load-messages', room.messages);
  });

  socket.on('send-message', ({ roomId, message, type, data }) => {
    const user = users.get(socket.id);
    if (!user) {
      console.log('User not found for socket:', socket.id);
      return;
    }
    
    const room = rooms.get(roomId);
    if (!room) {
      console.log('Room not found:', roomId);
      return;
    }
    
    const msg = {
      id: uuidv4(),
      user: user.username,
      profilePhoto: user.profilePhoto,
      message,
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    room.messages.push(msg);
    io.to(roomId).emit('new-message', msg);
  });

  socket.on('update-profile', ({ profilePhoto }) => {
    const user = users.get(socket.id);
    if (user) {
      user.profilePhoto = profilePhoto;
      const room = rooms.get(user.roomId);
      io.to(user.roomId).emit('user-updated', { userId: socket.id, profilePhoto });
    }
  });

  socket.on('update-background', ({ roomId, background }) => {
    const user = users.get(socket.id);
    const room = rooms.get(roomId);
    if (room) {
      room.backgrounds.set(socket.id, background);
      socket.emit('background-updated', background);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.roomId);
      if (room) {
        room.users = room.users.filter(u => u.id !== socket.id);
        io.to(user.roomId).emit('user-left', { userId: socket.id, users: room.users });
      }
      users.delete(socket.id);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Coleni server running on port ${PORT}`);
  console.log(`Server is ready and listening for connections`);
  console.log(`Local: http://localhost:${PORT}`);
  
  // Get local IP for mobile access
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Mobile: http://${iface.address}:${PORT}`);
      }
    }
  }
});
