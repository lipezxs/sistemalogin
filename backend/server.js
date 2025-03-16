require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

const PORT = process.env.PORT || 5000; // Mude para uma porta diferente
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(cors({
    origin: 'https://sistemalogin-frontend.onrender.com', // URL do frontend
    credentials: true,
}));

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Funções de validação
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

// Rota de registro
app.post('/register', async (req, res) => {
    console.log('Requisição de registro recebida:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!validateEmail(email)) return res.status(400).json({ message: 'Email inválido' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    pool.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            return res.status(500).json({ message: 'Erro ao verificar email' });
        }
        if (results.length > 0) return res.status(400).json({ message: 'Email já cadastrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        pool.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erro ao registrar usuário:', err);
                return res.status(500).json({ message: 'Erro ao registrar usuário' });
            }
            console.log('Usuário registrado com sucesso:', result);
            return res.status(201).json({ message: 'Usuário registrado com sucesso' });
        });
    });
});

// Rota de login
app.post('/login', (req, res) => {
    console.log('Requisição de login recebida:', req.body);
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Email inválido' });

    const query = 'SELECT * FROM users WHERE email = ?';
    pool.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao fazer login' });
        if (results.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Senha incorreta' });

        // Retorne os dados do usuário
        return res.json({ username: user.username });
    });
});

