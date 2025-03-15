import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    // Verifica se o usuário está autenticado ao carregar a página
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redireciona para a página de login se não houver token
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login'); // Redireciona para a página de login após o logout
    };

    return (
        <motion.div
            className="home-container"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2>Bem-vindo, {username}!</h2>
            <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Logout
            </motion.button>
        </motion.div>
    );
};

export default Home;