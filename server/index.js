const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const { handleChat } = require('./services/chatService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

app.get('/api/emissions', (req, res) => {
    res.json([]);
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message required" });
    }

    try {
        const response = await handleChat(message);
        res.json(response);
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send("API running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. Ready to accept requests.`);
});
