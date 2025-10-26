-- Agregar columna proyectoId a la tabla Reporte
ALTER TABLE "Reporte"
ADD COLUMN IF NOT EXISTS "proyectoId" TEXT;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "Reporte_proyectoId_idx" ON "Reporte"("proyectoId");

-- Agregar foreign key constraint (opcional, si quieres forzar integridad referencial)
-- ALTER TABLE "Reporte"
-- ADD CONSTRAINT "Reporte_proyectoId_fkey"
-- FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id")
-- ON DELETE SET NULL;

-- Nota: La foreign key está comentada porque usamos Supabase sin Prisma para la tabla Proyecto
-- Si quieres habilitar integridad referencial, descomenta las líneas de arriba
