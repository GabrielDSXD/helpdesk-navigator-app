
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { TicketResponse, User } from "@/types";

interface TicketMessagesProps {
  messages: TicketResponse[];
  messageUsers: Record<string, User>;
  ticketUserId: string;
}

const TicketMessages: React.FC<TicketMessagesProps> = ({
  messages,
  messageUsers,
  ticketUserId,
}) => {
  const getUserName = (userId: string) => {
    const userInfo = messageUsers[userId];
    if (userInfo && userInfo.name) {
      return userInfo.name;
    }
    return userId === ticketUserId ? "Cliente" : "Administrador";
  };

  const getUserRole = (userId: string) => {
    const userInfo = messageUsers[userId];
    if (userInfo) {
      return userInfo.role;
    }
    return userId === ticketUserId ? "user" : "admin";
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Respostas ({messages.length})
      </h3>

      {messages.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhuma resposta ainda</p>
          <p className="text-sm">
            Este ticket ainda não possui respostas. Seja o primeiro a responder!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start border-b pb-2">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium capitalize">
                        {getUserName(message.userId)}
                        {getUserRole(message.userId) === "user" ? (
                          <Badge
                            variant="outline"
                            className="ml-2 border-secondary-foreground"
                          >
                            Cliente
                          </Badge>
                        ) : (
                          <Badge variant="default" className="ml-2 bg-primary">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="flex flex-row mt-2 whitespace-pre-wrap pl-0 text-wrap">
                  {message.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketMessages;
