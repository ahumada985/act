/**
 * Definición de permisos del sistema
 * Cada permiso define una acción específica que un usuario puede realizar
 */

export const PERMISSIONS = {
  // Reportes
  REPORTES_VIEW_OWN: 'reportes:view:own',
  REPORTES_VIEW_ALL: 'reportes:view:all',
  REPORTES_CREATE: 'reportes:create',
  REPORTES_EDIT_OWN: 'reportes:edit:own',
  REPORTES_EDIT_ALL: 'reportes:edit:all',
  REPORTES_DELETE_OWN: 'reportes:delete:own',
  REPORTES_DELETE_ALL: 'reportes:delete:all',
  REPORTES_APPROVE: 'reportes:approve',
  REPORTES_REJECT: 'reportes:reject',
  REPORTES_EXPORT: 'reportes:export',

  // Proyectos
  PROYECTOS_VIEW: 'proyectos:view',
  PROYECTOS_CREATE: 'proyectos:create',
  PROYECTOS_EDIT: 'proyectos:edit',
  PROYECTOS_DELETE: 'proyectos:delete',

  // Usuarios
  USUARIOS_VIEW: 'usuarios:view',
  USUARIOS_CREATE: 'usuarios:create',
  USUARIOS_EDIT: 'usuarios:edit',
  USUARIOS_DELETE: 'usuarios:delete',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_EXECUTIVE: 'dashboard:executive',

  // Auditoría
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',

  // Notificaciones
  NOTIFICATIONS_SEND: 'notifications:send',

  // Chat
  CHAT_VIEW: 'chat:view',
  CHAT_SEND: 'chat:send',

  // Materiales
  MATERIALES_VIEW: 'materiales:view',
  MATERIALES_MANAGE: 'materiales:manage',

  // Reportes Programados
  REPORTES_PROGRAMADOS_VIEW: 'reportes_programados:view',
  REPORTES_PROGRAMADOS_CREATE: 'reportes_programados:create',
  REPORTES_PROGRAMADOS_EDIT: 'reportes_programados:edit',
  REPORTES_PROGRAMADOS_DELETE: 'reportes_programados:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
