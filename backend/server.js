require('dotenv').config(); // Carrega as variáveis do .env

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: '*', // Permite todas as origens (não recomendado para produção)
    credentials: true,
}));
app.use(express.json()); // Substitui o body-parser

// Serve arquivos estáticos do frontend (se estiver no mesmo projeto)
app.use(express.static(path.join(__dirname, 'build')));

// Rota para o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Conexão com o banco de dados
console.log('Tentando conectar ao banco de dados com as seguintes credenciais:');
console.log('Host:', process.env.DB_HOST);
console.log('Porta:', process.env.DB_PORT);
console.log('Usuário:', process.env.DB_USER);
console.log('Banco de dados:', process.env.DB_DATABASE);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Adicione a porta aqui
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 10000, // Aumenta o tempo limite para 10 segundos
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

// Funções de validação
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

app.post('/register', async (req, res) => {
    console.log('Requisição de registro recebida:', req.body); // Log para depuração
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!validateEmail(email)) return res.status(400).json({ message: 'Email inválido' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error('Erro ao verificar email:', err); // Log para depuração
            return res.status(500).json({ message: 'Erro ao verificar email' });
        }
        if (results.length > 0) return res.status(400).json({ message: 'Email já cadastrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erro ao registrar usuário:', err); // Log para depuração
                return res.status(500).json({ message: 'Erro ao registrar usuário' });
            }
            console.log('Usuário registrado com sucesso:', result); // Log para depuração
            res.status(201).json({ message: 'Usuário registrado com sucesso' });
        });
    });
});

// Rota de login
app.post('/login', (req, res) => {
    console.log('Requisição de login recebida:', req.body); // Log para depuração
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Email inválido' });

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao fazer login' });
        if (results.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    });
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});