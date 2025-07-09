
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import FileUpload from "./FileUpload";

interface MessageFormProps {
  responseContent: string;
  selectedFile: File | null;
  loading: boolean;
  onContentChange: (content: string) => void;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  responseContent,
  selectedFile,
  loading,
  onContentChange,
  onFileSelect,
  onSubmit,
  onKeyDown,
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Adicionar Resposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={responseContent}
          onChange={(e) => onContentChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite sua resposta... (Enter para enviar, Shift+Enter para quebrar linha)"
          rows={4}
        />
        <FileUpload onFileSelect={onFileSelect} selectedFile={selectedFile} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={loading || (!responseContent.trim() && !selectedFile)}
          className="bg-primary hover:bg-primary/80"
        >
          Enviar Resposta
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MessageForm;
