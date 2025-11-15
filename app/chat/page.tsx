/**
 * Página de chat en tiempo real
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/auth-store';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Chat, ChatMessage } from '@prisma/client';

interface ChatWithDetails extends Chat {
  participants: Array<{
    user: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
  }>;
  messages: ChatMessage[];
  _count: {
    messages: number;
  };
}

interface MessageWithUser extends ChatMessage {
  user: {
    nombre: string;
    apellido: string;
  };
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener lista de chats
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return chatService.getUserChats(user.id);
    },
    enabled: !!user,
  });

  // Obtener mensajes del chat seleccionado
  const { data: messages } = useQuery({
    queryKey: ['chat-messages', selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return [];
      return chatService.getMessages(selectedChatId);
    },
    enabled: !!selectedChatId,
    refetchInterval: 3000, // Polling cada 3 segundos
  });

  // Enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChatId || !user) throw new Error('No hay chat seleccionado');
      return chatService.sendMessage({
        chatId: selectedChatId,
        userId: user.id,
        content,
      });
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChatId] });
      scrollToBottom();
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });

  // Suscribirse a nuevos mensajes en tiempo real
  useEffect(() => {
    if (!selectedChatId) return;

    const unsubscribe = chatService.subscribeToMessages(
      selectedChatId,
      (message) => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChatId] });
        scrollToBottom();

        // Notificación si el mensaje es de otro usuario
        if (message.userId !== user?.id) {
          toast.info(`Nuevo mensaje de ${message.user?.nombre}`);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedChatId, user, queryClient]);

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const selectedChat = chats?.find((c) => c.id === selectedChatId);

  const filteredChats = chats?.filter((chat) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.nombre?.toLowerCase().includes(searchLower) ||
      chat.participants.some((p) =>
        `${p.user.nombre} ${p.user.apellido}`.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.CHAT_VIEW}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Lista de chats */}
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversaciones
                  </CardTitle>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredChats && filteredChats.length > 0 ? (
                  <div className="space-y-1">
                    {filteredChats.map((chat) => {
                      const lastMessage = chat.messages[0];
                      const otherParticipants = chat.participants.filter(
                        (p) => p.user.id !== user?.id
                      );
                      const chatName =
                        chat.nombre ||
                        otherParticipants
                          .map((p) => `${p.user.nombre} ${p.user.apellido}`)
                          .join(', ');

                      return (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`w-full p-3 rounded-lg text-left transition ${
                            selectedChatId === chat.id
                              ? 'bg-mining-orange text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback
                                className={
                                  selectedChatId === chat.id
                                    ? 'bg-white text-mining-orange'
                                    : 'bg-mining-orange text-white'
                                }
                              >
                                {chat.type === 'PROYECTO' ? (
                                  <Users className="h-5 w-5" />
                                ) : (
                                  otherParticipants[0]?.user.nombre.charAt(0).toUpperCase() ||
                                  'C'
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold truncate">{chatName}</p>
                                {chat._count.messages > 0 && lastMessage && (
                                  <span className="text-xs opacity-70">
                                    {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                      addSuffix: false,
                                      locale: es,
                                    })}
                                  </span>
                                )}
                              </div>
                              {lastMessage && (
                                <p className="text-xs truncate opacity-70">
                                  {lastMessage.content}
                                </p>
                              )}
                            </div>
                            {chat.type === 'PROYECTO' && (
                              <Badge
                                variant="secondary"
                                className={
                                  selectedChatId === chat.id ? 'bg-white/20' : ''
                                }
                              >
                                Proyecto
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay conversaciones</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ventana de chat */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedChat ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-mining-orange text-white">
                          {selectedChat.type === 'PROYECTO' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            selectedChat.nombre?.charAt(0).toUpperCase() || 'C'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {selectedChat.nombre ||
                            selectedChat.participants
                              .filter((p) => p.user.id !== user?.id)
                              .map((p) => `${p.user.nombre} ${p.user.apellido}`)
                              .join(', ')}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {selectedChat.participants.length} participantes
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Mensajes */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages && messages.length > 0 ? (
                        messages.map((message: MessageWithUser) => {
                          const isOwnMessage = message.userId === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] ${
                                  isOwnMessage
                                    ? 'bg-mining-orange text-white'
                                    : 'bg-gray-100 text-gray-900'
                                } rounded-lg p-3`}
                              >
                                {!isOwnMessage && (
                                  <p className="text-xs font-semibold mb-1">
                                    {message.user.nombre} {message.user.apellido}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isOwnMessage ? 'text-white/70' : 'text-gray-500'
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(message.createdAt), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No hay mensajes aún</p>
                          <p className="text-xs mt-1">Envía el primer mensaje</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Input de mensaje */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        type="submit"
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Selecciona una conversación</p>
                    <p className="text-sm">Elige un chat para comenzar a enviar mensajes</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
