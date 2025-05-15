
import React, { createContext, useContext, useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, User, TicketResponse } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  createTicket: (title: string, description: string, priority: TicketPriority) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  assignTicket: (ticketId: string) => Promise<void>;
  addResponse: (ticketId: string, content: string) => Promise<void>;
  closeTicket: (ticketId: string, resolution: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

// Função auxiliar para gerar IDs aleatórios
const generateId = () => Math.random().toString(36).substring(2, 15);

export const TicketProvider = ({ children }: { children: React.ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Criar um ticket
  const createTicket = async (title: string, description: string, priority: TicketPriority) => {
    if (!user) throw new Error('Você precisa estar logado para criar um ticket');
    
    setLoading(true);
    try {
      // Simular requisição API
      await new Promise(r => setTimeout(r, 1000));
      
      const newTicket: Ticket = {
        id: generateId(),
        title,
        description,
        status: 'NEW',
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id,
        user: user,
        responses: []
      };
      
      setTickets(prev => [newTicket, ...prev]);
      toast({
        title: "Ticket criado com sucesso",
        description: `Ticket #${newTicket.id.substring(0, 5)} foi criado e aguarda atendimento.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Obter ticket por ID
  const getTicketById = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  // Atribuir ticket para o administrador atual
  const assignTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (user.role !== 'ADMIN') throw new Error('Apenas administradores podem assumir tickets');
    
    setLoading(true);
    try {
      // Simular requisição API
      await new Promise(r => setTimeout(r, 1000));
      
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: 'OPEN' as TicketStatus,
            assignedToId: user.id,
            assignedTo: user,
            updatedAt: new Date()
          };
        }
        return ticket;
      }));
      
      toast({
        title: "Ticket assumido",
        description: `Você agora é responsável pelo ticket #${ticketId.substring(0, 5)}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar resposta ao ticket
  const addResponse = async (ticketId: string, content: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    
    setLoading(true);
    try {
      // Simular requisição API
      await new Promise(r => setTimeout(r, 1000));
      
      const newResponse: TicketResponse = {
        id: generateId(),
        content,
        createdAt: new Date(),
        userId: user.id,
        user: user,
        ticketId
      };
      
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            responses: [...ticket.responses, newResponse],
            updatedAt: new Date()
          };
        }
        return ticket;
      }));
      
      toast({
        title: "Resposta adicionada",
        description: `Sua resposta foi adicionada ao ticket #${ticketId.substring(0, 5)}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Fechar ticket com resolução
  const closeTicket = async (ticketId: string, resolution: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (user.role !== 'ADMIN') throw new Error('Apenas administradores podem fechar tickets');
    
    setLoading(true);
    try {
      // Simular requisição API
      await new Promise(r => setTimeout(r, 1000));
      
      // Adiciona a resolução como uma resposta final
      const resolutionResponse: TicketResponse = {
        id: generateId(),
        content: `RESOLUÇÃO: ${resolution}`,
        createdAt: new Date(),
        userId: user.id,
        user: user,
        ticketId
      };
      
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: 'CLOSED' as TicketStatus,
            responses: [...ticket.responses, resolutionResponse],
            updatedAt: new Date()
          };
        }
        return ticket;
      }));
      
      toast({
        title: "Ticket fechado",
        description: `O ticket #${ticketId.substring(0, 5)} foi fechado com sucesso.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        loading,
        createTicket,
        getTicketById,
        assignTicket,
        addResponse,
        closeTicket
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
