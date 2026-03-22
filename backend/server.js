require('dotenv').config();
const express = require('express');
const http = require('http'); // NEW: Core Node module for HTTP
const { Server } = require('socket.io'); // NEW: The WebSocket library

const app = express();
const server = http.createServer(app); // NEW: Wrap Express inside the HTTP server

// --- NEW: INITIALIZE THE WEBSOCKET SERVER ---
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Your React app's URL
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// --- NEW: THE "SWITCHBOARD" ---
// This map remembers who is online: { 'userId-123': 'socketId-abc' }
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log(`⚡ A device connected: ${socket.id}`);

    // When a user's React app loads, it will send a 'register' event with their User ID
    socket.on('register', (userId) => {
        // 🚀 FIX: Join a "Room" named after their User ID. 
        // This allows them to have multiple tabs (Topbar + Chat Page) open at the same time!
        socket.join(userId);
        console.log(`👤 User ${userId} joined their personal notification room`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ A device disconnected: ${socket.id}`);
    });
});

// Make the 'io' instance and 'connectedUsers' dictionary available to your controllers!
app.set('io', io);
app.set('connectedUsers', connectedUsers);
// --------------------------------------------

const session = require('express-session');
const passport = require('passport');
require('./src/config/passport')(passport);
const cors = require('cors');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
require('./src/config/db');

// --- Routes ---
const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const budgetRoutes = require('./src/routes/budgetRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', contactRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => { // 🚀 Added '0.0.0.0' for Render compatibility
    console.log(`🚀 EventLK API is live on port ${PORT}`);
});

// CHANGED: We now listen on the 'server' instead of 'app' so both HTTP and WebSockets work!
server.listen(PORT, () => {
    console.log(`🚀 EventLK HTTP API running on port ${PORT}`);
    console.log(`📡 WebSocket Server is armed and ready!`);
});