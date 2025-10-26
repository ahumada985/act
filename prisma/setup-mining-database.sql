-- =====================================================
-- ACT REPORTES - Configuración Base de Datos Minería
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- 1. AGREGAR COLUMNA proyectoId A LA TABLA Reporte
-- =====================================================
ALTER TABLE "Reporte"
ADD COLUMN IF NOT EXISTS "proyectoId" TEXT;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "Reporte_proyectoId_idx" ON "Reporte"("proyectoId");

-- Agregar foreign key constraint para integridad referencial (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Reporte_proyectoId_fkey'
  ) THEN
    ALTER TABLE "Reporte"
    ADD CONSTRAINT "Reporte_proyectoId_fkey"
    FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id")
    ON DELETE SET NULL;
  END IF;
END $$;

-- Agregar columna presupuesto a Proyecto si no existe
ALTER TABLE "Proyecto"
ADD COLUMN IF NOT EXISTS presupuesto BIGINT;


-- 2. INSERTAR PROYECTOS MINEROS DE LA ZONA NORTE
-- =====================================================
-- Limpiar proyectos existentes (OPCIONAL - comentar si quieres mantener datos existentes)
-- DELETE FROM "Proyecto";

-- Insertar proyectos mineros reales de Chile
INSERT INTO "Proyecto" (id, nombre, descripcion, cliente, "fechaInicio", "fechaFin", estado, presupuesto, "createdAt", "updatedAt")
VALUES
  -- Minera Escondida (BHP)
  (
    gen_random_uuid()::text,
    'Red de Fibra Óptica Minera Escondida',
    'Instalación de red de fibra óptica para comunicaciones en faena minera',
    'BHP - Minera Escondida',
    '2024-01-15',
    '2024-12-31',
    'ACTIVO',
    850000000,
    NOW(),
    NOW()
  ),

  -- Chuquicamata (CODELCO)
  (
    gen_random_uuid()::text,
    'Sistema CCTV Chuquicamata',
    'Implementación de sistema de videovigilancia en mina subterránea',
    'CODELCO - División Chuquicamata',
    '2024-02-01',
    '2025-01-31',
    'ACTIVO',
    620000000,
    NOW(),
    NOW()
  ),

  -- Spence (BHP)
  (
    gen_random_uuid()::text,
    'Ampliación Red Data Center Spence',
    'Modernización y ampliación de infraestructura de data center',
    'BHP - Minera Spence',
    '2024-03-10',
    '2024-11-30',
    'ACTIVO',
    450000000,
    NOW(),
    NOW()
  ),

  -- Centinela (Antofagasta Minerals)
  (
    gen_random_uuid()::text,
    'Antenas Comunicación Centinela',
    'Instalación de sistema de antenas para comunicaciones mineras',
    'Antofagasta Minerals - Centinela',
    '2024-01-20',
    '2024-10-15',
    'ACTIVO',
    380000000,
    NOW(),
    NOW()
  ),

  -- Altonorte (Glencore)
  (
    gen_random_uuid()::text,
    'Mantenimiento Red Altonorte',
    'Mantenimiento preventivo y correctivo de infraestructura de telecomunicaciones',
    'Glencore - Fundición Altonorte',
    '2024-02-15',
    '2025-02-14',
    'ACTIVO',
    290000000,
    NOW(),
    NOW()
  ),

  -- Mantos Blancos (Capstone)
  (
    gen_random_uuid()::text,
    'Red Industrial Mantos Blancos',
    'Instalación de red industrial para automatización de procesos',
    'Capstone - Mantos Blancos',
    '2024-04-01',
    '2024-12-20',
    'ACTIVO',
    410000000,
    NOW(),
    NOW()
  ),

  -- Quebrada Blanca (Teck)
  (
    gen_random_uuid()::text,
    'Fibra Óptica Quebrada Blanca II',
    'Tendido de fibra óptica para nuevo proyecto QB2',
    'Teck - Quebrada Blanca',
    '2024-01-05',
    '2025-03-31',
    'ACTIVO',
    920000000,
    NOW(),
    NOW()
  ),

  -- Collahuasi (Anglo American)
  (
    gen_random_uuid()::text,
    'Sistema Integrado Collahuasi',
    'Integración de sistemas de comunicaciones y monitoreo',
    'Anglo American - Collahuasi',
    '2024-03-01',
    '2025-02-28',
    'ACTIVO',
    680000000,
    NOW(),
    NOW()
  ),

  -- Radomiro Tomic (CODELCO)
  (
    gen_random_uuid()::text,
    'CCTV y Control Radomiro Tomic',
    'Sistema de videovigilancia y control de accesos',
    'CODELCO - Radomiro Tomic',
    '2024-02-20',
    '2024-11-30',
    'ACTIVO',
    340000000,
    NOW(),
    NOW()
  ),

  -- El Salvador (CODELCO)
  (
    gen_random_uuid()::text,
    'Modernización Red El Salvador',
    'Actualización de infraestructura de telecomunicaciones',
    'CODELCO - División Salvador',
    '2024-04-15',
    '2025-04-14',
    'ACTIVO',
    470000000,
    NOW(),
    NOW()
  ),

  -- Zaldívar (Barrick)
  (
    gen_random_uuid()::text,
    'Antenas Satelitales Zaldívar',
    'Instalación de sistema de comunicación satelital',
    'Barrick - Minera Zaldívar',
    '2024-01-10',
    '2024-09-30',
    'ACTIVO',
    310000000,
    NOW(),
    NOW()
  ),

  -- Los Pelambres (Antofagasta Minerals)
  (
    gen_random_uuid()::text,
    'Fibra Óptica Los Pelambres',
    'Expansión de red de fibra óptica en campamento y mina',
    'Antofagasta Minerals - Los Pelambres',
    '2024-03-20',
    '2024-12-15',
    'ACTIVO',
    540000000,
    NOW(),
    NOW()
  );


