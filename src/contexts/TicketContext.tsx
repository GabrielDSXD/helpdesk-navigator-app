
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, User, TicketResponse } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ticketService } from '@/services/ticketService';
import { messageService } from '@/services/messageService';

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  createTicket: (title: string, description: string, priority: TicketPriority) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  assignTicket: (ticketId: string) => Promise<void>;
  addResponse: (ticketId: string, content: string) => Promise<void>;
  closeTicket: (ticketId: string, resolution: string) => Promise<void>;
  reopenTicket: (ticketId: string) => Promise<void>;
  archiveTicket: (ticketId: string) => Promise<void>;
  unarchiveTicket: (ticketId: string) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  fetchTickets: () => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }: { children: React.ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Fetch tickets on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  // Fetch tickets based on user role
  const fetchTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let fetchedTickets;
      
      if (isAdmin) {
        fetchedTickets = await ticketService.getAllTickets();
      } else {
        fetchedTickets = await ticketService.getUserTickets();
      }
      
      console.log('Raw fetched tickets:', fetchedTickets);
      
      // Better handling of empty or null responses
      if (!fetchedTickets) {
        console.log('No tickets data received, setting empty array');
        setTickets([]);
      } else if (Array.isArray(fetchedTickets)) {
        console.log('Tickets is array, setting directly:', fetchedTickets.length);
        setTickets(fetchedTickets);
      } else {
        console.log('Tickets data received but not array, setting empty array');
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Erro ao carregar tickets",
        description: "Não foi possível carregar os tickets. Tente novamente.",
        variant: "destructive"
      });
      // Always set empty array in case of error to avoid undefined issues
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new ticket
  const createTicket = async (title: string, description: string, priority: TicketPriority) => {
    if (!user) throw new Error('Você precisa estar logado para criar um ticket');
    
    setLoading(true);
    try {
      const response = await ticketService.createTicket({ 
        title, 
        description, 
        priority 
      });
      
      await fetchTickets(); // Refresh tickets list
      
      toast({
        title: "Ticket criado com sucesso",
        description: `Seu ticket foi criado e aguarda atendimento.`
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Erro ao criar ticket",
        description: "Não foi possível criar o ticket. Verifique seus dados.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get a ticket by ID from the local state
  const getTicketById = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  // Assign a ticket to the current admin
  const assignTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem assumir tickets');
    
    setLoading(true);
    try {
      await ticketService.assumeTicket(ticketId);
      
      toast({
        title: "Ticket assumido",
        description: `Você agora é responsável pelo ticket #${ticketId.substring(0, 5)}`
      });
      
      // Recarregar a página para evitar problemas de cache
      window.location.reload();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Erro ao assumir ticket",
        description: "Não foi possível assumir o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a response to a ticket
  const addResponse = async (ticketId: string, content: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    
    setLoading(true);
    try {
      await messageService.createMessage({ 
        ticketId, 
        content 
      });
      
      // Refresh tickets to get updated responses
      await fetchTickets();
      
      toast({
        title: "Resposta adicionada",
        description: `Sua resposta foi adicionada ao ticket #${ticketId.substring(0, 5)}`
      });
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: "Erro ao adicionar resposta",
        description: "Não foi possível adicionar a resposta. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Close a ticket with resolution
  const closeTicket = async (ticketId: string, resolution: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem fechar tickets');
    
    setLoading(true);
    try {
      await ticketService.updateTicketStatus(ticketId, {
        status: 'closed',
        resolution
      });
      
      toast({
        title: "Ticket fechado",
        description: `O ticket #${ticketId.substring(0, 5)} foi fechado com sucesso.`
      });
      
      // Recarregar a página para evitar problemas de cache
      window.location.reload();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        title: "Erro ao fechar ticket",
        description: "Não foi possível fechar o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reopen a closed ticket
  const reopenTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem reabrir tickets');
    
    setLoading(true);
    try {
      await ticketService.reopenTicket(ticketId);
      
      toast({
        title: "Ticket reaberto",
        description: `O ticket #${ticketId.substring(0, 5)} foi reaberto com sucesso.`
      });
      
      // Recarregar a página para evitar problemas de cache
      window.location.reload();
    } catch (error) {
      console.error('Error reopening ticket:', error);
      toast({
        title: "Erro ao reabrir ticket",
        description: "Não foi possível reabrir o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Archive a ticket
  const archiveTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem arquivar tickets');
    
    setLoading(true);
    try {
      await ticketService.archiveTicket(ticketId);
      
      toast({
        title: "Ticket arquivado",
        description: `O ticket #${ticketId.substring(0, 5)} foi arquivado com sucesso.`
      });
      
      await fetchTickets();
    } catch (error) {
      console.error('Error archiving ticket:', error);
      toast({
        title: "Erro ao arquivar ticket",
        description: "Não foi possível arquivar o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Unarchive a ticket
  const unarchiveTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem desarquivar tickets');
    
    setLoading(true);
    try {
      await ticketService.unarchiveTicket(ticketId);
      
      toast({
        title: "Ticket desarquivado",
        description: `O ticket #${ticketId.substring(0, 5)} foi desarquivado com sucesso.`
      });
      
      await fetchTickets();
    } catch (error) {
      console.error('Error unarchiving ticket:', error);
      toast({
        title: "Erro ao desarquivar ticket",
        description: "Não foi possível desarquivar o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a ticket
  const deleteTicket = async (ticketId: string) => {
    if (!user) throw new Error('Você precisa estar logado');
    if (!isAdmin) throw new Error('Apenas administradores podem deletar tickets');
    
    setLoading(true);
    try {
      await ticketService.deleteTicket(ticketId);
      
      toast({
        title: "Ticket deletado",
        description: `O ticket #${ticketId.substring(0, 5)} foi deletado com sucesso.`
      });
      
      await fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Erro ao deletar ticket",
        description: "Não foi possível deletar o ticket. Tente novamente.",
        variant: "destructive"
      });
      throw error;
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
        closeTicket,
        reopenTicket,
        archiveTicket,
        unarchiveTicket,
        deleteTicket,
        fetchTickets
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
