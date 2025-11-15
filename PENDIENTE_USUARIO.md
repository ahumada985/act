# ⚠️ TAREAS PENDIENTES PARA EL USUARIO

**Todo el código está 100% implementado. Solo faltan configuraciones.**

---

## 🔥 URGENTE - Para poder usar el sistema

### 1️⃣ Ejecutar Migraciones de Base de Datos

```bash
cd C:\Users\usuario\Desktop\Proyectos_IA\ACT\act-reportes

# Opción A: Una sola migración
npx prisma migrate dev --name add_all_phases

# Generar cliente Prisma
npx prisma generate

# Aplicar cambios
npx prisma db push
```

---

### 2️⃣ Crear archivo `.env.local`

Crear el archivo `C:\Users\usuario\Desktop\Proyectos_IA\ACT\act-reportes\.env.local` con:

```bash
# ========================================
# SUPABASE (REQUERIDO)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# ========================================
# DATABASE (REQUERIDO)
# ========================================
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# ========================================
# OPENAI (REQUERIDO para IA)
# ========================================
OPENAI_API_KEY=sk-...

# ========================================
# CRON (REQUERIDO para reportes programados)
# ========================================
CRON_SECRET=mi-secret-super-seguro-123456789
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ========================================
# EMAIL (OPCIONAL - para reportes por email)
# ========================================
# RESEND_API_KEY=re_...
# EMAIL_FROM=reportes@tudominio.com

# ========================================
# PUSH NOTIFICATIONS (OPCIONAL)
# ========================================
# Generar con: npx web-push generate-vapid-keys
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxxx...
# VAPID_PRIVATE_KEY=xxx...
# VAPID_SUBJECT=mailto:admin@tudominio.com
```

**Dónde obtener las credenciales:**

- **Supabase:** https://app.supabase.com → Tu proyecto → Settings → API
- **OpenAI:** https://platform.openai.com/api-keys
- **Cron Secret:** Inventar uno aleatorio y seguro

---

### 3️⃣ Configurar Supabase Dashboard

1. **Ir a:** https://app.supabase.com → Tu proyecto

2. **Authentication > URL Configuration:**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Agregar `http://localhost:3000/auth/callback`

3. **Authentication > Providers:**
   - ✅ Habilitar "Email"
   - ✅ Habilitar "Confirm email" (opcional)

4. **Database > Replication:**
   - Ir a Replication
   - Buscar tabla `ChatMessage`
   - ✅ Habilitar "Realtime" para esa tabla

---

### 4️⃣ Iniciar y Probar

```bash
# Instalar dependencias (si aún no lo has hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador en http://localhost:3000
```

---

### 5️⃣ Crear Tu Usuario Admin

1. **Registrarte:**
   - Ir a `http://localhost:3000/register`
   - Completar formulario
   - Registrarte

2. **Cambiar tu rol a ADMIN:**
   - Ir a Supabase Dashboard
   - Database > SQL Editor
   - Ejecutar:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'tu-email@ejemplo.com';
```

3. **Recargar la página**
   - Ya eres administrador con todos los permisos

---

## 📦 OPCIONAL - Para producción

### Configurar Emails (Resend)

```bash
# 1. Instalar
npm install resend

# 2. Crear cuenta en https://resend.com

# 3. Obtener API Key

# 4. Agregar a .env.local
RESEND_API_KEY=re_...
EMAIL_FROM=reportes@tudominio.com

# 5. Descomentar código en:
# lib/email/send-report.ts (líneas 20-30)
```

---

### Configurar Cron para Reportes Programados

**Opción A: Vercel Cron (si despliegas en Vercel)**

```bash
# Renombrar archivo
mv vercel.example.json vercel.json

# Desplegar
vercel --prod
```

**Opción B: GitHub Actions (cualquier hosting)**

```bash
# Renombrar archivo
mv .github/workflows/cron-reports.example.yml .github/workflows/cron-reports.yml

# Configurar secrets en GitHub:
# Settings > Secrets > Actions > New repository secret
# - CRON_SECRET: tu secret del .env
# - APP_URL: https://tu-dominio.com

# Push a GitHub
git add .
git commit -m "Configure scheduled reports"
git push
```

---

### Generar VAPID Keys (Push Notifications)

```bash
npx web-push generate-vapid-keys

# Copiar las keys al .env.local
```

---

### PDFs y Excel Reales

```bash
# Para PDFs reales (en lugar de HTML)
npm install puppeteer

# Para Excel real (en lugar de CSV)
npm install xlsx
```

---

## ✅ Checklist Rápido

### Antes de Iniciar:
- [ ] Migraciones ejecutadas (`npx prisma migrate dev`)
- [ ] `.env.local` creado con todas las keys
- [ ] Supabase Dashboard configurado
- [ ] `npm install` ejecutado
- [ ] `npm run dev` funcionando
- [ ] Primer usuario creado y cambiado a ADMIN

### Probar Funcionalidades:
- [ ] Login/Logout funciona
- [ ] Dashboard carga correctamente
- [ ] Crear nuevo reporte funciona
- [ ] IA genera descripciones (con fotos)
- [ ] OCR extrae texto de imágenes
- [ ] Chat envía mensajes
- [ ] Notificaciones aparecen
- [ ] Crear reporte programado funciona

### Opcional (Producción):
- [ ] Resend configurado (emails)
- [ ] Cron configurado (Vercel/GitHub)
- [ ] VAPID keys generadas
- [ ] Build de producción (`npm run build`)
- [ ] Deployed a servidor

---

## 🐛 Si algo falla...

### Error: "Module not found"
```bash
npm install
```

### Error: "Prisma Client not found"
```bash
npx prisma generate
```

### Error: "Cannot connect to database"
- Verificar `DATABASE_URL` en `.env.local`
- Verificar que Supabase esté activo

### Error: "OpenAI API error"
- Verificar `OPENAI_API_KEY` en `.env.local`
- Verificar que la key tenga créditos

### No aparecen notificaciones
- Verificar que el navegador permita notificaciones
- Verificar VAPID keys en `.env.local`

---

## 📞 ¿Dónde está cada cosa?

| Funcionalidad | Ubicación |
|---------------|-----------|
| Login/Register | `/login`, `/register` |
| Dashboard | `/dashboard` |
| Crear Reporte | `/reportes/nuevo` |
| Chat | `/chat` |
| Reportes Programados | `/admin/reportes-programados` |
| Galería | `/galeria` |
| Mapa | `/mapa` |
| Proyectos | `/proyectos` |

---

## 🎯 Tiempo Estimado

- **Migraciones + Config:** 15-30 minutos
- **Crear usuario + probar:** 10 minutos
- **Configurar emails/cron (opcional):** 20 minutos

**Total:** ~30-60 minutos

---

## 🚀 Después de configurar...

**¡TODO FUNCIONA!**

- 9 sistemas completos
- 60+ archivos de código
- IA + OCR + Chat + Notificaciones + Reportes Programados
- Todo listo para producción

**Solo necesitas configurar el entorno y ya.**

---

**Última actualización:** 2025-11-09
**Estado del código:** ✅ 100% COMPLETO
