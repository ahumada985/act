/**
 * Utilidades de formateo general
 */

import { TIPO_TRABAJO_LABELS, STATUS_LABELS, ESTADO_LABELS } from '@/constants';

export const formatTipoTrabajo = (tipo: string): string => {
  return TIPO_TRABAJO_LABELS[tipo] || tipo;
};

export const formatStatus = (status: string): string => {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
};

export const formatEstado = (estado: string): string => {
  return ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] || estado;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};
