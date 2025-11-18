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
  FileText,
  ArrowLeft,
  MapPin
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface TimelineItem {
  id: string;
  tipo: "reporte";
  fecha: Date;
  proyecto: string;
  tipoTrabajo: string;
  direccion?: string;
  status: string;
}

export default function TimelinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>("");
  const [proyectos, setProyectos] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener todos los reportes
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("id, createdAt, proyecto, tipoTrabajo, direccion, status")
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Extraer lista única de proyectos
      const proyectosUnicos = [...new Set(
        reportes?.map(r => r.proyecto).filter(Boolean) || []
      )];
      setProyectos(proyectosUnicos as string[]);

      // Crear items de timeline
      const items: TimelineItem[] = reportes?.map(r => ({
        id: r.id,
        tipo: "reporte",
        fecha: new Date(r.createdAt),
        proyecto: r.proyecto || "Sin proyecto",
        tipoTrabajo: r.tipoTrabajo,
        direccion: r.direccion,
        status: r.status
      })) || [];

      setTimelineItems(items);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar timeline: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const itemsFiltrados = proyectoSeleccionado
    ? timelineItems.filter(item => item.proyecto === proyectoSeleccionado)
    : timelineItems;

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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      BORRADOR: { label: "Borrador", color: "bg-gray-500" },
      ENVIADO: { label: "Enviado", color: "bg-blue-500" },
      APROBADO: { label: "Aprobado", color: "bg-green-500" },
      RECHAZADO: { label: "Rechazado", color: "bg-red-500" },
    };
    const statusConfig = config[status] || { label: status, color: "bg-gray-500" };
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    );
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
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
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
                <Clock className="h-6 w-6" />
                Timeline de Reportes
              </CardTitle>
              <CardDescription>
                Línea de tiempo de todos los reportes registrados
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Filtro por proyecto */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Todos los proyectos ({timelineItems.length})</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto} value={proyecto}>
                  {proyecto} ({timelineItems.filter(i => i.proyecto === proyecto).length})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              {itemsFiltrados.length} {itemsFiltrados.length === 1 ? "Evento" : "Eventos"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              {/* Items del timeline */}
              <div className="space-y-6">
                {itemsFiltrados.map((item, index) => (
                  <div key={item.id} className="relative pl-12">
                    {/* Punto en la línea */}
                    <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>

                    {/* Contenido del evento */}
                    <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/reportes/${item.id}`)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarDays className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {formatDateTime(item.fecha.toISOString())}
                              </span>
                              {getStatusBadge(item.status)}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">
                              {getTipoTrabajoLabel(item.tipoTrabajo)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Proyecto:</strong> {item.proyecto}
                            </p>
                            {item.direccion && (
                              <div className="flex items-start gap-1 text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>{item.direccion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {itemsFiltrados.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay eventos en el timeline para este filtro
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
