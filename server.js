const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Função para ler usuários do arquivo
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Função para salvar usuários no arquivo
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Página inicial redireciona para login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Rota de cadastro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const exists = users.find(user => user.username === username);
  if (exists) {
    return res.send('Usuário já existe. <a href="/register.html">Tente novamente</a>');
  }

  users.push({ username, password, history: [] });
  saveUsers(users);
  res.send('Cadastro realizado com sucesso! <a href="/login.html">Faça login</a>');
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.send(`Bem-vindo, ${username}! Em breve, você verá o jogo aqui.`);
  } else {
    res.send('Usuário ou senha inválidos. <a href="/login.html">Tente novamente</a>');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
