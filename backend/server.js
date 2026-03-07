const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST']
  }
});

// Room-based Code Duels
let rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Create Room
  socket.on('create-room', (user) => {
    // Generate a simple 4 digit room code for easy sharing
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    socket.join(roomId);

    rooms[roomId] = {
      owner: user,
      players: [user],
      problem: null,
      status: 'waiting', // waiting, active, finished
      timerStartTime: null,
    };

    socket.emit('room-created', { roomId, room: rooms[roomId] });
  });

  // Join Room
  socket.on('join-room', ({ roomId, user }) => {
    if (!rooms[roomId]) {
      return socket.emit('error', { message: 'Room not found' });
    }
    
    if (rooms[roomId].players.length >= 2) {
      return socket.emit('error', { message: 'Room is full' });
    }

    // Prevent joining multiple times
    const isAlreadyIn = rooms[roomId].players.find(p => p.id === user.id);
    if (!isAlreadyIn) {
      rooms[roomId].players.push(user);
    }

    socket.join(roomId);

    // Notify room
    io.to(roomId).emit('player-joined', { roomId, room: rooms[roomId] });
  });

  // Sync Problem
  socket.on('sync-problem', ({ roomId, problem }) => {
    if (rooms[roomId]) {
      rooms[roomId].problem = problem;
      io.to(roomId).emit('problem-synced', { problem });
    }
  });

  // Start Round
  socket.on('start-round', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].status = 'active';
      rooms[roomId].timerStartTime = Date.now();
      io.to(roomId).emit('round-started', { timerStartTime: rooms[roomId].timerStartTime });
    }
  });

  // Test Progress
  socket.on('test-progress', ({ roomId, userId, passed, total }) => {
    if (rooms[roomId]) {
      socket.to(roomId).emit('opponent-progress', { userId, passed, total });
    }
  });

  // Win
  socket.on('duel-win', ({ roomId, user }) => {
    if (rooms[roomId] && rooms[roomId].status === 'active') {
      rooms[roomId].status = 'finished';
      io.to(roomId).emit('duel-finished', { winner: user, message: `${user.name || 'Opponent'} has passed all test cases and won the duel!` });
    }
  });

  // New Round
  socket.on('new-round', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].status = 'waiting';
      rooms[roomId].problem = null;
      rooms[roomId].timerStartTime = null;
      io.to(roomId).emit('round-reset', { room: rooms[roomId] });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vault', require('./routes/vaultRoutes'));
app.use('/api/testpad', require('./routes/testpadRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Serve uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Saarthi API' });
});

const PORT = process.env.PORT || 5000;

// Listen using the HTTP server
server.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
