
import React, { useEffect, useState, useMemo } from "react";
import { useTickets } from "@/contexts/TicketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TicketStatus, TicketPriority } from "@/types";
import TicketFilters from "./TicketFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Archive, Trash } from "lucide-react";

const TicketList: React.FC = () => {
  const { tickets, fetchTickets, loading, archiveTicket, unarchiveTicket, deleteTicket } = useTickets();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(undefined);
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  // Função para limpar todos os filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
  };

  // Filtrar tickets baseado nos filtros aplicados
  const filteredTickets = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];
    
    return tickets.filter((ticket) => {
      // Filtro por título
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por status - tickets arquivados só aparecem quando filtrado especificamente
      let matchesStatus = true;
      if (statusFilter === "all") {
        // Por padrão, não mostrar tickets arquivados
        matchesStatus = ticket.status !== "archived";
      } else {
        matchesStatus = ticket.status === statusFilter;
      }

      // Filtro por data
      const ticketDate = new Date(ticket.createdAt);
      const matchesDateFrom = !dateFromFilter || ticketDate >= dateFromFilter;
      const matchesDateTo = !dateToFilter || ticketDate <= dateToFilter;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [tickets, searchTerm, statusFilter, dateFromFilter, dateToFilter]);

  // Função para exibir o status do ticket
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

  // Função para exibir a prioridade do ticket
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

  const handleArchiveTicket = async (ticketId: string) => {
    try {
      await archiveTicket(ticketId);
    } catch (error) {
      console.error("Erro ao arquivar ticket:", error);
    }
  };

  const handleUnarchiveTicket = async (ticketId: string) => {
    try {
      await unarchiveTicket(ticketId);
    } catch (error) {
      console.error("Erro ao desarquivar ticket:", error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
    } catch (error) {
      console.error("Erro ao deletar ticket:", error);
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
          {isAdmin ? "Todos os Tickets" : "Meus Tickets"}
        </h2>
        <Button onClick={() => navigate("/new-ticket")}>Novo Ticket</Button>
      </div>

      {/* Componente de Filtros */}
      <TicketFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFromFilter={dateFromFilter}
        onDateFromFilterChange={setDateFromFilter}
        dateToFilter={dateToFilter}
        onDateToFilterChange={setDateToFilter}
        onClearFilters={handleClearFilters}
      />

      {filteredTickets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">
            {!tickets || tickets.length === 0 
              ? "Não há tickets para exibir" 
              : "Nenhum ticket encontrado com os filtros aplicados"
            }
          </p>
          {(!tickets || tickets.length === 0) && (
            <Button onClick={() => navigate("/new-ticket")} className="mt-4">
              Criar novo ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
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

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {ticket.user.name}
                  </p>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      {ticket.messageCount ? (
                        <span>{ticket.messageCount} resposta(s)</span>
                      ) : (
                        <span>Sem respostas</span>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <span>
                        Criado:{" "}
                        {new Date(ticket.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="border-t p-2 bg-gray-50 flex justify-end gap-2">
                    {ticket.status === "archived" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveTicket(ticket.id);
                        }}
                        disabled={loading}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Desarquivar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveTicket(ticket.id);
                        }}
                        disabled={loading}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Arquivar
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Deletar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o ticket "{ticket.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mostrar contadores */}
      {(searchTerm || statusFilter !== "all" || dateFromFilter || dateToFilter) && (
        <div className="text-sm text-gray-500 text-center mt-4">
          Mostrando {filteredTickets.length} de {tickets ? tickets.length : 0} tickets
        </div>
      )}
    </div>
  );
};

export default TicketList;
