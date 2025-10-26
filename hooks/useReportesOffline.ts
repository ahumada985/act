import { useState, useEffect } from 'react';
import {
  guardarReporteOffline,
  obtenerReportesPendientes,
  eliminarReporte,
  actualizarEstadoReporte,
  contarReportesPendientes,
  ReporteOffline,
} from '@/lib/offline-storage';

export function useReportesOffline() {
  const [reportesPendientes, setReportesPendientes] = useState<ReporteOffline[]>([]);
  const [contador, setContador] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Cargar reportes pendientes
  const cargarReportes = async () => {
    try {
      const reportes = await obtenerReportesPendientes();
      setReportesPendientes(reportes);

      const count = await contarReportesPendientes();
      setContador(count);
    } catch (error) {
      console.error('[Offline] Error cargando reportes:', error);
    }
  };

  // Guardar nuevo reporte
  const guardarReporte = async (reporte: Omit<ReporteOffline, 'id' | 'createdAt' | 'estado' | 'intentos'>) => {
    try {
      const id = await guardarReporteOffline(reporte);
      await cargarReportes();
      return id;
    } catch (error) {
      console.error('[Offline] Error guardando reporte:', error);
      throw error;
    }
  };

  // Eliminar reporte
  const eliminar = async (id: string) => {
    try {
      await eliminarReporte(id);
      await cargarReportes();
    } catch (error) {
      console.error('[Offline] Error eliminando reporte:', error);
      throw error;
    }
  };

  // Actualizar estado
  const actualizarEstado = async (id: string, estado: ReporteOffline['estado'], errorMsg?: string) => {
    try {
      await actualizarEstadoReporte(id, estado, errorMsg);
      await cargarReportes();
    } catch (error) {
      console.error('[Offline] Error actualizando estado:', error);
      throw error;
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarReportes();
  }, []);

  return {
    reportesPendientes,
    contador,
    cargando,
    guardarReporte,
    eliminarReporte: eliminar,
    actualizarEstado,
    recargar: cargarReportes,
  };
}
