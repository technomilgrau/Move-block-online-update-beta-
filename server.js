const express = require('express');
const app = express();
app.use(express.json());

let serverActive = true; // Mude para false para desativar a função no script
let activeUsers = {};
let dailyUsers = new Set();
let lastReset = Date.now();
let chatMessages = [];

// Checar status
app.get('/status', (req, res) => res.json({ active: serverActive }));

// Atualizar presença (Ping)
app.post('/ping', (req, res) => {
    const { userId } = req.body;
    if (userId) {
        activeUsers[userId] = Date.now();
        dailyUsers.add(userId);
    }
    res.json({ success: true });
});

// Resgatar Informações (Contadores)
app.get('/info', (req, res) => {
    const now = Date.now();
    // Limpar usuários que não mandam ping há mais de 15 segundos
    for (let user in activeUsers) {
        if (now - activeUsers[user] > 15000) delete activeUsers[user];
    }
    // Resetar contagem diária a cada 24 horas
    if (now - lastReset > 24 * 60 * 60 * 1000) {
        dailyUsers.clear();
        lastReset = now;
    }
    res.json({ active: Object.keys(activeUsers).length, daily: dailyUsers.size });
});

// Enviar Mensagem
app.post('/chat', (req, res) => {
    const { username, message } = req.body;
    if (username && message) {
        let displayName = username;
        // Lógica exclusiva do dono
        if (username === "technoadm_1") displayName = "👑 technoadm_1 (dono)";
        
        chatMessages.push(`${displayName}: ${message}`);
        // Limite de 60 mensagens
        if (chatMessages.length > 60) chatMessages.shift();
    }
    res.json({ success: true });
});

// Ler Chat
app.get('/chat', (req, res) => res.json({ messages: chatMessages }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
