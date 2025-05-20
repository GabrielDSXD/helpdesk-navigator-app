
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TicketList from '@/components/tickets/TicketList';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const { fetchTickets } = useTickets();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

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
      <TicketList />
    </MainLayout>
  );
};

export default Index;
