/**
 * Hooks de React Query para Plantillas
 */

import { useQuery } from '@tanstack/react-query';
import { plantillasService } from '@/services';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import type { TipoTrabajo } from '@/types';

/**
 * Hook para obtener todas las plantillas
 */
export function usePlantillas() {
  return useQuery({
    queryKey: QUERY_KEYS.PLANTILLAS,
    queryFn: plantillasService.getAll,
    staleTime: STALE_TIME.PLANTILLAS,
  });
}

/**
 * Hook para obtener plantilla por tipo de trabajo
 */
export function usePlantillaPorTipo(tipoTrabajo: TipoTrabajo) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PLANTILLAS, tipoTrabajo],
    queryFn: () => plantillasService.getByTipoTrabajo(tipoTrabajo),
    staleTime: STALE_TIME.PLANTILLAS,
    enabled: !!tipoTrabajo,
  });
}
