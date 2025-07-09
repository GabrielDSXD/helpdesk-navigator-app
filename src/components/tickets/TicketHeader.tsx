
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "@/types";

interface TicketHeaderProps {
  ticket: Ticket;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ ticket }) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-ticket-new">Novo</Badge>;
      case "open":
        return <Badge className="bg-ticket-open">Aberto</Badge>;
      case "closed":
        return <Badge className="bg-ticket-closed">Fechado</Badge>;
      case "archived":
        return <Badge className="bg-gray-500">Arquivado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Baixa
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Média
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-700"
          >
            Alta
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  return (
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
          Criado em {new Date(ticket.createdAt).toLocaleString("pt-BR")}
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
  );
};

export default TicketHeader;
