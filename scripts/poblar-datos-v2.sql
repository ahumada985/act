-- =====================================================
-- SCRIPT DE POBLACIÓN DE DATOS - NORTHTEK REPORTES v2
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Limpiar datos existentes (en orden por dependencias)
DELETE FROM integrantecuadrilla;
DELETE FROM cuadrilla;
DELETE FROM tareagantt;
DELETE FROM prevencionriesgo;
-- No eliminamos usuarios para no afectar autenticación

-- =====================================================
-- 1. CREAR SUPERVISORES (en tabla User)
-- Usar ON CONFLICT para actualizar si ya existen
-- =====================================================
INSERT INTO "User" (id, nombre, apellido, email, role, avatar, "createdAt", "updatedAt")
VALUES
  ('11111111-1111-1111-1111-111111111001', 'Carlos', 'Mendoza', 'carlos.mendoza@northtek.cl', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111002', 'María', 'González', 'maria.gonzalez@northtek.cl', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111003', 'Roberto', 'Soto', 'roberto.soto@northtek.cl', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto', NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111004', 'Andrea', 'Pérez', 'andrea.perez@northtek.cl', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea', NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111005', 'Francisco', 'Rojas', 'francisco.rojas@northtek.cl', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francisco', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  "updatedAt" = NOW();

-- Obtener los IDs reales de los supervisores para usarlos en cuadrillas
-- Crear tabla temporal con mapping
CREATE TEMP TABLE sup_mapping AS
SELECT id, email FROM "User" WHERE email IN (
  'carlos.mendoza@northtek.cl',
  'maria.gonzalez@northtek.cl',
  'roberto.soto@northtek.cl',
  'andrea.perez@northtek.cl',
  'francisco.rojas@northtek.cl'
);

-- =====================================================
-- 2. CREAR CUADRILLAS
-- =====================================================
INSERT INTO cuadrilla (id, nombre, supervisorid)
VALUES
  ('22222222-2222-2222-2222-222222222001', 'Cuadrilla Escondida Norte', (SELECT id FROM sup_mapping WHERE email = 'carlos.mendoza@northtek.cl')),
  ('22222222-2222-2222-2222-222222222002', 'Cuadrilla Spence Telecomunicaciones', (SELECT id FROM sup_mapping WHERE email = 'maria.gonzalez@northtek.cl')),
  ('22222222-2222-2222-2222-222222222003', 'Cuadrilla Centinela Fibra', (SELECT id FROM sup_mapping WHERE email = 'roberto.soto@northtek.cl')),
  ('22222222-2222-2222-2222-222222222004', 'Cuadrilla Quebrada Blanca', (SELECT id FROM sup_mapping WHERE email = 'andrea.perez@northtek.cl')),
  ('22222222-2222-2222-2222-222222222005', 'Cuadrilla Collahuasi Data Center', (SELECT id FROM sup_mapping WHERE email = 'francisco.rojas@northtek.cl'));

-- Limpiar tabla temporal
DROP TABLE sup_mapping;

-- =====================================================
-- 3. CREAR INTEGRANTES DE CUADRILLAS
-- Cada cuadrilla tiene: Jefe, TI, Eléctrico, Obra Civil, Apoyo
-- =====================================================

-- Cuadrilla Escondida Norte
INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono)
VALUES
  ('33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 'Carlos Mendoza (Jefe)', '12.345.678-9', 'Jefe de Cuadrilla', '+56 9 8765 4321'),
  ('33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222001', 'Juan Pérez Silva', '13.456.789-0', 'Especialista TI', '+56 9 8234 5678'),
  ('33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222001', 'Pedro Muñoz Ríos', '14.567.890-1', 'Técnico Eléctrico', '+56 9 8345 6789'),
  ('33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222001', 'Luis Araya Torres', '15.678.901-2', 'Maestro Obra Civil', '+56 9 8456 7890'),
  ('33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222001', 'Diego Fernández M.', '16.789.012-3', 'Técnico TI Junior', '+56 9 8567 8901');

-- Cuadrilla Spence Telecomunicaciones
INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono)
VALUES
  ('33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222002', 'María González (Jefa)', '11.234.567-8', 'Jefa de Cuadrilla', '+56 9 7654 3210'),
  ('33333333-3333-3333-3333-333333333007', '22222222-2222-2222-2222-222222222002', 'Ana Soto Vega', '12.345.678-K', 'Especialista Telecomunicaciones', '+56 9 7765 4321'),
  ('33333333-3333-3333-3333-333333333008', '22222222-2222-2222-2222-222222222002', 'Miguel Rojas Paz', '13.456.789-1', 'Técnico Eléctrico Senior', '+56 9 7876 5432'),
  ('33333333-3333-3333-3333-333333333009', '22222222-2222-2222-2222-222222222002', 'José Valenzuela C.', '14.567.890-2', 'Maestro Obra Civil', '+56 9 7987 6543'),
  ('33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222002', 'Carmen Fuentes R.', '15.678.901-3', 'Técnico Fibra Óptica', '+56 9 7098 7654');

