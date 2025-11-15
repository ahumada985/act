/**
 * Página de administración de reportes programados
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Mail,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  X,
} from 'lucide-react';
import { ScheduledReportForm } from '@/components/admin/ScheduledReportForm';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScheduledReport {
  id: string;
  nombre: string;
  descripcion?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  format: 'PDF' | 'EXCEL' | 'JSON';
  emails: string[];
  filters?: any;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  active: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: string;
  lastError?: string;
  createdAt: string;
}

const FREQUENCY_LABELS = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
};

const FORMAT_LABELS = {
  PDF: 'PDF',
  EXCEL: 'Excel (CSV)',
  JSON: 'JSON',
};

export default function ReportesProgramadosPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Obtener reportes programados
  const { data, isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const res = await fetch('/api/scheduled-reports');
      if (!res.ok) throw new Error('Error al cargar reportes');
      const json = await res.json();
      return json.reportes as ScheduledReport[];
    },
  });

  // Eliminar reporte
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/scheduled-reports/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Reporte eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar reporte');
    },
  });

  // Toggle active/inactive
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/scheduled-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Estado actualizado');
    },
  });

  const reportes = data || [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Programados</h1>
          <p className="text-gray-600 mt-1">
            Configura reportes automáticos que se enviarán por email
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportes.length}</div>
            <div className="text-sm text-gray-600">Total Reportes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {reportes.filter((r) => r.active).length}
            </div>
            <div className="text-sm text-gray-600">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-400">
              {reportes.filter((r) => !r.active).length}
            </div>
            <div className="text-sm text-gray-600">Inactivos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {reportes.filter((r) => r.lastStatus === 'ERROR').length}
            </div>
            <div className="text-sm text-gray-600">Con Errores</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reportes */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      ) : reportes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No hay reportes programados</h3>
            <p className="text-gray-600 mb-4">
              Crea tu primer reporte programado para automatizar el envío de información
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reportes.map((reporte) => (
            <Card key={reporte.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{reporte.nombre}</CardTitle>
                      <Badge
                        variant={reporte.active ? 'default' : 'secondary'}
                        className={
                          reporte.active ? 'bg-green-500 hover:bg-green-600' : ''
                        }
                      >
                        {reporte.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline">{FREQUENCY_LABELS[reporte.frequency]}</Badge>
                      <Badge variant="outline">{FORMAT_LABELS[reporte.format]}</Badge>
                      {reporte.lastStatus === 'ERROR' && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                      {reporte.lastStatus === 'SUCCESS' && (
                        <Badge className="bg-green-500 hover:bg-green-600">Exitoso</Badge>
                      )}
                    </div>
                    {reporte.descripcion && (
                      <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: reporte.id,
                          active: !reporte.active,
                        })
                      }
                    >
                      {reporte.active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (
                          confirm('¿Eliminar este reporte programado?')
                        ) {
                          deleteMutation.mutate(reporte.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Destinatarios:</div>
                      <div className="text-gray-600">
                        {reporte.emails.slice(0, 2).join(', ')}
                        {reporte.emails.length > 2 && (
                          <span className="text-xs ml-1">
                            +{reporte.emails.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Programación:</div>
                      <div className="text-gray-600">
                        {reporte.frequency === 'DAILY' && `Diario a las ${reporte.hour}:00`}
                        {reporte.frequency === 'WEEKLY' &&
                          `Semanal (${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][reporte.dayOfWeek || 1]}) a las ${reporte.hour}:00`}
                        {reporte.frequency === 'MONTHLY' &&
                          `Mensual (día ${reporte.dayOfMonth}) a las ${reporte.hour}:00`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Próxima ejecución:</div>
                      <div className="text-gray-600">
                        {reporte.nextRunAt ? (
                          formatDistanceToNow(new Date(reporte.nextRunAt), {
                            addSuffix: true,
                            locale: es,
                          })
                        ) : (
                          'No programada'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {reporte.lastError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <div className="font-medium text-red-900 mb-1">Último error:</div>
                    <div className="text-red-700">{reporte.lastError}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear/editar reporte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white z-10 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Crear Reporte Programado</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ScheduledReportForm
                onSubmit={async (data) => {
                  try {
                    const res = await fetch('/api/scheduled-reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });

                    if (!res.ok) throw new Error('Error al crear reporte');

                    queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
                    toast.success('Reporte programado creado');
                    setShowCreateModal(false);
                  } catch (error) {
                    toast.error('Error al crear reporte');
                    throw error;
                  }
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
