/**
 * Función para verificar permisos de usuario
 * CRÍTICO: Este archivo faltaba y causaba errores en producción
 */

import { createClient } from '@/lib/supabase/server';
import { hasPermission } from './roles';
import type { Permission } from './permissions';

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function checkPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const supabase = createClient();

    // Obtener rol del usuario desde la base de datos
    const { data: userData, error } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      console.error('Error obteniendo usuario para verificar permisos:', error);
      return false;
    }

    // Verificar si el rol tiene el permiso
    return hasPermission(userData.role, permission);
  } catch (error) {
    console.error('Error en checkPermission:', error);
    return false;
  }
}

/**
 * Verifica múltiples permisos (el usuario debe tener todos)
 */
export async function checkAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map((permission) => checkPermission(userId, permission))
  );
  return results.every((result) => result === true);
}

/**
 * Verifica múltiples permisos (el usuario debe tener al menos uno)
 */
export async function checkAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map((permission) => checkPermission(userId, permission))
  );
  return results.some((result) => result === true);
}
