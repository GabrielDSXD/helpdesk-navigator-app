
import React, { useEffect } from 'react';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { TicketStatus, TicketPriority } from '@/types';

const TicketList: React.FC = () => {
  const { tickets, fetchTickets, loading } = useTickets();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  // Função para exibir o status do ticket
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

  // Função para exibir a prioridade do ticket
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

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Carregando tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isAdmin ? 'Todos os Tickets' : 'Meus Tickets'}
        </h2>
        <Button onClick={() => navigate('/new-ticket')}>
          Novo Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">Não há tickets para exibir</p>
          <Button 
            onClick={() => navigate('/new-ticket')} 
            className="mt-4"
          >
            Criar novo ticket
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div 
                  className="p-4 cursor-pointer" 
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">{ticket.title}</h3>
                    <div className="flex gap-2">
                      {renderStatusBadge(ticket.status)}
                      {renderPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      {ticket.responses?.length ? (
                        <span>{ticket.responses.length} resposta(s)</span>
                      ) : (
                        <span>Sem respostas</span>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <span>
                        Criado: {new Date(ticket.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
