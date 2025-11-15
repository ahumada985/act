/**
 * Store para manejo de datos offline
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ReportePendiente {
  id: string;
  data: any;
  timestamp: number;
  syncAttempts: number;
}

interface OfflineState {
  // Reportes pendientes de sincronizar
  reportesPendientes: ReportePendiente[];
  addReportePendiente: (data: any) => void;
  removeReportePendiente: (id: string) => void;
  incrementSyncAttempts: (id: string) => void;
  clearReportesPendientes: () => void;

  // Datos en cache para modo offline
  cacheReportes: any[];
  setCacheReportes: (reportes: any[]) => void;

  cacheProyectos: any[];
  setCacheProyectos: (proyectos: any[]) => void;

  cachePlantillas: any[];
  setCachePlantillas: (plantillas: any[]) => void;

  // Última sincronización
  lastSync: number | null;
  updateLastSync: () => void;

  // Estado de sincronización
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;

  syncErrors: string[];
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  devtools(
    persist(
      (set, get) => ({
        // Reportes pendientes
        reportesPendientes: [],
        addReportePendiente: (data) =>
          set((state) => ({
            reportesPendientes: [
              ...state.reportesPendientes,
              {
                id: Math.random().toString(36).substring(7),
                data,
                timestamp: Date.now(),
                syncAttempts: 0,
              },
            ],
          })),
        removeReportePendiente: (id) =>
          set((state) => ({
            reportesPendientes: state.reportesPendientes.filter((r) => r.id !== id),
          })),
        incrementSyncAttempts: (id) =>
          set((state) => ({
            reportesPendientes: state.reportesPendientes.map((r) =>
              r.id === id ? { ...r, syncAttempts: r.syncAttempts + 1 } : r
            ),
          })),
        clearReportesPendientes: () => set({ reportesPendientes: [] }),

        // Cache
        cacheReportes: [],
        setCacheReportes: (reportes) => set({ cacheReportes: reportes }),

        cacheProyectos: [],
        setCacheProyectos: (proyectos) => set({ cacheProyectos: proyectos }),

        cachePlantillas: [],
        setCachePlantillas: (plantillas) => set({ cachePlantillas: plantillas }),

        // Sincronización
        lastSync: null,
        updateLastSync: () => set({ lastSync: Date.now() }),

        isSyncing: false,
        setIsSyncing: (syncing) => set({ isSyncing: syncing }),

        syncErrors: [],
        addSyncError: (error) =>
          set((state) => ({
            syncErrors: [...state.syncErrors, error],
          })),
        clearSyncErrors: () => set({ syncErrors: [] }),
      }),
      {
        name: 'offline-storage',
      }
    ),
    {
      name: 'OfflineStore',
    }
  )
);

// Selectores optimizados
export const selectReportesPendientes = (state: OfflineState) => state.reportesPendientes;
export const selectHasPendientes = (state: OfflineState) => state.reportesPendientes.length > 0;
export const selectCacheReportes = (state: OfflineState) => state.cacheReportes;
export const selectIsSyncing = (state: OfflineState) => state.isSyncing;
export const selectLastSync = (state: OfflineState) => state.lastSync;
