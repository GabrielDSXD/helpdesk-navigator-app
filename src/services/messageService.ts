
import api from './api';
import { TicketResponse } from '@/types';

interface CreateMessageData {
  content: string;
  ticketId: string;
}

interface CreateMessageWithFileData {
  content: string;
  ticketId: string;
  file?: File;
}

export const messageService = {
  createMessage: async (messageData: CreateMessageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  createMessageWithFile: async (messageData: CreateMessageWithFileData) => {
    const formData = new FormData();
    formData.append('content', messageData.content);
    formData.append('ticketId', messageData.ticketId);
    
    if (messageData.file) {
      formData.append('file', messageData.file);
    }

    const response = await api.post('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
