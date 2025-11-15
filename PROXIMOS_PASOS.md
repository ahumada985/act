# 📋 PRÓXIMOS PASOS - Tareas Pendientes

## 🔴 URGENTE - Completar Fase 1 (Autenticación/RBAC/Auditoría)

### 1. Ejecutar Migración de Base de Datos para Auth/RBAC/Audit

**IMPORTANTE: Ejecutar ANTES de usar el sistema de autenticación**

```bash
cd act-reportes
npx prisma migrate dev --name add_auth_rbac_audit
npx prisma generate
```

Esta migración agrega:
- Rol `CLIENTE` al enum `UserRole`
- Tabla `AuditLog` para auditoría
- Índices en `User.role`
- Relación `User.auditLogs`

### 2. Configurar Supabase Auth

**Panel de Supabase:**
1. Ir a: https://supabase.com/dashboard/project/udloynzfnktwoaanfjzo/auth/url-configuration
2. Configurar URLs:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
3. Habilitar Email Auth
4. (Opcional) Personalizar templates de email

### 3. Proteger Rutas Existentes

Actualizar las páginas principales para que requieran autenticación:

**Archivos a modificar:**
```typescript
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* contenido actual */}
    </ProtectedRoute>
  );
}

// Aplicar lo mismo en:
// - app/reportes/page.tsx
// - app/proyectos/page.tsx
// - app/mapa/page.tsx
// - app/galeria/page.tsx
```

### 4. Actualizar Header con Usuario

Modificar el header para mostrar usuario logueado y botón de logout:

**Archivo:** `components/layout/Header.tsx`

```typescript
import { useAuth } from '@/lib/rbac/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header>
      {user && (
        <div>
          <span>{user.nombre} {user.apellido}</span>
          <span>{user.role}</span>
          <button onClick={signOut}>Cerrar Sesión</button>
        </div>
      )}
    </header>
  );
}
```

### 5. Integrar Auditoría en Servicios

Agregar registro de auditoría en las operaciones críticas:

**Ejemplo en reportes:**
```typescript
// En componente que crea reporte
import { useAudit } from '@/hooks/useAudit';

const { logCreate } = useAudit();

const handleCreate = async (data) => {
  const reporte = await reportesService.create(data);
  await logCreate('Reporte', reporte.id, { tipoTrabajo: data.tipoTrabajo });
};
```

---

## 🔴 CRÍTICO - Migración Base de Datos (Proyectos)

### 1. Agregar Tabla Proyecto a Prisma

**Archivo:** `prisma/schema.prisma`

Agregar estos enums y modelo:

```prisma
enum EstadoProyecto {
  ACTIVO
  PAUSADO
  COMPLETADO
  CANCELADO
}

enum FaseProyecto {
  PLANIFICACION
  EJECUCION
  SUPERVISION
  CIERRE
}

model Proyecto {
  id            String          @id @default(uuid())
  nombre        String          @unique
  descripcion   String?
  cliente       String?
  estado        EstadoProyecto  @default(ACTIVO)
  fase          FaseProyecto?
  fechaInicio   DateTime?       @map("fecha_inicio")
  fechaFin      DateTime?       @map("fecha_fin")
  presupuesto   Float?
  ubicacion     String?
  responsable   String?
  metadata      Json?

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([estado])
  @@index([nombre])
}
```

### 2. Ejecutar Migración

```bash
# 1. Generar y aplicar migración
npx prisma migrate dev --name add_proyecto_table

# 2. Generar cliente de Prisma actualizado
npx prisma generate

# 3. (Opcional) Poblar tabla con proyectos existentes desde reportes
# Puedes crear un script para migrar los proyectos únicos del campo Reporte.proyecto
```

### 3. Script de Migración de Datos (Opcional)

Si quieres migrar proyectos existentes desde los reportes:

**Crear archivo:** `scripts/migrate-proyectos.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProyectos() {
  // 1. Obtener proyectos únicos de reportes
  const reportes = await prisma.reporte.findMany({
    where: { proyecto: { not: null } },
    select: { proyecto: true },
    distinct: ['proyecto'],
  });

  // 2. Crear registros en tabla Proyecto
  for (const r of reportes) {
    if (r.proyecto) {
      await prisma.proyecto.create({
        data: {
          nombre: r.proyecto,
          estado: 'ACTIVO',
          descripcion: `Proyecto migrado automáticamente`,
        },
      });
      console.log(`✅ Proyecto creado: ${r.proyecto}`);
    }
  }

  console.log(`\n🎉 Migración completada: ${reportes.length} proyectos creados`);
}

migrateProyectos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar:**
```bash
npx tsx scripts/migrate-proyectos.ts
```

---

## 🟡 IMPORTANTE - Actualizar Hooks de Reportes

Los hooks `useCreateReporte` y `useUpdateReporte` en `hooks/queries/useReportes.ts` todavía usan `addNotification` del store de Zustand. Deberían usar `toast` de Sonner:

**Archivo:** `hooks/queries/useReportes.ts`

Reemplazar:
```typescript
import { useAppStore } from '@/stores';
const addNotification = useAppStore((state) => state.addNotification);
addNotification('success', 'Mensaje');
```

Por:
```typescript
import { toast } from 'sonner';
toast.success('Mensaje');
```

---

## 🟢 OPCIONAL - Mejoras Sugeridas

### 1. Limpieza del AppStore
Ya que migramos las notificaciones a Sonner, podemos eliminar el sistema de notificaciones del `useAppStore`:

**Archivo:** `stores/useAppStore.ts`

Eliminar:
```typescript
notifications: [],
addNotification: (type, message) => { ... }
```

### 2. Crear Componente de Selector de Proyectos
Para usar en formularios de reportes:

```typescript
// components/features/proyectos/ProyectoSelector.tsx
export function ProyectoSelector({ value, onChange }) {
  const { data: proyectos } = useProyectosActivos();
  // ... select dropdown con búsqueda
}
```

### 3. Página de Proyectos
Crear UI para gestionar proyectos:
- `app/proyectos/page.tsx` - Lista de proyectos
- `app/proyectos/[id]/page.tsx` - Detalle de proyecto con estadísticas

---

## 📝 Checklist de Migración

- [ ] Agregar modelo Proyecto a `schema.prisma`
- [ ] Ejecutar `npx prisma migrate dev --name add_proyecto_table`
- [ ] Ejecutar `npx prisma generate`
- [ ] (Opcional) Ejecutar script de migración de datos
- [ ] Verificar que service de proyectos funciona con queries reales
- [ ] Actualizar hooks de reportes para usar `toast` en vez de `addNotification`
- [ ] Crear componente ProyectoSelector
- [ ] Crear página de gestión de proyectos

---

## 🚀 Comandos Rápidos

```bash
# Migración completa
npx prisma migrate dev --name add_proyecto_table && npx prisma generate

# Ver estado de la base de datos
npx prisma studio

# Generar cliente después de cambios
npx prisma generate

# Reset completo (⚠️ BORRA DATOS)
npx prisma migrate reset
```

---

## 📚 Documentación Relacionada

- `ARQUITECTURA.md` - Arquitectura general
- `MIGRACION.md` - Guía de migración de componentes
- `QUE_FALTA.md` - Análisis de lo que faltaba (ya completado)
- `TAREAS_PENDIENTES.md` - Tareas técnicas pendientes

---

**Última actualización:** 2025-11-09
**Estado:** ✅ Services y Hooks completados, pendiente migración de BD
