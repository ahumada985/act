# Guía de Migración a Nueva Arquitectura

## 🎯 Objetivo

Migrar componentes existentes para usar la nueva arquitectura basada en:
- Services Layer
- React Query
- Zustand Stores
- Componentes Memoizados

---

## 📦 Instalar Dependencias Faltantes

```bash
npm install @tanstack/react-query-devtools
```

---

## 🔄 Pasos de Migración por Componente

### 1. Migrar `app/reportes/page.tsx`

#### ANTES (Estado actual):
```typescript
const [reportes, setReportes] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

async function fetchReportes() {
  try {
    const { data, error } = await supabase
      .from("Reporte")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    setReportes(data || []);
  } catch (error: any) {
    alert("Error: " + error.message);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  fetchReportes();
}, []);
```

#### DESPUÉS (Nueva arquitectura):
```typescript
import { useReportes } from '@/hooks/queries/useReportes';
import { useFiltrosStore } from '@/stores';
import { LoadingState, ErrorState } from '@/components/common';

export default function ReportesPage() {
  const { data: reportes, isLoading, error, refetch } = useReportes();
  const filtros = useFiltrosStore((state) => state.filtrosReportes);

  if (isLoading) return <LoadingState message="Cargando reportes..." />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div>
      {/* Renderizar reportes */}
    </div>
  );
}
```

**Beneficios:**
- ✅ Cache automático
- ✅ Loading/Error states consistentes
- ✅ Menos código
- ✅ No más alerts

---

### 2. Migrar `app/reportes/nuevo/page.tsx`

Este es el componente más grande (760 líneas). Dividir en:

#### 2.1 Crear Hook de Formulario

```typescript
// hooks/useReporteForm.ts
import { useState } from 'react';
import { useCreateReporte } from '@/hooks/queries/useReportes';
import { useRouter } from 'next/navigation';

export function useReporteForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({/* ... */});
  const [fotos, setFotos] = useState<File[]>([]);
  const [audios, setAudios] = useState<any[]>([]);

  const createMutation = useCreateReporte();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        ...formData,
        // ...
      });

      router.push('/reportes');
    } catch (error) {
      // Error manejado automáticamente por el hook
    }
  };

  return {
    formData,
    setFormData,
    fotos,
    setFotos,
    audios,
    setAudios,
    handleSubmit,
    isSubmitting: createMutation.isPending,
  };
}
```

#### 2.2 Dividir en Componentes

```typescript
// app/reportes/nuevo/page.tsx
import { useReporteForm } from '@/hooks/useReporteForm';
import { ReporteFormGeneral } from './components/ReporteFormGeneral';
import { ReporteFormUbicacion } from './components/ReporteFormUbicacion';
import { ReporteFormFotos } from './components/ReporteFormFotos';

export default function NuevoReportePage() {
  const {
    formData,
    setFormData,
    fotos,
    handleSubmit,
    isSubmitting,
  } = useReporteForm();

  return (
    <form onSubmit={handleSubmit}>
      <ReporteFormGeneral
        formData={formData}
        onChange={setFormData}
      />
      <ReporteFormUbicacion />
      <ReporteFormFotos fotos={fotos} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear Reporte'}
      </Button>
    </form>
  );
}
```

---

### 3. Migrar `app/dashboard/page.tsx`

#### ANTES:
```typescript
const [loading, setLoading] = useState(true);
const [estadisticas, setEstadisticas] = useState<EstadisticasData>({/* ... */});

async function fetchEstadisticas() {
  // 142 líneas de queries y cálculos
}

useEffect(() => {
  fetchEstadisticas();
}, []);
```

#### DESPUÉS:
```typescript
import { useEstadisticasReportes } from '@/hooks/queries/useReportes';

export default function DashboardPage() {
  const { data: estadisticas, isLoading, error } = useEstadisticasReportes();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div>
      <EstadisticasCards estadisticas={estadisticas} />
      <GraficosSection estadisticas={estadisticas} />
    </div>
  );
}
```

---

## 🎨 Migrar Componentes UI

### Reemplazar Loading Duplicado

