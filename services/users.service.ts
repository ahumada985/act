/**
 * Service para operaciones de Usuarios
 */

import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export interface CreateUserInput {
  email: string;
  nombre: string;
  apellido: string;
  role?: UserRole;
  telefono?: string;
}

export const usersService = {
  /**
   * Obtener todos los usuarios
   */
  async getAll() {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener usuario por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener usuario por email
   */
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Obtener supervisores
   */
  async getSupervisores() {
    const { data, error } = await supabase
      .from('User')
      .select('id, nombre, apellido, email, telefono')
      .eq('role', 'SUPERVISOR')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Crear un usuario
   */
  async create(input: CreateUserInput) {
    const { data, error } = await supabase
      .from('User')
      .insert({
        ...input,
        role: input.role || 'SUPERVISOR',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un usuario
   */
  async update(id: string, updates: Partial<CreateUserInput>) {
    const { data, error } = await supabase
      .from('User')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un usuario
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};