-- Cuadrilla Centinela Fibra
INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono)
VALUES
  ('33333333-3333-3333-3333-333333333011', '22222222-2222-2222-2222-222222222003', 'Roberto Soto (Jefe)', '10.123.456-7', 'Jefe de Cuadrilla', '+56 9 6543 2109'),
  ('33333333-3333-3333-3333-333333333012', '22222222-2222-2222-2222-222222222003', 'Felipe Castro M.', '11.234.567-8', 'Ingeniero Redes', '+56 9 6654 3210'),
  ('33333333-3333-3333-3333-333333333013', '22222222-2222-2222-2222-222222222003', 'Andrés Mora Silva', '12.345.678-9', 'Técnico Eléctrico', '+56 9 6765 4321'),
  ('33333333-3333-3333-3333-333333333014', '22222222-2222-2222-2222-222222222003', 'Cristian Díaz R.', '13.456.789-K', 'Maestro Obra Civil', '+56 9 6876 5432'),
  ('33333333-3333-3333-3333-333333333015', '22222222-2222-2222-2222-222222222003', 'Sebastián Núñez P.', '14.567.890-0', 'Técnico Fibra Óptica', '+56 9 6987 6543');

-- Cuadrilla Quebrada Blanca
INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono)
VALUES
  ('33333333-3333-3333-3333-333333333016', '22222222-2222-2222-2222-222222222004', 'Andrea Pérez (Jefa)', '9.012.345-6', 'Jefa de Cuadrilla', '+56 9 5432 1098'),
  ('33333333-3333-3333-3333-333333333017', '22222222-2222-2222-2222-222222222004', 'Pablo Herrera G.', '10.123.456-7', 'Especialista Data Center', '+56 9 5543 2109'),
  ('33333333-3333-3333-3333-333333333018', '22222222-2222-2222-2222-222222222004', 'Ricardo Vera L.', '11.234.567-8', 'Técnico Eléctrico Senior', '+56 9 5654 3210'),
  ('33333333-3333-3333-3333-333333333019', '22222222-2222-2222-2222-222222222004', 'Eduardo Bravo M.', '12.345.678-9', 'Maestro Obra Civil', '+56 9 5765 4321'),
  ('33333333-3333-3333-3333-333333333020', '22222222-2222-2222-2222-222222222004', 'Marcelo Pizarro S.', '13.456.789-K', 'Técnico Eléctrico Junior', '+56 9 5876 5432');

-- Cuadrilla Collahuasi Data Center
INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono)
VALUES
  ('33333333-3333-3333-3333-333333333021', '22222222-2222-2222-2222-222222222005', 'Francisco Rojas (Jefe)', '8.901.234-5', 'Jefe de Cuadrilla', '+56 9 4321 0987'),
  ('33333333-3333-3333-3333-333333333022', '22222222-2222-2222-2222-222222222005', 'Daniel Espinoza V.', '9.012.345-6', 'Ingeniero Data Center', '+56 9 4432 1098'),
  ('33333333-3333-3333-3333-333333333023', '22222222-2222-2222-2222-222222222005', 'Gonzalo Tapia R.', '10.123.456-7', 'Técnico Eléctrico Alta Tensión', '+56 9 4543 2109'),
  ('33333333-3333-3333-3333-333333333024', '22222222-2222-2222-2222-222222222005', 'Patricio Campos N.', '11.234.567-8', 'Maestro Obra Civil Senior', '+56 9 4654 3210'),
  ('33333333-3333-3333-3333-333333333025', '22222222-2222-2222-2222-222222222005', 'Tomás Reyes H.', '12.345.678-9', 'Especialista UPS/Climatización', '+56 9 4765 4321');

