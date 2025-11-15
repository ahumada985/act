/**
 * Componente para renderizado condicional basado en roles
 * Solo muestra el contenido si el usuario tiene el rol especificado
 */

'use client';

import { useAuth } from '@/lib/rbac/useAuth';
import { type UserRole } from '@/lib/rbac/roles';

interface RoleGuardProps {
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const hasRole = allowedRoles.includes(user.role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
