/**
 * Service para operaciones de Reportes
 */

import { supabase } from '@/lib/supabase/client';
import type { ReportStatus, TipoTrabajo } from '@/types';

export interface CreateReporteInput {
  tipoTrabajo: TipoTrabajo;
  supervisorId: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  comuna?: string;
  region?: string;
  clienteFinal?: string;
  ordenTrabajo?: string;
  proyecto?: string;
  descripcion?: string;
  observaciones?: string;
  camposDinamicos?: Record<string, any>;
  analisisIA?: Record<string, any>;
  conformidadIA?: string;
  puntuacionIA?: number;
}

export interface UpdateReporteInput {
  status?: ReportStatus;
  descripcion?: string;
  observaciones?: string;
  camposDinamicos?: Record<string, any>;
  validadoPorHumano?: boolean;
}

export interface FiltrosReportes {
  tipoTrabajo?: TipoTrabajo;
  status?: ReportStatus;
  supervisorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  proyecto?: string;
}

export const reportesService = {
  /**
   * Obtener todos los reportes con sus relaciones
   */
  async getAll() {
    const { data, error } = await supabase
      .from('Reporte')
      .select(`
        *,
        supervisor:User!supervisorId(
          id,
          nombre,
          apellido,
          email,
          role
        ),
        fotos:Foto(
          id,
          url,
          descripcion,
          orden,
          analisisIA:analisis_ia,
          objetosDetectados:objetos_detectados,
          alertasIA:alertas_ia
        ),
        audios:Audio(
          id,
          url,
          duracion,
          transcripcion
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener reportes con filtros
   */
  async getFiltered(filtros: FiltrosReportes) {
    let query = supabase
      .from('Reporte')
      .select(`
        *,
        supervisor:User!supervisorId(id, nombre, apellido, email),
        fotos:Foto(id, url, descripcion),
        audios:Audio(id, url, duracion)
      `);

    if (filtros.tipoTrabajo) {
      query = query.eq('tipoTrabajo', filtros.tipoTrabajo);
    }

    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros.supervisorId) {
      query = query.eq('supervisorId', filtros.supervisorId);
    }

    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    if (filtros.proyecto) {
      query = query.eq('proyecto', filtros.proyecto);
    }

    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener un reporte por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('Reporte')
      .select(`
        *,
        supervisor:User!supervisorId(id, nombre, apellido, email, role, telefono),
        fotos:Foto(
          id,
          url,
          descripcion,
          orden,
          analisisIA:analisis_ia,
          objetosDetectados:objetos_detectados,
          alertasIA:alertas_ia,
          createdAt
        ),
        audios:Audio(id, url, duracion, transcripcion, createdAt)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo reporte
   */
  async create(input: CreateReporteInput) {
    const { data, error } = await supabase
      .from('Reporte')
      .insert({
        ...input,
        status: 'BORRADOR',
        analisis_ia: input.analisisIA,
        conformidad_ia: input.conformidadIA,
        puntuacion_ia: input.puntuacionIA,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un reporte existente
   */
  async update(id: string, updates: UpdateReporteInput) {
    const { data, error } = await supabase
      .from('Reporte')
      .update({
        ...updates,
        validado_por_humano: updates.validadoPorHumano,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un reporte
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('Reporte')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Cambiar el status de un reporte
   */
  async changeStatus(id: string, status: ReportStatus) {
    return this.update(id, { status });
  },

  /**
   * Validar reporte por humano
   */
  async validarPorHumano(id: string) {
    return this.update(id, { validadoPorHumano: true });
  },

  /**
   * Obtener estadísticas de reportes
   */
  async getEstadisticas() {
    const { data: reportes, error } = await supabase
      .from('Reporte')
      .select('id, status, tipoTrabajo, fecha, puntuacionIA:puntuacion_ia');

    if (error) throw error;

    const total = reportes?.length || 0;
    const porStatus = reportes?.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porTipo = reportes?.reduce((acc, r) => {
      acc[r.tipoTrabajo] = (acc[r.tipoTrabajo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const promedioIA = reportes
      ?.filter(r => r.puntuacionIA)
      .reduce((sum, r) => sum + (r.puntuacionIA || 0), 0) /
      (reportes?.filter(r => r.puntuacionIA).length || 1);

    return {
      total,
      porStatus,
      porTipo,
      promedioIA: Math.round(promedioIA),
    };
  },

  /**
   * Obtener reportes recientes
   */
  async getRecientes(limit: number = 5) {
    const { data, error } = await supabase
      .from('Reporte')
      .select(`
        id,
        tipoTrabajo,
        status,
        descripcion,
        fecha,
        createdAt,
        supervisor:User!supervisorId(nombre, apellido)
      `)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
