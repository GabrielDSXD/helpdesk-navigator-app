
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (user && user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'UT'; // User Template
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/logo-color.png" 
              alt="Logo" 
              className="h-8 mr-3 cursor-pointer" 
              onClick={() => navigate('/')}
            />
            <h1 
              className="text-xl font-bold text-primary cursor-pointer" 
              onClick={() => navigate('/')}
            >
              Sistema de Tickets
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              {/* Notificações - Apenas para admins */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-error rounded-full"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      Notificações
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          Marcar todas como lidas
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">
                              {notification.ticketId ? `Ticket #${notification.ticketId.substring(0, 5)}` : 'Sistema'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="mt-1 bg-focus/20 text-focus">
                              Nova
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="justify-center text-sm font-medium"
                      onClick={() => navigate('/notifications')}
                    >
                      Ver todas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Menu do usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="font-medium">{user?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-sm text-gray-500">{user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Badge variant={isAdmin ? "default" : "outline"} className={isAdmin ? "bg-primary" : ""}>
                      {isAdmin ? 'Admin' : 'Usuário'}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-error hover:text-error/80">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
