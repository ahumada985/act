/**
 * Componente para renderizado condicional basado en permisos
 * Solo muestra el contenido si el usuario tiene el permiso requerido
 */

'use client';

import { usePermissions } from '@/lib/rbac/usePermissions';
import { type Permission } from '@/lib/rbac/permissions';

interface CanProps {
  do: Permission | Permission[];
  matchAll?: boolean; // Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ do: permission, matchAll = false, fallback = null, children }: CanProps) {
  const { can, canAll, canAny } = usePermissions();

  const hasPermission = Array.isArray(permission)
    ? matchAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
