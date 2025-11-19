"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  FileText,
  MapPin,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Layers,
  BarChart3,
  Activity
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Tab = "timeline" | "avance" | "fases";

interface TimelineItem {
  id: string;
  fecha: Date;
  proyecto: string;
  tipoTrabajo: string;
  direccion?: string;
  status: string;
}

interface ProyectoAvance {
  nombre: string;
  total: number;
  aprobados: number;
  enviados: number;
  borradores: number;
  rechazados: number;
  porcentaje: number;
}

interface FaseProyecto {
  nombre: string;
  reportes: any[];
  total: number;
  completados: number;
  porcentaje: number;
}

interface ProyectoFases {
  nombre: string;
  fases: FaseProyecto[];
}

export default function SeguimientoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  // Timeline state
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [proyectoTimeline, setProyectoTimeline] = useState<string>("");
  const [proyectosLista, setProyectosLista] = useState<string[]>([]);

  // Avance state
  const [proyectosAvance, setProyectosAvance] = useState<ProyectoAvance[]>([]);

  // Fases state
  const [proyectosFases, setProyectosFases] = useState<ProyectoFases[]>([]);
  const [proyectoFasesSeleccionado, setProyectoFasesSeleccionado] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("id, createdAt, proyecto, tipoTrabajo, direccion, status")
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Timeline data
      const proyectosUnicos = [...new Set(
        reportes?.map(r => r.proyecto).filter(Boolean) || []
      )] as string[];
      setProyectosLista(proyectosUnicos);

      const items: TimelineItem[] = reportes?.map(r => ({
        id: r.id,
        fecha: new Date(r.createdAt),
        proyecto: r.proyecto || "Sin proyecto",
        tipoTrabajo: r.tipoTrabajo,
        direccion: r.direccion,
        status: r.status
      })) || [];
      setTimelineItems(items);

      // Avance data
      const avanceMap = new Map<string, ProyectoAvance>();
      reportes?.forEach(reporte => {
        if (!reporte.proyecto) return;
        const nombre = reporte.proyecto;

        if (!avanceMap.has(nombre)) {
          avanceMap.set(nombre, {
            nombre,
            total: 0,
            aprobados: 0,
            enviados: 0,
            borradores: 0,
            rechazados: 0,
            porcentaje: 0
          });
        }

        const proyecto = avanceMap.get(nombre)!;
        proyecto.total++;

        switch (reporte.status) {
          case "APROBADO": proyecto.aprobados++; break;
          case "ENVIADO": proyecto.enviados++; break;
          case "BORRADOR": proyecto.borradores++; break;
          case "RECHAZADO": proyecto.rechazados++; break;
        }
      });

      const avanceArray = Array.from(avanceMap.values()).map(p => ({
        ...p,
        porcentaje: p.total > 0 ? Math.round((p.aprobados / p.total) * 100) : 0
      }));
      avanceArray.sort((a, b) => b.porcentaje - a.porcentaje);
      setProyectosAvance(avanceArray);

      // Fases data
      const fasesMap = new Map<string, any>();
      reportes?.filter(r => r.proyecto).forEach(reporte => {
        const nombre = reporte.proyecto!;

        if (!fasesMap.has(nombre)) {
          fasesMap.set(nombre, {
            nombre,
            fases: new Map<string, any>()
          });
        }

        const proyecto = fasesMap.get(nombre);
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

      const fasesArray: ProyectoFases[] = Array.from(fasesMap.values()).map(p => ({
        nombre: p.nombre,
        fases: Array.from(p.fases.values()).map((f: any) => ({
          nombre: f.nombre,
          reportes: f.reportes,
          total: f.total,
          completados: f.completados,
          porcentaje: f.total > 0 ? Math.round((f.completados / f.total) * 100) : 0
        }))
      }));

      setProyectosFases(fasesArray);
      if (fasesArray.length > 0) {
        setProyectoFasesSeleccionado(fasesArray[0].nombre);
      }

    } catch (error: any) {
      console.error("Error:", error);
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "APROBADO": return "bg-emerald-100 text-emerald-700";
      case "ENVIADO": return "bg-blue-100 text-blue-700";
      case "RECHAZADO": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Filtered timeline items
  const timelineFiltrado = proyectoTimeline
    ? timelineItems.filter(item => item.proyecto === proyectoTimeline)
    : timelineItems;

  // Stats
  const totalReportes = proyectosAvance.reduce((sum, p) => sum + p.total, 0);
  const totalAprobados = proyectosAvance.reduce((sum, p) => sum + p.aprobados, 0);
  const totalPendientes = proyectosAvance.reduce((sum, p) => sum + p.enviados + p.borradores, 0);

  // Selected project for fases
  const proyectoFasesActual = proyectosFases.find(p => p.nombre === proyectoFasesSeleccionado);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            Seguimiento de Proyectos
          </h1>
          <p className="text-gray-500 mt-1">Timeline, avance y fases</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "timeline"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab("avance")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "avance"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Avance
          </button>
          <button
            onClick={() => setActiveTab("fases")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "fases"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="h-4 w-4" />
            Fases
          </button>
        </div>

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div>
            {/* Filtro */}
            <div className="mb-6">
              <select
                value={proyectoTimeline}
                onChange={(e) => setProyectoTimeline(e.target.value)}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm w-full sm:w-auto"
              >
                <option value="">Todos los proyectos</option>
                {proyectosLista.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Timeline */}
            {timelineFiltrado.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Sin reportes para mostrar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {timelineFiltrado.slice(0, 20).map((item, index) => (
                    <div
                      key={item.id}
                      className="relative pl-10 cursor-pointer"
                      onClick={() => router.push(`/reportes/${item.id}`)}
                    >
                      <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                        item.status === "APROBADO" ? "bg-emerald-500" :
                        item.status === "RECHAZADO" ? "bg-red-500" :
                        "bg-blue-500"
                      }`}></div>
                      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {getTipoTrabajoLabel(item.tipoTrabajo)}
                              </h3>
                              <p className="text-sm text-gray-500">{item.proyecto}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDateTime(item.fecha.toISOString())}</span>
                            </div>
                            {item.direccion && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{item.direccion}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avance Tab */}
        {activeTab === "avance" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{totalReportes}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-600">{totalAprobados}</p>
                  <p className="text-xs text-gray-500">Aprobados</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{totalPendientes}</p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress bars */}
            {proyectosAvance.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Sin proyectos para mostrar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {proyectosAvance.map((proyecto) => (
                  <Card key={proyecto.nombre} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{proyecto.nombre}</h3>
                        <span className="text-sm font-bold text-gray-700">{proyecto.porcentaje}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${proyecto.porcentaje}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-emerald-600">{proyecto.aprobados} aprobados</span>
                        <span className="text-blue-600">{proyecto.enviados} enviados</span>
                        <span className="text-red-600">{proyecto.rechazados} rechazados</span>
                        <span className="text-gray-600">{proyecto.borradores} borradores</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fases Tab */}
        {activeTab === "fases" && (
          <div>
            {/* Selector de proyecto */}
            <div className="mb-6">
              <select
                value={proyectoFasesSeleccionado}
                onChange={(e) => setProyectoFasesSeleccionado(e.target.value)}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm w-full sm:w-auto"
              >
                {proyectosFases.map(p => (
                  <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fases */}
            {!proyectoFasesActual || proyectoFasesActual.fases.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Sin fases para mostrar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {proyectoFasesActual.fases.map((fase) => (
                  <Card key={fase.nombre} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {fase.porcentaje === 100 ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {getTipoTrabajoLabel(fase.nombre)}
                          </h3>
                        </div>
                        <span className={`text-sm font-bold ${
                          fase.porcentaje === 100 ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {fase.completados}/{fase.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            fase.porcentaje === 100 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${fase.porcentaje}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
