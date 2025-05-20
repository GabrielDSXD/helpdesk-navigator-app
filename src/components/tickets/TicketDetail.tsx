
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageSquare, Check, X, RefreshCw } from 'lucide-react';
import { messageService } from '@/services/messageService';
import { ticketService } from '@/services/ticketService';
import { TicketResponse, User } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicketById, assignTicket, addResponse, closeTicket, loading, fetchTickets } = useTickets();
  const { user, isAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [responseContent, setResponseContent] = useState('');
  const [resolution, setResolution] = useState('');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [ticket, setTicket] = useState(getTicketById(id || ''));
  const [messages, setMessages] = useState<TicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageUsers, setMessageUsers] = useState<Record<string, User>>({});
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadTicketAndMessages();
    }
  }, [id]);

  const loadTicketAndMessages = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Refresh tickets first to get latest data
      await fetchTickets();
      const currentTicket = getTicketById(id);
      setTicket(currentTicket);
      
      // Load messages for this ticket
      if (currentTicket) {
        const ticketMessages = await messageService.getTicketMessages(id);
        setMessages(ticketMessages || []);
        
        // Get user details for each message
        const userIds = new Set<string>();
        ticketMessages?.forEach(message => userIds.add(message.userId));
        
        // In a real app, you'd fetch user details here
        // For now, we'll simulate with the data we have
        const usersMap: Record<string, User> = {};
        if (currentTicket.user) {
          usersMap[currentTicket.userId] = currentTicket.user;
        }
        if (currentTicket.assignedTo) {
          usersMap[currentTicket.adminId!] = currentTicket.assignedTo;
        }
        
        setMessageUsers(usersMap);
      }
    } catch (error) {
      console.error("Failed to load ticket details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketAndMessages();
    setRefreshing(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando detalhes do ticket...</p>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Ticket não encontrado</h2>
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </div>
    );
  }

  // Verificar se o usuário pode responder a este ticket
  const canRespond = user?.id === ticket.userId || isAdmin;
  
  // Verificar se o usuário pode fechar o ticket (apenas administrador atribuído)
  const canClose = isAdmin && ticket.adminId === user?.id && ticket.status === 'open';
  
  // Verificar se um admin pode assumir o ticket
  const canAssign = isAdmin && ticket.status === 'new';
  
  // Função para renderizar o badge de status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-ticket-new">Novo</Badge>;
      case 'open':
        return <Badge className="bg-ticket-open">Aberto</Badge>;
      case 'closed':
        return <Badge className="bg-ticket-closed">Fechado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  // Função para renderizar o badge de prioridade
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Baixa</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-green-300 text-green-700">Média</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Alta</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };
  
  // Manipulador para assumir o ticket
  const handleAssign = async () => {
    if (canAssign && id) {
      await assignTicket(id);
      
      // Adicionar notificação
      if (ticket.userId !== user?.id) {
        addNotification(
          `O ticket "${ticket.title}" foi assumido por um administrador e está sendo analisado.`,
          ticket.id
        );
      }
      
      // Recarregar ticket após atualização
      loadTicketAndMessages();
    }
  };
  
  // Manipulador para adicionar resposta
  const handleAddResponse = async () => {
    if (responseContent.trim() && canRespond && id) {
      await addResponse(id, responseContent);
      setResponseContent('');
      
      // Adicionar notificação se for um administrador respondendo ao usuário
      if (isAdmin && ticket.userId !== user?.id) {
        addNotification(
          `Nova resposta no seu ticket "${ticket.title}"`,
          ticket.id
        );
      }
      
      // Adicionar notificação se for usuário respondendo (para administradores)
      if (!isAdmin && ticket.adminId) {
        addNotification(
          `Nova resposta do usuário no ticket "${ticket.title}"`,
          ticket.id
        );
      }
      
      // Recarregar mensagens após adicionar resposta
      loadTicketAndMessages();
    }
  };
  
  // Manipulador para fechar ticket
  const handleCloseTicket = async () => {
    if (resolution.trim() && canClose && id) {
      await closeTicket(id, resolution);
      setIsCloseDialogOpen(false);
      
      // Adicionar notificação para o usuário
      if (ticket.userId !== user?.id) {
        addNotification(
          `Seu ticket "${ticket.title}" foi resolvido e fechado.`,
          ticket.id
        );
      }
      
      // Recarregar ticket após fechar
      loadTicketAndMessages();
    }
  };
  
  // Função para obter as iniciais do nome do usuário
  const getUserInitials = (userId: string) => {
    const userInfo = messageUsers[userId];
    if (userInfo && userInfo.name) {
      const nameParts = userInfo.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return userInfo.name.substring(0, 2).toUpperCase();
    }
    return userId.substring(0, 2).toUpperCase();
  };
  
  // Função para obter o nome do usuário
  const getUserName = (userId: string) => {
    const userInfo = messageUsers[userId];
    return userInfo ? userInfo.name : userId === ticket.userId ? 'Cliente' : 'Administrador';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold flex-grow">
          Ticket #{ticket.id.substring(0, 5)}
        </h1>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mr-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="ml-2">Atualizar</span>
        </Button>
        <div className="flex gap-2">
          {canAssign && (
            <Button 
              onClick={handleAssign} 
              disabled={loading}
              className="bg-primary hover:bg-primary/80"
            >
              Assumir Ticket
            </Button>
          )}
          
          {canClose && (
            <Button 
              variant="destructive"
              onClick={() => setIsCloseDialogOpen(true)}
              disabled={loading}
              className="bg-error hover:bg-error/80"
            >
              Fechar Ticket
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{ticket.title}</CardTitle>
            <div className="flex gap-2">
              {renderStatusBadge(ticket.status)}
              {renderPriorityBadge(ticket.priority)}
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Criado em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
          </div>
          {ticket.adminId && (
            <div className="text-sm text-gray-500">
              Atribuído a um administrador
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-xl font-medium mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Respostas ({messages.length})
        </h3>
        
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            Ainda não há respostas para este ticket.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className={message.userId === ticket.userId ? "bg-secondary" : "bg-primary text-primary-foreground"}>
                          {getUserInitials(message.userId)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {getUserName(message.userId)}
                          {message.userId === ticket.userId ? (
                            <Badge variant="outline" className="ml-2 border-secondary-foreground">Cliente</Badge>
                          ) : (
                            <Badge variant="default" className="ml-2 bg-primary">Admin</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap pl-10">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {ticket.status !== 'closed' && canRespond && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder="Digite sua resposta..."
                rows={4}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleAddResponse} 
                disabled={loading || !responseContent.trim()}
                className="bg-primary hover:bg-primary/80"
              >
                Enviar Resposta
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Modal para fechar ticket */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fechar Ticket</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="resolution">
              Descreva como este ticket foi resolvido:
            </Label>
            <Textarea
              id="resolution"
              className="mt-2"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Descreva a resolução..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleCloseTicket}
              disabled={loading || !resolution.trim()}
              className="bg-primary hover:bg-primary/80"
            >
              <Check className="h-4 w-4 mr-2" />
              Fechar Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketDetail;
