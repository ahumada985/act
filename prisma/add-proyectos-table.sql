-- Crear tabla de Proyectos
CREATE TABLE IF NOT EXISTS "Proyecto" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "cliente" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "Proyecto_estado_idx" ON "Proyecto"("estado");
CREATE INDEX IF NOT EXISTS "Proyecto_nombre_idx" ON "Proyecto"("nombre");

-- Deshabilitar RLS temporalmente
ALTER TABLE "Proyecto" DISABLE ROW LEVEL SECURITY;

-- Insertar proyectos de ejemplo
INSERT INTO "Proyecto" ("nombre", "descripcion", "cliente", "estado", "fechaInicio") VALUES
('Proyecto Metro Santiago', 'Instalación de fibra óptica en red de Metro', 'Metro de Santiago', 'ACTIVO', NOW() - INTERVAL '60 days'),
('Red Fibra Óptica RM', 'Despliegue de red de fibra en Región Metropolitana', 'Movistar', 'ACTIVO', NOW() - INTERVAL '90 days'),
('Instalación Antenas 5G', 'Torres de antenas 5G en zonas urbanas', 'Entel', 'ACTIVO', NOW() - INTERVAL '30 days'),
('Sistema CCTV Mall Plaza', 'Instalación de cámaras de seguridad', 'Mall Plaza', 'COMPLETADO', NOW() - INTERVAL '120 days'),
('Data Center Banco Chile', 'Infraestructura de data center corporativo', 'Banco de Chile', 'ACTIVO', NOW() - INTERVAL '45 days');

COMMENT ON TABLE "Proyecto" IS 'Proyectos de telecomunicaciones de ACT';
