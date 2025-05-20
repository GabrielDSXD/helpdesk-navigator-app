
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector?: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'new' | 'open' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  userId: string;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  assignedTo?: User;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  content: string;
  userId: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  ticketId?: string;
}
