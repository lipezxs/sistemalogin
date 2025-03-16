require('dotenv').config(); // Carrega as variáveis do .env

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware CORS
const cors = require('cors');

app.use(cors({
    origin: 'https://sistemalogin-l5e0.onrender.com', // ou '*' para permitir todos
    credentials: true,
}));

app.use(express.json()); // Substitui o body-parser

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

module.exports = pool;

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        process.exit(1); // Encerra o processo se não conseguir conectar ao banco de dados
    } else {
        console.log('Conectado ao MySQL');
        connection.release();
    }
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

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, username: user.username });
});
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
