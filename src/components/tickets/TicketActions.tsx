
import React from "react";
import { Button } from "@/components/ui/button";
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
import { RotateCcw, Archive, Trash } from "lucide-react";
import { Ticket } from "@/types";

interface TicketActionsProps {
  ticket: Ticket;
  canAssign: boolean;
  canClose: boolean;
  canReopen: boolean;
  canArchive: boolean;
  canUnarchive: boolean;
  canDelete: boolean;
  loading: boolean;
  onAssign: () => void;
  onClose: () => void;
  onReopen: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  ticket,
  canAssign,
  canClose,
  canReopen,
  canArchive,
  canUnarchive,
  canDelete,
  loading,
  onAssign,
  onClose,
  onReopen,
  onArchive,
  onUnarchive,
  onDelete,
}) => {
  return (
    <div className="flex gap-2">
      {canAssign && (
        <Button
          onClick={onAssign}
          disabled={loading}
          className="bg-primary hover:bg-primary/80"
        >
          Assumir Ticket
        </Button>
      )}

      {canClose && (
        <Button
          variant="destructive"
          onClick={onClose}
          disabled={loading}
          className="bg-error hover:bg-error/80"
        >
          Fechar Ticket
        </Button>
      )}

      {canReopen && (
        <Button
          onClick={onReopen}
          disabled={loading}
          className="bg-success hover:bg-success/80"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reabrir Ticket
        </Button>
      )}

      {canArchive && (
        <Button variant="outline" onClick={onArchive} disabled={loading}>
          <Archive className="h-4 w-4 mr-2" />
          Arquivar
        </Button>
      )}

      {canUnarchive && (
        <Button variant="outline" onClick={onUnarchive} disabled={loading}>
          <Archive className="h-4 w-4 mr-2" />
          Desarquivar
        </Button>
      )}

      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <Trash className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o ticket "{ticket.title}"? Esta
                ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default TicketActions;
