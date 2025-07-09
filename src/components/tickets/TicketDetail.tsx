
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/contexts/TicketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { messageService } from "@/services/messageService";
import { ticketService } from "@/services/ticketService";
import { TicketResponse, User, Ticket } from "@/types";
import { toast } from "sonner";
import TicketHeader from "./TicketHeader";
import TicketActions from "./TicketActions";
import TicketMessages from "./TicketMessages";
import MessageForm from "./MessageForm";
import CloseTicketDialog from "./CloseTicketDialog";

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getTicketById,
    assignTicket,
    addResponse,
    closeTicket,
    reopenTicket,
    archiveTicket,
    unarchiveTicket,
    deleteTicket,
    loading,
  } = useTickets();
  const { user, isAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [responseContent, setResponseContent] = useState("");
  const [resolution, setResolution] = useState("");
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | undefined>(undefined);
  const [messages, setMessages] = useState<TicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageUsers, setMessageUsers] = useState<Record<string, User>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (id) {
      loadTicketAndMessages();

      intervalRef.current = window.setInterval(() => {
        loadTicketAndMessages(false);
      }, 10000) as unknown as number;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const loadTicketAndMessages = async (showLoading = true) => {
    if (!id) return;

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      let currentTicket = getTicketById(id);
      
      if (!currentTicket) {
        try {
          currentTicket = await ticketService.getTicketById(id);
        } catch (error) {
          console.error("Failed to load ticket from API:", error);
          toast.error("Ticket não encontrado");
          navigate("/");
          return;
        }
      }
      
      setTicket(currentTicket);

      if (currentTicket) {
        try {
          const ticketMessages = await messageService.getTicketMessages(id);
          setMessages(ticketMessages || []);

          if (ticketMessages && ticketMessages.length > 0) {
            const userIds = new Set<string>();
            ticketMessages.forEach((message) => userIds.add(message.userId));

            const usersMap: Record<string, User> = {};

            if (currentTicket.user) {
              usersMap[currentTicket.userId] = currentTicket.user;
            }

            if (currentTicket.assignedTo) {
              usersMap[currentTicket.adminId!] = currentTicket.assignedTo;
            }

            ticketMessages.forEach((message) => {
              if (message.user) {
                usersMap[message.userId] = message.user;
              }
            });

            setMessageUsers(usersMap);
          }
        } catch (messageError) {
          console.log("Ticket ainda não possui mensagens");
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to load ticket details:", error);
      if (showLoading) {
        toast.error("Erro ao carregar detalhes do ticket");
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketAndMessages();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando detalhes do ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Ticket não encontrado</h2>
        <Button onClick={() => navigate("/")}>Voltar</Button>
      </div>
    );
  }

  const canRespond = user?.id === ticket.userId || isAdmin;
  const canClose = isAdmin && ticket.adminId === user?.id && ticket.status === "open";
  const canReopen = isAdmin && ticket.adminId === user?.id && ticket.status === "closed";
  const canAssign = isAdmin && ticket.status === "new";
  const canArchive = isAdmin && ticket.status !== "archived";
  const canUnarchive = isAdmin && ticket.status === "archived";
  const canDelete = isAdmin;

  const handleAssign = async () => {
    if (canAssign && id) {
      await assignTicket(id);

      if (ticket.userId !== user?.id) {
        addNotification(
          `O ticket "${ticket.title}" foi assumido por um administrador e está sendo analisado.`,
          ticket.id
        );
      }
    }
  };

  const handleAddResponse = async () => {
    if (responseContent.trim() && canRespond && id) {
      try {
        if (selectedFile) {
          await messageService.createMessageWithFile({ 
            ticketId: id, 
            content: responseContent,
            file: selectedFile
          });
        } else {
          await addResponse(id, responseContent);
        }
        
        setResponseContent("");
        setSelectedFile(null);

        if (isAdmin && ticket.userId !== user?.id) {
          addNotification(
            `Nova resposta no seu ticket "${ticket.title}"`,
            ticket.id
          );
        }

        if (!isAdmin && ticket.adminId) {
          addNotification(
            `Nova resposta do usuário no ticket "${ticket.title}"`,
            ticket.id
          );
        }

        loadTicketAndMessages();
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Erro ao enviar mensagem. Tente novamente.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddResponse();
    }
  };

  const handleCloseTicket = async () => {
    if (resolution.trim() && canClose && id) {
      await closeTicket(id, resolution);
      setIsCloseDialogOpen(false);

      if (ticket.userId !== user?.id) {
        addNotification(
          `Seu ticket "${ticket.title}" foi resolvido e fechado.`,
          ticket.id
        );
      }
    }
  };

  const handleReopenTicket = async () => {
    if (canReopen && id) {
      await reopenTicket(id);

      if (ticket.userId !== user?.id) {
        addNotification(
          `Seu ticket "${ticket.title}" foi reaberto.`,
          ticket.id
        );
      }
    }
  };

  const handleArchiveTicket = async () => {
    if (canArchive && id) {
      await archiveTicket(id);
      navigate("/");
    }
  };

  const handleUnarchiveTicket = async () => {
    if (canUnarchive && id) {
      await unarchiveTicket(id);
      navigate("/");
    }
  };

  const handleDeleteTicket = async () => {
    if (canDelete && id) {
      await deleteTicket(id);
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold flex-grow">
          Ticket #{ticket.id.substring(0, 5)}
        </h1>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mr-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="ml-2">Atualizar</span>
        </Button>
        <TicketActions
          ticket={ticket}
          canAssign={canAssign}
          canClose={canClose}
          canReopen={canReopen}
          canArchive={canArchive}
          canUnarchive={canUnarchive}
          canDelete={canDelete}
          loading={loading}
          onAssign={handleAssign}
          onClose={() => setIsCloseDialogOpen(true)}
          onReopen={handleReopenTicket}
          onArchive={handleArchiveTicket}
          onUnarchive={handleUnarchiveTicket}
          onDelete={handleDeleteTicket}
        />
      </div>

      <TicketHeader ticket={ticket} />

      <TicketMessages 
        messages={messages} 
        messageUsers={messageUsers} 
        ticketUserId={ticket.userId} 
      />

      {ticket.status !== "closed" && ticket.status !== "archived" && canRespond && (
        <MessageForm
          responseContent={responseContent}
          selectedFile={selectedFile}
          loading={loading}
          onContentChange={setResponseContent}
          onFileSelect={setSelectedFile}
          onSubmit={handleAddResponse}
          onKeyDown={handleKeyDown}
        />
      )}

      <CloseTicketDialog
        isOpen={isCloseDialogOpen}
        resolution={resolution}
        loading={loading}
        onOpenChange={setIsCloseDialogOpen}
        onResolutionChange={setResolution}
        onClose={handleCloseTicket}
      />
    </div>
  );
};

export default TicketDetail;
