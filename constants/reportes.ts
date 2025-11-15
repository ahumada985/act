/**
 * Constantes para módulo de Reportes
 */

export const TIPOS_TRABAJO = [
  { value: "FIBRA_OPTICA", label: "Fibra Óptica" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "ANTENAS", label: "Antenas" },
  { value: "CCTV", label: "CCTV" },
  { value: "INSTALACION_RED", label: "Instalación de Red" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "OTRO", label: "Otro" },
] as const;

export const STATUS_REPORTE = {
  BORRADOR: "BORRADOR",
  ENVIADO: "ENVIADO",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

export const STATUS_COLORS = {
  BORRADOR: "bg-gray-100 text-gray-800 border-gray-300",
  ENVIADO: "bg-blue-100 text-blue-800 border-blue-300",
  APROBADO: "bg-green-100 text-green-800 border-green-300",
  RECHAZADO: "bg-red-100 text-red-800 border-red-300",
} as const;

export const STATUS_LABELS = {
  BORRADOR: "Borrador",
  ENVIADO: "Enviado",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
} as const;

export const TIPO_TRABAJO_LABELS: Record<string, string> = {
  FIBRA_OPTICA: "Fibra Óptica",
  DATA_CENTER: "Data Center",
  ANTENAS: "Antenas",
  CCTV: "CCTV",
  INSTALACION_RED: "Instalación de Red",
  MANTENIMIENTO: "Mantenimiento",
  OTRO: "Otro",
};

export const QUERY_KEYS = {
  REPORTES: ['reportes'] as const,
  REPORTE: (id: string) => ['reporte', id] as const,
  PROYECTOS: ['proyectos'] as const,
  PROYECTO: (id: string) => ['proyecto', id] as const,
  PROYECTOS_ACTIVOS: ['proyectos', 'activos'] as const,
  PLANTILLAS: ['plantillas'] as const,
  ETIQUETAS: ['etiquetas'] as const,
} as const;

export const STALE_TIME = {
  DEFAULT: 5 * 60 * 1000, // 5 minutos
  REPORTES: 2 * 60 * 1000, // 2 minutos
  PROYECTOS: 10 * 60 * 1000, // 10 minutos
  PLANTILLAS: 30 * 60 * 1000, // 30 minutos
} as const;
