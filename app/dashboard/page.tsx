"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Mic,
  TrendingUp,
  Users,
  MapPin,
  Briefcase,
  Building2
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
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// import { PERMISSIONS } from "@/lib/rbac/permissions"; // No usado

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
  // Nuevas métricas de minería
  totalProyectos: number;
  proyectosActivos: number;
  reportesPorProyecto: { proyecto: string; cantidad: number; cliente: string }[];
  reportesPorCliente: { cliente: string; cantidad: number }[];
  reportesConGPS: number;
}

const COLORS = {
  ENVIADO: "#3b82f6",
  APROBADO: "#22c55e",
  RECHAZADO: "#ef4444",
  BORRADOR: "#6b7280",
};

const TIPO_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1"
];

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
    totalProyectos: 0,
    proyectosActivos: 0,
    reportesPorProyecto: [],
    reportesPorCliente: [],
    reportesConGPS: 0,
  });

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  async function fetchEstadisticas() {
    try {
      // Obtener todos los reportes
      const { data: reportes, error: reportesError } = await supabase
        .from("Reporte")
        .select("*, fotos:Foto(id), audios:Audio(id)");

      if (reportesError) throw reportesError;

      // Obtener supervisores únicos
      const { data: supervisores, error: supervisoresError } = await supabase
        .from("User")
        .select("id")
        .eq("role", "SUPERVISOR");

      if (supervisoresError) throw supervisoresError;

      // DESHABILITADO - tabla Proyecto no existe
      // const { data: proyectos, error: proyectosError } = await supabase
      //   .from("Proyecto")
      //   .select("*");

      // if (proyectosError) throw proyectosError;

      // Calcular estadísticas
      const totalReportes = reportes?.length || 0;
      const reportesEnviados = reportes?.filter(r => r.status === "ENVIADO").length || 0;
      const reportesAprobados = reportes?.filter(r => r.status === "APROBADO").length || 0;
      const reportesRechazados = reportes?.filter(r => r.status === "RECHAZADO").length || 0;
      const reportesBorrador = reportes?.filter(r => r.status === "BORRADOR").length || 0;

      const totalFotos = reportes?.reduce((acc, r) => acc + (r.fotos?.length || 0), 0) || 0;
      const totalAudios = reportes?.reduce((acc, r) => acc + (r.audios?.length || 0), 0) || 0;

      // Reportes por tipo
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

      // Reportes por estado
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

      // Reportes por semana (últimas 4 semanas)
      const reportesPorSemana = calcularReportesPorSemana(reportes || []);

      // Nuevas métricas de minería
      const totalProyectos = 0; // DESHABILITADO - tabla Proyecto no existe
      const proyectosActivos = 0; // DESHABILITADO - tabla Proyecto no existe
      const reportesConGPS = reportes?.filter(r => r.latitud && r.longitud).length || 0;

      // DESHABILITADO - tabla Proyecto no existe
      // Reportes por proyecto (top 10)
      // const reportesPorProyectoMap: Record<string, { cantidad: number; cliente: string }> = {};
      // reportes?.forEach(r => {
      //   if (r.proyectoId) {
      //     const proyecto = proyectos?.find(p => p.id === r.proyectoId);
      //     if (proyecto) {
      //       if (!reportesPorProyectoMap[proyecto.nombre]) {
      //         reportesPorProyectoMap[proyecto.nombre] = { cantidad: 0, cliente: proyecto.cliente || "Sin cliente" };
      //       }
      //       reportesPorProyectoMap[proyecto.nombre].cantidad++;
      //     }
      //   }
      // });

      // const reportesPorProyecto = Object.entries(reportesPorProyectoMap)
      //   .map(([proyecto, data]) => ({
      //     proyecto,
      //     cantidad: data.cantidad,
      //     cliente: data.cliente
      //   }))
      //   .sort((a, b) => b.cantidad - a.cantidad)
      //   .slice(0, 10);

      const reportesPorProyecto: { proyecto: string; cantidad: number; cliente: string }[] = [];

      // DESHABILITADO - tabla Proyecto no existe
      // Reportes por cliente minero
      // const reportesPorClienteMap: Record<string, number> = {};
      // reportes?.forEach(r => {
      //   if (r.proyectoId) {
      //     const proyecto = proyectos?.find(p => p.id === r.proyectoId);
      //     if (proyecto && proyecto.cliente) {
      //       reportesPorClienteMap[proyecto.cliente] = (reportesPorClienteMap[proyecto.cliente] || 0) + 1;
      //     }
      //   }
      // });

      // const reportesPorCliente = Object.entries(reportesPorClienteMap)
      //   .map(([cliente, cantidad]) => ({ cliente, cantidad }))
      //   .sort((a, b) => b.cantidad - a.cantidad)
      //   .slice(0, 8);

      const reportesPorCliente: { cliente: string; cantidad: number }[] = [];

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
        totalProyectos,
        proyectosActivos,
        reportesPorProyecto,
        reportesPorCliente,
        reportesConGPS,
      });
    } catch (error: any) {
      console.error("Error fetching estadísticas:", error);
      alert("Error al cargar estadísticas: " + error.message);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando dashboard...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />
      <div className="max-w-7xl mx-auto space-y-6 py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Dashboard Northtek</h1>
            <p className="text-gray-600 mt-1">
              Estadísticas y métricas de reportes de terreno
            </p>
          </div>
          <Button onClick={() => router.push("/reportes")} size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Ver Reportes
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.totalReportes}</div>
              <p className="text-xs text-gray-600 mt-1">Reportes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.reportesAprobados}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {estadisticas.totalReportes > 0
                  ? `${Math.round((estadisticas.reportesAprobados / estadisticas.totalReportes) * 100)}%`
                  : "0%"}{" "}
                del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estadisticas.reportesEnviados}
              </div>
              <p className="text-xs text-gray-600 mt-1">Esperando revisión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supervisores</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {estadisticas.totalSupervisores}
              </div>
              <p className="text-xs text-gray-600 mt-1">Usuarios activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tarjetas de proyectos mineros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
              <Briefcase className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {estadisticas.totalProyectos}
              </div>
              <p className="text-xs text-gray-600 mt-1">Proyectos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {estadisticas.proyectosActivos}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {estadisticas.totalProyectos > 0
                  ? `${Math.round((estadisticas.proyectosActivos / estadisticas.totalProyectos) * 100)}%`
                  : "0%"}{" "}
                del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes con GPS</CardTitle>
              <MapPin className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {estadisticas.reportesConGPS}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {estadisticas.totalReportes > 0
                  ? `${Math.round((estadisticas.reportesConGPS / estadisticas.totalReportes) * 100)}%`
                  : "0%"}{" "}
                geolocalizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tarjetas de multimedia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fotografías</CardTitle>
              <Camera className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {estadisticas.totalFotos}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Promedio: {estadisticas.totalReportes > 0
                  ? (estadisticas.totalFotos / estadisticas.totalReportes).toFixed(1)
                  : "0"}{" "}
                por reporte
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audios de Voz</CardTitle>
              <Mic className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {estadisticas.totalAudios}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Promedio: {estadisticas.totalReportes > 0
                  ? (estadisticas.totalAudios / estadisticas.totalReportes).toFixed(1)
                  : "0"}{" "}
                por reporte
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de barras - Reportes por tipo */}
          {estadisticas.reportesPorTipo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reportes por Tipo de Trabajo</CardTitle>
                <CardDescription>Distribución de trabajos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estadisticas.reportesPorTipo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#3b82f6">
                      {estadisticas.reportesPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIPO_COLORS[index % TIPO_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de torta - Estado de reportes */}
          {estadisticas.reportesPorEstado.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Estado de Reportes</CardTitle>
                <CardDescription>Distribución por estado actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadisticas.reportesPorEstado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {estadisticas.reportesPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.estado as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráfico de línea - Tendencia semanal */}
        {estadisticas.reportesPorSemana.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencia de Reportes (Últimas 4 Semanas)
              </CardTitle>
              <CardDescription>Evolución semanal de reportes creados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estadisticas.reportesPorSemana}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Reportes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráficos de proyectos mineros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top proyectos más activos */}
          {estadisticas.reportesPorProyecto.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Top Proyectos Mineros
                </CardTitle>
                <CardDescription>Proyectos con más reportes generados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estadisticas.reportesPorProyecto} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="proyecto" type="category" width={150} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{payload[0].payload.proyecto}</p>
                              <p className="text-sm text-gray-600">{payload[0].payload.cliente}</p>
                              <p className="text-sm font-medium text-blue-600">
                                {payload[0].value} reportes
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Reportes por cliente minero */}
          {estadisticas.reportesPorCliente.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Reportes por Cliente Minero
                </CardTitle>
                <CardDescription>Distribución por empresa minera</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadisticas.reportesPorCliente}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ cliente, percent }) => `${cliente.split(" -")[0]} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {estadisticas.reportesPorCliente.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIPO_COLORS[index % TIPO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mensaje si no hay datos */}
        {estadisticas.totalReportes === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No hay datos disponibles</CardTitle>
              <CardDescription>
                Comienza creando reportes para ver estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/reportes/nuevo")} className="w-full">
                <FileText className="h-5 w-5 mr-2" />
                Crear Primer Reporte
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
