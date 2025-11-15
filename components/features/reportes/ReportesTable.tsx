/**
 * Componente de tabla de reportes optimizado
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge, TipoTrabajoBadge, EmptyState } from '@/components/common';
import { formatDate, formatRelativeTime } from '@/utils';
import { Eye, Edit, Trash2, MapPin } from 'lucide-react';

interface Reporte {
  id: string;
  tipoTrabajo: string;
  status: string;
  descripcion?: string;
  fecha: string;
  direccion?: string;
  comuna?: string;
  supervisor?: {
    nombre: string;
    apellido: string;
  };
  fotos?: Array<{ id: string }>;
  createdAt: string;
}

interface ReportesTableProps {
  reportes: Reporte[];
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const ReporteRow = React.memo<{
  reporte: Reporte;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}>(({ reporte, onView, onEdit, onDelete, showActions = true }) => {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Info principal */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TipoTrabajoBadge tipo={reporte.tipoTrabajo as any} />
              <StatusBadge status={reporte.status as any} />
              {reporte.fotos && reporte.fotos.length > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {reporte.fotos.length} fotos
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-1">
              {reporte.descripcion || 'Sin descripción'}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {reporte.supervisor && (
                <span>
                  👤 {reporte.supervisor.nombre} {reporte.supervisor.apellido}
                </span>
              )}
              {reporte.direccion && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {reporte.direccion}, {reporte.comuna}
                </span>
              )}
              <span>📅 {formatDate(reporte.fecha)}</span>
              <span className="text-gray-400">
                {formatRelativeTime(reporte.createdAt)}
              </span>
            </div>
          </div>

          {/* Acciones */}
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(reporte.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(reporte.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(reporte.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ReporteRow.displayName = 'ReporteRow';

export const ReportesTable = React.memo<ReportesTableProps>(
  ({ reportes, onDelete, showActions = true }) => {
    const router = useRouter();

    const handleView = useMemo(
      () => (id: string) => router.push(`/reportes/${id}`),
      [router]
    );

    const handleEdit = useMemo(
      () => (id: string) => router.push(`/reportes/${id}/editar`),
      [router]
    );

    if (!reportes || reportes.length === 0) {
      return (
        <EmptyState
          title="No hay reportes"
          message="No se encontraron reportes con los filtros seleccionados"
          actionLabel="Crear nuevo reporte"
          onAction={() => router.push('/reportes/nuevo')}
        />
      );
    }

    return (
      <div className="space-y-2">
        {reportes.map((reporte) => (
          <ReporteRow
            key={reporte.id}
            reporte={reporte}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={onDelete}
            showActions={showActions}
          />
        ))}
      </div>
    );
  }
);

ReportesTable.displayName = 'ReportesTable';
