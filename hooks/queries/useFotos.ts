/**
 * Hooks de React Query para Fotos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fotosService, type CreateFotoInput } from '@/services';
import { QUERY_KEYS } from '@/constants';
import { useAppStore } from '@/stores';

/**
 * Hook para obtener fotos de un reporte
 */
export function useFotosReporte(reporteId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.REPORTE(reporteId), 'fotos'],
    queryFn: () => fotosService.getByReporte(reporteId),
    enabled: !!reporteId,
  });
}

/**
 * Hook para subir una foto
 */
export function useUploadFoto() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: ({ file, reporteId }: { file: File; reporteId: string }) =>
      fotosService.uploadFile(file, reporteId),
    onSuccess: () => {
      addNotification('success', 'Foto subida exitosamente');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al subir foto: ${error.message}`);
    },
  });
}

/**
 * Hook para crear foto (después de upload)
 */
export function useCreateFoto() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (data: CreateFotoInput) => fotosService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.REPORTE(data.reporteId), 'fotos'],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTE(data.reporteId) });
    },
    onError: (error: Error) => {
      addNotification('error', `Error al crear foto: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar una foto
 */
export function useDeleteFoto() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: (id: string) => fotosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
      addNotification('success', 'Foto eliminada');
    },
    onError: (error: Error) => {
      addNotification('error', `Error al eliminar foto: ${error.message}`);
    },
  });
}
