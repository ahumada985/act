/**
 * EJEMPLO DE MIGRACIÓN COMPLETA
 * Este archivo muestra cómo debería verse una página migrada
 * Compáralo con app/reportes/page.tsx actual para ver las diferencias
 *
 * NO USAR ESTE ARCHIVO DIRECTAMENTE - ES SOLO REFERENCIA
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, FileDown } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/common';
import { ReportesTable, ReportesFilters } from '@/components/features/reportes';
import { useReportes, useDeleteReporte } from '@/hooks/queries/useReportes';
import { useFiltrosStore } from '@/stores';
import { useDebounce } from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';

export default function ReportesPageEjemplo() {
  const router = useRouter();

  // ✅ React Query en lugar de useState + fetch manual
  const { data: reportes = [], isLoading, error, refetch } = useReportes();

  // ✅ Zustand para filtros en lugar de useState local
  const filtros = useFiltrosStore((state) => state.filtrosReportes);
  const setFiltros = useFiltrosStore((state) => state.setFiltrosReportes);
  const clearFiltros = useFiltrosStore((state) => state.clearFiltrosReportes);

  // ✅ Mutation para delete con notificaciones automáticas
  const deleteMutation = useDeleteReporte();

  // ✅ Debounce para búsqueda
  const debouncedBusqueda = useDebounce(filtros.busqueda || '', 300);

  // ✅ Filtrado local con useMemo para performance
  const reportesFiltrados = useMemo(() => {
    let filtered = [...reportes];

    if (filtros.tipoTrabajo) {
      filtered = filtered.filter((r) => r.tipoTrabajo === filtros.tipoTrabajo);
    }

    if (filtros.status) {
      filtered = filtered.filter((r) => r.status === filtros.status);
    }

    if (filtros.fechaDesde) {
      filtered = filtered.filter((r) => r.fecha >= filtros.fechaDesde!);
    }

    if (filtros.fechaHasta) {
      filtered = filtered.filter((r) => r.fecha <= filtros.fechaHasta!);
    }

    if (debouncedBusqueda) {
      const search = debouncedBusqueda.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.descripcion?.toLowerCase().includes(search) ||
          r.direccion?.toLowerCase().includes(search) ||
          r.supervisor?.nombre?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [reportes, filtros, debouncedBusqueda]);

  // ✅ Handler de delete optimizado
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      // ✅ Cache se actualiza automáticamente
      // ✅ Notificación de éxito automática
    } catch (error) {
      // ✅ Error manejado automáticamente por el hook
    }
  };

  // ✅ Exportar a Excel (mantener esta lógica)
  const exportarExcel = () => {
    const datos = reportesFiltrados.map((r) => ({
      Fecha: r.fecha,
      Tipo: r.tipoTrabajo,
      Estado: r.status,
      Descripción: r.descripcion || '',
      Dirección: r.direccion || '',
      Comuna: r.comuna || '',
      Supervisor: r.supervisor
        ? `${r.supervisor.nombre} ${r.supervisor.apellido}`
        : '',
      Fotos: r.fotos?.length || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
    XLSX.writeFile(wb, `reportes_${new Date().toISOString()}.xlsx`);
  };

  // ✅ Loading y Error states con componentes reutilizables
  if (isLoading) return <LoadingState message="Cargando reportes..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
            <p className="text-gray-600">
              {reportesFiltrados.length} de {reportes.length} reportes
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={exportarExcel} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={() => router.push('/reportes/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* Filtros - Componente separado */}
        <ReportesFilters
          filtros={filtros}
          onChange={setFiltros}
          onClear={clearFiltros}
        />

        {/* Tabla - Componente separado */}
        <ReportesTable
          reportes={reportesFiltrados}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

/*
 * COMPARACIÓN ANTES VS DESPUÉS:
 *
 * ANTES (625 líneas):
 * - useState para reportes, loading, filtros
 * - useEffect con fetchReportes manual
 * - try-catch con alert() para errores
 * - Loading state duplicado (HTML repetido)
 * - Funciones helper definidas inline
 * - Lógica de filtrado mezclada con UI
 *
 * DESPUÉS (150 líneas):
 * - useReportes() con cache automático
 * - useFiltrosStore() con persistencia
 * - Componentes reutilizables (LoadingState, ErrorState)
 * - ReportesTable y ReportesFilters separados
 * - Notificaciones automáticas
 * - useMemo para performance
 * - useDebounce para búsqueda
 *
 * BENEFICIOS:
 * ✅ 75% menos código
 * ✅ Cache automático
 * ✅ Performance optimizada
 * ✅ Fácil de testear
 * ✅ Fácil de mantener
 * ✅ Reutilizable
 */
