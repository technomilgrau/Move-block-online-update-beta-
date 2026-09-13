const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let onlineUsers = {};
let active24h = new Set();
let globalChat = [];
let pendingMessages = {};
let friendRequests = {};
let friends = {};

setInterval(() => {
    const now = Date.now();
    for (let user in onlineUsers) {
        if (now - onlineUsers[user].lastSeen > 10000) delete onlineUsers[user];
    }
}, 5000);

app.post('/ping', (req, res) => {
    const { nick, pic, typingTo } = req.body;
    if (nick) {
        onlineUsers[nick] = { lastSeen: Date.now(), pic, typingTo };
        active24h.add(nick);
    }
    res.json({
        online: Object.keys(onlineUsers).length,
        ativos24h: active24h.size
    });
});

app.get('/search/:nick', (req, res) => {
    const nick = req.params.nick;
    const isOnline = !!onlineUsers[nick];
    res.json({ found: active24h.has(nick), online: isOnline });
});

app.post('/global', (req, res) => {
    const { nick, msg } = req.body;
    globalChat.push(`${nick}: ${msg}`);
    if (globalChat.length > 100) globalChat.shift();
    res.json({ success: true });
});

app.get('/global', (req, res) => res.json(globalChat));

app.post('/pv/send', (req, res) => {
    const { from, to, msg } = req.body;
    if (!pendingMessages[to]) pendingMessages[to] = [];
    pendingMessages[to].push({ from, msg, t: Date.now() });
    res.json({ success: true });
});

app.get('/pv/fetch/:nick', (req, res) => {
    const nick = req.params.nick;
    const msgs = pendingMessages[nick] || [];
    delete pendingMessages[nick]; 
    res.json(msgs);
});

app.post('/friend/add', (req, res) => {
    const { from, to } = req.body;
    if (!friendRequests[to]) friendRequests[to] = [];
    if (!friendRequests[to].includes(from)) friendRequests[to].push(from);
    res.json({ success: true });
});

app.get('/friend/requests/:nick', (req, res) => {
    res.json(friendRequests[req.params.nick] || []);
});

app.post('/friend/accept', (req, res) => {
    const { nick, from } = req.body;
    if (friendRequests[nick]) {
        friendRequests[nick] = friendRequests[nick].filter(n => n !== from);
    }
    if (!friends[nick]) friends[nick] = [];
    if (!friends[from]) friends[from] = [];
    friends[nick].push(from);
    friends[from].push(nick);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MBwork rodando na porta ${PORT}`));
