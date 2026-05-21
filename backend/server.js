const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    console.log('=== BACKEND: CREATE-ROOM ===');
    console.log('User creating room:', user);
    
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

    console.log('Room created:', roomId, 'with player:', { id: user.id, name: user.name });
    socket.emit('room-created', { roomId, room: rooms[roomId] });
  });

  // Join Room
  socket.on('join-room', ({ roomId, user }) => {
    console.log('=== BACKEND: JOIN-ROOM ===');
    console.log('User joining room:', roomId, 'user:', user);
    console.log('Room exists?', !!rooms[roomId]);
    
    if (!rooms[roomId]) {
      console.log('Room not found, emitting error');
      return socket.emit('error', { message: 'Room not found' });
    }
    
    if (rooms[roomId].players.length >= 2) {
      console.log('Room is full');
      return socket.emit('error', { message: 'Room is full' });
    }

    // Prevent joining multiple times
    const isAlreadyIn = rooms[roomId].players.find(p => p.id === user.id);
    if (!isAlreadyIn) {
      rooms[roomId].players.push(user);
      console.log('Player added to room. Room now has:', rooms[roomId].players.map(p => ({ id: p.id, name: p.name })));
    } else {
      console.log('Player already in room');
    }

    socket.join(roomId);

    // Notify room
    console.log('Emitting player-joined event');
    io.to(roomId).emit('player-joined', { roomId, room: rooms[roomId] });
  });

  // Sync Problem
  socket.on('sync-problem', ({ roomId, problem }) => {
    console.log('=== BACKEND: SYNC-PROBLEM EVENT ===');
    console.log('roomId:', roomId);
    console.log('room exists?', !!rooms[roomId]);
    console.log('problem title:', problem?.title);
    console.log('problem difficulty:', problem?.difficulty);
    
    if (rooms[roomId]) {
      rooms[roomId].problem = problem;
      console.log('Problem stored in room, now broadcasting problem-synced event');
      io.to(roomId).emit('problem-synced', { problem });
      console.log('problem-synced event emitted to room');
    } else {
      console.log('ERROR: Room does not exist!');
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
    console.log('=== BACKEND: DUEL-WIN EVENT ===');
    console.log('roomId:', roomId);
    console.log('winner user:', user);
    console.log('room exists?', !!rooms[roomId]);
    console.log('room status:', rooms[roomId]?.status);
    console.log('room players:', rooms[roomId]?.players?.map(p => ({ id: p.id, name: p.name })));
    console.log('room problem:', rooms[roomId]?.problem?.title);
    
    if (rooms[roomId] && rooms[roomId].status === 'active') {
      rooms[roomId].status = 'finished';
      
      // Find opponent
      const allPlayers = rooms[roomId].players;
      const opponent = allPlayers.find(p => p.id !== user.id);
      
      console.log('Opponent found:', opponent?.name);
      
      // Get the problem from the room
      const problem = rooms[roomId].problem;
      console.log('Problem from room:', { title: problem?.title, difficulty: problem?.difficulty });
      
      // Prepare event data with all required fields
      const eventData = { 
        winner: user, 
        opponent: opponent || null,
        problemTitle: problem?.title || 'Unknown Problem',
        problemDifficulty: problem?.difficulty || 'Medium',
        roomId: roomId,
        message: `${user.name || 'Opponent'} has passed all test cases and won the duel!` 
      };
      
      console.log('Emitting duel-finished event with all data');
      io.to(roomId).emit('duel-finished', eventData);
    } else {
      console.log('FAILED - room not found or not active');
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
app.use('/api/codeduel', require('./routes/codeduelRoutes'));

// Note: File uploads now use Cloudinary - no local static file serving needed

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Saarthi API' });
});

const PORT = process.env.PORT || 5000;

// Listen using the HTTP server
server.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Start email scheduler after server starts
const { scheduleWeeklyEmails } = require('./utils/emailScheduler');
scheduleWeeklyEmails();

// Verify email service on startup
const { verifyConnection } = require('./utils/emailService');
verifyConnection().then((ready) => {
  if (ready) {
    console.log('✅ Email service is ready for sending');
  } else {
    console.error('❌ Email service is NOT ready. Password reset emails will fail.');
    console.error('   Check your SMTP credentials in backend/.env and restart the server.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

