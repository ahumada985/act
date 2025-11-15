# 🏗️ Northtek Reportes - Sistema de Reportabilidad v2.0

Sistema completo de reportabilidad para proyectos mineros de telecomunicaciones en Chile con **arquitectura moderna y optimizada**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ahumada985/act)

## 🆕 **Novedades v2.0 - Arquitectura Optimizada**

- ⚡ **React Query** - Cache inteligente y sincronización automática
- 🏪 **Zustand Stores** - Estado global optimizado con persistencia
- 🏛️ **Services Layer** - Capa de servicios centralizada
- 🎣 **Custom Hooks** - Hooks reutilizables y testeables
- 🚀 **Componentes Memoizados** - Performance optimizada
- 📝 **TypeScript Strict** - Type-safety completo
- 📚 **Documentación Completa** - Guías de arquitectura y migración

👉 Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para detalles completos

## 🌟 Características Principales

### 📊 Dashboard Analítico
- ✅ Gráficos específicos para proyectos mineros
- ✅ Métricas en tiempo real por proyecto y cliente
- ✅ Top 10 proyectos mineros más activos
- ✅ Distribución visual de reportes

### 🗺️ Mapa Interactivo con GPS
- ✅ Visualización de reportes en mapa de Chile
- ✅ Filtros avanzados: proyecto, tipo, fecha, ubicación
- ✅ Colores por tipo de trabajo
- ✅ Popups con información detallada

### 📅 Timeline de Proyectos
- ✅ Línea de tiempo visual de todos los eventos
- ✅ Inicio/fin de proyectos y reportes
- ✅ Estadísticas de progreso
- ✅ Filtros por estado

### 📈 Reportes de Avance
- ✅ Seguimiento detallado por proyecto
- ✅ Métricas: aprobados, en proceso, rechazados
- ✅ Barras de progreso temporal y de tareas
- ✅ Indicadores de adelanto/atraso

### 🔄 Organización por Fases
- ✅ División automática en 3 fases del proyecto
- ✅ Planificación (30%) → Ejecución (50%) → Finalización (20%)
- ✅ Reportes organizados por fase
- ✅ Resumen de progreso por fase

### 🖼️ Galería de Fotos
- ✅ Grid responsive de todas las fotos
- ✅ Filtros avanzados por proyecto/tipo/fecha
- ✅ Lightbox con navegación
- ✅ Búsqueda inteligente

### 🔍 Búsqueda Avanzada
- ✅ **Filtros guardados** con nombres personalizados
- ✅ Filtros: proyecto, tipo, estado, fechas, GPS, fotos
- ✅ Búsqueda de texto en múltiples campos
- ✅ Guardado en localStorage

### 🏷️ Sistema de Etiquetas
- ✅ Crear etiquetas personalizadas
- ✅ 8 colores disponibles
- ✅ Organizar reportes por categorías
- ✅ Gestión completa (CRUD)

### 📱 PWA Optimizado
- ✅ Instalable como app nativa
- ✅ Funciona offline
- ✅ Íconos con logo Northtek
- ✅ 5 shortcuts de acceso rápido
- ✅ Push notifications (próximamente)

### 🎨 Tema Personalizado Minería
- Paleta de colores específica para industria minera
- Cobre, oro, plata, carbón, hierro
- Gradientes industriales

## 🚀 Tecnologías

### Core
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + CSS personalizado
- **UI**: shadcn/ui + Lucide Icons

### Estado y Data (v2.0) ⭐
- **TanStack React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de schemas

### Backend y Base de Datos
- **Supabase** - Backend as a Service (PostgreSQL)
- **Prisma** - ORM

### Features Especiales
- **Mapas**: Leaflet + React Leaflet
- **Gráficos**: Recharts
- **PWA**: next-pwa (offline-first)
- **Exportación**: xlsx (Excel)
- **PDF**: @react-pdf/renderer
- **IA**: Google Gemini Vision (análisis de imágenes)

