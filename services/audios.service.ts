/**
 * Service para operaciones de Audios
 */

import { supabase } from '@/lib/supabase/client';

export interface CreateAudioInput {
  reporteId: string;
  url: string;
  duracion?: number;
  transcripcion?: string;
}

export const audiosService = {
  /**
   * Crear un audio
   */
  async create(input: CreateAudioInput) {
    const { data, error } = await supabase
      .from('Audio')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear múltiples audios en batch
   */
  async createBatch(inputs: CreateAudioInput[]) {
    const { data, error } = await supabase
      .from('Audio')
      .insert(inputs)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener audios de un reporte
   */
  async getByReporte(reporteId: string) {
    const { data, error } = await supabase
      .from('Audio')
      .select('*')
      .eq('reporteId', reporteId)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Actualizar un audio
   */
  async update(id: string, updates: Partial<CreateAudioInput>) {
    const { data, error } = await supabase
      .from('Audio')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un audio
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('Audio')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Subir archivo de audio a storage
   */
  async uploadFile(file: File, reporteId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${reporteId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('reportes-audios')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('reportes-audios')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
