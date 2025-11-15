# 📋 TAREAS PENDIENTES - ACT Reportes

**Fecha:** 2025-11-09

---

## 🔥 URGENTE - Antes de usar el sistema

### 1. Ejecutar Migraciones de Base de Datos

```bash
# Opción A: Todas las fases de una vez
npx prisma migrate dev --name add_all_phases

# Opción B: Una por una (si hay conflictos)
npx prisma migrate dev --name add_auth_rbac_audit
npx prisma migrate dev --name add_notifications_chat_approvals
npx prisma migrate dev --name add_scheduled_reports

# Generar cliente de Prisma
npx prisma generate

# Aplicar a base de datos
npx prisma db push
```

### 2. Configurar Variables de Entorno (`.env.local`)

```bash
# Supabase - REQUERIDO
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database - REQUERIDO
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI - REQUERIDO para IA
OPENAI_API_KEY=sk-...

# Email - OPCIONAL (recomendado para reportes)
RESEND_API_KEY=re_...
EMAIL_FROM=reportes@tudominio.com

# Push Notifications - OPCIONAL
# Generar con: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxxx...
VAPID_PRIVATE_KEY=xxx...
VAPID_SUBJECT=mailto:admin@tudominio.com

# Cron - REQUERIDO para reportes programados
CRON_SECRET=crea-un-secret-muy-seguro-123456
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar Supabase Dashboard

1. **Ir a:** https://app.supabase.com
2. **Authentication > URL Configuration:**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. **Authentication > Providers:**
   - ✅ Enable Email provider
4. **Database > Replication:**
   - ✅ Enable Realtime para tabla `ChatMessage`

### 4. Crear Primer Usuario Admin

```sql
-- En Supabase SQL Editor, después de registrarte en /register
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'tu-email@ejemplo.com';
```

---

## ✅ COMPLETADO - Integraciones en UI

### ✅ 1. Header Actualizado

**Completado:**
- ✅ Agregado `<NotificationBell />`
- ✅ Agregado `<UserMenu />` con avatar y logout
- ✅ Agregado botón de Chat
- ✅ Creado componente `UserMenu.tsx`
- ✅ Creado store `auth-store.ts` con Zustand

**Archivo:** `components/layout/Header.tsx` - ACTUALIZADO

### ✅ 2. Rutas Protegidas con RBAC

**Completado:**
- ✅ `app/dashboard/page.tsx` - Protegida con `DASHBOARD_VIEW`
- ✅ `app/reportes/nuevo/page.tsx` - Protegida con `REPORTES_CREATE`

**Todas las páginas ahora usan `<ProtectedRoute>` con permisos específicos**

### ✅ 3. IA y OCR Integrados

**Completado en:** `app/reportes/nuevo/page.tsx`

- ✅ `<AIDescriptionGenerator />` - Genera descripciones automáticas con GPT-4 Vision
- ✅ `<OCRCapture />` - Extrae texto de imágenes con Tesseract.js
- ✅ Integrado antes del campo de descripción (se muestra si hay fotos)
- ✅ Integrado antes del campo de orden de trabajo

### ✅ 4. Página de Chat Creada

**Completado:** `app/chat/page.tsx`

Incluye:
- ✅ Lista de chats del usuario con búsqueda
- ✅ Ventana de conversación seleccionada
- ✅ Envío de mensajes en tiempo real con Supabase Realtime
- ✅ Auto-scroll a mensajes nuevos
- ✅ Notificaciones toast de mensajes nuevos
- ✅ UI responsive con avatares y badges

### ✅ 5. Formulario de Reportes Programados Completado

**Completado:**
- ✅ Creado `components/admin/ScheduledReportForm.tsx`
- ✅ Actualizado `app/admin/reportes-programados/page.tsx`
- ✅ Formulario completo con todos los campos:
  - Nombre y descripción
  - Frecuencia (Diaria/Semanal/Mensual)
  - Formato (PDF/Excel/JSON)
  - Emails (agregar múltiples con tags)
  - Filtros opcionales (proyecto, tipo, región, fechas)
  - Selector de día y hora
- ✅ Validaciones de formulario
- ✅ Integración con API

---

## 📦 RECOMENDADO - Dependencias Opcionales

### Para Emails Reales

```bash
npm install resend

