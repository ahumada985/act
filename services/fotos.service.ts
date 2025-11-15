/**
 * Service para operaciones de Fotos
 */

import { supabase } from '@/lib/supabase/client';
import { fileToBase64 } from '@/utils';

export interface CreateFotoInput {
  reporteId: string;
  url: string;
  descripcion?: string;
  orden?: number;
  analisisIA?: Record<string, any>;
  objetosDetectados?: string[];
  alertasIA?: string[];
}

export const fotosService = {
  /**
   * Crear una foto
   */
  async create(input: CreateFotoInput) {
    const { data, error } = await supabase
      .from('Foto')
      .insert({
        ...input,
        analisis_ia: input.analisisIA,
        objetos_detectados: input.objetosDetectados || [],
        alertas_ia: input.alertasIA || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear múltiples fotos en batch
   */
  async createBatch(inputs: CreateFotoInput[]) {
    const formattedInputs = inputs.map(input => ({
      ...input,
      analisis_ia: input.analisisIA,
      objetos_detectados: input.objetosDetectados || [],
      alertas_ia: input.alertasIA || [],
    }));

    const { data, error } = await supabase
      .from('Foto')
      .insert(formattedInputs)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener fotos de un reporte
   */
  async getByReporte(reporteId: string) {
    const { data, error } = await supabase
      .from('Foto')
      .select('*')
      .eq('reporteId', reporteId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Actualizar una foto
   */
  async update(id: string, updates: Partial<CreateFotoInput>) {
    const formattedUpdates = {
      ...updates,
      analisis_ia: updates.analisisIA,
      objetos_detectados: updates.objetosDetectados,
      alertas_ia: updates.alertasIA,
    };

    const { data, error } = await supabase
      .from('Foto')
      .update(formattedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar una foto
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('Foto')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Subir archivo de foto a storage
   */
  async uploadFile(file: File, reporteId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${reporteId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('reportes-fotos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('reportes-fotos')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  /**
   * Subir foto desde base64
   */
  async uploadBase64(base64: string, reporteId: string): Promise<string> {
    const base64Data = base64.split(',')[1];
    const mimeType = base64.split(',')[0].split(':')[1].split(';')[0];
    const fileExt = mimeType.split('/')[1];

    const fileName = `${reporteId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('reportes-fotos')
      .upload(fileName, Buffer.from(base64Data, 'base64'), {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('reportes-fotos')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
