"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Progress component - usando HTML nativo
import {
  TrendingUp,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

export default function AvancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener todos los reportes
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("id, proyecto, status")
        .not("proyecto", "is", null);

      if (error) throw error;

      // Agrupar por proyecto y calcular estadísticas
      const proyectosMap = new Map<string, any>();

      reportes?.forEach(reporte => {
        const nombreProyecto = reporte.proyecto || "Sin proyecto";

        if (!proyectosMap.has(nombreProyecto)) {
          proyectosMap.set(nombreProyecto, {
            nombre: nombreProyecto,
            total: 0,
            aprobados: 0,
            enviados: 0,
            borradores: 0,
            rechazados: 0
          });
        }

        const proyecto = proyectosMap.get(nombreProyecto);
        proyecto.total++;

        switch (reporte.status) {
          case "APROBADO":
            proyecto.aprobados++;
            break;
          case "ENVIADO":
            proyecto.enviados++;
            break;
          case "BORRADOR":
            proyecto.borradores++;
            break;
          case "RECHAZADO":
            proyecto.rechazados++;
            break;
        }
      });

      // Convertir a array y calcular porcentajes
      const proyectosArray = Array.from(proyectosMap.values()).map(p => ({
        ...p,
        porcentajeAprobado: p.total > 0 ? Math.round((p.aprobados / p.total) * 100) : 0,
        porcentajeCompletado: p.total > 0 ? Math.round(((p.aprobados + p.enviados) / p.total) * 100) : 0
      }));

      // Ordenar por porcentaje de completado
      proyectosArray.sort((a, b) => b.porcentajeCompletado - a.porcentajeCompletado);

      setProyectos(proyectosArray);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar avance: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando avance...</CardTitle>
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
                <TrendingUp className="h-6 w-6" />
                Avance de Proyectos
              </CardTitle>
              <CardDescription>
                Seguimiento del progreso de reportes por proyecto
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {proyectos.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {proyectos.reduce((sum, p) => sum + p.total, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aprobados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {proyectos.reduce((sum, p) => sum + p.aprobados, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {proyectos.reduce((sum, p) => sum + p.enviados + p.borradores, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Proyecto</CardTitle>
            <CardDescription>
              {proyectos.length} {proyectos.length === 1 ? "proyecto" : "proyectos"} activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {proyectos.map((proyecto, index) => (
                <div key={index} className="space-y-3 pb-6 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{proyecto.nombre}</h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {proyecto.porcentajeAprobado}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${proyecto.porcentajeAprobado}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{proyecto.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">Aprobados:</span>
                      <span className="font-semibold text-green-600">{proyecto.aprobados}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">Enviados:</span>
                      <span className="font-semibold text-blue-600">{proyecto.enviados}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-gray-600">Rechazados:</span>
                      <span className="font-semibold text-red-600">{proyecto.rechazados}</span>
                    </div>
                  </div>
                </div>
              ))}

              {proyectos.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay proyectos con reportes registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
