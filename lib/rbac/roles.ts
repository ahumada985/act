/**
 * Configuración de roles y sus permisos
 * Define qué puede hacer cada rol en el sistema
 */

import { PERMISSIONS, type Permission } from './permissions';

export type UserRole = 'SUPERVISOR' | 'ADMIN' | 'GERENTE' | 'CLIENTE';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Supervisor: Puede crear y gestionar sus propios reportes
  SUPERVISOR: [
    PERMISSIONS.REPORTES_VIEW_OWN,
    PERMISSIONS.REPORTES_CREATE,
    PERMISSIONS.REPORTES_EDIT_OWN,
    PERMISSIONS.REPORTES_DELETE_OWN,
    PERMISSIONS.REPORTES_EXPORT,
    PERMISSIONS.PROYECTOS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.MATERIALES_VIEW,
  ],

  // Admin: Control total del sistema
  ADMIN: [
    // Reportes
    PERMISSIONS.REPORTES_VIEW_ALL,
    PERMISSIONS.REPORTES_CREATE,
    PERMISSIONS.REPORTES_EDIT_ALL,
    PERMISSIONS.REPORTES_DELETE_ALL,
    PERMISSIONS.REPORTES_APPROVE,
    PERMISSIONS.REPORTES_REJECT,
    PERMISSIONS.REPORTES_EXPORT,

    // Proyectos
    PERMISSIONS.PROYECTOS_VIEW,
    PERMISSIONS.PROYECTOS_CREATE,
    PERMISSIONS.PROYECTOS_EDIT,
    PERMISSIONS.PROYECTOS_DELETE,

    // Usuarios
    PERMISSIONS.USUARIOS_VIEW,
    PERMISSIONS.USUARIOS_CREATE,
    PERMISSIONS.USUARIOS_EDIT,
    PERMISSIONS.USUARIOS_DELETE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EXECUTIVE,

    // Auditoría
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,

    // Notificaciones
    PERMISSIONS.NOTIFICATIONS_SEND,

    // Chat
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,

    // Materiales
    PERMISSIONS.MATERIALES_VIEW,
    PERMISSIONS.MATERIALES_MANAGE,

    // Reportes Programados
    PERMISSIONS.REPORTES_PROGRAMADOS_VIEW,
    PERMISSIONS.REPORTES_PROGRAMADOS_CREATE,
    PERMISSIONS.REPORTES_PROGRAMADOS_EDIT,
    PERMISSIONS.REPORTES_PROGRAMADOS_DELETE,
  ],

  // Gerente: Puede ver todo, aprobar/rechazar, pero no eliminar
  GERENTE: [
    PERMISSIONS.REPORTES_VIEW_ALL,
    PERMISSIONS.REPORTES_APPROVE,
    PERMISSIONS.REPORTES_REJECT,
    PERMISSIONS.REPORTES_EXPORT,
    PERMISSIONS.PROYECTOS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EXECUTIVE,
    PERMISSIONS.USUARIOS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_SEND,
    PERMISSIONS.MATERIALES_VIEW,

    // Reportes Programados
    PERMISSIONS.REPORTES_PROGRAMADOS_VIEW,
    PERMISSIONS.REPORTES_PROGRAMADOS_CREATE,
    PERMISSIONS.REPORTES_PROGRAMADOS_EDIT,
  ],

  // Cliente: Solo lectura de sus proyectos
  CLIENTE: [
    PERMISSIONS.REPORTES_VIEW_OWN,
    PERMISSIONS.REPORTES_EXPORT,
    PERMISSIONS.PROYECTOS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica si un rol tiene alguno de los permisos especificados
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = getRolePermissions(role);
  return permissions.some((permission) => rolePerms.includes(permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePerms = getRolePermissions(role);
  return permissions.every((permission) => rolePerms.includes(permission));
}

/**
 * Labels de roles para UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  CLIENTE: 'Cliente',
};

/**
 * Descripciones de roles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPERVISOR: 'Puede crear y gestionar sus propios reportes de campo',
  ADMIN: 'Control total del sistema, gestión de usuarios y proyectos',
  GERENTE: 'Puede ver todos los reportes, aprobar/rechazar y acceder a analíticas ejecutivas',
  CLIENTE: 'Acceso de solo lectura a reportes de sus proyectos',
};
