/**
 * Service para Aprobaciones Multi-nivel
 */

import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/rbac/roles';

export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
export type StepStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

export interface ApprovalWorkflow {
  id: string;
  reporteId: string;
  currentStep: number;
  status: WorkflowStatus;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  role: UserRole;
  status: StepStatus;
  approverId?: string;
  approver?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ApproveStepInput {
  workflowId: string;
  stepNumber: number;
  userId: string;
  comments?: string;
}

export interface RejectStepInput {
  workflowId: string;
  stepNumber: number;
  userId: string;
  reason: string;
}

// Flujo de aprobación por defecto: SUPERVISOR → ADMIN → GERENTE
const DEFAULT_APPROVAL_FLOW: UserRole[] = ['ADMIN', 'GERENTE'];

export const approvalService = {
  /**
   * Crear workflow de aprobación para un reporte
   */
  async createWorkflow(reporteId: string, customFlow?: UserRole[]) {
    const flow = customFlow || DEFAULT_APPROVAL_FLOW;

    // 1. Crear el workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('ApprovalWorkflow')
      .insert({
        reporteId,
        currentStep: 1,
        status: 'PENDING',
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // 2. Crear los steps
    const steps = flow.map((role, index) => ({
      workflowId: workflow.id,
      stepNumber: index + 1,
      role,
      status: 'PENDING' as StepStatus,
    }));

    const { error: stepsError } = await supabase.from('ApprovalStep').insert(steps);

    if (stepsError) throw stepsError;

    return workflow;
  },

  /**
   * Obtener workflow de un reporte
   */
  async getByReporte(reporteId: string) {
    const { data, error } = await supabase
      .from('ApprovalWorkflow')
      .select(
        `
        *,
        steps:ApprovalStep(
          *,
          approver:User(id, nombre, apellido, email)
        )
      `
      )
      .eq('reporteId', reporteId)
      .single();

    if (error) throw error;

    // Ordenar steps por stepNumber
    if (data.steps) {
      data.steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber);
    }

    return data as ApprovalWorkflow;
  },

  /**
   * Obtener workflows pendientes para un usuario
   */
  async getPendingForUser(userId: string, userRole: UserRole) {
    // Obtener workflows donde el step actual corresponde al rol del usuario
    const { data: workflows, error } = await supabase
      .from('ApprovalWorkflow')
      .select(
        `
        *,
        reporte:Reporte!reporteId(
          id,
          tipoTrabajo,
          proyecto,
          descripcion,
          fecha,
          supervisor:User!supervisorId(nombre, apellido)
        ),
        steps:ApprovalStep(
          *,
          approver:User(id, nombre, apellido, email)
        )
      `
      )
      .in('status', ['PENDING', 'IN_PROGRESS'])
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Filtrar workflows donde el usuario puede aprobar el step actual
    const filteredWorkflows = workflows.filter((w: any) => {
      const currentStep = w.steps.find((s: any) => s.stepNumber === w.currentStep);
      return currentStep && currentStep.role === userRole && currentStep.status === 'PENDING';
    });

    return filteredWorkflows;
  },

  /**
   * Aprobar un step
   */
  async approveStep(input: ApproveStepInput) {
    const { workflowId, stepNumber, userId, comments } = input;

    // 1. Actualizar el step
    const { data: step, error: stepError } = await supabase
      .from('ApprovalStep')
      .update({
        status: 'APPROVED',
        approverId: userId,
        comments,
        approvedAt: new Date().toISOString(),
      })
      .eq('workflowId', workflowId)
      .eq('stepNumber', stepNumber)
      .select()
      .single();

    if (stepError) throw stepError;

    // 2. Obtener el workflow y sus steps
    const { data: workflow, error: workflowError } = await supabase
      .from('ApprovalWorkflow')
      .select('*, steps:ApprovalStep(*)')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    const totalSteps = workflow.steps.length;

    // 3. Determinar si hay más steps o si terminó
    if (stepNumber < totalSteps) {
      // Hay más steps, avanzar al siguiente
      await supabase
        .from('ApprovalWorkflow')
        .update({
          currentStep: stepNumber + 1,
          status: 'IN_PROGRESS',
        })
        .eq('id', workflowId);
    } else {
      // Era el último step, aprobar el workflow completo
      await supabase
        .from('ApprovalWorkflow')
        .update({
          status: 'APPROVED',
        })
        .eq('id', workflowId);

      // Actualizar el reporte a APROBADO
      await supabase
        .from('Reporte')
        .update({ status: 'APROBADO' })
        .eq('id', workflow.reporteId);
    }

    return step;
  },

  /**
   * Rechazar un step (rechaza todo el workflow)
   */
  async rejectStep(input: RejectStepInput) {
    const { workflowId, stepNumber, userId, reason } = input;

    // 1. Actualizar el step
    const { data: step, error: stepError } = await supabase
      .from('ApprovalStep')
      .update({
        status: 'REJECTED',
        approverId: userId,
        comments: reason,
        approvedAt: new Date().toISOString(),
      })
      .eq('workflowId', workflowId)
      .eq('stepNumber', stepNumber)
      .select()
      .single();

    if (stepError) throw stepError;

    // 2. Rechazar el workflow completo
    const { data: workflow } = await supabase
      .from('ApprovalWorkflow')
      .update({ status: 'REJECTED' })
      .eq('id', workflowId)
      .select()
      .single();

    // 3. Actualizar el reporte a RECHAZADO
    if (workflow) {
      await supabase
        .from('Reporte')
        .update({ status: 'RECHAZADO' })
        .eq('id', workflow.reporteId);
    }

    return step;
  },

  /**
   * Obtener historial de aprobaciones de un reporte
   */
  async getHistory(reporteId: string) {
    try {
      const workflow = await this.getByReporte(reporteId);
      return workflow.steps || [];
    } catch (error) {
      // No hay workflow aún
      return [];
    }
  },

  /**
   * Cancelar workflow (por Admin)
   */
  async cancelWorkflow(workflowId: string) {
    const { error } = await supabase
      .from('ApprovalWorkflow')
      .update({ status: 'REJECTED' })
      .eq('id', workflowId);

    if (error) throw error;

    return { success: true };
  },
};
