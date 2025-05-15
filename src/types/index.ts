
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type TicketStatus = 'NEW' | 'OPEN' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  assignedToId?: string;
  assignedTo?: User;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user?: User;
  ticketId: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  ticketId?: string;
}
