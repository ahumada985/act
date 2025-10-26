"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  MapPin
} from "lucide-react";

interface ProyectoConAvance {
  id: string;
  nombre: string;
  cliente: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  presupuesto: number;
  reportes: any[];
  totalReportes: number;
  reportesAprobados: number;
  reportesEnviados: number;
  reportesBorrador: number;
  reportesRechazados: number;
  porcentajeAvance: number;
  diasTranscurridos: number;
  diasTotales: number;
  porcentajeTiempo: number;
}

export default function AvanceProyectosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<ProyectoConAvance[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  useEffect(() => {
    fetchProyectosConAvance();
  }, []);

  async function fetchProyectosConAvance() {
    try {
      // Obtener proyectos
      const { data: proyectosData, error: proyectosError } = await supabase
        .from("Proyecto")
        .select("*")
        .order("fechaInicio", { ascending: false });

      if (proyectosError) throw proyectosError;

      // Obtener todos los reportes
      const { data: reportesData, error: reportesError } = await supabase
        .from("Reporte")
        .select("*")
        .not("proyectoId", "is", null);

      if (reportesError) throw reportesError;

      // Calcular avance por proyecto
      const proyectosConAvance: ProyectoConAvance[] = (proyectosData || []).map(p => {
        const reportesProyecto = (reportesData || []).filter(r => r.proyectoId === p.id);

        const reportesAprobados = reportesProyecto.filter(r => r.status === "APROBADO").length;
        const reportesEnviados = reportesProyecto.filter(r => r.status === "ENVIADO").length;
        const reportesBorrador = reportesProyecto.filter(r => r.status === "BORRADOR").length;
        const reportesRechazados = reportesProyecto.filter(r => r.status === "RECHAZADO").length;

        // Calcular porcentaje de avance basado en reportes aprobados
        const totalReportes = reportesProyecto.length;
        const porcentajeAvance = totalReportes > 0
          ? Math.round((reportesAprobados / totalReportes) * 100)
          : 0;

        // Calcular avance temporal
        const fechaInicio = new Date(p.fechaInicio);
        const fechaFin = p.fechaFin ? new Date(p.fechaFin) : new Date();
        const hoy = new Date();

        const diasTotales = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const diasTranscurridos = Math.ceil((hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const porcentajeTiempo = diasTotales > 0
          ? Math.min(Math.round((diasTranscurridos / diasTotales) * 100), 100)
          : 0;

        return {
          ...p,
          reportes: reportesProyecto,
          totalReportes,
          reportesAprobados,
          reportesEnviados,
          reportesBorrador,
          reportesRechazados,
          porcentajeAvance,
          diasTranscurridos: Math.max(diasTranscurridos, 0),
          diasTotales: Math.max(diasTotales, 0),
          porcentajeTiempo: Math.max(porcentajeTiempo, 0)
        };
      });

      setProyectos(proyectosConAvance);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar proyectos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETADO":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PAUSADO":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getAvanceColor = (porcentaje: number) => {
    if (porcentaje >= 80) return "bg-green-500";
    if (porcentaje >= 50) return "bg-blue-500";
    if (porcentaje >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (porcentajeAvance: number, porcentajeTiempo: number) => {
    if (porcentajeAvance >= porcentajeTiempo) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (porcentajeAvance >= porcentajeTiempo - 20) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const proyectosFiltrados = filtroEstado
    ? proyectos.filter(p => p.estado === filtroEstado)
    : proyectos;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando avance de proyectos...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-7xl mx-auto space-y-6 py-6 px-4">
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
                <BarChart3 className="h-8 w-8" />
                Reportes de Avance por Proyecto
              </CardTitle>
              <CardDescription>
                Seguimiento del progreso de cada proyecto minero
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
              <div className="flex gap-2">
                <Button
                  variant={filtroEstado === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado("")}
                >
                  Todos ({proyectos.length})
                </Button>
                <Button
                  variant={filtroEstado === "ACTIVO" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado("ACTIVO")}
                >
                  Activos ({proyectos.filter(p => p.estado === "ACTIVO").length})
                </Button>
                <Button
                  variant={filtroEstado === "COMPLETADO" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado("COMPLETADO")}
                >
                  Completados ({proyectos.filter(p => p.estado === "COMPLETADO").length})
                </Button>
                <Button
                  variant={filtroEstado === "PAUSADO" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado("PAUSADO")}
                >
                  Pausados ({proyectos.filter(p => p.estado === "PAUSADO").length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Proyectos con Avance */}
        {proyectosFiltrados.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay proyectos</CardTitle>
              <CardDescription>
                No se encontraron proyectos con los filtros seleccionados
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {proyectosFiltrados.map((proyecto) => (
              <Card key={proyecto.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header del Proyecto */}
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{proyecto.nombre}</CardTitle>
                        <Badge className={getEstadoColor(proyecto.estado)}>
                          {proyecto.estado}
                        </Badge>
                        {getStatusIcon(proyecto.porcentajeAvance, proyecto.porcentajeTiempo)}
                      </div>
                      {proyecto.cliente && (
                        <p className="text-sm text-gray-600 mb-1">
                          Cliente: <span className="font-semibold">{proyecto.cliente}</span>
                        </p>
                      )}
                      {proyecto.descripcion && (
                        <p className="text-sm text-gray-700">{proyecto.descripcion}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Métricas Principales */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Total Reportes</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {proyecto.totalReportes}
                          </p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Aprobados</p>
                          <p className="text-2xl font-bold text-green-600">
                            {proyecto.reportesAprobados}
                          </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">En Proceso</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {proyecto.reportesEnviados + proyecto.reportesBorrador}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">% Avance</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {proyecto.porcentajeAvance}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progreso de Reportes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso de Reportes
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {proyecto.reportesAprobados} / {proyecto.totalReportes}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getAvanceColor(proyecto.porcentajeAvance)}`}
                        style={{ width: `${proyecto.porcentajeAvance}%` }}
                      />
                    </div>
                  </div>

                  {/* Barra de Progreso Temporal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso Temporal
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {proyecto.diasTranscurridos} / {proyecto.diasTotales} días
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${proyecto.porcentajeTiempo}%` }}
                      />
                    </div>
                  </div>

                  {/* Fechas del Proyecto */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 pt-2 border-t">
                    {proyecto.fechaInicio && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Inicio: <strong>{new Date(proyecto.fechaInicio).toLocaleDateString('es-CL')}</strong>
                        </span>
                      </div>
                    )}
                    {proyecto.fechaFin && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Fin: <strong>{new Date(proyecto.fechaFin).toLocaleDateString('es-CL')}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Últimos Reportes */}
                  {proyecto.reportes.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Últimos Reportes ({proyecto.reportes.slice(0, 5).length} de {proyecto.reportes.length})
                      </h4>
                      <div className="space-y-2">
                        {proyecto.reportes
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((reporte) => (
                            <div
                              key={reporte.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                              onClick={() => router.push(`/reportes/${reporte.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {reporte.tipoTrabajo?.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(reporte.createdAt).toLocaleDateString('es-CL')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {reporte.latitud && reporte.longitud && (
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                )}
                                <Badge
                                  variant="outline"
                                  className={
                                    reporte.status === "APROBADO"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : reporte.status === "ENVIADO"
                                      ? "bg-blue-100 text-blue-800 border-blue-300"
                                      : reporte.status === "RECHAZADO"
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : "bg-gray-100 text-gray-800 border-gray-300"
                                  }
                                >
                                  {reporte.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                      {proyecto.reportes.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => router.push(`/reportes?proyectoId=${proyecto.id}`)}
                        >
                          Ver todos los reportes ({proyecto.reportes.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
