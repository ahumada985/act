/**
 * Store global de la aplicación (UI state, user, etc)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  telefono?: string;
}

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // User State
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Online/Offline
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // UI State
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // User State
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),

        // Online/Offline
        isOnline: true,
        setIsOnline: (online) => set({ isOnline: online }),

        // Notifications
        notifications: [],
        addNotification: (type, message) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                id: Math.random().toString(36).substring(7),
                type,
                message,
                timestamp: Date.now(),
              },
            ],
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),

        // Loading states
        globalLoading: false,
        setGlobalLoading: (loading) => set({ globalLoading: loading }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          currentUser: state.currentUser,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);

// Selectores optimizados
export const selectUser = (state: AppState) => state.currentUser;
export const selectIsOnline = (state: AppState) => state.isOnline;
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen;
export const selectNotifications = (state: AppState) => state.notifications;
