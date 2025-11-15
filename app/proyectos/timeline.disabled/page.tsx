"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CalendarDays,
  CheckCircle2,
  Circle,
  Briefcase,
  FileText,
  ArrowLeft,
  TrendingUp
} from "lucide-react";

interface TimelineItem {
  id: string;
  tipo: "proyecto_inicio" | "proyecto_fin" | "reporte";
  fecha: Date;
  proyecto: any;
  reporte?: any;
  estado?: string;
}

export default function TimelinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener proyectos con sus reportes
      const { data: proyectosData, error: proyectosError } = await supabase
        .from("Proyecto")
        .select("*")
        .order("fechaInicio", { ascending: false });

      if (proyectosError) throw proyectosError;

      // Obtener todos los reportes relacionados con proyectos
      const { data: reportesData, error: reportesError } = await supabase
        .from("Reporte")
        .select("id, createdAt, tipoTrabajo, status, proyecto, proyectoId")
        .not("proyectoId", "is", null)
        .order("createdAt", { ascending: false });

      if (reportesError) throw reportesError;

      // Construir timeline
      const items: TimelineItem[] = [];

      // Agregar eventos de proyectos
      proyectosData?.forEach(p => {
        if (p.fechaInicio) {
          items.push({
            id: `${p.id}-inicio`,
            tipo: "proyecto_inicio",
            fecha: new Date(p.fechaInicio),
            proyecto: p,
            estado: p.estado
          });
        }

        if (p.fechaFin) {
          items.push({
            id: `${p.id}-fin`,
            tipo: "proyecto_fin",
            fecha: new Date(p.fechaFin),
            proyecto: p,
            estado: p.estado
          });
        }
      });

      // Agregar eventos de reportes
      reportesData?.forEach(r => {
        const proyecto = proyectosData?.find(p => p.id === r.proyectoId);
        if (proyecto) {
          items.push({
            id: `reporte-${r.id}`,
            tipo: "reporte",
            fecha: new Date(r.createdAt),
            proyecto: proyecto,
            reporte: r,
            estado: r.status
          });
        }
      });

      // Ordenar por fecha descendente
      items.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      setTimelineItems(items);
      setProyectos(proyectosData || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar timeline: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
      case "ENVIADO":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "COMPLETADO":
      case "APROBADO":
        return "bg-green-100 text-green-800 border-green-300";
      case "PAUSADO":
      case "BORRADOR":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CANCELADO":
      case "RECHAZADO":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTipoIcon = (item: TimelineItem) => {
    switch (item.tipo) {
      case "proyecto_inicio":
        return <Circle className="h-5 w-5 text-green-600 fill-green-600" />;
      case "proyecto_fin":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "reporte":
        return <FileText className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTipoLabel = (item: TimelineItem) => {
    switch (item.tipo) {
      case "proyecto_inicio":
        return "Inicio de Proyecto";
      case "proyecto_fin":
        return "Fin de Proyecto";
      case "reporte":
        return "Reporte Generado";
    }
  };

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(fecha);
  };

  const formatFechaCorta = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando timeline...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
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
              <CardTitle className="text-3xl text-blue-600 flex items-center gap-2">
                <Clock className="h-8 w-8" />
                Timeline de Proyectos
              </CardTitle>
              <CardDescription>
                Línea de tiempo de todos los eventos de proyectos mineros
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {proyectos.filter(p => p.estado === "ACTIVO").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {proyectos.length}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Eventos Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {timelineItems.length}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        {timelineItems.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay eventos</CardTitle>
              <CardDescription>
                Comienza creando proyectos para ver el timeline
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"></div>

            {/* Items del timeline */}
            <div className="space-y-8 relative">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-6 group">
                  {/* Icono */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 shadow-lg group-hover:scale-110 transition-transform">
                    {getTipoIcon(item)}
                  </div>

                  {/* Contenido */}
                  <Card className="flex-1 group-hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getEstadoColor(item.estado || "")}>
                              {getTipoLabel(item)}
                            </Badge>
                            {item.estado && (
                              <Badge className={getEstadoColor(item.estado)}>
                                {item.estado}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.proyecto.nombre}
                          </h3>

                          {item.proyecto.cliente && (
                            <p className="text-sm text-gray-600 mb-2">
                              Cliente: {item.proyecto.cliente}
                            </p>
                          )}

                          {item.tipo === "reporte" && item.reporte && (
                            <p className="text-sm text-gray-700">
                              Tipo: {item.reporte.tipoTrabajo?.replace(/_/g, " ")}
                            </p>
                          )}

                          {item.proyecto.descripcion && item.tipo !== "reporte" && (
                            <p className="text-sm text-gray-600 mt-2">
                              {item.proyecto.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatFechaCorta(item.fecha)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.fecha.toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
