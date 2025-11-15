/**
 * Hooks de React Query para Chat
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  chatService,
  type CreateChatInput,
  type SendMessageInput,
} from '@/services';
import { useAuth } from '@/lib/rbac/useAuth';

const QUERY_KEYS = {
  CHATS: ['chats'] as const,
  CHAT: (id: string) => ['chat', id] as const,
  MESSAGES: (chatId: string) => ['messages', chatId] as const,
};

/**
 * Hook para obtener todos los chats del usuario
 */
export function useMyChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.CHATS,
    queryFn: () => chatService.getMyChats(user!.id),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener un chat específico
 */
export function useChat(chatId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.CHAT(chatId),
    queryFn: () => chatService.getChatById(chatId, user!.id),
    enabled: !!user && !!chatId,
  });
}

/**
 * Hook para obtener mensajes de un chat
 */
export function useChatMessages(chatId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES(chatId),
    queryFn: () => chatService.getMessages(chatId),
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para crear un nuevo chat
 */
export function useCreateChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateChatInput) => chatService.create(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      toast.success('Chat creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear chat: ${error.message}`);
    },
  });
}

/**
 * Hook para enviar un mensaje
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: SendMessageInput) => chatService.sendMessage(user!.id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES(data.chatId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
    onError: (error: Error) => {
      toast.error(`Error al enviar mensaje: ${error.message}`);
    },
  });
}

/**
 * Hook para marcar mensajes como leídos
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (chatId: string) => chatService.markAsRead(chatId, user!.id),
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT(chatId) });
    },
  });
}

/**
 * Hook para obtener o crear chat directo con otro usuario
 */
export function useGetOrCreateDirectChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (otherUserId: string) => chatService.getOrCreateDirectChat(user!.id, otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
    onError: (error: Error) => {
      toast.error(`Error al abrir chat: ${error.message}`);
    },
  });
}
