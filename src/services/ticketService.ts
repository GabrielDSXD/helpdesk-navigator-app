
import api from './api';
import { Ticket, TicketPriority } from '@/types';

interface CreateTicketData {
  title: string;
  description: string;
  priority: string;
}

interface UpdateTicketStatusData {
  status: string;
  resolution?: string;
}

export const ticketService = {
  createTicket: async (ticketData: CreateTicketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },
  
  getUserTickets: async () => {
    const response = await api.get('/tickets/me');
    return response.data.tickets || [];
  },
  
  getAllTickets: async () => {
    const response = await api.get('/tickets');
    return response.data.tickets_list || [];
  },
  
  getTicketById: async (id: string) => {
    const response = await api.get(`/tickets/${id}/show`);
    return response.data.ticket;
  },
  
  assumeTicket: async (id: string) => {
    const response = await api.patch(`/tickets/${id}/assume`);
    return response.data.updatedTicket;
  },
  
  updateTicketStatus: async (id: string, data: UpdateTicketStatusData) => {
    const response = await api.patch(`/tickets/${id}/status`, data);
    return response.data.ticket;
  },
  
  reopenTicket: async (id: string) => {
    const response = await api.patch(`/tickets/${id}/status`, {
      status: 'open'
    });
    return response.data.ticket;
  },
  
  archiveTicket: async (id: string) => {
    const response = await api.patch(`/tickets/${id}/status`, {
      status: 'archived'
    });
    return response.data.ticket;
  },
  
  unarchiveTicket: async (id: string) => {
    const response = await api.patch(`/tickets/${id}/status`, {
      status: 'open'
    });
    return response.data.ticket;
  },
  
  deleteTicket: async (id: string) => {
    const response = await api.delete(`/tickets/${id}/delete`);
    return response.data;
  }
};
