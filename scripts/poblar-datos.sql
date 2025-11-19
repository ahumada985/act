-- =============================================
-- SCRIPT PARA POBLAR DATOS DE EJEMPLO
-- Sistema Northtek Reportes - Minería
-- =============================================

-- 1. SUPERVISORES (5)
-- =============================================
INSERT INTO "User" (id, nombre, apellido, email, telefono, role, avatar, "createdAt", "updatedAt")
VALUES
  ('sup-001', 'Carlos', 'Mendoza', 'carlos.mendoza@northtek.cl', '+56 9 8765 4321', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', NOW(), NOW()),
  ('sup-002', 'María', 'González', 'maria.gonzalez@northtek.cl', '+56 9 7654 3210', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', NOW(), NOW()),
  ('sup-003', 'Roberto', 'Silva', 'roberto.silva@northtek.cl', '+56 9 6543 2109', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto', NOW(), NOW()),
  ('sup-004', 'Andrea', 'Vargas', 'andrea.vargas@northtek.cl', '+56 9 5432 1098', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea', NOW(), NOW()),
  ('sup-005', 'Felipe', 'Rojas', 'felipe.rojas@northtek.cl', '+56 9 4321 0987', 'SUPERVISOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. CUADRILLAS (5)
-- =============================================
INSERT INTO cuadrilla (id, nombre, supervisorid)
VALUES
  (gen_random_uuid(), 'Cuadrilla Norte - Escondida', 'sup-001'),
  (gen_random_uuid(), 'Cuadrilla Sur - Spence', 'sup-002'),
  (gen_random_uuid(), 'Cuadrilla Centinela', 'sup-003'),
  (gen_random_uuid(), 'Cuadrilla Quebrada Blanca', 'sup-004'),
  (gen_random_uuid(), 'Cuadrilla Collahuasi', 'sup-005')
ON CONFLICT (id) DO NOTHING;

-- 3. INTEGRANTES DE CUADRILLAS
-- =============================================
-- Obtener IDs de cuadrillas e insertar integrantes
DO $$
DECLARE
  cuadrilla_id UUID;
BEGIN
  -- Cuadrilla Norte - Escondida (4 integrantes)
  SELECT id INTO cuadrilla_id FROM cuadrilla WHERE nombre = 'Cuadrilla Norte - Escondida' LIMIT 1;
  IF cuadrilla_id IS NOT NULL THEN
    INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono) VALUES
      (gen_random_uuid(), cuadrilla_id, 'Juan Pérez Torres', '12.345.678-9', 'Técnico Telecomunicaciones', '+56 9 1111 2222'),
      (gen_random_uuid(), cuadrilla_id, 'Pedro Soto Muñoz', '13.456.789-0', 'Electricista', '+56 9 2222 3333'),
      (gen_random_uuid(), cuadrilla_id, 'Luis Araya Castro', '14.567.890-1', 'Maestro Obra Civil', '+56 9 3333 4444'),
      (gen_random_uuid(), cuadrilla_id, 'Miguel Contreras Díaz', '15.678.901-2', 'Ayudante General', '+56 9 4444 5555');
  END IF;

  -- Cuadrilla Sur - Spence (3 integrantes)
  SELECT id INTO cuadrilla_id FROM cuadrilla WHERE nombre = 'Cuadrilla Sur - Spence' LIMIT 1;
  IF cuadrilla_id IS NOT NULL THEN
    INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono) VALUES
      (gen_random_uuid(), cuadrilla_id, 'Ana Morales Vega', '16.789.012-3', 'Técnico Telecomunicaciones', '+56 9 5555 6666'),
      (gen_random_uuid(), cuadrilla_id, 'Diego Fuentes Parra', '17.890.123-4', 'Electricista Industrial', '+56 9 6666 7777'),
      (gen_random_uuid(), cuadrilla_id, 'Francisco Reyes Núñez', '18.901.234-5', 'Operador Grúa', '+56 9 7777 8888');
  END IF;

  -- Cuadrilla Centinela (4 integrantes)
  SELECT id INTO cuadrilla_id FROM cuadrilla WHERE nombre = 'Cuadrilla Centinela' LIMIT 1;
  IF cuadrilla_id IS NOT NULL THEN
    INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono) VALUES
      (gen_random_uuid(), cuadrilla_id, 'Sergio Espinoza Ríos', '19.012.345-6', 'Técnico Fibra Óptica', '+56 9 8888 9999'),
      (gen_random_uuid(), cuadrilla_id, 'Pablo Herrera Lagos', '20.123.456-7', 'Electricista', '+56 9 9999 0000'),
      (gen_random_uuid(), cuadrilla_id, 'Ricardo Bravo Sepúlveda', '21.234.567-8', 'Soldador', '+56 9 1010 2020'),
      (gen_random_uuid(), cuadrilla_id, 'Gonzalo Torres Figueroa', '22.345.678-9', 'Ayudante Técnico', '+56 9 3030 4040');
  END IF;

  -- Cuadrilla Quebrada Blanca (3 integrantes)
  SELECT id INTO cuadrilla_id FROM cuadrilla WHERE nombre = 'Cuadrilla Quebrada Blanca' LIMIT 1;
  IF cuadrilla_id IS NOT NULL THEN
    INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono) VALUES
      (gen_random_uuid(), cuadrilla_id, 'Cristian Valdés Ahumada', '23.456.789-0', 'Técnico Antenas', '+56 9 5050 6060'),
      (gen_random_uuid(), cuadrilla_id, 'Mauricio Cáceres Pinto', '24.567.890-1', 'Electricista', '+56 9 7070 8080'),
      (gen_random_uuid(), cuadrilla_id, 'Ignacio Muñoz Sandoval', '25.678.901-2', 'Rigger', '+56 9 9090 1010');
  END IF;

  -- Cuadrilla Collahuasi (4 integrantes)
  SELECT id INTO cuadrilla_id FROM cuadrilla WHERE nombre = 'Cuadrilla Collahuasi' LIMIT 1;
  IF cuadrilla_id IS NOT NULL THEN
    INSERT INTO integrantecuadrilla (id, cuadrillaid, nombre, rut, cargo, telefono) VALUES
      (gen_random_uuid(), cuadrilla_id, 'Tomás Guerrero Leiva', '26.789.012-3', 'Técnico Telecomunicaciones', '+56 9 2020 3030'),
      (gen_random_uuid(), cuadrilla_id, 'Alejandro Campos Vera', '27.890.123-4', 'Electricista MT', '+56 9 4040 5050'),
      (gen_random_uuid(), cuadrilla_id, 'Nicolás Pizarro Ibarra', '28.901.234-5', 'Maestro Obra Civil', '+56 9 6060 7070'),
      (gen_random_uuid(), cuadrilla_id, 'Eduardo Salazar Ortiz', '29.012.345-6', 'Conductor', '+56 9 8080 9090');
  END IF;
END $$;

-- 4. TAREAS GANTT
-- =============================================
INSERT INTO tareagantt (id, proyectonombre, nombre, fechainicio, fechafin, completada, orden)
VALUES
  -- Minera Escondida
  (gen_random_uuid(), 'Minera Escondida', 'Instalación fibra óptica sector norte', '2025-01-06', '2025-01-20', true, 1),
  (gen_random_uuid(), 'Minera Escondida', 'Configuración switches industriales', '2025-01-15', '2025-01-25', true, 2),
  (gen_random_uuid(), 'Minera Escondida', 'Instalación antenas 4G/5G', '2025-01-20', '2025-02-05', false, 3),
  (gen_random_uuid(), 'Minera Escondida', 'Pruebas de cobertura', '2025-02-01', '2025-02-10', false, 4),

  -- Minera Spence
  (gen_random_uuid(), 'Minera Spence', 'Tendido fibra backbone', '2025-01-08', '2025-01-30', true, 1),
  (gen_random_uuid(), 'Minera Spence', 'Instalación nodos de red', '2025-01-25', '2025-02-08', false, 2),
  (gen_random_uuid(), 'Minera Spence', 'Configuración VLAN mineras', '2025-02-05', '2025-02-15', false, 3),

  -- Minera Centinela
  (gen_random_uuid(), 'Minera Centinela', 'Ampliación data center', '2025-01-10', '2025-02-15', false, 1),
  (gen_random_uuid(), 'Minera Centinela', 'Instalación UPS y generadores', '2025-01-20', '2025-02-05', false, 2),
  (gen_random_uuid(), 'Minera Centinela', 'Cableado estructurado rack', '2025-02-01', '2025-02-20', false, 3),
  (gen_random_uuid(), 'Minera Centinela', 'Migración servidores', '2025-02-15', '2025-02-28', false, 4),

  -- Quebrada Blanca
  (gen_random_uuid(), 'Quebrada Blanca', 'Instalación radio enlaces', '2025-01-12', '2025-01-28', true, 1),
  (gen_random_uuid(), 'Quebrada Blanca', 'Configuración repetidoras', '2025-01-25', '2025-02-08', false, 2),
  (gen_random_uuid(), 'Quebrada Blanca', 'Mantenimiento torres', '2025-02-05', '2025-02-18', false, 3),

  -- Minera Collahuasi
  (gen_random_uuid(), 'Minera Collahuasi', 'Upgrade red comunicaciones', '2025-01-15', '2025-02-10', false, 1),
  (gen_random_uuid(), 'Minera Collahuasi', 'Instalación sistema SCADA', '2025-02-01', '2025-02-25', false, 2),
  (gen_random_uuid(), 'Minera Collahuasi', 'Integración sensores IoT', '2025-02-15', '2025-03-01', false, 3),
  (gen_random_uuid(), 'Minera Collahuasi', 'Capacitación operadores', '2025-02-25', '2025-03-05', false, 4);

-- 5. PREVENCIÓN DE RIESGOS
-- =============================================
INSERT INTO prevencionriesgo (id, proyectonombre, actividad, personasinvolucradas, documentos, fecha)
VALUES
  (gen_random_uuid(), 'Minera Escondida',
   'Trabajo en altura - Instalación de antenas en torre de comunicaciones sector norte. Altura máxima 45 metros.',
   'Carlos Mendoza (Supervisor)
Juan Pérez Torres (Técnico)
Pedro Soto Muñoz (Electricista)
Miguel Contreras Díaz (Ayudante)',
   '[{"nombre": "AST-001-Trabajo en Altura", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Permiso Trabajo Altura N°2025-001", "tipo": "Permiso de Trabajo"}, {"nombre": "Check List EPP Altura", "tipo": "Check List EPP"}]'::jsonb,
   '2025-01-15'),

  (gen_random_uuid(), 'Minera Spence',
   'Excavación para tendido de ductos de fibra óptica. Profundidad 1.2 metros, longitud 500 metros.',
   'María González (Supervisor)
Ana Morales Vega (Técnico)
Diego Fuentes Parra (Electricista)
Francisco Reyes Núñez (Operador)',
   '[{"nombre": "AST-002-Excavaciones", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Permiso Excavación N°2025-002", "tipo": "Permiso de Trabajo"}, {"nombre": "Plano excavación aprobado", "tipo": "Procedimiento de Trabajo"}]'::jsonb,
   '2025-01-20'),

  (gen_random_uuid(), 'Minera Centinela',
   'Trabajo eléctrico en media tensión - Conexión de UPS y tableros de distribución.',
   'Roberto Silva (Supervisor)
Sergio Espinoza Ríos (Técnico)
Pablo Herrera Lagos (Electricista)
Ricardo Bravo Sepúlveda (Soldador)',
   '[{"nombre": "AST-003-Trabajo Eléctrico MT", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Permiso Trabajo Eléctrico N°2025-003", "tipo": "Permiso de Trabajo"}, {"nombre": "Bloqueo y Etiquetado LOTO", "tipo": "Procedimiento de Trabajo"}, {"nombre": "Check List EPP Eléctrico", "tipo": "Check List EPP"}]'::jsonb,
   '2025-01-22'),

  (gen_random_uuid(), 'Quebrada Blanca',
   'Izaje de equipos - Instalación de antenas y equipos en torre existente mediante grúa telescópica.',
   'Andrea Vargas (Supervisor)
Cristian Valdés Ahumada (Técnico)
Mauricio Cáceres Pinto (Electricista)
Ignacio Muñoz Sandoval (Rigger)',
   '[{"nombre": "AST-004-Izaje de Cargas", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Plan de Izaje N°2025-001", "tipo": "Procedimiento de Trabajo"}, {"nombre": "Certificación Grúa", "tipo": "Otro"}]'::jsonb,
   '2025-01-25'),

  (gen_random_uuid(), 'Minera Collahuasi',
   'Trabajo en espacios confinados - Instalación de cableado en ductos subterráneos y cámaras de empalme.',
   'Felipe Rojas (Supervisor)
Tomás Guerrero Leiva (Técnico)
Alejandro Campos Vera (Electricista)
Nicolás Pizarro Ibarra (Obra Civil)',
   '[{"nombre": "AST-005-Espacios Confinados", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Permiso Espacio Confinado N°2025-004", "tipo": "Permiso de Trabajo"}, {"nombre": "Monitoreo Gases", "tipo": "Procedimiento de Trabajo"}, {"nombre": "Plan de Rescate", "tipo": "Plan de Emergencia"}]'::jsonb,
   '2025-01-28'),

  (gen_random_uuid(), 'Minera Escondida',
   'Soldadura en estructura metálica - Fabricación de soportes para gabinetes de telecomunicaciones.',
   'Carlos Mendoza (Supervisor)
Luis Araya Castro (Obra Civil)
Pedro Soto Muñoz (Electricista)',
   '[{"nombre": "AST-006-Trabajos en Caliente", "tipo": "AST (Análisis Seguro de Trabajo)"}, {"nombre": "Permiso Trabajo en Caliente N°2025-005", "tipo": "Permiso de Trabajo"}, {"nombre": "Check List EPP Soldadura", "tipo": "Check List EPP"}]'::jsonb,
   '2025-02-01');

-- 6. REPORTES DE EJEMPLO (para que se vean las faenas)
-- =============================================
INSERT INTO "Reporte" (id, "tipoTrabajo", descripcion, proyecto, "ordenTrabajo", direccion, status, "supervisorId", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'FIBRA_OPTICA', 'Instalación de 2km de fibra óptica monomodo en sector norte de la mina. Empalmes realizados correctamente.', 'Minera Escondida', 'OT-2025-001', 'Sector Mina Norte Km 15', 'APROBADO', 'sup-001', NOW() - INTERVAL '5 days', NOW()),
  (gen_random_uuid(), 'ANTENAS', 'Instalación de antenas 4G/5G en torre de comunicaciones. Cobertura verificada en radio de 5km.', 'Minera Escondida', 'OT-2025-002', 'Torre Comunicaciones T-01', 'ENVIADO', 'sup-001', NOW() - INTERVAL '3 days', NOW()),
  (gen_random_uuid(), 'DATA_CENTER', 'Instalación de rack 42U con PDU redundante. Cableado estructurado categoría 6A completado.', 'Minera Spence', 'OT-2025-003', 'Data Center Principal', 'APROBADO', 'sup-002', NOW() - INTERVAL '4 days', NOW()),
  (gen_random_uuid(), 'MANTENIMIENTO', 'Mantenimiento preventivo de equipos de radio enlace. Limpieza y ajuste de antenas.', 'Minera Spence', 'OT-2025-004', 'Cerro Comunicaciones', 'BORRADOR', 'sup-002', NOW() - INTERVAL '1 day', NOW()),
  (gen_random_uuid(), 'INSTALACION_RED', 'Configuración de switches industriales Cisco IE4000. VLAN configuradas según diseño.', 'Minera Centinela', 'OT-2025-005', 'Sala Eléctrica SE-03', 'APROBADO', 'sup-003', NOW() - INTERVAL '6 days', NOW()),
  (gen_random_uuid(), 'FIBRA_OPTICA', 'Tendido de fibra backbone entre concentradora y puerto. 8km de cable ADSS.', 'Minera Centinela', 'OT-2025-006', 'Corredor Principal', 'ENVIADO', 'sup-003', NOW() - INTERVAL '2 days', NOW()),
  (gen_random_uuid(), 'ANTENAS', 'Instalación de sistema de radio troncalizado TETRA. 5 repetidoras instaladas.', 'Quebrada Blanca', 'OT-2025-007', 'Torre QB-Norte', 'APROBADO', 'sup-004', NOW() - INTERVAL '7 days', NOW()),
  (gen_random_uuid(), 'DATA_CENTER', 'Ampliación de capacidad UPS. Instalación de banco de baterías adicional.', 'Quebrada Blanca', 'OT-2025-008', 'Data Center Operaciones', 'ENVIADO', 'sup-004', NOW() - INTERVAL '1 day', NOW()),
  (gen_random_uuid(), 'MANTENIMIENTO', 'Mantenimiento correctivo sistema SCADA. Reemplazo de módulos de comunicación.', 'Minera Collahuasi', 'OT-2025-009', 'Sala Control Principal', 'APROBADO', 'sup-005', NOW() - INTERVAL '8 days', NOW()),
  (gen_random_uuid(), 'INSTALACION_RED', 'Integración de sensores IoT en red de monitoreo. 50 sensores configurados.', 'Minera Collahuasi', 'OT-2025-010', 'Planta Concentradora', 'BORRADOR', 'sup-005', NOW(), NOW());

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

SELECT 'Datos poblados exitosamente!' as mensaje;