# Luego descomentar código en:
# lib/email/send-report.ts (líneas 20-30)
```

### Para PDFs Reales (en lugar de HTML)

```bash
npm install puppeteer

# Crear: app/api/reports/generate-pdf/route.ts
```

### Para Excel Real (en lugar de CSV)

```bash
npm install xlsx

# Actualizar: lib/reports/report-generator.ts
```

---

## ⚙️ Configurar Cron Job

### Opción A: Vercel Cron (si despliegas en Vercel)

```bash
# Renombrar archivo
mv vercel.example.json vercel.json

# Ya está listo para deployment
```

### Opción B: GitHub Actions (cualquier hosting)

```bash
# Renombrar archivo
mv .github/workflows/cron-reports.example.yml .github/workflows/cron-reports.yml

# Configurar secrets en GitHub:
# - CRON_SECRET
# - APP_URL
```

### Opción C: PM2 (servidor propio)

```bash
npm install -g pm2
pm2 start lib/cron/setup.ts --name "act-cron"
pm2 startup
pm2 save
```

---

## 🧪 Testing Básico

### 1. Probar Login

```bash
npm run dev
# Ir a http://localhost:3000/login
# Registrar usuario
# Hacer login
```

### 2. Probar IA Generativa

1. Ir a `/reportes/nuevo`
2. Seleccionar tipo de trabajo
3. Subir imágenes
4. Click "Generar con IA"
5. Verificar descripción

### 3. Probar OCR

1. Capturar foto de placa o etiqueta
2. Verificar extracción de texto
3. Click "Usar Texto"

### 4. Probar Reportes Programados

```bash
# Ejecutar manualmente
curl -X POST \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  http://localhost:3000/api/cron/generate-scheduled-reports
```

---

## 🚀 Para Deployment a Producción

### 1. Build de Prueba

```bash
npm run build
npm run lint
```

### 2. Configurar Variables en Plataforma

- Cambiar URLs a producción
- Usar secrets diferentes
- Verificar API keys

### 3. Configurar Dominio

- DNS apuntando a servidor
- HTTPS habilitado
- Actualizar Supabase URLs

---

## ✅ Checklist Rápido

### Antes de Usar:
- [ ] Migraciones ejecutadas
- [ ] Variables de entorno configuradas
- [ ] Supabase configurado
- [ ] Primer usuario admin creado

### Integraciones UI:
- [x] Header con notificaciones ✅
- [x] Rutas protegidas ✅
- [x] IA/OCR en formularios ✅
- [x] Página de chat creada ✅
- [x] Formulario reportes programados ✅

### Producción:
- [ ] Cron configurado
- [ ] Emails configurados (Resend)
- [ ] Build exitoso
- [ ] Deployed

---

## 📊 Lo que YA ESTÁ LISTO

✅ **3 Fases Implementadas (60+ archivos):**
1. Autenticación + RBAC + Auditoría (20 archivos)
2. Push Notifications + Chat + Aprobaciones (15 archivos)
3. IA Generativa + OCR + Reportes Programados (20 archivos)
4. **NUEVO:** Integraciones UI Completadas (5+ archivos)

✅ **9 Sistemas Completos:**
- Sistema de Auth con Supabase
- RBAC con 35+ permisos
- Auditoría de acciones
- Push Notifications
- Chat en tiempo real
- Aprobaciones multi-nivel
- IA para descripciones
- OCR para texto
- Reportes automáticos

✅ **Base de Datos:**
- Schema completo en Prisma
- 15+ modelos
- Relaciones configuradas

✅ **APIs:**
- 25+ endpoints REST
- Autenticación
- Autorización

---

## ⏱️ Tiempo Estimado

- **Migraciones + Config:** 30 min
- **Integraciones UI:** 2-3 horas
- **Testing:** 1 hora
- **Deployment:** 1 hora

**Total:** 4-6 horas de trabajo

---

## 📞 Documentación

Consulta estos archivos para más info:
- `FASE_1_COMPLETADA.md` - Auth y RBAC
- `FASE_2_COMPLETADA.md` - Comunicación
- `FASE_3_COMPLETADA.md` - IA (recién creado)
- `ESTADO_ACTUAL.md` - Resumen completo