#### ANTES:
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card><CardTitle>Cargando...</CardTitle></Card>
    </div>
  );
}
```

#### DESPUÉS:
```typescript
import { LoadingState } from '@/components/common';

if (loading) return <LoadingState message="Cargando..." />;
```

### Reemplazar Badges Duplicados

#### ANTES:
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "BORRADOR": return "bg-gray-100 text-gray-800";
    // ...
  }
};

<span className={getStatusColor(reporte.status)}>
  {reporte.status}
</span>
```

#### DESPUÉS:
```typescript
import { StatusBadge } from '@/components/common';

<StatusBadge status={reporte.status} />
```

---

## 📊 Migrar Filtros

### ANTES (Estado local en cada página):
```typescript
const [filtros, setFiltros] = useState({});

// Guardar en localStorage manualmente
localStorage.setItem('filtros', JSON.stringify(filtros));
```

### DESPUÉS (Zustand con persistencia):
```typescript
import { useFiltrosStore } from '@/stores';

const filtros = useFiltrosStore((state) => state.filtrosReportes);
const setFiltros = useFiltrosStore((state) => state.setFiltrosReportes);
const clearFiltros = useFiltrosStore((state) => state.clearFiltrosReportes);

// Persistencia automática en localStorage
```

---

## 🔧 Utilidades

### Migrar Funciones Helper

#### ANTES (En cada archivo):
```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // ...
  });
};
```

#### DESPUÉS:
```typescript
import { fileToBase64, formatDate, formatTipoTrabajo } from '@/utils';

// Usar directamente
const base64 = await fileToBase64(file);
```

---

## ✅ Checklist de Migración

Por cada componente/página:

- [ ] Reemplazar `useState` + `fetch` con hooks de React Query
- [ ] Usar `useFiltrosStore` para filtros persistentes
- [ ] Usar `useAppStore` para estado global (user, notifications)
- [ ] Reemplazar loading states con `<LoadingState />`
- [ ] Reemplazar error handling con `<ErrorState />`
- [ ] Usar `<StatusBadge />` y `<TipoTrabajoBadge />`
- [ ] Importar funciones de `@/utils` en lugar de definir localmente
- [ ] Importar constantes de `@/constants`
- [ ] Agregar tipos específicos (no usar `any`)
- [ ] Considerar `React.memo` si el componente re-renderiza mucho

---

## 🚀 Orden de Migración Recomendado

1. **Fase 1 - Páginas simples** (1-2 días)
   - `/reportes/page.tsx` (lista)
   - `/proyectos/page.tsx`
   - `/galeria/page.tsx`

2. **Fase 2 - Dashboard** (1 día)
   - `/dashboard/page.tsx`

3. **Fase 3 - Formularios** (2-3 días)
   - `/reportes/nuevo/page.tsx` (el más complejo)
   - `/reportes/[id]/editar/page.tsx`
   - `/proyectos/nuevo/page.tsx`

4. **Fase 4 - Componentes especializados** (1-2 días)
   - `components/ia/AnalisisIAPanel.tsx`
   - `components/maps/ReportesMap.tsx`
   - `components/forms/*`

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "hooks can only be called inside the body of a function component"

**Solución:** Asegúrate de que el archivo tenga `'use client'` al inicio si usa hooks.

```typescript
'use client';

import { useReportes } from '@/hooks/queries/useReportes';
```

### Problema: React Query devuelve datos undefined

**Solución:** Usa optional chaining y valores por defecto:

```typescript
const { data: reportes = [] } = useReportes();

// O
const { data } = useReportes();
const reportes = data ?? [];
```

### Problema: Zustand store no persiste

**Solución:** Verifica que el store tenga el middleware `persist`:

```typescript
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'app-storage' } // ← Importante
  )
);
```

---

## 📚 Recursos de Ayuda

- Ver ejemplos en `hooks/queries/useReportes.ts`
- Revisar `components/common/` para componentes reutilizables
- Consultar `ARQUITECTURA.md` para patrones
- Usar React Query DevTools en desarrollo

---

**Última actualización:** 2025-01-08
