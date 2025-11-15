/**
 * Hook para verificar permisos del usuario actual
 */

'use client';

import { useAuth } from './useAuth';
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission } from './permissions';

export function usePermissions() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };

  const isRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const isAdmin = (): boolean => {
    return isRole('ADMIN');
  };

  const isSupervisor = (): boolean => {
    return isRole('SUPERVISOR');
  };

  const isGerente = (): boolean => {
    return isRole('GERENTE');
  };

  const isCliente = (): boolean => {
    return isRole('CLIENTE');
  };

  return {
    can,
    canAny,
    canAll,
    isRole,
    isAdmin,
    isSupervisor,
    isGerente,
    isCliente,
    role: user?.role,
  };
}
