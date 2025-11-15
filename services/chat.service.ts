/**
 * Service para operaciones de Chat
 */

import { supabase } from '@/lib/supabase/client';

export type ChatType = 'PROYECTO' | 'DIRECT';

export interface Chat {
  id: string;
  type: ChatType;
  proyectoId?: string;
  nombre?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  lastRead?: string;
  joinedAt: string;
  user?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    role: string;
  };
}

export interface CreateChatInput {
  type: ChatType;
  proyectoId?: string;
  nombre?: string;
  participantIds: string[]; // IDs de usuarios participantes (además del creador)
}

export interface SendMessageInput {
  chatId: string;
  content: string;
}

export const chatService = {
  /**
   * Obtener todos los chats del usuario actual
   */
  async getMyChats(userId: string) {
    const { data, error } = await supabase
      .from('ChatParticipant')
      .select(
        `
        chat:Chat!chatId(
          id,
          type,
          proyectoId,
          nombre,
          createdBy,
          createdAt,
          updatedAt,
          participants:ChatParticipant(
            id,
            userId,
            lastRead,
            user:User!userId(id, nombre, apellido, email, role)
          )
        )
      `
      )
      .eq('userId', userId)
      .order('joinedAt', { ascending: false });

    if (error) throw error;

    // Obtener último mensaje de cada chat
    const chatsWithLastMessage = await Promise.all(
      (data || []).map(async (item: any) => {
        const chat = item.chat;

        // Obtener último mensaje
        const { data: lastMsg } = await supabase
          .from('ChatMessage')
          .select('*, user:User!userId(nombre, apellido)')
          .eq('chatId', chat.id)
          .order('createdAt', { ascending: false })
          .limit(1)
          .single();

        // Contar mensajes no leídos
        const { data: participant } = await supabase
          .from('ChatParticipant')
          .select('lastRead')
          .eq('chatId', chat.id)
          .eq('userId', userId)
          .single();

        const lastRead = participant?.lastRead;

        const { count: unreadCount } = await supabase
          .from('ChatMessage')
          .select('id', { count: 'exact', head: true })
          .eq('chatId', chat.id)
          .neq('userId', userId) // No contar mis propios mensajes
          .gt('createdAt', lastRead || '1970-01-01');

        return {
          ...chat,
          lastMessage: lastMsg,
          unreadCount: unreadCount || 0,
        };
      })
    );

    return chatsWithLastMessage;
  },

  /**
   * Obtener un chat por ID con sus mensajes
   */
  async getChatById(chatId: string, userId: string) {
    const { data: chat, error } = await supabase
      .from('Chat')
      .select(
        `
        *,
        participants:ChatParticipant(
          id,
          userId,
          lastRead,
          joinedAt,
          user:User!userId(id, nombre, apellido, email, role)
        )
      `
      )
      .eq('id', chatId)
      .single();

    if (error) throw error;

    // Verificar que el usuario es participante
    const isParticipant = chat.participants.some((p: any) => p.userId === userId);
    if (!isParticipant) {
      throw new Error('No tienes acceso a este chat');
    }

    return chat;
  },

  /**
   * Obtener mensajes de un chat
   */
  async getMessages(chatId: string, limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('ChatMessage')
      .select(
        `
        *,
        user:User!userId(id, nombre, apellido, email)
      `
      )
      .eq('chatId', chatId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Invertir para que el más reciente esté al final
    return (data || []).reverse();
  },

  /**
   * Crear un nuevo chat
   */
  async create(userId: string, input: CreateChatInput) {
    // 1. Crear el chat
    const { data: chat, error: chatError } = await supabase
      .from('Chat')
      .insert({
        type: input.type,
        proyectoId: input.proyectoId || null,
        nombre: input.nombre || null,
        createdBy: userId,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // 2. Agregar participantes (incluido el creador)
    const participantIds = [...new Set([userId, ...input.participantIds])];

    const { error: participantsError } = await supabase
      .from('ChatParticipant')
      .insert(
        participantIds.map((participantId) => ({
          chatId: chat.id,
          userId: participantId,
        }))
      );

    if (participantsError) throw participantsError;

    return chat;
  },

  /**
   * Enviar un mensaje
   */
  async sendMessage(userId: string, input: SendMessageInput) {
    const { data, error } = await supabase
      .from('ChatMessage')
      .insert({
        chatId: input.chatId,
        userId,
        content: input.content,
        isRead: false,
      })
      .select(
        `
        *,
        user:User!userId(id, nombre, apellido, email)
      `
      )
      .single();

    if (error) throw error;

    // Actualizar updatedAt del chat
    await supabase.from('Chat').update({ updatedAt: new Date().toISOString() }).eq('id', input.chatId);

    return data;
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(chatId: string, userId: string) {
    // Actualizar lastRead del participante
    const { error } = await supabase
      .from('ChatParticipant')
      .update({ lastRead: new Date().toISOString() })
      .eq('chatId', chatId)
      .eq('userId', userId);

    if (error) throw error;

    return { success: true };
  },

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  subscribeToMessages(chatId: string, callback: (message: ChatMessage) => void) {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
          filter: `chatId=eq.${chatId}`,
        },
        async (payload) => {
          // Obtener datos completos del mensaje con usuario
          const { data } = await supabase
            .from('ChatMessage')
            .select('*, user:User!userId(id, nombre, apellido, email)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data as ChatMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Obtener o crear chat directo con otro usuario
   */
  async getOrCreateDirectChat(userId: string, otherUserId: string) {
    // Buscar chat directo existente entre estos dos usuarios
    const { data: existingChats } = await supabase
      .from('ChatParticipant')
      .select('chatId, chat:Chat!chatId(id, type)')
      .eq('userId', userId);

    if (existingChats) {
      for (const item of existingChats) {
        if (item.chat.type === 'DIRECT') {
          // Verificar si el otro usuario también es participante
          const { data: otherParticipant } = await supabase
            .from('ChatParticipant')
            .select('id')
            .eq('chatId', item.chatId)
            .eq('userId', otherUserId)
            .single();

          if (otherParticipant) {
            // Chat directo ya existe
            return await this.getChatById(item.chatId, userId);
          }
        }
      }
    }

    // No existe, crear nuevo chat directo
    return await this.create(userId, {
      type: 'DIRECT',
      participantIds: [otherUserId],
    });
  },
};