## 📋 Prerequisitos

- Node.js 18 o superior
- npm o yarn
- Cuenta en Supabase
- Cuenta en Vercel (para deployment)

## 🛠️ Instalación Local

```bash
# 1. Clonar repositorio
git clone https://github.com/ahumada985/act.git
cd act

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Ejecutar base de datos
# Ve a Supabase Dashboard → SQL Editor
# Ejecuta el script: prisma/setup-mining-database.sql

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Configuración de Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda las credenciales (URL y anon key)

### 2. Configurar Base de Datos
1. Ve a SQL Editor
2. Ejecuta el script `prisma/setup-mining-database.sql`
3. Esto creará:
   - 12 proyectos mineros reales de Chile
   - 30+ reportes de ejemplo
   - Usuarios y supervisores
   - Relaciones entre tablas

### 3. Configurar Storage
1. Ve a Storage
2. Crea buckets:
   - `reportes-fotos` (público)
   - `reportes-audios` (público)
3. Configura políticas de acceso públicas

### 4. Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 🚀 Deploy a Vercel

### Opción 1: Un Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ahumada985/act)

### Opción 2: Manual

1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio de GitHub
3. Configura las variables de entorno
4. Click en Deploy
5. ¡Listo!

Ver guía detallada en [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📱 Instalar PWA en Celular

### Android (Chrome):
1. Abre la URL de Vercel en Chrome
2. Menú (⋮) → "Añadir a pantalla de inicio"
3. Confirma
4. ¡El icono Northtek aparecerá en tu pantalla!

### iOS (Safari):
1. Abre la URL en Safari
2. Compartir → "Añadir a pantalla de inicio"
3. Confirma
4. ¡Listo!

## 🏗️ Estructura del Proyecto (v2.0)

```
act-reportes/
├── app/                          # Next.js App Router
│   ├── dashboard/               # 📊 Dashboard con gráficos
│   ├── reportes/                # 📝 CRUD de reportes
│   │   ├── [id]/               # Ver/editar reporte
│   │   └── nuevo/              # Crear reporte
│   ├── proyectos/              # 🏗️ Gestión de proyectos
│   │   ├── timeline/           # Timeline de eventos
│   │   ├── avance/             # Reportes de avance
│   │   └── fases/              # Organización por fases
│   ├── mapa/                   # 🗺️ Mapa con GPS
│   ├── galeria/                # 🖼️ Galería de fotos
│   └── etiquetas/              # 🏷️ Gestión de etiquetas
├── components/
│   ├── common/                 # ⭐ Componentes reutilizables memoizados
│   ├── providers/              # ⭐ React providers (React Query, etc)
│   ├── ui/                     # Componentes base (shadcn/ui)
│   ├── forms/                  # Formularios dinámicos
│   ├── layout/                 # Header, OfflineIndicator
│   └── maps/                   # Componentes de mapa
├── constants/                   # ⭐ Constantes centralizadas
├── hooks/
│   ├── queries/                # ⭐ React Query hooks personalizados
│   └── [otros hooks]           # Custom hooks
├── lib/
│   ├── supabase/              # Cliente Supabase
│   ├── pdf/                   # Generador PDF
│   └── hooks/                 # Legacy hooks
├── services/                    # ⭐ Capa de servicios (API calls)
├── stores/                      # ⭐ Zustand stores
├── types/                       # TypeScript types
├── utils/                       # ⭐ Funciones utilitarias
├── prisma/                     # Schema y migraciones
└── public/                     # Assets estáticos + PWA
    ├── manifest.json          # PWA manifest
    ├── icon-*.png             # Íconos PWA
    └── logo.png               # Logo Northtek

