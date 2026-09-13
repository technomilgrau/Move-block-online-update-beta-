const express = require('express');
const app = express();
app.use(express.json());

let serverActive = true;
let activeUsers = {}; 
let dailyUsers = new Set();
let lastReset = Date.now();
let chatMessages = [];

// Rota raiz adicionada para o UptimeRobot manter o servidor 24/7
app.get('/', (req, res) => {
    res.status(200).send('Servidor Online!');
});

app.get('/status', (req, res) => res.json({ active: serverActive }));

app.post('/ping', (req, res) => {
    const { userId, username } = req.body;
    if (userId) {
        activeUsers[userId] = {
            userId: userId,
            username: username || "Unknown",
            lastPing: Date.now()
        };
        dailyUsers.add(userId);
    }
    res.json({ success: true });
});

app.get('/info', (req, res) => {
    const now = Date.now();
    let activeList = [];
    
    for (let id in activeUsers) {
        if (now - activeUsers[id].lastPing > 15000) {
            delete activeUsers[id];
        } else {
            activeList.push({
                userId: activeUsers[id].userId,
                username: activeUsers[id].username
            });
        }
    }

    if (now - lastReset > 24 * 60 * 60 * 1000) {
        dailyUsers.clear();
        lastReset = now;
    }

    res.json({ 
        active: activeList.length, 
        daily: dailyUsers.size,
        users: activeList 
    });
});

app.post('/chat', (req, res) => {
    const { username, message } = req.body;
    if (username && message) {
        let displayName = username;
        if (username === "technoadm_1") displayName = "👑 technoadm_1 (dono)";
        
        chatMessages.push(`${displayName}: ${message}`);
        if (chatMessages.length > 60) chatMessages.shift();
    }
    res.json({ success: true });
});

app.get('/chat', (req, res) => res.json({ messages: chatMessages }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
