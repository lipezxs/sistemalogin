import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email e senha são obrigatórios');
            return;
        }

        try {
            console.log('Enviando requisição de login:', { email, password });
            const response = await axios.post(`${API_URL}/login`, { email, password });
            console.log('Resposta do backend:', response.data);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);

            navigate('/home');
        } catch (err) {
            console.error('Erro na requisição:', err);
            setError(err.response?.data?.message || 'Erro ao conectar ao servidor');
        }
    };

    const animationProps = useMemo(() => ({
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    }), []);

    return (
        <motion.div className="auth-container" {...animationProps}>
            <h2>Login</h2>
            {error && (
                <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {error}
                </motion.p>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
                <motion.input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
                <motion.input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
                <motion.button
                    type="submit"
                    aria-label="Fazer login"
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
