import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';


const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validações no frontend
        if (!username || !email || !password) {
            setError('Todos os campos são obrigatórios');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            await axios.post('https://sistemalogin-l5e0.onrender.com/register', { username, email, password });
            console.log('Resposta do backend:', response.data);
            navigate('/login');
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
            <h2>Registro</h2>
            {error && (
                <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {error}
                </motion.p>
            )}
            <form onSubmit={handleSubmit} className="auth-form">
                <motion.input
                    type="text"
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
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
                    aria-label="Registrar"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Registrar
                </motion.button>
            </form>
            <motion.p className="auth-link" whileHover={{ scale: 1.05 }}>
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </motion.p>
        </motion.div>
    );
};

export default Register;
