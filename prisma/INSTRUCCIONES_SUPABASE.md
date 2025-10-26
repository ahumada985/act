# 📋 Instrucciones para Ejecutar SQL en Supabase

## Paso 1: Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** para crear una nueva consulta

## Paso 2: Copiar el Script SQL

1. Abre el archivo `setup-mining-database.sql` que está en la carpeta `prisma/`
2. Copia **TODO** el contenido del archivo (Ctrl+A, luego Ctrl+C)

## Paso 3: Pegar y Ejecutar

1. Pega el contenido en el editor SQL de Supabase
2. Haz clic en el botón **"Run"** (▶️) en la esquina inferior derecha
3. Espera a que se ejecute el script (puede tomar unos segundos)

## ✅ ¿Qué hace este script?

### 1. Migración de Base de Datos
- ✅ Agrega la columna `proyectoId` a la tabla `Reporte`
- ✅ Crea un índice para mejorar el rendimiento
- ✅ Agrega una restricción de clave foránea (foreign key)
- ✅ Agrega la columna `presupuesto` a la tabla `Proyecto`

### 2. Supervisor de Sistema
- ✅ Crea un usuario supervisor si no existe (ID: `supervisor-001`)
- ✅ O usa un usuario existente si ya tienes usuarios en la base de datos
- ✅ Este supervisor se asigna automáticamente a los reportes de ejemplo

### 3. Proyectos Mineros (12 proyectos)
Inserta proyectos reales de telecomunicaciones en mineras de la zona norte:
- 🏔️ **Minera Escondida** (BHP) - Red de Fibra Óptica
- ⛏️ **Chuquicamata** (CODELCO) - Sistema CCTV
- 🏗️ **Spence** (BHP) - Data Center
- 📡 **Centinela** (Antofagasta Minerals) - Antenas
- 🔧 **Altonorte** (Glencore) - Mantenimiento
- 🏭 **Mantos Blancos** (Capstone) - Red Industrial
- 🌐 **Quebrada Blanca II** (Teck) - Fibra Óptica
- 🛰️ **Collahuasi** (Anglo American) - Sistema Integrado
- 📹 **Radomiro Tomic** (CODELCO) - CCTV y Control
- 🔌 **El Salvador** (CODELCO) - Modernización
- 📶 **Zaldívar** (Barrick) - Antenas Satelitales
- 🌄 **Los Pelambres** (Antofagasta Minerals) - Fibra Óptica

### 4. Reportes de Ejemplo (4 reportes con GPS)
- Reporte en Minera Escondida (-23.3167, -69.0500)
- Reporte en Chuquicamata (-22.3053, -68.9033)
- Reporte en Spence (-22.9167, -69.2167)
- Reporte en Centinela (-23.9333, -69.2500)

### 5. Verificación Final
El script ejecuta consultas de verificación automáticamente:
- Cuenta total de proyectos
- Cuenta total de reportes
- Cuenta de reportes asociados a proyectos
- Lista de proyectos creados
- Lista de reportes con sus proyectos asociados

## 🔍 Verificar que todo funcionó

Después de ejecutar el script, deberías ver en la parte inferior del SQL Editor:

```
Results:
┌─────────────────┬───────┐
│ total_proyectos │  12   │
└─────────────────┴───────┘

┌────────────────┬───────┐
│ total_reportes │   4   │
└────────────────┴───────┘

┌────────────────────────┬───────┐
│ reportes_con_proyecto  │   4   │
└────────────────────────┴───────┘
```

Y también verás las tablas con los proyectos y reportes creados.

## ⚠️ Notas Importantes

1. **Script es seguro para re-ejecutar**: El script usa `IF NOT EXISTS` y otras validaciones, por lo que puedes ejecutarlo múltiples veces sin problemas.

2. **Datos existentes**: Si ya tienes proyectos, NO se borrarán. Los nuevos proyectos mineros se agregarán a los existentes.

3. **Si quieres limpiar proyectos existentes**: Descomenta la línea 36 del script:
   ```sql
   -- DELETE FROM "Proyecto";  ← quitar los guiones para activar
   ```

4. **Coordenadas GPS**: Las coordenadas de las minas son aproximadas. Puedes ajustarlas editando el script antes de ejecutarlo.

## 🗺️ Ver el Mapa

Después de ejecutar el script:

1. Ve a tu aplicación en `http://localhost:3000`
2. Haz clic en **"Mapa de Reportes"**
3. Deberías ver 4 marcadores en el mapa con los reportes de ejemplo
4. **Pasa el mouse** sobre los marcadores para ver detalles rápidos
5. **Haz click** en los marcadores para ver el popup completo

## 🎨 Características del Mapa

- ✅ **Tooltip al pasar el mouse**: Muestra tipo de trabajo y proyecto
- ✅ **Popup bonito al hacer click**: Con colores, información detallada y botón "Ver Detalles"
- ✅ **Colores por tipo de trabajo**:
  - 🔵 Fibra Óptica - Azul
  - 🟣 Data Center - Morado
  - 🟡 CCTV - Naranja
  - 🟢 Instalación Red - Verde
  - 🔴 Antenas - Rosa
  - 🔷 Mantenimiento - Cyan
  - ⚫ Otro - Gris

## 💡 Siguiente Paso

Después de ejecutar este script, todos los formularios de reportes tendrán un dropdown para seleccionar proyectos mineros. El sistema está completamente integrado con contexto minero.

¿Necesitas ayuda? Revisa los logs del SQL Editor para ver si hay algún error.
