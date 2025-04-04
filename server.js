const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // onde está seu jogo HTML

// Simulação de sessão com usuário fixo
const usuarioAtual = 'usuario1';

// Rota para salvar histórico
app.post('/historico', (req, res) => {
    const { tempoRestante, resultado } = req.body;
    const historicoPath = path.join(__dirname, 'historico', `${usuarioAtual}.json`);

    // Criar diretório se não existir
    if (!fs.existsSync(path.dirname(historicoPath))) {
        fs.mkdirSync(path.dirname(historicoPath), { recursive: true });
    }

    let historico = [];

    // Ler histórico anterior se existir
    if (fs.existsSync(historicoPath)) {
        const data = fs.readFileSync(historicoPath);
        historico = JSON.parse(data);
    }

    // Adicionar nova entrada
    historico.push({
        data: new Date().toISOString(),
        resultado,
        tempoRestante
    });

    // Salvar de volta no arquivo
    fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));

    res.send('Histórico salvo com sucesso!');
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
