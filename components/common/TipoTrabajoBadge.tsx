/**
 * Componente de Tipo Trabajo Badge optimizado
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatTipoTrabajo } from '@/utils';
import type { TipoTrabajo } from '@/types';

interface TipoTrabajoBadgeProps {
  tipo: TipoTrabajo;
  className?: string;
}

const TIPO_COLORS: Record<TipoTrabajo, string> = {
  FIBRA_OPTICA: 'bg-purple-100 text-purple-800 border-purple-300',
  DATA_CENTER: 'bg-blue-100 text-blue-800 border-blue-300',
  ANTENAS: 'bg-green-100 text-green-800 border-green-300',
  CCTV: 'bg-orange-100 text-orange-800 border-orange-300',
  INSTALACION_RED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  OTRO: 'bg-gray-100 text-gray-800 border-gray-300',
};

export const TipoTrabajoBadge = React.memo<TipoTrabajoBadgeProps>(({ tipo, className }) => {
  const colorClass = TIPO_COLORS[tipo];
  const label = formatTipoTrabajo(tipo);

  return (
    <Badge className={`${colorClass} ${className || ''}`} variant="outline">
      {label}
    </Badge>
  );
});

TipoTrabajoBadge.displayName = 'TipoTrabajoBadge';
