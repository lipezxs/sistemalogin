const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

// Use the PORT environment variable from Render
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'OlRHcNhnmFAlDRnymYUynrGSuOlmqpRT',
    database: 'railway'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

// Função para validar email
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Função para validar senha (agora mais simples)
const validatePassword = (password) => {
    return password.length >= 6; // Senha deve ter pelo menos 6 caracteres
};

// Rota de registro
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validações
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, email e senha' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Email inválido' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' }); // Mensagem atualizada
    }

    // Verificar se o email já está cadastrado
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao verificar email' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir novo usuário no banco de dados
        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao registrar usuário' });
            }
            res.status(201).json({ message: 'Usuário registrado com sucesso' });
        });
    });
});


// Rota de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Email inválido' });
    }

    // Verificar se o usuário existe
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer login' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
        res.json({ token, username: user.username });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});