-- =====================================================
-- 4. CREAR TAREAS GANTT POR PROYECTO
-- =====================================================

-- Tareas Minera Escondida
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  ('44444444-4444-4444-4444-444444444001', 'Minera Escondida', 'Levantamiento topográfico', '2025-01-06', '2025-01-10', true, 1),
  ('44444444-4444-4444-4444-444444444002', 'Minera Escondida', 'Excavación y canalización', '2025-01-13', '2025-01-24', true, 2),
  ('44444444-4444-4444-4444-444444444003', 'Minera Escondida', 'Tendido de fibra óptica', '2025-01-27', '2025-02-07', true, 3),
  ('44444444-4444-4444-4444-444444444004', 'Minera Escondida', 'Instalación de equipos activos', '2025-02-10', '2025-02-21', false, 4),
  ('44444444-4444-4444-4444-444444444005', 'Minera Escondida', 'Pruebas y certificación', '2025-02-24', '2025-02-28', false, 5);

-- Tareas Minera Spence
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  ('44444444-4444-4444-4444-444444444006', 'Minera Spence', 'Diseño de red telecomunicaciones', '2025-01-13', '2025-01-17', true, 1),
  ('44444444-4444-4444-4444-444444444007', 'Minera Spence', 'Adquisición de materiales', '2025-01-20', '2025-01-31', true, 2),
  ('44444444-4444-4444-4444-444444444008', 'Minera Spence', 'Instalación de antenas', '2025-02-03', '2025-02-14', false, 3),
  ('44444444-4444-4444-4444-444444444009', 'Minera Spence', 'Configuración de equipos', '2025-02-17', '2025-02-28', false, 4),
  ('44444444-4444-4444-4444-444444444010', 'Minera Spence', 'Capacitación al personal', '2025-03-03', '2025-03-07', false, 5);

-- Tareas Minera Centinela
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  ('44444444-4444-4444-4444-444444444011', 'Minera Centinela', 'Estudio de factibilidad', '2025-01-20', '2025-01-24', true, 1),
  ('44444444-4444-4444-4444-444444444012', 'Minera Centinela', 'Preparación de sitio', '2025-01-27', '2025-02-07', true, 2),
  ('44444444-4444-4444-4444-444444444013', 'Minera Centinela', 'Instalación backbone fibra', '2025-02-10', '2025-02-28', false, 3),
  ('44444444-4444-4444-4444-444444444014', 'Minera Centinela', 'Conexión nodos principales', '2025-03-03', '2025-03-14', false, 4),
  ('44444444-4444-4444-4444-444444444015', 'Minera Centinela', 'Pruebas de velocidad', '2025-03-17', '2025-03-21', false, 5);

-- Tareas Quebrada Blanca
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  ('44444444-4444-4444-4444-444444444016', 'Quebrada Blanca', 'Evaluación infraestructura actual', '2025-02-03', '2025-02-07', true, 1),
  ('44444444-4444-4444-4444-444444444017', 'Quebrada Blanca', 'Diseño sistema CCTV', '2025-02-10', '2025-02-14', true, 2),
  ('44444444-4444-4444-4444-444444444018', 'Quebrada Blanca', 'Instalación cámaras', '2025-02-17', '2025-03-07', false, 3),
  ('44444444-4444-4444-4444-444444444019', 'Quebrada Blanca', 'Configuración NVR', '2025-03-10', '2025-03-14', false, 4),
  ('44444444-4444-4444-4444-444444444020', 'Quebrada Blanca', 'Integración con sala control', '2025-03-17', '2025-03-21', false, 5);

-- Tareas Minera Collahuasi
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  ('44444444-4444-4444-4444-444444444021', 'Minera Collahuasi', 'Diseño Data Center', '2025-02-10', '2025-02-21', true, 1),
  ('44444444-4444-4444-4444-444444444022', 'Minera Collahuasi', 'Obra civil y climatización', '2025-02-24', '2025-03-14', false, 2),
  ('44444444-4444-4444-4444-444444444023', 'Minera Collahuasi', 'Instalación racks y UPS', '2025-03-17', '2025-03-28', false, 3),
  ('44444444-4444-4444-4444-444444444024', 'Minera Collahuasi', 'Cableado estructurado', '2025-03-31', '2025-04-11', false, 4),
  ('44444444-4444-4444-4444-444444444025', 'Minera Collahuasi', 'Puesta en marcha', '2025-04-14', '2025-04-18', false, 5);

