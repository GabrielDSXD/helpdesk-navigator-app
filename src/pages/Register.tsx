
import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Register: React.FC = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Sistema de Tickets</h1>
        <p className="text-gray-600">Crie sua conta para acessar o suporte</p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register;
