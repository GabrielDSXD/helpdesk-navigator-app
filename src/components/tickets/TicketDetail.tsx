
import React, { useState } from 'react';
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
import { ArrowLeft, MessageSquare, Check, X } from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTicketById, assignTicket, addResponse, closeTicket, loading } = useTickets();
  const { user, isAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [responseContent, setResponseContent] = useState('');
  const [resolution, setResolution] = useState('');
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  
  const ticket = getTicketById(id || '');
  
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
  const canClose = isAdmin && ticket.assignedToId === user?.id && ticket.status === 'OPEN';
  
  // Verificar se um admin pode assumir o ticket
  const canAssign = isAdmin && ticket.status === 'NEW';
  
  // Função para renderizar o badge de status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge className="bg-ticket-new">Novo</Badge>;
      case 'OPEN':
        return <Badge className="bg-ticket-open">Aberto</Badge>;
      case 'CLOSED':
        return <Badge className="bg-ticket-closed">Fechado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  // Função para renderizar o badge de prioridade
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Baixa</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="border-green-300 text-green-700">Média</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Alta</Badge>;
      case 'URGENT':
        return <Badge className="bg-ticket-urgent">Urgente</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };
  
  // Manipulador para assumir o ticket
  const handleAssign = async () => {
    if (canAssign) {
      await assignTicket(ticket.id);
      
      // Adicionar notificação
      if (ticket.userId !== user?.id) {
        addNotification(
          `O ticket "${ticket.title}" foi assumido por um administrador e está sendo analisado.`,
          ticket.id
        );
      }
    }
  };
  
  // Manipulador para adicionar resposta
  const handleAddResponse = async () => {
    if (responseContent.trim() && canRespond) {
      await addResponse(ticket.id, responseContent);
      setResponseContent('');
      
      // Adicionar notificação se for um administrador respondendo ao usuário
      if (isAdmin && ticket.userId !== user?.id) {
        addNotification(
          `Nova resposta no seu ticket "${ticket.title}"`,
          ticket.id
        );
      }
      
      // Adicionar notificação se for usuário respondendo (para administradores)
      if (!isAdmin && ticket.assignedToId) {
        addNotification(
          `Nova resposta do usuário no ticket "${ticket.title}"`,
          ticket.id
        );
      }
    }
  };
  
  // Manipulador para fechar ticket
  const handleCloseTicket = async () => {
    if (resolution.trim() && canClose) {
      await closeTicket(ticket.id, resolution);
      setIsCloseDialogOpen(false);
      
      // Adicionar notificação para o usuário
      if (ticket.userId !== user?.id) {
        addNotification(
          `Seu ticket "${ticket.title}" foi resolvido e fechado.`,
          ticket.id
        );
      }
    }
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
        <div className="flex gap-2">
          {canAssign && (
            <Button onClick={handleAssign} disabled={loading}>
              Assumir Ticket
            </Button>
          )}
          
          {canClose && (
            <Button 
              variant="destructive"
              onClick={() => setIsCloseDialogOpen(true)}
              disabled={loading}
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
            Criado por {ticket.user?.name} em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
          </div>
          {ticket.assignedTo && (
            <div className="text-sm text-gray-500">
              Atribuído a {ticket.assignedTo.name}
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
          Respostas ({ticket.responses.length})
        </h3>
        
        {ticket.responses.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            Ainda não há respostas para este ticket.
          </div>
        ) : (
          <div className="space-y-4">
            {ticket.responses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {response.user?.name}
                      {response.user?.id === ticket.userId ? (
                        <Badge variant="outline" className="ml-2">Cliente</Badge>
                      ) : (
                        <Badge variant="default" className="ml-2">Admin</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">
                    {response.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {ticket.status !== 'CLOSED' && canRespond && (
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
              <Button onClick={handleAddResponse} disabled={loading || !responseContent.trim()}>
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
