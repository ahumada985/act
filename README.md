# ACT Reportes - Sistema de Reportabilidad

Sistema integral de reportes diarios para supervisores de telecomunicaciones con captura multimedia, geolocalización y generación automática de PDFs.

## 🚀 Features

- **Reportes dinámicos** por tipo de trabajo (Fibra Óptica, Data Center, Antenas, CCTV, etc.)
- **Captura multimedia** (fotos, audio, GPS)
- **PWA** - Funciona offline, se instala como app nativa
- **Generación automática de PDFs** profesionales
- **Dashboard interactivo** con filtros temporales
- **Consolidados automáticos** semanales/mensuales
- **Exportación** a Excel y Power BI
- **Búsqueda histórica** avanzada

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **ORM:** Prisma
- **PDF:** @react-pdf/renderer
- **PWA:** next-pwa

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# Ejecutar migraciones de Prisma
npx prisma generate
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener credenciales (URL y API Keys)
3. Crear buckets de Storage:
   - `reportes-fotos`
   - `reportes-audios`
4. Configurar políticas de acceso en Storage
5. Actualizar `.env.local` con las credenciales

## 📱 PWA - Instalación

Una vez desplegado, los supervisores pueden instalar la app:

- **Android/iOS:** Abrir en navegador → Menú → "Agregar a pantalla de inicio"
- **Desktop:** Chrome → Ícono de instalación en barra de direcciones

## 🏗️ Estructura del Proyecto

```
act-reportes/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard administrativo
│   ├── reportes/          # Formularios de reportes
│   └── auth/              # Autenticación
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── forms/            # Formularios dinámicos
│   └── layouts/          # Layouts
├── lib/                   # Utilidades y configuración
│   ├── supabase/         # Cliente Supabase
│   ├── pdf/              # Generadores PDF
│   └── utils/            # Helpers
├── prisma/               # Schema y migraciones
├── types/                # TypeScript types
└── public/               # Assets estáticos
```

## 🔐 Roles de Usuario

- **SUPERVISOR:** Crear y ver sus propios reportes
- **ADMIN:** Ver todos los reportes, exportar, gestionar consolidados
- **GERENTE:** Solo lectura, dashboards ejecutivos

## 📊 Tipos de Trabajo Soportados

1. **Fibra Óptica:** Km instalados, empalmes, mufas, pérdidas
2. **Data Center:** Racks, equipos, potencia, cableado
3. **Antenas:** Altura, tipo, frecuencia, azimut, tilt
4. **CCTV:** Cantidad cámaras, resolución, almacenamiento
5. **Instalación de Red:** Configuración general
6. **Mantenimiento:** Correctivo/preventivo
7. **Otro:** Campos personalizables

## 🚢 Deployment

### Vercel (Recomendado)

```bash
# Conectar con Vercel
vercel

# Agregar variables de entorno en Vercel dashboard
# Deploy
vercel --prod
```

### Azure App Service

```bash
# Build
npm run build

# Deploy según documentación de Azure
```

## 📝 Roadmap

- [x] Estructura base del proyecto
- [x] Schema de base de datos
- [ ] Autenticación con Supabase
- [ ] Formulario dinámico de reportes
- [ ] Captura de fotos y GPS
- [ ] Sistema de almacenamiento
- [ ] Generador de PDF
- [ ] Dashboard administrativo
- [ ] Filtros y búsqueda histórica
- [ ] PWA completa con offline support
- [ ] Exportación Excel/Power BI
- [ ] Tests e2e

## 📄 Licencia

Propiedad de ACT Telecomunicaciones

## 👤 Autor

Desarrollado para ACT - Sistema de Reportabilidad 2025
