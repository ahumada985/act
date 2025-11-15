/**
 * Hooks de React Query para Proyectos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  proyectosService,
  type CreateProyectoInput,
  type UpdateProyectoInput,
  type FiltrosProyectos,
  type EstadoProyecto,
  type FaseProyecto,
} from '@/services';
import { QUERY_KEYS, STALE_TIME } from '@/constants';

/**
 * Hook para obtener todos los proyectos
 */
export function useProyectos() {
  return useQuery({
    queryKey: QUERY_KEYS.PROYECTOS,
    queryFn: proyectosService.getAll,
    staleTime: STALE_TIME.PROYECTOS,
  });
}

/**
 * Hook para obtener proyectos filtrados
 */
export function useProyectosFiltrados(filtros: FiltrosProyectos) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'filtrados', filtros],
    queryFn: () => proyectosService.getFiltered(filtros),
    staleTime: STALE_TIME.PROYECTOS,
    enabled: Object.keys(filtros).length > 0,
  });
}

/**
 * Hook para obtener proyectos activos
 */
export function useProyectosActivos() {
  return useQuery({
    queryKey: QUERY_KEYS.PROYECTOS_ACTIVOS,
    queryFn: proyectosService.getActivos,
    staleTime: STALE_TIME.PROYECTOS,
  });
}

/**
 * Hook para obtener un proyecto por ID
 */
export function useProyecto(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROYECTO(id),
    queryFn: () => proyectosService.getById(id),
    staleTime: STALE_TIME.PROYECTOS,
    enabled: !!id,
  });
}

/**
 * Hook para obtener un proyecto por nombre
 */
export function useProyectoByNombre(nombre: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'nombre', nombre],
    queryFn: () => proyectosService.getByNombre(nombre),
    staleTime: STALE_TIME.PROYECTOS,
    enabled: !!nombre,
  });
}

/**
 * Hook para obtener estadísticas de un proyecto
 */
export function useEstadisticasProyecto(proyectoNombre: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'estadisticas', proyectoNombre],
    queryFn: () => proyectosService.getEstadisticas(proyectoNombre),
    staleTime: STALE_TIME.PROYECTOS,
    enabled: !!proyectoNombre,
  });
}

/**
 * Hook para obtener reportes de un proyecto
 */
export function useReportesProyecto(proyectoNombre: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'reportes', proyectoNombre],
    queryFn: () => proyectosService.getReportes(proyectoNombre),
    staleTime: STALE_TIME.REPORTES,
    enabled: !!proyectoNombre,
  });
}

/**
 * Hook para obtener proyectos únicos desde reportes
 * (Útil cuando no hay tabla Proyecto)
 */
export function useProyectosFromReportes() {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'from-reportes'],
    queryFn: proyectosService.getProyectosFromReportes,
    staleTime: STALE_TIME.PROYECTOS,
  });
}

/**
 * Hook para obtener resumen de proyectos
 */
export function useResumenProyectos() {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROYECTOS, 'resumen'],
    queryFn: proyectosService.getResumen,
    staleTime: STALE_TIME.PROYECTOS,
  });
}

/**
 * Hook para crear un proyecto
 */
export function useCreateProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProyectoInput) => proyectosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTOS });
      toast.success('Proyecto creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear proyecto: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar un proyecto
 */
export function useUpdateProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateProyectoInput }) =>
      proyectosService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTO(data.id) });
      toast.success('Proyecto actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar proyecto: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar un proyecto
 */
export function useDeleteProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proyectosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTOS });
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar proyecto: ${error.message}`);
    },
  });
}

/**
 * Hook para cambiar el estado de un proyecto
 */
export function useChangeEstadoProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoProyecto }) =>
      proyectosService.changeEstado(id, estado),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTO(data.id) });
      toast.success('Estado del proyecto actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al cambiar estado: ${error.message}`);
    },
  });
}

/**
 * Hook para cambiar la fase de un proyecto
 */
export function useChangeFaseProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, fase }: { id: string; fase: FaseProyecto }) =>
      proyectosService.changeFase(id, fase),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROYECTO(data.id) });
      toast.success('Fase del proyecto actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al cambiar fase: ${error.message}`);
    },
  });
}
