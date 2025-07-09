
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";

interface CloseTicketDialogProps {
  isOpen: boolean;
  resolution: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onResolutionChange: (resolution: string) => void;
  onClose: () => void;
}

const CloseTicketDialog: React.FC<CloseTicketDialogProps> = ({
  isOpen,
  resolution,
  loading,
  onOpenChange,
  onResolutionChange,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechar Ticket</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="resolution">
            Descreva como este ticket foi resolvido:
          </Label>
          <Textarea
            id="resolution"
            className="mt-2"
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value)}
            placeholder="Descreva a resolução..."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onClose}
            disabled={loading || !resolution.trim()}
            className="bg-primary hover:bg-primary/80"
          >
            <Check className="h-4 w-4 mr-2" />
            Fechar Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseTicketDialog;
