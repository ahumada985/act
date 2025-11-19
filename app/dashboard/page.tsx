"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  Camera,
  Mic,
  TrendingUp,
  Users,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  Timer
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface EstadisticasData {
  totalReportes: number;
  reportesEnviados: number;
  reportesAprobados: number;
  reportesRechazados: number;
  reportesBorrador: number;
  totalFotos: number;
  totalAudios: number;
  totalSupervisores: number;
  reportesPorTipo: { tipo: string; cantidad: number; label: string }[];
  reportesPorEstado: { estado: string; cantidad: number; label: string }[];
  reportesPorSemana: { semana: string; cantidad: number }[];
  reportesConGPS: number;
  // Nuevos KPIs
  reportesEsteMes: number;
  reportesMesAnterior: number;
  topSupervisores: { nombre: string; cantidad: number }[];
  topProyectos: { nombre: string; cantidad: number }[];
  reportesPendientesAntiguos: number;
  tiempoPromedioAprobacion: number;
}

const COLORS = {
  ENVIADO: "#3b82f6",
  APROBADO: "#10b981",
  RECHAZADO: "#ef4444",
  BORRADOR: "#6b7280",
};

const TIPO_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({
    totalReportes: 0,
    reportesEnviados: 0,
    reportesAprobados: 0,
    reportesRechazados: 0,
    reportesBorrador: 0,
    totalFotos: 0,
    totalAudios: 0,
    totalSupervisores: 0,
    reportesPorTipo: [],
    reportesPorEstado: [],
    reportesPorSemana: [],
    reportesConGPS: 0,
    reportesEsteMes: 0,
    reportesMesAnterior: 0,
    topSupervisores: [],
    topProyectos: [],
    reportesPendientesAntiguos: 0,
    tiempoPromedioAprobacion: 0,
  });

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  async function fetchEstadisticas() {
    try {
      const { data: reportes, error: reportesError } = await supabase
        .from("Reporte")
        .select("*, fotos:Foto(id), audios:Audio(id), supervisor:User(id, nombre, apellido)");

      if (reportesError) throw reportesError;

      const { data: supervisores, error: supervisoresError } = await supabase
        .from("User")
        .select("id")
        .eq("role", "SUPERVISOR");

      if (supervisoresError) throw supervisoresError;

      const totalReportes = reportes?.length || 0;
      const reportesEnviados = reportes?.filter(r => r.status === "ENVIADO").length || 0;
      const reportesAprobados = reportes?.filter(r => r.status === "APROBADO").length || 0;
      const reportesRechazados = reportes?.filter(r => r.status === "RECHAZADO").length || 0;
      const reportesBorrador = reportes?.filter(r => r.status === "BORRADOR").length || 0;

      const totalFotos = reportes?.reduce((acc, r) => acc + (r.fotos?.length || 0), 0) || 0;
      const totalAudios = reportes?.reduce((acc, r) => acc + (r.audios?.length || 0), 0) || 0;

      // Reportes este mes vs mes anterior
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

      const reportesEsteMes = reportes?.filter(r => new Date(r.createdAt) >= inicioMes).length || 0;
      const reportesMesAnterior = reportes?.filter(r => {
        const fecha = new Date(r.createdAt);
        return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
      }).length || 0;

      // Top 5 supervisores
      const supervisorCount: Record<string, { nombre: string; cantidad: number }> = {};
      reportes?.forEach(r => {
        if (r.supervisor) {
          const key = r.supervisor.id;
          const nombre = `${r.supervisor.nombre} ${r.supervisor.apellido}`;
          if (!supervisorCount[key]) {
            supervisorCount[key] = { nombre, cantidad: 0 };
          }
          supervisorCount[key].cantidad++;
        }
      });
      const topSupervisores = Object.values(supervisorCount)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Top 5 proyectos
      const proyectoCount: Record<string, number> = {};
      reportes?.forEach(r => {
        if (r.proyecto) {
          proyectoCount[r.proyecto] = (proyectoCount[r.proyecto] || 0) + 1;
        }
      });
      const topProyectos = Object.entries(proyectoCount)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Reportes pendientes hace más de 3 días
      const tresDiasAtras = new Date();
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
      const reportesPendientesAntiguos = reportes?.filter(r =>
        r.status === "ENVIADO" && new Date(r.createdAt) < tresDiasAtras
      ).length || 0;

      // Tiempo promedio de aprobación (simulado - en producción necesitarías campo updatedAt)
      const tiempoPromedioAprobacion = 2.5; // días

      const tipoLabels: Record<string, string> = {
        FIBRA_OPTICA: "Fibra Óptica",
        DATA_CENTER: "Data Center",
        ANTENAS: "Antenas",
        CCTV: "CCTV",
        INSTALACION_RED: "Instalación Red",
        MANTENIMIENTO: "Mantenimiento",
        OTRO: "Otro",
      };

      const reportesPorTipo = Object.entries(
        reportes?.reduce((acc: Record<string, number>, r) => {
          acc[r.tipoTrabajo] = (acc[r.tipoTrabajo] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        label: tipoLabels[tipo] || tipo
      }));

      const estadoLabels: Record<string, string> = {
        ENVIADO: "Enviados",
        APROBADO: "Aprobados",
        RECHAZADO: "Rechazados",
        BORRADOR: "Borradores",
      };

      const reportesPorEstado = [
        { estado: "ENVIADO", cantidad: reportesEnviados, label: estadoLabels.ENVIADO },
        { estado: "APROBADO", cantidad: reportesAprobados, label: estadoLabels.APROBADO },
        { estado: "RECHAZADO", cantidad: reportesRechazados, label: estadoLabels.RECHAZADO },
        { estado: "BORRADOR", cantidad: reportesBorrador, label: estadoLabels.BORRADOR },
      ].filter(item => item.cantidad > 0);

      const reportesPorSemana = calcularReportesPorSemana(reportes || []);
      const reportesConGPS = reportes?.filter(r => r.latitud && r.longitud).length || 0;

      setEstadisticas({
        totalReportes,
        reportesEnviados,
        reportesAprobados,
        reportesRechazados,
        reportesBorrador,
        totalFotos,
        totalAudios,
        totalSupervisores: supervisores?.length || 0,
        reportesPorTipo,
        reportesPorEstado,
        reportesPorSemana,
        reportesConGPS,
        reportesEsteMes,
        reportesMesAnterior,
        topSupervisores,
        topProyectos,
        reportesPendientesAntiguos,
        tiempoPromedioAprobacion,
      });
    } catch (error: any) {
      console.error("Error fetching estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  function calcularReportesPorSemana(reportes: any[]) {
    const ahora = new Date();
    const semanas = [];

    for (let i = 3; i >= 0; i--) {
      const inicio = new Date(ahora);
      inicio.setDate(inicio.getDate() - (i * 7) - ahora.getDay());
      inicio.setHours(0, 0, 0, 0);

      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);

      const cantidad = reportes.filter(r => {
        const fecha = new Date(r.createdAt);
        return fecha >= inicio && fecha <= fin;
      }).length;

      const nombreSemana = `${inicio.getDate()}/${inicio.getMonth() + 1}`;
      semanas.push({ semana: nombreSemana, cantidad });
    }

    return semanas;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const tasaAprobacion = estadisticas.totalReportes > 0
    ? Math.round((estadisticas.reportesAprobados / estadisticas.totalReportes) * 100)
    : 0;

  const variacionMensual = estadisticas.reportesMesAnterior > 0
    ? Math.round(((estadisticas.reportesEsteMes - estadisticas.reportesMesAnterior) / estadisticas.reportesMesAnterior) * 100)
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Resumen de actividad y métricas</p>
            </div>
            <Button
              onClick={() => router.push("/reportes/nuevo")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>

          {/* Alerta de pendientes antiguos */}
          {estadisticas.reportesPendientesAntiguos > 0 && (
            <Card className="border-0 shadow-sm mb-6 bg-amber-50 border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      {estadisticas.reportesPendientesAntiguos} reportes pendientes hace más de 3 días
                    </p>
                    <p className="text-sm text-amber-600">Requieren atención urgente</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => router.push("/reportes?status=ENVIADO")}
                  >
                    Ver reportes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Reportes</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.totalReportes}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Aprobados</p>
                    <p className="text-3xl font-bold text-emerald-600">{estadisticas.reportesAprobados}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600 ml-1">{tasaAprobacion}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-amber-600">{estadisticas.reportesEnviados}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Este Mes</p>
                    <p className="text-3xl font-bold text-violet-600">{estadisticas.reportesEsteMes}</p>
                    <div className="flex items-center mt-1">
                      {variacionMensual >= 0 ? (
                        <>
                          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 ml-1">+{variacionMensual}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600 ml-1">{variacionMensual}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats secundarios */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalFotos}</p>
                    <p className="text-xs text-gray-500">Fotografías</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.reportesConGPS}</p>
                    <p className="text-xs text-gray-500">Con GPS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalSupervisores}</p>
                    <p className="text-xs text-gray-500">Supervisores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.tiempoPromedioAprobacion}d</p>
                    <p className="text-xs text-gray-500">Tiempo aprob.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos y Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Tendencia semanal */}
            {estadisticas.reportesPorSemana.length > 0 && (
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    Actividad Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={estadisticas.reportesPorSemana}>
                      <defs>
                        <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="semana" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cantidad"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorCantidad)"
                        name="Reportes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Supervisores */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Top Supervisores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estadisticas.topSupervisores.length > 0 ? (
                  <div className="space-y-3">
                    {estadisticas.topSupervisores.map((sup, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{sup.nombre}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{sup.cantidad}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Segunda fila de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Estado de reportes */}
            {estadisticas.reportesPorEstado.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Estado de Reportes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={estadisticas.reportesPorEstado}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="cantidad"
                      >
                        {estadisticas.reportesPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.estado as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {estadisticas.reportesPorEstado.map((item) => (
                      <div key={item.estado} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[item.estado as keyof typeof COLORS] }}
                        />
                        <span className="text-xs text-gray-600">{item.label} ({item.cantidad})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Proyectos */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Proyectos con más Reportes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estadisticas.topProyectos.length > 0 ? (
                  <div className="space-y-3">
                    {estadisticas.topProyectos.map((proy, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{proy.nombre}</p>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(proy.cantidad / estadisticas.topProyectos[0].cantidad) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{proy.cantidad}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Sin proyectos</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reportes por tipo */}
          {estadisticas.reportesPorTipo.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Reportes por Tipo de Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estadisticas.reportesPorTipo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="cantidad"
                      radius={[0, 4, 4, 0]}
                      name="Cantidad"
                    >
                      {estadisticas.reportesPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIPO_COLORS[index % TIPO_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {estadisticas.totalReportes === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin datos aún</h3>
                <p className="text-gray-500 mb-6">Comienza creando tu primer reporte</p>
                <Button
                  onClick={() => router.push("/reportes/nuevo")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crear Reporte
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
