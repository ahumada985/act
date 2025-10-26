# 🚀 Guía de Deployment - ACT Reportes

## 📱 Deploy a Vercel + PWA

### 1️⃣ Configurar Vercel

1. Ve a https://vercel.com
2. Inicia sesión con tu cuenta de GitHub
3. Click en **"Add New..."** → **"Project"**
4. Busca e importa el repositorio: `ahumada985/act`
5. Click en **"Import"**

### 2️⃣ Configurar Variables de Entorno

En la configuración del proyecto, añade estas variables de entorno:

**Variables requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

**Obtener las credenciales de Supabase:**
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en "Settings" (⚙️) → "API"
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3️⃣ Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye y despliega tu app
3. ¡Listo! Tu app estará disponible en: `https://tu-proyecto.vercel.app`

### 4️⃣ Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a tu proyecto → "Settings" → "Domains"
2. Añade tu dominio personalizado (ej: `reportes.actchile.com`)
3. Configura los DNS según las instrucciones de Vercel

---

## 📱 Instalar PWA en el Celular

### En Android (Chrome):

1. Abre la URL de Vercel en Chrome: `https://tu-proyecto.vercel.app`
2. Espera a que cargue completamente
3. Verás un banner "Añadir a pantalla de inicio" o:
4. Menu (⋮) → "Añadir a pantalla de inicio"
5. Confirma el nombre "ACT Reportes"
6. ¡Listo! El icono con el logo ACT aparecerá en tu pantalla

### En iOS (Safari):

1. Abre la URL en Safari
2. Toca el botón "Compartir" (cuadro con flecha hacia arriba)
3. Desplázate y toca "Añadir a pantalla de inicio"
4. Confirma el nombre
5. ¡Listo! La app estará disponible como una app nativa

---

## ✅ Verificar que PWA funciona

Una vez instalada, la app debe:

- ✅ Abrir en pantalla completa (sin barra del navegador)
- ✅ Mostrar el logo ACT como icono
- ✅ Funcionar offline (después de la primera carga)
- ✅ Tener acceso rápido desde shortcuts del sistema

---

## 🔧 Troubleshooting

### Si PWA no se instala:

1. Verifica que estás usando HTTPS (Vercel usa HTTPS automáticamente)
2. Verifica que el manifest.json es accesible: `https://tu-app.vercel.app/manifest.json`
3. Verifica que los íconos existen en `/public/`
4. En Chrome DevTools → Application → Manifest → Verifica que no hay errores

### Si hay errores en producción:

1. Verifica las variables de entorno en Vercel
2. Revisa los logs en Vercel: Project → Deployments → Click en deployment → "View Function Logs"
3. Si hay errores de Supabase, verifica que las URLs son correctas

---

## 📊 Monitoreo

- **Analytics**: Vercel incluye analytics básicos gratis
- **Logs**: Disponibles en la sección "Deployments" de cada deploy
- **Performance**: Ve a "Speed Insights" en tu proyecto de Vercel

---

## 🔄 Actualizaciones

Para actualizar la app:

1. Haz cambios en tu código local
2. Commit: `git add . && git commit -m "descripción"`
3. Push: `git push`
4. Vercel desplegará automáticamente
5. Los usuarios verán la actualización al recargar la PWA

---

## 🎯 URLs Importantes

- **Repositorio GitHub**: https://github.com/ahumada985/act
- **Proyecto Vercel**: (se genera después del deploy)
- **App en Producción**: (se genera después del deploy)
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 📞 Soporte

Para problemas técnicos:
- GitHub Issues: https://github.com/ahumada985/act/issues
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
