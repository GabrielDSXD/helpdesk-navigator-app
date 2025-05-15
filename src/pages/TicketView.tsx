
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TicketDetail from '@/components/tickets/TicketDetail';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const TicketView: React.FC = () => {
  const { user, loading } = useAuth();

  // Redirecionamento para login se não estiver autenticado
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
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
    <MainLayout>
      <TicketDetail />
    </MainLayout>
  );
};

export default TicketView;
