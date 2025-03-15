import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token'); // Verifica se o token existe

    // Se o token não existir, redireciona para a página de login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Se o token existir, renderiza a rota protegida
    return <Outlet />;
};

export default ProtectedRoute;