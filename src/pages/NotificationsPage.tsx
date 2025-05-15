
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Redirecionamento para login se não estiver autenticado
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionamento para home se não for um admin
  if (!loading && !isAdmin) {
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

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleNavigateToTicket = (ticketId?: string) => {
    if (ticketId) {
      navigate(`/ticket/${ticketId}`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Notificações</h1>
          </div>
          
          {notifications.some(n => !n.read) && (
            <Button onClick={handleMarkAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">Não há notificações para exibir</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">
                          {notification.ticketId 
                            ? `Ticket #${notification.ticketId.substring(0, 5)}` 
                            : 'Sistema'}
                        </span>
                        {!notification.read && (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {new Date(notification.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marcar como lida
                        </Button>
                      )}
                      {notification.ticketId && (
                        <Button 
                          size="sm"
                          onClick={() => handleNavigateToTicket(notification.ticketId)}
                        >
                          Ver Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
