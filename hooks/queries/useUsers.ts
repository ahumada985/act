/**
 * Hooks de React Query para Users
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services';
import { STALE_TIME } from '@/constants';

const QUERY_KEYS_USERS = {
  USERS: ['users'] as const,
  USER: (id: string) => ['user', id] as const,
  SUPERVISORES: ['users', 'supervisores'] as const,
};

/**
 * Hook para obtener todos los usuarios
 */
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS_USERS.USERS,
    queryFn: usersService.getAll,
    staleTime: STALE_TIME.DEFAULT,
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS_USERS.USER(id),
    queryFn: () => usersService.getById(id),
    staleTime: STALE_TIME.DEFAULT,
    enabled: !!id,
  });
}

/**
 * Hook para obtener supervisores
 */
export function useSupervisores() {
  return useQuery({
    queryKey: QUERY_KEYS_USERS.SUPERVISORES,
    queryFn: usersService.getSupervisores,
    staleTime: STALE_TIME.DEFAULT,
  });
}
