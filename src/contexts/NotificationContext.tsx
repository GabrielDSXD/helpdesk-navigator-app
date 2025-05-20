
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, User } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (message: string, ticketId?: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  pollForNewNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Função auxiliar para gerar IDs aleatórios
const generateId = () => Math.random().toString(36).substring(2, 15);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Função para buscar notificações do servidor
  const pollForNewNotifications = useCallback(() => {
    if (!user) return;
    
    // Simulando a busca de novas notificações
    // Em um cenário real, isso faria uma chamada à API
    console.log("Polling for new notifications...");
    
    // Aqui você implementaria a lógica real para buscar notificações do servidor
  }, [user]);
  
  // Configurar polling periódico de notificações
  useEffect(() => {
    if (!user) return;
    
    // Polling inicial
    pollForNewNotifications();
    
    // Configurar intervalo para polling
    const intervalId = setInterval(pollForNewNotifications, 30000); // a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [user, pollForNewNotifications]);
  
  // Adicionar uma nova notificação
  const addNotification = (message: string, ticketId?: string) => {
    if (!user) return;
    
    const newNotification: Notification = {
      id: generateId(),
      message,
      read: false,
      createdAt: new Date().toISOString(),
      userId: user.id,
      ticketId
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar uma toast para a notificação
    if (user.role === 'admin') {
      uiToast({
        title: "Nova notificação",
        description: message,
      });
      
      // Também mostrar uma notificação usando Sonner para maior visibilidade
      toast.info(message, {
        position: 'top-right',
        icon: <BellRing className="h-4 w-4" />,
      });
    }
  };

  // Marcar uma notificação como lida
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        pollForNewNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
