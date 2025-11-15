/**
 * Ventana de chat con mensajes en tiempo real
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages, useSendMessage, useMarkAsRead } from '@/hooks/queries/useChat';
import { chatService, type ChatMessage } from '@/services/chat.service';
import { useAuth } from '@/lib/rbac/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const { data: messages = [], refetch } = useChatMessages(chatId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Suscribirse a nuevos mensajes en tiempo real
  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(chatId, (message) => {
      refetch();

      // Auto-scroll si estamos cerca del final
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom) {
          setTimeout(() => {
            scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
          }, 100);
        }
      }
    });

    return unsubscribe;
  }, [chatId, refetch]);

  // Marcar como leído cuando se abre el chat
  useEffect(() => {
    markAsRead.mutate(chatId);
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    await sendMessage.mutateAsync({
      chatId,
      content: newMessage,
    });

    setNewMessage('');
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else {
      return format(date, 'dd/MM HH:mm', { locale: es });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message: ChatMessage) => {
            const isOwn = message.userId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg px-4 py-2`}
                >
                  {!isOwn && message.user && (
                    <p className="text-xs font-semibold mb-1">
                      {message.user.nombre} {message.user.apellido}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input de mensaje */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sendMessage.isPending}
            className="flex-1"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
