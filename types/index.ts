// Tipos generales de la aplicación
export type TipoTrabajo =
  | 'FIBRA_OPTICA'
  | 'DATA_CENTER'
  | 'ANTENAS'
  | 'CCTV'
  | 'INSTALACION_RED'
  | 'MANTENIMIENTO'
  | 'OTRO';

export type ReportStatus =
  | 'BORRADOR'
  | 'ENVIADO'
  | 'APROBADO'
  | 'RECHAZADO';

export type UserRole =
  | 'SUPERVISOR'
  | 'ADMIN'
  | 'GERENTE';

// Tipo para campos dinámicos según el tipo de trabajo
export interface CamposDinamicosFibraOptica {
  km_fibra?: number;
  tipo_fibra?: string;
  cantidad_empalmes?: number;
  cantidad_mufa?: number;
  perdida_db?: number;
  tipo_conector?: string;
}

export interface CamposDinamicosDataCenter {
  cantidad_racks?: number;
  tipo_equipo?: string;
  cantidad_equipos?: number;
  potencia_instalada?: number;
  tipo_cableado?: string;
}

export interface CamposDinamicosAntenas {
  altura_antena?: number;
  tipo_antena?: string;
  frecuencia?: string;
  azimut?: number;
  tilt_mecanico?: number;
  tilt_electrico?: number;
}

export interface CamposDinamicosCCTV {
  cantidad_camaras?: number;
  tipo_camara?: string;
  resolucion?: string;
  tipo_grabador?: string;
  dias_almacenamiento?: number;
}

// Tipo unión de todos los campos dinámicos
export type CamposDinamicos =
  | CamposDinamicosFibraOptica
  | CamposDinamicosDataCenter
  | CamposDinamicosAntenas
  | CamposDinamicosCCTV
  | Record<string, any>;

// Interfaces para formularios
export interface ReporteFormData {
  tipoTrabajo: TipoTrabajo;
  clienteFinal?: string;
  ordenTrabajo?: string;
  proyecto?: string;
  descripcion?: string;
  observaciones?: string;
  camposDinamicos?: CamposDinamicos;
  direccion?: string;
  comuna?: string;
  region?: string;
}

export interface LocationData {
  latitud: number;
  longitud: number;
  accuracy?: number;
}

export interface MediaFile {
  id: string;
  url: string;
  file?: File;
  descripcion?: string;
}
