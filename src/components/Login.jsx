import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validações no frontend
        if (!email || !password) {
            setError('Email e senha são obrigatórios');
            return;
        }

        try {
            console.log('Enviando requisição de login:', { email, password }); // Log para depuração
            const response = await axios.post('https://sistemalogin-l5e0.onrender.com/login', { email, password });
            console.log('Resposta do backend:', response.data); // Log para depuração

            // Armazena o token e o nome de usuário no localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);

            // Redireciona para a página home
            navigate('/home');
        } catch (err) {
            console.error('Erro na requisição:', err); // Log para depuração
            if (err.response) {
                // Erros do backend
                setError(err.response.data.message);
            } else {
                setError('Erro ao conectar ao servidor');
            }
        }
    };

    return (
        <motion.div
            className="auth-container"
            initial={{ opacity: 0, y: -50 }} // Animação inicial
            animate={{ opacity: 1, y: 0 }} // Animação ao carregar
            transition={{ duration: 0.5 }} // Duração da animação
        >
            <h2>Login</h2>
            {error && (
                <motion.p
                    className="error-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {error}
                </motion.p>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
                <motion.input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    whileHover={{ scale: 1.05 }} // Efeito ao passar o mouse
                    whileTap={{ scale: 0.95 }} // Efeito ao clicar
                />
                <motion.input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Login
                </motion.button>
            </form>
            <motion.p className="auth-link" whileHover={{ scale: 1.05 }}>
                Não tem uma conta? <Link to="/register">Crie agora</Link>
            </motion.p>
        </motion.div>
    );
};

export default Login;