const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let chatMessages = [];
let activeUsers = {};

// Rota raiz para o UptimeRobot reconhecer o status (200 OK)
app.get('/', (req, res) => {
    res.status(200).send('Servidor Online!');
});

// Limpa usuários que não enviaram ping há mais de 10 segundos
setInterval(() => {
    const now = Date.now();
    for (let user in activeUsers) {
        if (now - activeUsers[user] > 10000) {
            delete activeUsers[user];
        }
    }
}, 5000);

app.post('/sync', (req, res) => {
    const { user } = req.body;
    if (user) {
        activeUsers[user] = Date.now();
    }
    res.json({
        activeCount: Object.keys(activeUsers).length,
        chat: chatMessages
    });
});

app.post('/send', (req, res) => {
    const { user, msg } = req.body;
    if (user && msg) {
        chatMessages.push({ user, msg });
        if (chatMessages.length > 100) {
            chatMessages.shift(); // Mantém apenas as últimas 100 mensagens
        }
    }
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
