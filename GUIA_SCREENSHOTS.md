# 📸 GUÍA PARA CAPTURAR SCREENSHOTS PERFECTOS

## 🖥️ SCREENSHOT DESKTOP (Computadora)

### Opción A: Captura directa
1. Abre tu app en: `http://localhost:3000`
2. Ve a la página que quieres capturar (ej: dashboard)
3. Presiona `F11` para pantalla completa (oculta barras)
4. Windows: `Windows + Shift + S` → Selecciona área
5. Mac: `Cmd + Shift + 4` → Selecciona área

### Opción B: Chrome DevTools (más control)
1. Abre Chrome DevTools: `F12`
2. Click en icono de dispositivos (arriba izquierda)
3. Selecciona: **"Responsive"**
4. Establece dimensiones: **1920 x 1080**
5. Click en `⋮` (tres puntos) → **"Capture screenshot"**

**Páginas a capturar:**
- ✅ Dashboard: `http://localhost:3000/dashboard`
- ✅ Mapa: `http://localhost:3000/mapa`
- ✅ Homepage: `http://localhost:3000`

---

## 📱 SCREENSHOT MÓVIL (Celular)

### Usando Chrome DevTools:
1. Abre tu app: `http://localhost:3000`
2. Presiona `F12` (DevTools)
3. Click en icono de celular 📱 (arriba izquierda)
4. Selecciona dispositivo: **iPhone 14 Pro** o **iPhone 13**
5. Dimensiones automáticas: 393 x 852
6. Navega a la página que quieres
7. Click `⋮` → **"Capture screenshot"**

**Páginas móviles a capturar:**
- ✅ Formulario reporte: `http://localhost:3000/reportes/nuevo`
- ✅ Lista reportes: `http://localhost:3000/reportes`
- ✅ Dashboard móvil: `http://localhost:3000/dashboard`

---

## 📱 SCREENSHOT TABLET (iPad)

### Usando Chrome DevTools:
1. Abre tu app: `http://localhost:3000`
2. Presiona `F12`
3. Click en icono de celular 📱
4. Selecciona: **iPad Pro** o **iPad Air**
5. Dimensiones: 1024 x 1366 (portrait) o 1366 x 1024 (landscape)
6. Captura: `⋮` → **"Capture screenshot"**

**Páginas tablet a capturar:**
- ✅ Dashboard: `http://localhost:3000/dashboard`
- ✅ Mapa: `http://localhost:3000/mapa`

---

## 🎯 SCREENSHOTS PRIORITARIOS PARA LA PRESENTACIÓN

### SLIDE 3 (La Solución):
**1 imagen:** Homepage o dashboard (desktop)

### SLIDE 5 (Demo Visual - 4 imágenes):

**Imagen 1: Dashboard con Gráficos**
- URL: `http://localhost:3000/dashboard`
- Dispositivo: Desktop (1920x1080)
- Asegúrate de tener datos visibles en los gráficos

**Imagen 2: Formulario de Reporte**
- URL: `http://localhost:3000/reportes/nuevo`
- Dispositivo: Desktop (1920x1080)
- Muestra el formulario completo con algunos campos llenos

**Imagen 3: Mapa con Marcadores**
- URL: `http://localhost:3000/mapa`
- Dispositivo: Desktop (1920x1080)
- Asegúrate de que se vean varios marcadores en el mapa

**Imagen 4: Vista Móvil (PWA)**
- URL: `http://localhost:3000/reportes/nuevo` o `/reportes`
- Dispositivo: iPhone 14 Pro (393x852)
- Muestra la interfaz móvil optimizada

---

## 🎨 PARA EL BANNER MULTI-DISPOSITIVO

Necesitas capturar la MISMA página en 3 dispositivos:

**Opción A - Dashboard:**
- Desktop: Dashboard completo (1920x1080)
- Tablet: Dashboard en iPad Pro (1024x1366)
- Mobile: Dashboard en iPhone 14 Pro (393x852)

**Opción B - Homepage:**
- Desktop: Página principal (1920x1080)
- Tablet: Homepage en iPad Pro
- Mobile: Homepage en iPhone 14 Pro

---

## 💡 TIPS PARA SCREENSHOTS PROFESIONALES

### Antes de capturar:
1. ✅ **Datos de ejemplo:** Asegúrate de tener reportes/proyectos en la BD
2. ✅ **Scroll al inicio:** Siempre captura desde el top de la página
3. ✅ **Cierra notificaciones:** No debe aparecer nada del sistema operativo
4. ✅ **Modo claro:** Usa tema claro (más profesional para presentación)
5. ✅ **Zoom 100%:** Verifica que el navegador esté al 100% de zoom

### Durante la captura:
1. ✅ **Sin cursor:** Mueve el mouse fuera del área visible
2. ✅ **Pantalla completa:** Usa F11 o modo presentación
3. ✅ **Calidad:** Guarda como PNG (no JPG, para mejor calidad)

### Después de capturar:
1. ✅ **Revisa:** Abre cada imagen y verifica que se vea bien
2. ✅ **Nombra bien:**
   - `dashboard-desktop.png`
   - `formulario-reporte-desktop.png`
   - `mapa-desktop.png`
   - `reportes-mobile.png`

---

## 🚀 PROCESO RÁPIDO (15 MINUTOS)

### Paso 1: Inicia tu app (2 min)
```bash
cd C:\Users\usuario\Desktop\Proyectos_IA\ACT\act-reportes
npm run dev
```
Espera a que abra en `http://localhost:3000`

### Paso 2: Desktop screenshots (5 min)
1. Abre DevTools (`F12`)
2. Responsive mode (1920x1080)
3. Captura: Dashboard, Formulario, Mapa, Reportes

### Paso 3: Mobile screenshots (5 min)
1. Cambia a iPhone 14 Pro en DevTools
2. Captura: Formulario de reporte, Lista reportes

### Paso 4: Tablet screenshots (3 min)
1. Cambia a iPad Pro en DevTools
2. Captura: Dashboard en tablet

---

## 📂 ORGANIZACIÓN DE ARCHIVOS

Guarda todos los screenshots en:
```
C:\Users\usuario\Desktop\Proyectos_IA\ACT\screenshots-presentacion\

├── dashboard-desktop.png
├── dashboard-tablet.png
├── dashboard-mobile.png
├── formulario-reporte-desktop.png
├── formulario-reporte-mobile.png
├── mapa-desktop.png
├── reportes-mobile.png
└── homepage-desktop.png
```

---

## ✅ CHECKLIST FINAL

Antes de crear el banner multi-dispositivo, asegúrate de tener:

- [ ] 1 screenshot desktop del dashboard (para banner)
- [ ] 1 screenshot tablet del dashboard (para banner)
- [ ] 1 screenshot mobile del dashboard o formulario (para banner)
- [ ] 4 screenshots para Slide 5 (dashboard, formulario, mapa, mobile)

---

**Tiempo total estimado: 15-20 minutos**
**Herramientas necesarias:** Solo tu navegador Chrome/Edge
