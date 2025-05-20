
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, User } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (message: string, ticketId?: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
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
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Adicionar uma nova notificação
  const addNotification = (message: string, ticketId?: string) => {
    if (!user) return;
    
    const newNotification: Notification = {
      id: generateId(),
      message,
      read: false,
      createdAt: new Date().toISOString(), // Converting Date to string
      userId: user.id,
      ticketId
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar uma toast para a notificação
    if (user.role === 'admin') { // Changed from 'ADMIN' to 'admin' to match UserRole type
      toast({
        title: "Nova notificação",
        description: message,
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
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
