/**
 * Store para manejo de filtros globales
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TipoTrabajo, ReportStatus } from '@/types';

export interface FiltrosReportes {
  tipoTrabajo?: TipoTrabajo;
  status?: ReportStatus;
  supervisorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  proyecto?: string;
  busqueda?: string;
}

export interface FiltrosProyectos {
  estado?: string;
  busqueda?: string;
}

interface FiltrosState {
  // Filtros de Reportes
  filtrosReportes: FiltrosReportes;
  setFiltrosReportes: (filtros: Partial<FiltrosReportes>) => void;
  clearFiltrosReportes: () => void;

  // Filtros de Proyectos
  filtrosProyectos: FiltrosProyectos;
  setFiltrosProyectos: (filtros: Partial<FiltrosProyectos>) => void;
  clearFiltrosProyectos: () => void;

  // Filtros guardados (presets)
  filtrosGuardados: Record<string, FiltrosReportes>;
  guardarFiltro: (nombre: string, filtros: FiltrosReportes) => void;
  eliminarFiltroGuardado: (nombre: string) => void;
  aplicarFiltroGuardado: (nombre: string) => void;
}

export const useFiltrosStore = create<FiltrosState>()(
  devtools(
    persist(
      (set, get) => ({
        // Filtros de Reportes
        filtrosReportes: {},
        setFiltrosReportes: (filtros) =>
          set((state) => ({
            filtrosReportes: { ...state.filtrosReportes, ...filtros },
          })),
        clearFiltrosReportes: () => set({ filtrosReportes: {} }),

        // Filtros de Proyectos
        filtrosProyectos: {},
        setFiltrosProyectos: (filtros) =>
          set((state) => ({
            filtrosProyectos: { ...state.filtrosProyectos, ...filtros },
          })),
        clearFiltrosProyectos: () => set({ filtrosProyectos: {} }),

        // Filtros guardados
        filtrosGuardados: {},
        guardarFiltro: (nombre, filtros) =>
          set((state) => ({
            filtrosGuardados: { ...state.filtrosGuardados, [nombre]: filtros },
          })),
        eliminarFiltroGuardado: (nombre) =>
          set((state) => {
            const { [nombre]: _, ...rest } = state.filtrosGuardados;
            return { filtrosGuardados: rest };
          }),
        aplicarFiltroGuardado: (nombre) => {
          const filtros = get().filtrosGuardados[nombre];
          if (filtros) {
            set({ filtrosReportes: filtros });
          }
        },
      }),
      {
        name: 'filtros-storage',
      }
    ),
    {
      name: 'FiltrosStore',
    }
  )
);

// Selectores optimizados
export const selectFiltrosReportes = (state: FiltrosState) => state.filtrosReportes;
export const selectFiltrosProyectos = (state: FiltrosState) => state.filtrosProyectos;
export const selectFiltrosGuardados = (state: FiltrosState) => state.filtrosGuardados;
export const selectHasActiveFiltros = (state: FiltrosState) =>
  Object.keys(state.filtrosReportes).length > 0;
