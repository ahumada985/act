/**
 * Hook para registrar acciones en el sistema de auditoría
 */

'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/rbac/useAuth';
import { auditService, type AuditAction, type AuditEntity } from '@/services';

export function useAudit() {
  const { user } = useAuth();

  const logAction = useCallback(
    async (
      action: AuditAction,
      entity: AuditEntity,
      entityId?: string,
      changes?: Record<string, any>,
      metadata?: Record<string, any>
    ) => {
      if (!user) {
        console.warn('[useAudit] No hay usuario autenticado');
        return;
      }

      try {
        // Obtener información del navegador
        const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

        // Nota: Para obtener IP real necesitarías un endpoint de servidor
        // Por ahora solo guardamos el user agent

        await auditService.create({
          userId: user.id,
          action,
          entity,
          entityId,
          changes,
          metadata,
          userAgent,
        });
      } catch (error) {
        console.error('[useAudit] Error al registrar acción:', error);
        // No lanzar error para no interrumpir la acción principal
      }
    },
    [user]
  );

  // Helpers para acciones comunes
  const logCreate = useCallback(
    (entity: AuditEntity, entityId: string, data?: Record<string, any>) => {
      return logAction('CREATE', entity, entityId, undefined, data);
    },
    [logAction]
  );

  const logUpdate = useCallback(
    (entity: AuditEntity, entityId: string, changes: Record<string, any>) => {
      return logAction('UPDATE', entity, entityId, changes);
    },
    [logAction]
  );

  const logDelete = useCallback(
    (entity: AuditEntity, entityId: string) => {
      return logAction('DELETE', entity, entityId);
    },
    [logAction]
  );

  const logApprove = useCallback(
    (entity: AuditEntity, entityId: string, comments?: string) => {
      return logAction('APPROVE', entity, entityId, undefined, { comments });
    },
    [logAction]
  );

  const logReject = useCallback(
    (entity: AuditEntity, entityId: string, reason?: string) => {
      return logAction('REJECT', entity, entityId, undefined, { reason });
    },
    [logAction]
  );

  const logExport = useCallback(
    (entity: AuditEntity, filters?: Record<string, any>) => {
      return logAction('EXPORT', entity, undefined, undefined, { filters });
    },
    [logAction]
  );

  const logView = useCallback(
    (entity: AuditEntity, entityId?: string) => {
      return logAction('VIEW', entity, entityId);
    },
    [logAction]
  );

  return {
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logApprove,
    logReject,
    logExport,
    logView,
  };
}
