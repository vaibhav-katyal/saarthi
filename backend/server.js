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

// Basic Socket.io Logic for Code Duels
let waitingPlayer = null;
let rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Join Duel Queue
  socket.on('join-duel', (user) => {
    if (waitingPlayer) {
      if (waitingPlayer.socket.id === socket.id) return; // Ignore duplicate requests
      
      const roomId = `room-${Date.now()}`;
      socket.join(roomId);
      waitingPlayer.socket.join(roomId);

      rooms[roomId] = {
        players: [waitingPlayer.user, user],
        code: ''
      };

      // Notify both players
      io.to(roomId).emit('duel-started', {
        roomId,
        opponent: waitingPlayer.user,
        message: 'A wild opponent appeared! Let the duel begin.'
      });
      waitingPlayer.socket.emit('duel-started', {
        roomId,
        opponent: user,
        message: 'A wild opponent appeared! Let the duel begin.'
      });

      waitingPlayer = null; // Reset waiting player
    } else {
      waitingPlayer = { socket, user };
      socket.emit('waiting', { message: 'Waiting for an opponent...' });
    }
  });

  // Handle Code Changes
  socket.on('code-change', ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('opponent-code-change', code);
    }
  });

  // End Duel (Simplified)
  socket.on('submit-code', ({ roomId, user }) => {
    io.to(roomId).emit('duel-finished', {
      winner: user,
      message: `${user.name || 'Opponent'} has submitted their code and won the duel!`
    });
    delete rooms[roomId];
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (waitingPlayer && waitingPlayer.socket.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));

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