-- 3. CREAR/OBTENER SUPERVISOR PARA REPORTES
-- =====================================================
-- Crear un supervisor si no existe, o usar uno existente
DO $$
DECLARE
  supervisor_id TEXT;
BEGIN
  -- Verificar si existe el supervisor hardcodeado
  SELECT id INTO supervisor_id FROM "User" WHERE id = 'supervisor-001';

  -- Si no existe, crear uno
  IF supervisor_id IS NULL THEN
    -- Intentar obtener cualquier usuario existente
    SELECT id INTO supervisor_id FROM "User" LIMIT 1;

    -- Si no hay ningún usuario, crear el supervisor por defecto
    IF supervisor_id IS NULL THEN
      INSERT INTO "User" (id, email, nombre, apellido, role, "createdAt", "updatedAt")
      VALUES (
        'supervisor-001',
        'supervisor@actreportes.cl',
        'Supervisor',
        'General',
        'SUPERVISOR',
        NOW(),
        NOW()
      );
      supervisor_id := 'supervisor-001';
    END IF;
  END IF;

  -- Guardar el ID del supervisor en una variable temporal (tabla temporal)
  CREATE TEMP TABLE IF NOT EXISTS temp_supervisor (id TEXT);
  DELETE FROM temp_supervisor;
  INSERT INTO temp_supervisor (id) VALUES (supervisor_id);
END $$;


-- 4. INSERTAR REPORTES DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Nota: Estos son ejemplos. Ajusta las coordenadas GPS según necesites.
-- Las coordenadas son aproximadas de las ubicaciones reales de las minas.

-- Verificar que existen proyectos antes de insertar reportes
DO $$
DECLARE
  proyecto_escondida TEXT;
  proyecto_chuqui TEXT;
  proyecto_spence TEXT;
  proyecto_centinela TEXT;
  supervisor_id TEXT;
