
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
      // Load tickets once when the component mounts
      fetchTickets();
      
      // Poll for notifications once when the component mounts
      pollForNewNotifications();
      
      // We've moved the recurring polling to the TicketDetail component
      // to have better control over the interval and avoid duplicate requests
    }
  }, [user, id]);

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
