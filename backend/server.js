require('dotenv').config();
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Battle = require('./models/Battle');

const app = express();
const PORT = process.env.PORT || 3000;

// Sentry Setup for Express (v8+)
Sentry.setupExpressErrorHandler(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health Check for UptimeRobot
app.get('/health', (req, res) => res.status(200).send('OK'));

// Create HTTP server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/colorBattle')
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));
}

// Initialize DB if not exists
const initializeBattle = async () => {
    try {
        const count = await Battle.countDocuments();
        if (count === 0) {
            const initialData = new Battle({
                battleId: 'red-vs-blue',
                name: 'Equipo Rojo vs Equipo Azul',
                options: [
                    { id: 'red', name: 'Equipo Rojo', votes: 0 },
                    { id: 'blue', name: 'Equipo Azul', votes: 0 }
                ],
                votes: {}
            });
            await initialData.save();
            console.log('Initial Battle Created');
        }
    } catch (err) {
        console.error('Initialization Error:', err);
    }
};
if (process.env.NODE_ENV !== 'test') {
    initializeBattle();
}

// API Routes
const battleRoutes = require('./src/routes/battleRoutes');
const socialRoutes = require('./src/routes/socialRoutes');

app.use('/api', battleRoutes);
app.use('/api', socialRoutes);

// Store io in app for controller access
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join Battle Room
    socket.on('join_battle', (battleId) => {
        socket.join(battleId);
        console.log(`User ${socket.id} joined battle: ${battleId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app, server };
