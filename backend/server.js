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

// Sentry Debug Endpoint (Restored for troubleshooting)
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

// Create HTTP server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Initialize DB if not exists
const initializeBattle = async () => {
    try {
        const count = await Battle.countDocuments();
        if (count === 0) {
            const initialData = new Battle({
                battleId: 'red-vs-blue',
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
initializeBattle();

// API Routes

// GET /api/battle/:id?deviceId=...
app.get('/api/battle/:battleId', async (req, res) => {
    const { battleId } = req.params;
    const { deviceId } = req.query;

    try {
        const battle = await Battle.findOne({ battleId });

        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        // Calculate total votes from options array
        // Note: We could also calculate from votes Map size, but let's stick to options for display consistency
        const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);

        const optionsWithStats = battle.options.map(opt => ({
            id: opt.id,
            name: opt.name,
            votes: opt.votes,
            percentage: totalVotes === 0 ? 50 : Math.round((opt.votes / totalVotes) * 100)
        }));

        const userVote = deviceId && battle.votes ? battle.votes.get(deviceId) : null;

        res.json({
            battleId,
            options: optionsWithStats,
            totalVotes,
            userVote
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/battle/:id/vote
app.post('/api/battle/:battleId/vote', async (req, res) => {
    const { battleId } = req.params;
    const { optionId, deviceId } = req.body;

    if (!optionId || !deviceId) {
        return res.status(400).json({ error: 'Missing optionId or deviceId' });
    }

    try {
        const battle = await Battle.findOne({ battleId });

        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        // Check if user already voted (and vote hasn't changed)
        const previousVote = battle.votes.get(deviceId);

        if (previousVote === optionId) {
            return res.status(200).json({ message: 'Already voted for this option' });
        }

        // Decrement old vote if exists
        if (previousVote) {
            const oldOption = battle.options.find(o => o.id === previousVote);
            if (oldOption) oldOption.votes--;
        }

        // Increment new vote
        const newOption = battle.options.find(o => o.id === optionId);
        if (!newOption) {
            return res.status(400).json({ error: 'Invalid option' });
        }
        newOption.votes++;

        // Save vote
        battle.votes.set(deviceId, optionId);
        await battle.save();

        // Broadcast update via Socket.io
        const totalVotes = battle.options.reduce((acc, opt) => acc + opt.votes, 0);
        const optionsWithStats = battle.options.map(opt => ({
            id: opt.id,
            name: opt.name,
            votes: opt.votes,
            percentage: totalVotes === 0 ? 50 : Math.round((opt.votes / totalVotes) * 100)
        }));

        io.emit('vote_update', {
            battleId,
            options: optionsWithStats,
            totalVotes
        });

        res.json({ success: true, optionId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
