"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Circle,
  Clock
} from "lucide-react";

export default function FasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener todos los reportes
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("id, proyecto, tipoTrabajo, status, createdAt")
        .not("proyecto", "is", null)
        .order("createdAt", { ascending: true });

      if (error) throw error;

      // Agrupar por proyecto
      const proyectosMap = new Map<string, any>();

      reportes?.forEach(reporte => {
        const nombreProyecto = reporte.proyecto || "Sin proyecto";

        if (!proyectosMap.has(nombreProyecto)) {
          proyectosMap.set(nombreProyecto, {
            nombre: nombreProyecto,
            fases: new Map<string, any>()
          });
        }

        const proyecto = proyectosMap.get(nombreProyecto);
        const tipoTrabajo = reporte.tipoTrabajo;

        if (!proyecto.fases.has(tipoTrabajo)) {
          proyecto.fases.set(tipoTrabajo, {
            nombre: tipoTrabajo,
            reportes: [],
            total: 0,
            completados: 0
          });
        }

        const fase = proyecto.fases.get(tipoTrabajo);
        fase.reportes.push(reporte);
        fase.total++;
        if (reporte.status === "APROBADO") {
          fase.completados++;
        }
      });

      // Convertir a array
      const proyectosArray = Array.from(proyectosMap.values()).map(p => ({
        nombre: p.nombre,
        fases: Array.from(p.fases.values()).map((f: any) => ({
          nombre: f.nombre,
          reportes: f.reportes,
          total: f.total,
          completados: f.completados,
          porcentaje: f.total > 0 ? Math.round((f.completados / f.total) * 100) : 0
        }))
      }));

      setProyectos(proyectosArray);
      if (proyectosArray.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(proyectosArray[0].nombre);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar fases: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const getTipoTrabajoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      FIBRA_OPTICA: "Fibra Óptica",
      DATA_CENTER: "Data Center",
      ANTENAS: "Antenas",
      CCTV: "CCTV",
      INSTALACION_RED: "Instalación Red",
      MANTENIMIENTO: "Mantenimiento",
      OTRO: "Otro",
    };
    return labels[tipo] || tipo;
  };

  const proyectoActual = proyectos.find(p => p.nombre === proyectoSeleccionado);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando fases...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/proyectos")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
                <Layers className="h-6 w-6" />
                Fases de Proyectos
              </CardTitle>
              <CardDescription>
                Organización de reportes por tipo de trabajo (fases)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Selector de proyecto */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {proyectos.map((proyecto) => (
                <option key={proyecto.nombre} value={proyecto.nombre}>
                  {proyecto.nombre} ({proyecto.fases.length} {proyecto.fases.length === 1 ? "fase" : "fases"})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Fases del proyecto */}
        {proyectoActual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proyectoActual.fases.map((fase, index) => (
              <Card key={index} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                      {getTipoTrabajoLabel(fase.nombre)}
                    </CardTitle>
                    <Badge variant={fase.porcentaje === 100 ? "default" : "secondary"} className={fase.porcentaje === 100 ? "bg-green-500" : ""}>
                      {fase.porcentaje}%
                    </Badge>
                  </div>
                  <CardDescription>
                    {fase.completados} de {fase.total} reportes completados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${fase.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Lista de reportes */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {fase.reportes.map((reporte: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition"
                        onClick={() => router.push(`/reportes/${reporte.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          {reporte.status === "APROBADO" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : reporte.status === "ENVIADO" ? (
                            <Clock className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Reporte #{idx + 1}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(reporte.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {proyectoActual.fases.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  No hay fases registradas para este proyecto
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {proyectos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No hay proyectos con reportes registrados
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