⭐ = Nuevo en v2.0
```

Ver estructura completa y patrones en [ARQUITECTURA.md](./ARQUITECTURA.md)

## 📊 Proyectos Mineros Incluidos

El sistema viene pre-poblado con 12 proyectos reales:

1. **Minera Escondida** - BHP
2. **Chuquicamata** - CODELCO
3. **El Teniente** - CODELCO
4. **Collahuasi** - Compañía Minera
5. **Los Pelambres** - Antofagasta Minerals
6. **Centinela** - Antofagasta Minerals
7. **Spence** - BHP
8. **Quebrada Blanca** - Teck Resources
9. **Radomiro Tomic** - CODELCO
10. **Ministro Hales** - CODELCO
11. **Sierra Gorda** - KGHM/Sumitomo
12. **Candelaria** - Lundin Mining

## 📝 Tipos de Trabajo

- **Fibra Óptica**: Instalación de fibra, empalmes, mufas
- **Data Center**: Racks, equipos, cableado estructurado
- **Antenas**: Torres, equipos radio, line of sight
- **CCTV**: Cámaras, grabadores, centro de monitoreo
- **Instalación Red**: Switches, routers, configuración
- **Mantenimiento**: Correctivo y preventivo
- **Otro**: Trabajos personalizados

## 🎯 Características Técnicas

### PWA
- ✅ Manifest configurado
- ✅ Service Worker con next-pwa
- ✅ Íconos 192x192 y 512x512
- ✅ Instalable en móviles y desktop
- ✅ Funciona offline
- ✅ 5 shortcuts personalizados

### Seguridad
- ✅ Variables de entorno protegidas
- ✅ Autenticación con Supabase
- ✅ Políticas RLS en base de datos
- ✅ Validación de datos

### Performance
- ✅ Static Generation donde es posible
- ✅ Dynamic imports para componentes pesados
- ✅ Optimización de imágenes con Next/Image
- ✅ Lazy loading de mapas

## 🔄 Actualizaciones

Para actualizar el código en producción:

```bash
# 1. Hacer cambios locales
git add .
git commit -m "descripción de cambios"

# 2. Push a GitHub
git push origin main

# 3. Vercel desplegará automáticamente
# Los usuarios verán los cambios al recargar la app
```

## 📚 Documentación Adicional

### Arquitectura v2.0
- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - 📖 Guía completa de arquitectura, patrones y mejores prácticas
- **[MIGRACION.md](./MIGRACION.md)** - 🔄 Guía paso a paso para migrar componentes existentes

### Deployment
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa de deployment
- [prisma/INSTRUCCIONES_SUPABASE.md](./prisma/INSTRUCCIONES_SUPABASE.md) - Setup de Supabase

## 🐛 Troubleshooting

### La app no se instala como PWA
- Verifica que estés en HTTPS (Vercel usa HTTPS automáticamente)
- Verifica que `/manifest.json` es accesible
- Revisa Chrome DevTools → Application → Manifest

### Errores de Supabase
- Verifica las variables de entorno
- Verifica que las políticas RLS permiten acceso
- Revisa los logs en Supabase Dashboard

### Problemas con el mapa
- Verifica que tienes coordenadas GPS válidas
- El mapa usa Leaflet y requiere conexión a internet
- Los tiles se cargan de OpenStreetMap

## 📞 Soporte

- **GitHub Issues**: https://github.com/ahumada985/act/issues
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

## 📄 Licencia

Propiedad de Northtek Chile - Sistema de Reportabilidad 2025

## 🤖 Desarrollado con

Este proyecto fue desarrollado con asistencia de Claude Code de Anthropic.

### Arquitectura v2.0
- Refactorización completa a patrones modernos
- Services Layer, React Query, Zustand
- Componentes optimizados y memoizados
- Documentación exhaustiva

---

**🎉 ¡Listo para usar!** Deploy a Vercel, instala en tu celular y comienza a reportar.

**📖 Para desarrolladores:** Lee [ARQUITECTURA.md](./ARQUITECTURA.md) para entender la nueva arquitectura v2.0
