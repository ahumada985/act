/**
 * Hooks de React Query para Reportes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportesService, type CreateReporteInput, type UpdateReporteInput, type FiltrosReportes } from '@/services';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAppStore } from '@/stores';

/**
 * Hook para obtener todos los reportes
 */
export function useReportes() {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTES,
    queryFn: reportesService.getAll,
    staleTime: STALE_TIME.REPORTES,
  });
}

/**
 * Hook para obtener reportes filtrados
 */
export function useReportesFiltrados(filtros: FiltrosReportes) {
  return useQuery({
    queryKey: [...QUERY_KEYS.REPORTES, 'filtrados', filtros],
    queryFn: () => reportesService.getFiltered(filtros),
    staleTime: STALE_TIME.REPORTES,
    enabled: Object.keys(filtros).length > 0,
  });
}

/**
 * Hook para obtener un reporte por ID
 */
export function useReporte(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTE(id),
    queryFn: () => reportesService.getById(id),
    staleTime: STALE_TIME.REPORTES,
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de reportes
 */
export function useEstadisticasReportes() {
  return useQuery({
    queryKey: [...QUERY_KEYS.REPORTES, 'estadisticas'],
    queryFn: reportesService.getEstadisticas,
    staleTime: STALE_TIME.REPORTES,
  });
}

/**
 * Hook para obtener reportes recientes
 */
export function useReportesRecientes(limit?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.REPORTES, 'recientes', limit],
    queryFn: () => reportesService.getRecientes(limit),
    staleTime: STALE_TIME.REPORTES,
  });
}

/**
 * Hook para crear un reporte
 */
export function useCreateReporte() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (data: CreateReporteInput) => reportesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
      addNotification('success', 'Reporte creado exitosamente');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al crear reporte: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar un reporte
 */
export function useUpdateReporte() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateReporteInput }) =>
      reportesService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTE(data.id) });
      addNotification('success', 'Reporte actualizado exitosamente');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al actualizar reporte: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar un reporte
 */
export function useDeleteReporte() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (id: string) => reportesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
      addNotification('success', 'Reporte eliminado exitosamente');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al eliminar reporte: ${error.message}`);
    },
  });
}

/**
 * Hook para cambiar el status de un reporte
 */
export function useChangeStatusReporte() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      reportesService.changeStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTE(data.id) });
      addNotification('success', 'Estado actualizado exitosamente');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al cambiar estado: ${error.message}`);
    },
  });
}
