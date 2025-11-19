/**
 * Barrel export para todas las constantes
 */

export * from './reportes';
export * from './proyectos';

// Constantes comunes
export const APP_NAME = "Northtek Reportes";
export const APP_VERSION = "1.0.0";

export const TOAST_DURATION = 3000;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
