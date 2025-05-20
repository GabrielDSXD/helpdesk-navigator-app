
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { user, loading } = useAuth();

  // Redirecionamento para home se já estiver autenticado
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  // Mostrar carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary">
      <div className="mb-8 text-center">
        <img src="/logo-color.png" alt="Logo" className="h-12 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-primary">Sistema de Tickets</h1>
        <p className="text-gray-600">Faça login para gerenciar seus tickets de suporte</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
