# Arquitectura de ACT Reportes

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Patrones de Diseño](#patrones-de-diseño)
- [Estado Global](#estado-global)
- [Guía de Uso](#guía-de-uso)
- [Mejores Prácticas](#mejores-prácticas)

---

## Visión General

ACT Reportes está construido con una arquitectura moderna basada en:

- **Next.js 14** (App Router)
- **TypeScript** para type-safety
- **React Query** para data fetching y cache
- **Zustand** para estado global
- **Supabase** como backend
- **Tailwind CSS** para estilos

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Código organizado en capas (Services, Hooks, Components)
2. **Single Responsibility**: Cada módulo tiene una única responsabilidad
3. **DRY (Don't Repeat Yourself)**: Reutilización máxima de código
4. **Performance First**: Memoización y optimizaciones desde el inicio
5. **Type Safety**: TypeScript estricto en todo el proyecto

---

## Estructura de Carpetas

```
act-reportes/
├── app/                      # Next.js App Router
│   ├── (routes)/            # Páginas de la aplicación
│   ├── api/                 # API Routes
│   └── layout.tsx           # Layout principal con providers
│
├── components/              # Componentes React
│   ├── common/             # Componentes reutilizables
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── StatusBadge.tsx
│   │   └── TipoTrabajoBadge.tsx
│   ├── features/           # Componentes por feature (futuro)
│   ├── forms/              # Componentes de formularios
│   ├── layout/             # Componentes de layout
│   ├── providers/          # Providers de React
│   └── ui/                 # Componentes UI base (shadcn/ui)
│
├── constants/              # Constantes y configuraciones
│   ├── reportes.ts         # Constantes de reportes
│   ├── proyectos.ts        # Constantes de proyectos
│   └── index.ts            # Barrel export
│
├── contexts/               # React Contexts (si se necesitan)
│
├── hooks/                  # Custom Hooks
│   ├── queries/            # React Query hooks
│   │   ├── useReportes.ts
│   │   ├── useFotos.ts
│   │   ├── usePlantillas.ts
│   │   └── useUsers.ts
│   └── useOnlineStatus.ts
│
├── lib/                    # Librerías y configuraciones
│   ├── supabase/
│   ├── utils.ts
│   └── ...
│
├── services/               # Capa de servicios (API calls)
│   ├── reportes.service.ts
│   ├── fotos.service.ts
│   ├── audios.service.ts
│   ├── plantillas.service.ts
│   ├── users.service.ts
│   └── index.ts
│
├── stores/                 # Zustand stores
│   ├── useAppStore.ts      # Estado global de UI
│   ├── useFiltrosStore.ts  # Filtros globales
│   ├── useOfflineStore.ts  # Manejo offline
│   └── index.ts
│
├── types/                  # TypeScript types
│   └── index.ts
│
└── utils/                  # Funciones utilitarias
    ├── fileUtils.ts
    ├── dateUtils.ts
    ├── formatters.ts
    └── index.ts
```

---

## Patrones de Diseño

### 1. Service Layer Pattern

Toda la lógica de llamadas a API está centralizada en services:

```typescript
// services/reportes.service.ts
export const reportesService = {
  getAll: async () => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  create: async (data) => { /* ... */ },
  update: async (id, updates) => { /* ... */ },
  delete: async (id) => { /* ... */ },
};
```

**Beneficios:**
- Una única fuente de verdad para queries
- Fácil de testear
- Cambios de backend centralizados

### 2. Custom Hooks Pattern

Hooks de React Query para cada entidad:

```typescript
// hooks/queries/useReportes.ts
export function useReportes() {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTES,
    queryFn: reportesService.getAll,
  });
}

export function useCreateReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTES });
    },
  });
}
```

**Beneficios:**
- Cache automático
- Revalidación inteligente
- Loading/Error states integrados

### 3. Zustand para Estado Global

```typescript
// stores/useAppStore.ts
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        // ...
      }),
      { name: 'app-storage' }
    )
  )
);
```

**Beneficios:**
- Simple y performante
- DevTools integrado
- Persistencia automática

### 4. Component Memoization

Componentes optimizados con React.memo:

```typescript
export const StatusBadge = React.memo<StatusBadgeProps>(({ status }) => {
  // ...
});

StatusBadge.displayName = 'StatusBadge';
```

**Beneficios:**
- Previene re-renders innecesarios
- Mejor performance

---

## Estado Global

### 1. React Query (Server State)

Maneja TODO el estado del servidor:

```typescript
// En un componente
const { data: reportes, isLoading, error } = useReportes();
const createMutation = useCreateReporte();

// Crear un reporte
createMutation.mutate(data);
```

**Query Keys:**
```typescript
QUERY_KEYS.REPORTES           // ['reportes']
QUERY_KEYS.REPORTE(id)        // ['reporte', '123']
QUERY_KEYS.PROYECTOS          // ['proyectos']
QUERY_KEYS.PLANTILLAS         // ['plantillas']
```

### 2. Zustand (Client State)

Maneja estado de UI y preferencias:

```typescript
// useAppStore - Estado global de la app
const currentUser = useAppStore((state) => state.currentUser);
const isOnline = useAppStore((state) => state.isOnline);

// useFiltrosStore - Filtros globales
const filtros = useFiltrosStore((state) => state.filtrosReportes);
const setFiltros = useFiltrosStore((state) => state.setFiltrosReportes);

// useOfflineStore - Manejo offline
const pendientes = useOfflineStore((state) => state.reportesPendientes);
const addPendiente = useOfflineStore((state) => state.addReportePendiente);
```

---

## Guía de Uso

### Crear un Nuevo Feature

#### 1. Agregar Service

```typescript
// services/miFeature.service.ts
export const miFeatureService = {
  async getAll() {
    const { data, error } = await supabase
      .from('MiTabla')
      .select('*');

    if (error) throw error;
    return data;
  },
};
```

#### 2. Crear Hook de Query

```typescript
// hooks/queries/useMiFeature.ts
import { useQuery } from '@tanstack/react-query';
import { miFeatureService } from '@/services';

export function useMiFeature() {
  return useQuery({
    queryKey: ['miFeature'],
    queryFn: miFeatureService.getAll,
  });
}
```

#### 3. Usar en Componente

```typescript
// components/features/MiFeature.tsx
'use client';

import { useMiFeature } from '@/hooks/queries/useMiFeature';
import { LoadingState, ErrorState } from '@/components/common';

export function MiFeature() {
  const { data, isLoading, error } = useMiFeature();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.nombre}</div>
      ))}
    </div>
  );
}
```

### Trabajar con Formularios

```typescript
import { useCreateReporte } from '@/hooks/queries/useReportes';
import { useAppStore } from '@/stores';

export function ReporteForm() {
  const currentUser = useAppStore((state) => state.currentUser);
  const createMutation = useCreateReporte();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        supervisorId: currentUser?.id!,
      });
      // Éxito - React Query invalida cache automáticamente
    } catch (error) {
      // Error - manejado por el hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### Trabajar con Filtros

```typescript
import { useFiltrosStore } from '@/stores';
import { useReportesFiltrados } from '@/hooks/queries/useReportes';

export function ReportesListaFiltrada() {
  const filtros = useFiltrosStore((state) => state.filtrosReportes);
  const setFiltros = useFiltrosStore((state) => state.setFiltrosReportes);

  const { data: reportes } = useReportesFiltrados(filtros);

  return (
    <>
      <FilterPanel
        filtros={filtros}
        onChange={(newFiltros) => setFiltros(newFiltros)}
      />
      <ReportesList reportes={reportes} />
    </>
  );
}
```

---

## Mejores Prácticas

### 1. Imports Organizados

```typescript
// 1. Imports de React y Next
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports de librerías externas
import { useQuery } from '@tanstack/react-query';

// 3. Imports de la app (con alias @)
import { useReportes } from '@/hooks/queries/useReportes';
import { reportesService } from '@/services';
import { useAppStore } from '@/stores';
import { LoadingState } from '@/components/common';
import { formatDate } from '@/utils';
import { TIPOS_TRABAJO } from '@/constants';

// 4. Imports de tipos
import type { Reporte } from '@/types';
```

### 2. Naming Conventions

```typescript
// Componentes: PascalCase
export function ReporteCard() {}

// Hooks: camelCase con prefijo 'use'
export function useReporte(id: string) {}

// Services: camelCase con sufijo '.service'
export const reportesService = {};

// Stores: camelCase con prefijo 'use' y sufijo 'Store'
export const useAppStore = create();

// Constants: UPPER_SNAKE_CASE
export const QUERY_KEYS = {};

// Types/Interfaces: PascalCase
export interface ReporteFormData {}

// Archivos: kebab-case
// reporte-card.tsx
// use-reporte.ts
// reportes.service.ts
```

### 3. Error Handling

```typescript
// En hooks de mutation
export function useCreateReporte() {
  const addNotification = useAppStore((state) => state.addNotification);

  return useMutation({
    mutationFn: reportesService.create,
    onSuccess: () => {
      addNotification('success', 'Reporte creado');
    },
    onError: (error: Error) => {
      addNotification('error', error.message);
      // Log error para debugging
      console.error('[useCreateReporte]', error);
    },
  });
}
```

### 4. Loading y Error States

```typescript
// Usar componentes comunes
import { LoadingState, ErrorState, EmptyState } from '@/components/common';

function MiComponente() {
  const { data, isLoading, error } = useQuery();

  if (isLoading) return <LoadingState message="Cargando reportes..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No hay reportes" />;

  return <div>{/* Contenido */}</div>;
}
```

### 5. Performance

```typescript
// Usar React.memo para componentes que re-renderizan mucho
export const ReporteCard = React.memo<ReporteCardProps>(({ reporte }) => {
  // ...
});

// Usar useMemo para cálculos costosos
const estadisticas = useMemo(() => {
  return calcularEstadisticas(reportes);
}, [reportes]);

// Usar useCallback para funciones pasadas como props
const handleClick = useCallback((id: string) => {
  navigate(`/reportes/${id}`);
}, [navigate]);
```

### 6. TypeScript

```typescript
// Siempre tipar parámetros y returns
function createReporte(data: CreateReporteInput): Promise<Reporte> {
  return reportesService.create(data);
}

// Evitar 'any' - usar tipos específicos
const [reportes, setReportes] = useState<Reporte[]>([]); // ✅
const [reportes, setReportes] = useState<any[]>([]);     // ❌

// Usar tipos exportados
import type { TipoTrabajo, ReportStatus } from '@/types';
```

---

## Scripts Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Poblar datos de prueba
npm run poblar
```

---

## Recursos Adicionales

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Última actualización:** 2025-01-08
**Versión:** 2.0.0
