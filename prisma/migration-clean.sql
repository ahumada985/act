CREATE TYPE "UserRole" AS ENUM ('SUPERVISOR', 'ADMIN', 'GERENTE');
CREATE TYPE "ReportStatus" AS ENUM ('BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO');
CREATE TYPE "TipoTrabajo" AS ENUM ('FIBRA_OPTICA', 'DATA_CENTER', 'ANTENAS', 'CCTV', 'INSTALACION_RED', 'MANTENIMIENTO', 'OTRO');

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SUPERVISOR',
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReportStatus" NOT NULL DEFAULT 'BORRADOR',
    "tipoTrabajo" "TipoTrabajo" NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "direccion" TEXT,
    "comuna" TEXT,
    "region" TEXT,
    "clienteFinal" TEXT,
    "ordenTrabajo" TEXT,
    "proyecto" TEXT,
    "descripcion" TEXT,
    "observaciones" TEXT,
    "camposDinamicos" JSONB,
    "supervisorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reporte_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Foto" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "reporteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Audio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "url" TEXT NOT NULL,
    "duracion" INTEGER,
    "transcripcion" TEXT,
    "reporteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Audio_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ConsolidadoSemanal" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "semanaInicio" TIMESTAMP(3) NOT NULL,
    "semanaFin" TIMESTAMP(3) NOT NULL,
    "anio" INTEGER NOT NULL,
    "numeroSemana" INTEGER NOT NULL,
    "totalReportes" INTEGER NOT NULL DEFAULT 0,
    "tiposTrabajo" JSONB NOT NULL,
    "estadisticas" JSONB,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsolidadoSemanal_anio_numeroSemana_key" UNIQUE ("anio", "numeroSemana")
);

CREATE TABLE "_ConsolidadoSemanalToReporte" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ConsolidadoSemanalToReporte_A_fkey" FOREIGN KEY ("A") REFERENCES "ConsolidadoSemanal"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConsolidadoSemanalToReporte_B_fkey" FOREIGN KEY ("B") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PlantillaFormulario" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "tipoTrabajo" "TipoTrabajo" NOT NULL UNIQUE,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "campos" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Reporte_supervisorId_idx" ON "Reporte"("supervisorId");
CREATE INDEX "Reporte_tipoTrabajo_idx" ON "Reporte"("tipoTrabajo");
CREATE INDEX "Reporte_status_idx" ON "Reporte"("status");
CREATE INDEX "Reporte_fecha_idx" ON "Reporte"("fecha");
CREATE INDEX "Foto_reporteId_idx" ON "Foto"("reporteId");
CREATE INDEX "Audio_reporteId_idx" ON "Audio"("reporteId");
CREATE INDEX "ConsolidadoSemanal_semanaInicio_semanaFin_idx" ON "ConsolidadoSemanal"("semanaInicio", "semanaFin");
CREATE UNIQUE INDEX "_ConsolidadoSemanalToReporte_AB_unique" ON "_ConsolidadoSemanalToReporte"("A", "B");
CREATE INDEX "_ConsolidadoSemanalToReporte_B_index" ON "_ConsolidadoSemanalToReporte"("B");

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reporte_updated_at BEFORE UPDATE ON "Reporte"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consolidado_updated_at BEFORE UPDATE ON "ConsolidadoSemanal"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plantilla_updated_at BEFORE UPDATE ON "PlantillaFormulario"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO "User" ("id", "email", "nombre", "apellido", "role")
VALUES
    ('admin-001', 'admin@act.cl', 'Admin', 'ACT', 'ADMIN'),
    ('supervisor-001', 'supervisor@act.cl', 'Juan', 'Pérez', 'SUPERVISOR');

INSERT INTO "PlantillaFormulario" ("tipoTrabajo", "nombre", "descripcion", "campos")
VALUES
(
    'FIBRA_OPTICA',
    'Reporte Fibra Óptica',
    'Formulario para instalación y mantenimiento de fibra óptica',
    '[
        {"id": "km_fibra", "tipo": "number", "label": "Kilómetros de fibra instalada", "requerido": true},
        {"id": "tipo_fibra", "tipo": "select", "label": "Tipo de fibra", "opciones": ["Monomodo", "Multimodo"], "requerido": true},
        {"id": "cantidad_empalmes", "tipo": "number", "label": "Cantidad de empalmes", "requerido": false},
        {"id": "cantidad_mufa", "tipo": "number", "label": "Cantidad de mufas", "requerido": false},
        {"id": "perdida_db", "tipo": "number", "label": "Pérdida en dB", "requerido": false},
        {"id": "tipo_conector", "tipo": "text", "label": "Tipo de conector", "requerido": false}
    ]'::jsonb
),
(
    'DATA_CENTER',
    'Reporte Data Center',
    'Formulario para trabajos en data center',
    '[
        {"id": "cantidad_racks", "tipo": "number", "label": "Cantidad de racks", "requerido": true},
        {"id": "tipo_equipo", "tipo": "text", "label": "Tipo de equipo instalado", "requerido": true},
        {"id": "cantidad_equipos", "tipo": "number", "label": "Cantidad de equipos", "requerido": true},
        {"id": "potencia_instalada", "tipo": "number", "label": "Potencia instalada (W)", "requerido": false},
        {"id": "tipo_cableado", "tipo": "select", "label": "Tipo de cableado", "opciones": ["Cat5e", "Cat6", "Cat6a", "Fibra"], "requerido": false}
    ]'::jsonb
),
(
    'ANTENAS',
    'Reporte Antenas',
    'Formulario para instalación de antenas',
    '[
        {"id": "altura_antena", "tipo": "number", "label": "Altura de antena (m)", "requerido": true},
        {"id": "tipo_antena", "tipo": "text", "label": "Tipo de antena", "requerido": true},
        {"id": "frecuencia", "tipo": "text", "label": "Frecuencia", "requerido": true},
        {"id": "azimut", "tipo": "number", "label": "Azimut (grados)", "requerido": false},
        {"id": "tilt_mecanico", "tipo": "number", "label": "Tilt mecánico", "requerido": false},
        {"id": "tilt_electrico", "tipo": "number", "label": "Tilt eléctrico", "requerido": false}
    ]'::jsonb
),
(
    'CCTV',
    'Reporte CCTV',
    'Formulario para instalación de cámaras',
    '[
        {"id": "cantidad_camaras", "tipo": "number", "label": "Cantidad de cámaras", "requerido": true},
        {"id": "tipo_camara", "tipo": "select", "label": "Tipo de cámara", "opciones": ["Domo", "Bullet", "PTZ", "Fisheye"], "requerido": true},
        {"id": "resolucion", "tipo": "select", "label": "Resolución", "opciones": ["1080p", "4K", "8MP"], "requerido": true},
        {"id": "tipo_grabador", "tipo": "text", "label": "Tipo de grabador (NVR/DVR)", "requerido": false},
        {"id": "dias_almacenamiento", "tipo": "number", "label": "Días de almacenamiento", "requerido": false}
    ]'::jsonb
);
