/**
 * Servicio para gestionar reportes programados
 */

import { createClient } from '@/lib/supabase/server';
import type { ReportFrequency, ReportFormat } from '@prisma/client';

export interface ScheduledReportFilters {
  proyecto?: string;
  tipoTrabajo?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateScheduledReportInput {
  nombre: string;
  descripcion?: string;
  frequency: ReportFrequency;
  format?: ReportFormat;
  emails: string[];
  filters?: ScheduledReportFilters;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour?: number;
}

export interface UpdateScheduledReportInput extends Partial<CreateScheduledReportInput> {
  id: string;
  active?: boolean;
}

/**
 * Calcula la próxima fecha de ejecución según la frecuencia
 */
export function calculateNextRun(
  frequency: ReportFrequency,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  hour: number = 8
): Date {
  const now = new Date();
  const next = new Date();

  next.setHours(hour, 0, 0, 0);

  switch (frequency) {
    case 'DAILY':
      // Si ya pasó la hora hoy, programar para mañana
      if (now.getHours() >= hour) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'WEEKLY':
      const targetDay = dayOfWeek ?? 1; // Default: Lunes
      const currentDay = now.getDay();
      let daysUntilTarget = targetDay - currentDay;

      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && now.getHours() >= hour)) {
        daysUntilTarget += 7;
      }

      next.setDate(next.getDate() + daysUntilTarget);
      break;

    case 'MONTHLY':
      const targetDate = dayOfMonth ?? 1;
      next.setDate(targetDate);

      // Si ya pasó este mes, programar para el próximo
      if (now.getDate() > targetDate || (now.getDate() === targetDate && now.getHours() >= hour)) {
        next.setMonth(next.getMonth() + 1);
      }

      // Manejar meses con menos días
      if (next.getDate() !== targetDate) {
        next.setDate(0); // Último día del mes anterior
      }
      break;
  }

  return next;
}

export class ScheduledReportsService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Obtener todos los reportes programados
   */
  async getAll(activeOnly: boolean = false) {
    const query = this.supabase.from('ScheduledReport').select('*').order('createdAt', { ascending: false });

    if (activeOnly) {
      query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Obtener un reporte programado por ID
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('ScheduledReport')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crear un nuevo reporte programado
   */
  async create(input: CreateScheduledReportInput) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) throw new Error('Usuario no autenticado');

    const nextRunAt = calculateNextRun(
      input.frequency,
      input.dayOfWeek,
      input.dayOfMonth,
      input.hour ?? 8
    );

    const { data, error } = await this.supabase
      .from('ScheduledReport')
      .insert({
        nombre: input.nombre,
        descripcion: input.descripcion,
        frequency: input.frequency,
        format: input.format ?? 'PDF',
        emails: input.emails,
        filters: input.filters,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        hour: input.hour ?? 8,
        nextRunAt,
        createdBy: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar un reporte programado
   */
  async update(input: UpdateScheduledReportInput) {
    const { id, ...updates } = input;

    // Si se actualiza la frecuencia o configuración, recalcular nextRunAt
    let nextRunAt;
    if (
      updates.frequency ||
      updates.dayOfWeek !== undefined ||
      updates.dayOfMonth !== undefined ||
      updates.hour !== undefined
    ) {
      const current = await this.getById(id);
      nextRunAt = calculateNextRun(
        updates.frequency ?? current.frequency,
        updates.dayOfWeek !== undefined ? updates.dayOfWeek : current.dayOfWeek,
        updates.dayOfMonth !== undefined ? updates.dayOfMonth : current.dayOfMonth,
        updates.hour ?? current.hour
      );
    }

    const { data, error } = await this.supabase
      .from('ScheduledReport')
      .update({
        ...updates,
        ...(nextRunAt && { nextRunAt }),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar un reporte programado
   */
  async delete(id: string) {
    const { error } = await this.supabase.from('ScheduledReport').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Activar/desactivar un reporte programado
   */
  async toggleActive(id: string, active: boolean) {
    return this.update({ id, active });
  }

  /**
   * Marcar un reporte como ejecutado
   */
  async markAsRun(id: string, status: 'SUCCESS' | 'ERROR', error?: string) {
    const current = await this.getById(id);

    const nextRunAt = calculateNextRun(
      current.frequency,
      current.dayOfWeek,
      current.dayOfMonth,
      current.hour
    );

    const { data, updateError } = await this.supabase
      .from('ScheduledReport')
      .update({
        lastRunAt: new Date().toISOString(),
        nextRunAt: nextRunAt.toISOString(),
        lastStatus: status,
        lastError: error,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  }

  /**
   * Obtener reportes que deben ejecutarse ahora
   */
  async getDueReports() {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('ScheduledReport')
      .select('*')
      .eq('active', true)
      .lte('nextRunAt', now);

    if (error) throw error;
    return data;
  }
}

export const scheduledReportsService = new ScheduledReportsService();
