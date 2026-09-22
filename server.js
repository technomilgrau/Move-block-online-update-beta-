const express = require('express');  
const cors = require('cors');  
const app = express();  
  
app.use(cors());  
app.use(express.json());  
  
let chatMessages = [];  
let activeUsers = {};  

// Novos objetos para o sistema MBWork
let privateQueues = {}; // Armazena mensagens privadas até o alvo dar /sync
let typingStatus = {};  // Armazena quem está digitando para quem
  
// Rota raiz para o UptimeRobot reconhecer o status (200 OK)  
app.get('/', (req, res) => {  
    res.status(200).send('Servidor Online!');  
});  
  
// Limpa usuários inativos e seus status de digitação
setInterval(() => {  
    const now = Date.now();  
    for (let user in activeUsers) {  
        if (now - activeUsers[user].lastSeen > 10000) {  
            delete activeUsers[user];  
            
            // Remove o status de digitação do usuário que caiu
            for (let target in typingStatus) {
                if (typingStatus[target][user]) {
                    delete typingStatus[target][user];
                }
            }
        }  
    }  
}, 5000);  
  
// Rota de Sincronização (Modificada para o MBWork)
app.post('/sync', (req, res) => {  
    const { user, id, display } = req.body;  
    
    if (user) {  
        // Agora salva os dados extras enviados pelo script
        activeUsers[user] = {
            lastSeen: Date.now(),
            id: id,
            display: display
        };  
    }  
    
    // Pega as mensagens privadas direcionadas a este usuário
    const myPrivateMessages = privateQueues[user] || [];
    
    // Limpa a fila do servidor (o script Lua agora salva localmente)
    if (myPrivateMessages.length > 0) {
        privateQueues[user] = [];
    }

    res.json({  
        activeCount: Object.keys(activeUsers).length,  
        chat: chatMessages,
        privateMessages: myPrivateMessages,
        typingUsers: typingStatus[user] || {}
    });  
});  
  
// Rota Chat Global
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

// Rota MBWork: Enviar Mensagem Privada
app.post('/send_private', (req, res) => {
    const { target, message } = req.body;
    if (target && message) {
        // Se não existir uma fila para o alvo, cria uma
        if (!privateQueues[target]) {
            privateQueues[target] = [];
        }
        // Adiciona a mensagem para ser entregue no próximo /sync do alvo
        privateQueues[target].push(message);
    }
    res.json({ success: true });
});

// Rota MBWork: Status de Digitação
app.post('/typing', (req, res) => {
    const { user, target, typing } = req.body;
    
    if (user && target) {
        if (!typingStatus[target]) {
            typingStatus[target] = {};
        }
        
        if (typing) {
            typingStatus[target][user] = true;
        } else {
            delete typingStatus[target][user];
        }
    }
    res.json({ success: true });
});
  
const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
