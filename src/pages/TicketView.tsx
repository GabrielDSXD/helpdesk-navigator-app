
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TicketDetail from '@/components/tickets/TicketDetail';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useNotifications } from '@/contexts/NotificationContext';

const TicketView: React.FC = () => {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { fetchTickets } = useTickets();
  const { pollForNewNotifications } = useNotifications();

  useEffect(() => {
    if (user && id) {
      fetchTickets();
      pollForNewNotifications();
    }
  }, [user, id, fetchTickets, pollForNewNotifications]);

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
