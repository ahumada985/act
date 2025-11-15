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
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  Rocket,
  Target,
  Award,
  MapPin,
  Calendar
} from "lucide-react";

type Fase = "PLANIFICACION" | "EJECUCION" | "FINALIZACION";

interface FaseInfo {
  nombre: string;
  descripcion: string;
  icon: any;
  color: string;
  bgColor: string;
}

const FASES_CONFIG: Record<Fase, FaseInfo> = {
  PLANIFICACION: {
    nombre: "Planificación",
    descripcion: "Reportes iniciales y de planificación del proyecto",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  EJECUCION: {
    nombre: "Ejecución",
    descripcion: "Reportes durante la ejecución del proyecto",
    icon: Rocket,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  FINALIZACION: {
    nombre: "Finalización",
    descripcion: "Reportes finales y de cierre del proyecto",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  }
};

interface ProyectoConFases {
  id: string;
  nombre: string;
  cliente: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  reportesPorFase: Record<Fase, any[]>;
}

export default function FasesProyectosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<ProyectoConFases[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    fetchProyectosConFases();
  }, []);

  async function fetchProyectosConFases() {
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

      // Organizar reportes por proyecto y fase
      const proyectosConFases: ProyectoConFases[] = (proyectosData || []).map(p => {
        const reportesProyecto = (reportesData || []).filter(r => r.proyectoId === p.id);

        // Calcular fases basadas en el tiempo del proyecto
        const fechaInicio = new Date(p.fechaInicio);
        const fechaFin = p.fechaFin ? new Date(p.fechaFin) : new Date();
        const duracionTotal = fechaFin.getTime() - fechaInicio.getTime();

        // Dividir el proyecto en 3 fases: 30% planificación, 50% ejecución, 20% finalización
        const finPlanificacion = new Date(fechaInicio.getTime() + (duracionTotal * 0.3));
        const finEjecucion = new Date(fechaInicio.getTime() + (duracionTotal * 0.8));

        // Clasificar reportes por fase según su fecha de creación
        const reportesPorFase: Record<Fase, any[]> = {
          PLANIFICACION: [],
          EJECUCION: [],
          FINALIZACION: []
        };

        reportesProyecto.forEach(reporte => {
          const fechaReporte = new Date(reporte.createdAt);

          if (fechaReporte <= finPlanificacion) {
            reportesPorFase.PLANIFICACION.push(reporte);
          } else if (fechaReporte <= finEjecucion) {
            reportesPorFase.EJECUCION.push(reporte);
          } else {
            reportesPorFase.FINALIZACION.push(reporte);
          }
        });

        return {
          id: p.id,
          nombre: p.nombre,
          cliente: p.cliente,
          estado: p.estado,
          fechaInicio: p.fechaInicio,
          fechaFin: p.fechaFin,
          reportesPorFase
        };
      });

      setProyectos(proyectosConFases);

      // Seleccionar automáticamente el primer proyecto activo
      const primerActivo = proyectosConFases.find(p => p.estado === "ACTIVO");
      if (primerActivo) {
        setProyectoSeleccionado(primerActivo.id);
      } else if (proyectosConFases.length > 0) {
        setProyectoSeleccionado(proyectosConFases[0].id);
      }
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

  const proyectoActual = proyectos.find(p => p.id === proyectoSeleccionado);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando fases de proyectos...</CardTitle>
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
                <Layers className="h-8 w-8" />
                Reportes por Fases del Proyecto
              </CardTitle>
              <CardDescription>
                Organización de reportes según las fases del proyecto minero
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Selector de Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seleccionar Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {proyectos.map((proyecto) => (
                <button
                  key={proyecto.id}
                  onClick={() => setProyectoSeleccionado(proyecto.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    proyectoSeleccionado === proyecto.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{proyecto.nombre}</h4>
                    <Badge className={getEstadoColor(proyecto.estado)}>
                      {proyecto.estado}
                    </Badge>
                  </div>
                  {proyecto.cliente && (
                    <p className="text-sm text-gray-600 mb-2">{proyecto.cliente}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {Object.values(proyecto.reportesPorFase).flat().length} reportes
                    </span>
                    <span>•</span>
                    <span>
                      {Object.keys(proyecto.reportesPorFase).filter(
                        fase => proyecto.reportesPorFase[fase as Fase].length > 0
                      ).length} fases activas
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fases del Proyecto Seleccionado */}
        {proyectoActual ? (
          <div className="space-y-6">
            {/* Info del Proyecto */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{proyectoActual.nombre}</CardTitle>
                    {proyectoActual.cliente && (
                      <p className="text-sm text-gray-600">
                        Cliente: <strong>{proyectoActual.cliente}</strong>
                      </p>
                    )}
                  </div>
                  <Badge className={getEstadoColor(proyectoActual.estado)}>
                    {proyectoActual.estado}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                  {proyectoActual.fechaInicio && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Inicio: <strong>{new Date(proyectoActual.fechaInicio).toLocaleDateString('es-CL')}</strong>
                      </span>
                    </div>
                  )}
                  {proyectoActual.fechaFin && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Fin: <strong>{new Date(proyectoActual.fechaFin).toLocaleDateString('es-CL')}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Fases */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(Object.keys(FASES_CONFIG) as Fase[]).map((fase) => {
                const faseConfig = FASES_CONFIG[fase];
                const reportes = proyectoActual.reportesPorFase[fase];
                const IconComponent = faseConfig.icon;

                return (
                  <Card key={fase} className={`border-2 ${faseConfig.bgColor}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-white border ${faseConfig.color}`}>
                          <IconComponent className={`h-6 w-6 ${faseConfig.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{faseConfig.nombre}</CardTitle>
                          <p className="text-xs text-gray-600 mt-1">
                            {reportes.length} {reportes.length === 1 ? "reporte" : "reportes"}
                          </p>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {faseConfig.descripcion}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {reportes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Sin reportes en esta fase</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {reportes
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((reporte) => (
                              <div
                                key={reporte.id}
                                className="p-3 bg-white rounded-lg border hover:shadow-md transition cursor-pointer"
                                onClick={() => router.push(`/reportes/${reporte.id}`)}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {reporte.tipoTrabajo?.replace(/_/g, " ")}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <p className="text-xs text-gray-600">
                                          {new Date(reporte.createdAt).toLocaleDateString('es-CL')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
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

                                {reporte.direccion && (
                                  <div className="flex items-start gap-1 text-xs text-gray-600">
                                    <MapPin className="h-3 w-3 mt-0.5" />
                                    <p className="line-clamp-1">{reporte.direccion}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumen de Fases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Resumen de Progreso por Fases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Object.keys(FASES_CONFIG) as Fase[]).map((fase) => {
                    const faseConfig = FASES_CONFIG[fase];
                    const reportes = proyectoActual.reportesPorFase[fase];
                    const aprobados = reportes.filter(r => r.status === "APROBADO").length;
                    const porcentaje = reportes.length > 0
                      ? Math.round((aprobados / reportes.length) * 100)
                      : 0;

                    return (
                      <div key={fase}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${faseConfig.color.replace('text-', 'bg-')}`} />
                            <span className="text-sm font-medium text-gray-700">
                              {faseConfig.nombre}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {aprobados} / {reportes.length} aprobados ({porcentaje}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${faseConfig.color.replace('text-', 'bg-')}`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No hay proyectos</CardTitle>
              <CardDescription>
                Comienza creando proyectos para ver sus fases
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
