/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/rbac/useAuth';
import { LoadingState } from '@/components/common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  if (loading) {
    return <LoadingState message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
