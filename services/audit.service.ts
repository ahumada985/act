/**
 * Service para registro de auditoría
 * Registra todas las acciones importantes en el sistema
 */

import { supabase } from '@/lib/supabase/client';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'EXPORT'
  | 'VIEW';

export type AuditEntity =
  | 'Reporte'
  | 'Proyecto'
  | 'Usuario'
  | 'Foto'
  | 'Audio'
  | 'Material'
  | 'Chat'
  | 'Plantilla';

export interface CreateAuditLogInput {
  userId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface FiltrosAuditLog {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const auditService = {
  /**
   * Crear un registro de auditoría
   */
  async create(input: CreateAuditLogInput) {
    try {
      const { data, error } = await supabase
        .from('AuditLog')
        .insert({
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId || null,
          changes: input.changes || null,
          metadata: input.metadata || null,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[AuditService] Error al crear log:', error);
      // No lanzar error para no bloquear la acción principal
      return null;
    }
  },

  /**
   * Obtener todos los logs de auditoría
   */
  async getAll() {
    const { data, error } = await supabase
      .from('AuditLog')
      .select(
        `
        *,
        user:User!userId(
          id,
          nombre,
          apellido,
          email,
          role
        )
      `
      )
      .order('createdAt', { ascending: false })
      .limit(1000);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener logs con filtros
   */
  async getFiltered(filtros: FiltrosAuditLog) {
    let query = supabase.from('AuditLog').select(
      `
        *,
        user:User!userId(id, nombre, apellido, email, role)
      `
    );

    if (filtros.userId) {
      query = query.eq('userId', filtros.userId);
    }

    if (filtros.action) {
      query = query.eq('action', filtros.action);
    }

    if (filtros.entity) {
      query = query.eq('entity', filtros.entity);
    }

    if (filtros.entityId) {
      query = query.eq('entityId', filtros.entityId);
    }

    if (filtros.fechaDesde) {
      query = query.gte('createdAt', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('createdAt', filtros.fechaHasta);
    }

    query = query.order('createdAt', { ascending: false }).limit(1000);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener logs por entidad específica
   */
  async getByEntity(entity: AuditEntity, entityId: string) {
    const { data, error } = await supabase
      .from('AuditLog')
      .select(
        `
        *,
        user:User!userId(id, nombre, apellido, email)
      `
      )
      .eq('entity', entity)
      .eq('entityId', entityId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener logs por usuario
   */
  async getByUser(userId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('AuditLog')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener estadísticas de auditoría
   */
  async getStats(fechaDesde?: string, fechaHasta?: string) {
    let query = supabase.from('AuditLog').select('id, action, entity, userId, createdAt');

    if (fechaDesde) {
      query = query.gte('createdAt', fechaDesde);
    }

    if (fechaHasta) {
      query = query.lte('createdAt', fechaHasta);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    const total = logs?.length || 0;

    const porAccion = logs?.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const porEntidad = logs?.reduce((acc, log) => {
      acc[log.entity] = (acc[log.entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const usuariosMasActivos = Object.entries(
      logs?.reduce((acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    return {
      total,
      porAccion,
      porEntidad,
      usuariosMasActivos,
    };
  },

  /**
   * Exportar logs a JSON
   */
  async exportLogs(filtros?: FiltrosAuditLog) {
    const logs = filtros ? await this.getFiltered(filtros) : await this.getAll();

    const jsonData = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  },
};
