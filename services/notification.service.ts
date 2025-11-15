/**
 * Service para enviar notificaciones push
 * Solo accesible por usuarios con permisos de ADMIN
 */

export interface SendNotificationInput {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  userId?: string;
  userIds?: string[];
  sendToAll?: boolean;
}

export const notificationService = {
  /**
   * Enviar notificación a usuario(s) específico(s)
   */
  async send(input: SendNotificationInput) {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar notificación');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[NotificationService] Error:', error);
      throw error;
    }
  },

  /**
   * Enviar notificación a un usuario específico
   */
  async sendToUser(userId: string, title: string, body: string, data?: Record<string, any>) {
    return this.send({
      title,
      body,
      data,
      userId,
    });
  },

  /**
   * Enviar notificación a múltiples usuarios
   */
  async sendToUsers(userIds: string[], title: string, body: string, data?: Record<string, any>) {
    return this.send({
      title,
      body,
      data,
      userIds,
    });
  },

  /**
   * Enviar notificación a todos los usuarios suscritos
   */
  async sendToAll(title: string, body: string, data?: Record<string, any>) {
    return this.send({
      title,
      body,
      data,
      sendToAll: true,
    });
  },

  /**
   * Notificación de reporte aprobado
   */
  async notifyReporteAprobado(userId: string, reporteId: string, proyecto?: string) {
    return this.sendToUser(
      userId,
      '✅ Reporte Aprobado',
      `Tu reporte${proyecto ? ` del proyecto ${proyecto}` : ''} ha sido aprobado`,
      {
        type: 'REPORTE_APROBADO',
        reporteId,
        url: `/reportes/${reporteId}`,
      }
    );
  },

  /**
   * Notificación de reporte rechazado
   */
  async notifyReporteRechazado(
    userId: string,
    reporteId: string,
    razon?: string,
    proyecto?: string
  ) {
    return this.sendToUser(
      userId,
      '❌ Reporte Rechazado',
      `Tu reporte${proyecto ? ` del proyecto ${proyecto}` : ''} ha sido rechazado${
        razon ? `: ${razon}` : ''
      }`,
      {
        type: 'REPORTE_RECHAZADO',
        reporteId,
        url: `/reportes/${reporteId}/editar`,
      }
    );
  },

  /**
   * Notificación de nuevo comentario
   */
  async notifyNuevoComentario(
    userId: string,
    reporteId: string,
    autor: string,
    preview: string
  ) {
    return this.sendToUser(
      userId,
      '💬 Nuevo Comentario',
      `${autor}: ${preview.substring(0, 50)}${preview.length > 50 ? '...' : ''}`,
      {
        type: 'NUEVO_COMENTARIO',
        reporteId,
        url: `/reportes/${reporteId}`,
      }
    );
  },

  /**
   * Notificación de proyecto asignado
   */
  async notifyProyectoAsignado(userId: string, proyectoId: string, proyectoNombre: string) {
    return this.sendToUser(
      userId,
      '📋 Nuevo Proyecto Asignado',
      `Has sido asignado al proyecto: ${proyectoNombre}`,
      {
        type: 'PROYECTO_ASIGNADO',
        proyectoId,
        url: `/proyectos/${proyectoId}`,
      }
    );
  },

  /**
   * Notificación de recordatorio
   */
  async notifyRecordatorio(userId: string, mensaje: string, url?: string) {
    return this.sendToUser(userId, '🔔 Recordatorio', mensaje, {
      type: 'RECORDATORIO',
      url,
    });
  },
};
