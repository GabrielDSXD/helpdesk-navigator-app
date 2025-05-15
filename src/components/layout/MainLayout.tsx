
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer" 
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
                        <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
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
                          className="text-xs"
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
                            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
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
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="font-medium">{user.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Badge variant={isAdmin ? "default" : "outline"}>
                      {isAdmin ? 'Admin' : 'Usuário'}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
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
