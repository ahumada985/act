/**
 * Constantes para módulo de Proyectos
 */

export const ESTADOS_PROYECTO = {
  ACTIVO: "ACTIVO",
  PAUSADO: "PAUSADO",
  COMPLETADO: "COMPLETADO",
  CANCELADO: "CANCELADO",
} as const;

export const ESTADO_COLORS = {
  ACTIVO: "bg-green-100 text-green-800 border-green-300",
  PAUSADO: "bg-yellow-100 text-yellow-800 border-yellow-300",
  COMPLETADO: "bg-blue-100 text-blue-800 border-blue-300",
  CANCELADO: "bg-red-100 text-red-800 border-red-300",
} as const;

export const ESTADO_LABELS = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
} as const;

export const FASES_PROYECTO = [
  { value: "PLANIFICACION", label: "Planificación" },
  { value: "EJECUCION", label: "Ejecución" },
  { value: "SUPERVISION", label: "Supervisión" },
  { value: "CIERRE", label: "Cierre" },
] as const;
