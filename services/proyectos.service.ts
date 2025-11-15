/**
 * Service para operaciones de Proyectos
 */

import { supabase } from '@/lib/supabase/client';

export type EstadoProyecto = 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO';
export type FaseProyecto = 'PLANIFICACION' | 'EJECUCION' | 'SUPERVISION' | 'CIERRE';

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  cliente?: string;
  estado: EstadoProyecto;
  fase?: FaseProyecto;
  fechaInicio?: string;
  fechaFin?: string;
  presupuesto?: number;
  ubicacion?: string;
  responsable?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProyectoInput {
  nombre: string;
  descripcion?: string;
  cliente?: string;
  estado?: EstadoProyecto;
  fase?: FaseProyecto;
  fechaInicio?: string;
  fechaFin?: string;
  presupuesto?: number;
  ubicacion?: string;
  responsable?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProyectoInput {
  nombre?: string;
  descripcion?: string;
  cliente?: string;
  estado?: EstadoProyecto;
  fase?: FaseProyecto;
  fechaInicio?: string;
  fechaFin?: string;
  presupuesto?: number;
  ubicacion?: string;
  responsable?: string;
  metadata?: Record<string, any>;
}

export interface FiltrosProyectos {
  estado?: EstadoProyecto;
  fase?: FaseProyecto;
  cliente?: string;
  busqueda?: string;
}

export interface EstadisticasProyecto {
  totalReportes: number;
  reportesPorEstado: Record<string, number>;
  reportesPorTipo: Record<string, number>;
  ultimoReporte?: string;
  progresoGeneral: number;
}

export const proyectosService = {
  /**
   * Obtener todos los proyectos
   */
  async getAll() {
    const { data, error } = await supabase
      .from('Proyecto')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener proyectos con filtros
   */
  async getFiltered(filtros: FiltrosProyectos) {
    let query = supabase
      .from('Proyecto')
      .select('*');

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.fase) {
      query = query.eq('fase', filtros.fase);
    }

    if (filtros.cliente) {
      query = query.eq('cliente', filtros.cliente);
    }

    if (filtros.busqueda) {
      query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }

    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener proyectos activos
   */
  async getActivos() {
    const { data, error } = await supabase
      .from('Proyecto')
      .select('*')
      .eq('estado', 'ACTIVO')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener un proyecto por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('Proyecto')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un proyecto por nombre
   */
  async getByNombre(nombre: string) {
    const { data, error } = await supabase
      .from('Proyecto')
      .select('*')
      .eq('nombre', nombre)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo proyecto
   */
  async create(input: CreateProyectoInput) {
    const { data, error } = await supabase
      .from('Proyecto')
      .insert({
        ...input,
        estado: input.estado || 'ACTIVO',
        fecha_inicio: input.fechaInicio,
        fecha_fin: input.fechaFin,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un proyecto existente
   */
  async update(id: string, updates: UpdateProyectoInput) {
    const { data, error } = await supabase
      .from('Proyecto')
      .update({
        ...updates,
        fecha_inicio: updates.fechaInicio,
        fecha_fin: updates.fechaFin,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un proyecto
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('Proyecto')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Cambiar el estado de un proyecto
   */
  async changeEstado(id: string, estado: EstadoProyecto) {
    return this.update(id, { estado });
  },

  /**
   * Cambiar la fase de un proyecto
   */
  async changeFase(id: string, fase: FaseProyecto) {
    return this.update(id, { fase });
  },

  /**
   * Obtener estadísticas de un proyecto
   */
  async getEstadisticas(proyectoNombre: string): Promise<EstadisticasProyecto> {
    const { data: reportes, error } = await supabase
      .from('Reporte')
      .select('id, status, tipoTrabajo, fecha, createdAt')
      .eq('proyecto', proyectoNombre);

    if (error) throw error;

    const totalReportes = reportes?.length || 0;

    const reportesPorEstado = reportes?.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const reportesPorTipo = reportes?.reduce((acc, r) => {
      acc[r.tipoTrabajo] = (acc[r.tipoTrabajo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const reportesOrdenados = reportes?.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const ultimoReporte = reportesOrdenados?.[0]?.createdAt;

    // Calcular progreso basado en reportes completados
    const reportesCompletados = reportesPorEstado['APROBADO'] || 0;
    const progresoGeneral = totalReportes > 0
      ? Math.round((reportesCompletados / totalReportes) * 100)
      : 0;

    return {
      totalReportes,
      reportesPorEstado,
      reportesPorTipo,
      ultimoReporte,
      progresoGeneral,
    };
  },

  /**
   * Obtener todos los reportes de un proyecto
   */
  async getReportes(proyectoNombre: string) {
    const { data, error } = await supabase
      .from('Reporte')
      .select(`
        *,
        supervisor:User!supervisorId(id, nombre, apellido, email),
        fotos:Foto(id, url, descripcion),
        audios:Audio(id, url, duracion)
      `)
      .eq('proyecto', proyectoNombre)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener lista de proyectos únicos desde los reportes
   * (Útil para cuando no hay tabla Proyecto todavía)
   */
  async getProyectosFromReportes() {
    const { data, error } = await supabase
      .from('Reporte')
      .select('proyecto')
      .not('proyecto', 'is', null)
      .order('proyecto', { ascending: true });

    if (error) throw error;

    // Extraer nombres únicos
    const proyectosUnicos = [...new Set(data?.map(r => r.proyecto).filter(Boolean))];

    return proyectosUnicos.map(nombre => ({
      nombre,
      value: nombre,
      label: nombre,
    }));
  },

  /**
   * Obtener resumen de todos los proyectos
   */
  async getResumen() {
    const proyectos = await this.getAll();

    const total = proyectos.length;
    const porEstado = proyectos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porFase = proyectos.reduce((acc, p) => {
      if (p.fase) {
        acc[p.fase] = (acc[p.fase] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      porEstado,
      porFase,
      activos: porEstado['ACTIVO'] || 0,
      completados: porEstado['COMPLETADO'] || 0,
    };
  },
};
