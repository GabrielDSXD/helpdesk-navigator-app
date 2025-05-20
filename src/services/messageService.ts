
import api from './api';
import { TicketResponse } from '@/types';

interface CreateMessageData {
  content: string;
  ticketId: string;
}

export const messageService = {
  createMessage: async (messageData: CreateMessageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  
  getTicketMessages: async (ticketId: string) => {
    const response = await api.get(`/messages/${ticketId}/list`);
    return response.data;
  },
  
  getAllMessages: async () => {
    const response = await api.get('/messages');
    return response.data;
  },
  
  deleteMessage: async (id: string) => {
    const response = await api.delete(`/messages/${id}/delete`);
    return response.data;
  }
};
