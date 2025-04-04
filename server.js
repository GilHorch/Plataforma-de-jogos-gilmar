const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração da sessão
app.use(session({
    secret: 'segredo-do-jogo',
    resave: false,
    saveUninitialized: true
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Carregar base de usuários
const USERS_FILE = 'usuarios.json';
function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        return JSON.parse(fs.readFileSync(USERS_FILE));
    }
    return {};
}

// Middleware para proteger rotas
function requireLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login.html');
    }
    next();
}

// Rota de login
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const users = loadUsers();

    if (users[usuario] && users[usuario] === senha) {
        req.session.usuario = usuario;
        return res.redirect('/jogo.html');
    }
    res.send('Usuário ou senha inválidos.');
});


// Rota de cadastro de novo usuário
app.post('/cadastro', (req, res) => {
    const { usuario, senha } = req.body;
    const users = loadUsers();

    if (users[usuario]) {
        return res.send('Usuário já existe. Tente outro nome.');
    }

    users[usuario] = senha;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    req.session.usuario = usuario;
    res.redirect('/jogo.html');
});







// Rota de logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});

// Rota protegida
app.get('/jogo.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jogo.html'));
});

// Salvar histórico
app.post('/historico', (req, res) => {
    if (!req.session.usuario) return res.status(401).send('Não autenticado');

    const { tempoRestante, resultado } = req.body;
    const usuario = req.session.usuario;
    const historicoPath = path.join(__dirname, 'historico', `${usuario}.json`);

    if (!fs.existsSync('historico')) fs.mkdirSync('historico');

    let historico = [];
    if (fs.existsSync(historicoPath)) {
        historico = JSON.parse(fs.readFileSync(historicoPath));
    }

    historico.push({
        data: new Date().toISOString(),
        resultado,
        tempoRestante
    });

    fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
    res.send('Histórico salvo!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando: http://localhost:${PORT}`);
});


// Rota protegida para exibir o histórico do usuário
app.get('/meu-historico', requireLogin, (req, res) => {
    const usuario = req.session.usuario;
    const historicoPath = path.join(__dirname, 'historico', `${usuario}.json`);

    if (fs.existsSync(historicoPath)) {
        const historico = JSON.parse(fs.readFileSync(historicoPath));
        return res.json(historico);
    }

    res.json([]);
});
