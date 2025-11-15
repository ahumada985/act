/**
 * Service para operaciones de Plantillas de Formularios
 */

import { supabase } from '@/lib/supabase/client';
import type { TipoTrabajo } from '@/types';

export interface CampoFormulario {
  id: string;
  tipo: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  requerido?: boolean;
  opciones?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface CreatePlantillaInput {
  tipoTrabajo: TipoTrabajo;
  nombre: string;
  descripcion?: string;
  campos: CampoFormulario[];
}

export const plantillasService = {
  /**
   * Obtener todas las plantillas activas
   */
  async getAll() {
    const { data, error } = await supabase
      .from('PlantillaFormulario')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener plantilla por tipo de trabajo
   */
  async getByTipoTrabajo(tipoTrabajo: TipoTrabajo) {
    const { data, error } = await supabase
      .from('PlantillaFormulario')
      .select('*')
      .eq('tipoTrabajo', tipoTrabajo)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found
    return data;
  },

  /**
   * Crear una plantilla
   */
  async create(input: CreatePlantillaInput) {
    const { data, error } = await supabase
      .from('PlantillaFormulario')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar una plantilla
   */
  async update(id: string, updates: Partial<CreatePlantillaInput>) {
    const updateData = {
      ...updates,
      version: updates.campos ? { increment: 1 } : undefined,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('PlantillaFormulario')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Desactivar una plantilla
   */
  async desactivar(id: string) {
    return this.update(id, { activo: false } as any);
  },
};