BEGIN
  -- Obtener el supervisor de la tabla temporal
  SELECT id INTO supervisor_id FROM temp_supervisor LIMIT 1;

  -- Obtener IDs de proyectos
  SELECT id INTO proyecto_escondida FROM "Proyecto" WHERE nombre LIKE '%Escondida%' LIMIT 1;
  SELECT id INTO proyecto_chuqui FROM "Proyecto" WHERE nombre LIKE '%Chuquicamata%' LIMIT 1;
  SELECT id INTO proyecto_spence FROM "Proyecto" WHERE nombre LIKE '%Spence%' LIMIT 1;
  SELECT id INTO proyecto_centinela FROM "Proyecto" WHERE nombre LIKE '%Centinela%' LIMIT 1;

  -- Insertar reportes de ejemplo solo si existen los proyectos Y el supervisor
  IF proyecto_escondida IS NOT NULL AND supervisor_id IS NOT NULL THEN
    INSERT INTO "Reporte" (id, "ordenTrabajo", "tipoTrabajo", "proyectoId", proyecto, descripcion, direccion, latitud, longitud, status, "supervisorId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      'OT-ESC-2024-001',
      'FIBRA_OPTICA',
      proyecto_escondida,
      'Red de Fibra Óptica Minera Escondida',
      'Instalación de tendido de fibra óptica tramo principal',
      'Minera Escondida, Antofagasta',
      -23.3167,
      -69.0500,
      'ENVIADO',
      supervisor_id,
      NOW(),
      NOW()
    );
  END IF;

  IF proyecto_chuqui IS NOT NULL AND supervisor_id IS NOT NULL THEN
    INSERT INTO "Reporte" (id, "ordenTrabajo", "tipoTrabajo", "proyectoId", proyecto, descripcion, direccion, latitud, longitud, status, "supervisorId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      'OT-CHU-2024-002',
      'CCTV',
      proyecto_chuqui,
      'Sistema CCTV Chuquicamata',
      'Instalación de cámaras de seguridad en acceso norte',
      'Mina Chuquicamata, Calama',
      -22.3053,
      -68.9033,
      'ENVIADO',
      supervisor_id,
      NOW(),
      NOW()
    );
  END IF;

  IF proyecto_spence IS NOT NULL AND supervisor_id IS NOT NULL THEN
    INSERT INTO "Reporte" (id, "ordenTrabajo", "tipoTrabajo", "proyectoId", proyecto, descripcion, direccion, latitud, longitud, status, "supervisorId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      'OT-SPN-2024-003',
      'DATA_CENTER',
      proyecto_spence,
      'Ampliación Red Data Center Spence',
      'Configuración de servidores y sistemas de respaldo',
      'Minera Spence, Sierra Gorda',
      -22.9167,
      -69.2167,
      'APROBADO',
      supervisor_id,
      NOW(),
      NOW()
    );
  END IF;

  IF proyecto_centinela IS NOT NULL AND supervisor_id IS NOT NULL THEN
    INSERT INTO "Reporte" (id, "ordenTrabajo", "tipoTrabajo", "proyectoId", proyecto, descripcion, direccion, latitud, longitud, status, "supervisorId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      'OT-CTN-2024-004',
      'ANTENAS',
      proyecto_centinela,
      'Antenas Comunicación Centinela',
      'Montaje de torre de antenas sector concentradora',
      'Minera Centinela, Antofagasta',
      -23.9333,
      -69.2500,
      'ENVIADO',
      supervisor_id,
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- Limpiar tabla temporal
DROP TABLE IF EXISTS temp_supervisor;


-- 5. VERIFICACIÓN
-- =====================================================
-- Verificar que se crearon correctamente

SELECT COUNT(*) as total_proyectos FROM "Proyecto";
SELECT COUNT(*) as total_reportes FROM "Reporte";
SELECT COUNT(*) as reportes_con_proyecto FROM "Reporte" WHERE "proyectoId" IS NOT NULL;

-- Ver proyectos creados
SELECT id, nombre, cliente, estado FROM "Proyecto" ORDER BY nombre;

-- Ver reportes con su proyecto asociado
SELECT
  r.id,
  r."ordenTrabajo",
  r."tipoTrabajo",
  r.proyecto as proyecto_nombre,
  p.nombre as proyecto_asociado,
  p.cliente,
  r.status
FROM "Reporte" r
LEFT JOIN "Proyecto" p ON r."proyectoId" = p.id
WHERE r."proyectoId" IS NOT NULL
ORDER BY r."createdAt" DESC;