-- =====================================================
-- 5. CREAR REGISTROS DE PREVENCIÓN DE RIESGOS
-- =====================================================
INSERT INTO prevencionriesgo (id, proyectonombre, actividad, personasinvolucradas, documentos, fecha)
VALUES
  (
    '55555555-5555-5555-5555-555555555001',
    'Minera Escondida',
    'Excavación de zanja para canalización de fibra óptica en sector norte. Profundidad 1.2m, largo 500m.',
    'Carlos Mendoza (Supervisor)
Juan Pérez Silva (TI)
Pedro Muñoz Ríos (Eléctrico)
Luis Araya Torres (Obra Civil)',
    '[{"nombre": "AST-ESC-001", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "PT-ESC-001", "tipo": "Permiso de Trabajo"}, {"nombre": "CL-EPP-001", "tipo": "Check List EPP"}]'::jsonb,
    '2025-01-15'
  ),
  (
    '55555555-5555-5555-5555-555555555002',
    'Minera Spence',
    'Instalación de antenas en torre de comunicaciones. Trabajo en altura sobre 10 metros.',
    'María González (Supervisora)
Ana Soto Vega (Telecom)
Miguel Rojas Paz (Eléctrico)',
    '[{"nombre": "AST-SPN-001", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "PT-ALTURA-001", "tipo": "Permiso de Trabajo"}, {"nombre": "PROC-ALTURA", "tipo": "Procedimiento de Trabajo"}]'::jsonb,
    '2025-02-05'
  ),
  (
    '55555555-5555-5555-5555-555555555003',
    'Minera Centinela',
    'Tendido de cable de fibra óptica en ductos subterráneos existentes. Trabajo en espacio confinado.',
    'Roberto Soto (Supervisor)
Felipe Castro M. (Redes)
Sebastián Núñez P. (Fibra Óptica)',
    '[{"nombre": "AST-CEN-001", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "PT-CONF-001", "tipo": "Permiso de Trabajo"}, {"nombre": "PLAN-EMERG-001", "tipo": "Plan de Emergencia"}]'::jsonb,
    '2025-02-12'
  ),
  (
    '55555555-5555-5555-5555-555555555004',
    'Quebrada Blanca',
    'Instalación de cámaras de seguridad en perímetro de planta. Trabajo eléctrico en media tensión.',
    'Andrea Pérez (Supervisora)
Ricardo Vera L. (Eléctrico Senior)
Marcelo Pizarro S. (Eléctrico Junior)',
    '[{"nombre": "AST-QB-001", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "PT-ELEC-001", "tipo": "Permiso de Trabajo"}, {"nombre": "BLOQUEO-001", "tipo": "Procedimiento de Trabajo"}]'::jsonb,
    '2025-02-20'
  ),
  (
    '55555555-5555-5555-5555-555555555005',
    'Minera Collahuasi',
    'Instalación de sistema UPS y climatización en Data Center. Manejo de equipos pesados.',
    'Francisco Rojas (Supervisor)
Daniel Espinoza V. (Data Center)
Gonzalo Tapia R. (Eléctrico AT)
Patricio Campos N. (Obra Civil)',
    '[{"nombre": "AST-COL-001", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "PT-DC-001", "tipo": "Permiso de Trabajo"}, {"nombre": "MANIOBRA-001", "tipo": "Procedimiento de Trabajo"}, {"nombre": "CAP-IZAJE", "tipo": "Registro de Capacitación"}]'::jsonb,
    '2025-03-18'
  );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'Supervisores creados:' as tipo, COUNT(*) as cantidad FROM "User" WHERE role = 'SUPERVISOR'
UNION ALL
SELECT 'Cuadrillas creadas:', COUNT(*) FROM cuadrilla
UNION ALL
SELECT 'Integrantes creados:', COUNT(*) FROM integrantecuadrilla
UNION ALL
SELECT 'Tareas Gantt creadas:', COUNT(*) FROM tareagantt
UNION ALL
SELECT 'Registros Prevención:', COUNT(*) FROM prevencionriesgo;
