"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  ChevronRight,
  Mountain,
  ChevronDown,
  ChevronUp,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";
import { Header } from "@/components/layout/Header";

interface Faena {
  id: string;
  nombre: string;
  ubicacion: string;
  cliente: string;
  activa: boolean;
}

interface ProyectoStats {
  nombre: string;
  faena: string;
  totalReportes: number;
  aprobados: number;
  pendientes: number;
  rechazados: number;
  borradores: number;
  supervisores: Set<string>;
  ultimaActividad: string | null;
  porcentajeAprobacion: number;
}

export default function ProyectosPage() {
  const router = useRouter();
  const [faenas, setFaenas] = useState<Faena[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [faenasExpandidas, setFaenasExpandidas] = useState<Set<string>>(new Set());
  const [mostrarFormFaena, setMostrarFormFaena] = useState(false);
  const [nuevaFaena, setNuevaFaena] = useState({ nombre: "", ubicacion: "", cliente: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Cargar faenas
      const { data: faenasData } = await supabase
        .from("Faena")
        .select("*")
        .eq("activa", true)
        .order("nombre");

      setFaenas(faenasData || []);

      // Cargar reportes
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("proyecto, faena, status, createdAt, supervisorId")
        .not("proyecto", "is", null)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Agrupar por proyecto
      const proyectosMap: Record<string, ProyectoStats> = {};

      reportes?.forEach(r => {
        if (!r.proyecto) return;

        if (!proyectosMap[r.proyecto]) {
          proyectosMap[r.proyecto] = {
            nombre: r.proyecto,
            faena: r.faena || "Sin Faena",
            totalReportes: 0,
            aprobados: 0,
            pendientes: 0,
            rechazados: 0,
            borradores: 0,
            supervisores: new Set(),
            ultimaActividad: null,
            porcentajeAprobacion: 0,
          };
        }

        const p = proyectosMap[r.proyecto];
        p.totalReportes++;

        switch (r.status) {
          case "APROBADO": p.aprobados++; break;
          case "ENVIADO": p.pendientes++; break;
          case "RECHAZADO": p.rechazados++; break;
          case "BORRADOR": p.borradores++; break;
        }

        if (r.supervisorId) p.supervisores.add(r.supervisorId);
        if (!p.ultimaActividad || new Date(r.createdAt) > new Date(p.ultimaActividad)) {
          p.ultimaActividad = r.createdAt;
        }
      });

      const proyectosArray = Object.values(proyectosMap).map(p => ({
        ...p,
        porcentajeAprobacion: p.totalReportes > 0
          ? Math.round((p.aprobados / p.totalReportes) * 100)
          : 0,
      }));

      proyectosArray.sort((a, b) => b.totalReportes - a.totalReportes);
      setProyectos(proyectosArray);

      // Expandir todas las faenas por defecto
      const todasFaenas = new Set([
        ...faenasData?.map(f => f.nombre) || [],
        "Sin Faena"
      ]);
      setFaenasExpandidas(todasFaenas);

    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function crearFaena() {
    if (!nuevaFaena.nombre) return;

    try {
      const { error } = await supabase
        .from("Faena")
        .insert({
          nombre: nuevaFaena.nombre,
          ubicacion: nuevaFaena.ubicacion,
          cliente: nuevaFaena.cliente,
          activa: true
        });

      if (error) throw error;

      setNuevaFaena({ nombre: "", ubicacion: "", cliente: "" });
      setMostrarFormFaena(false);
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al crear faena");
    }
  }

  async function eliminarFaena(id: string) {
    if (!confirm("¿Eliminar esta faena?")) return;

    try {
      const { error } = await supabase
        .from("Faena")
        .update({ activa: false })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const toggleFaena = (nombre: string) => {
    const nuevas = new Set(faenasExpandidas);
    if (nuevas.has(nombre)) {
      nuevas.delete(nombre);
    } else {
      nuevas.add(nombre);
    }
    setFaenasExpandidas(nuevas);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Filtrar proyectos
  const proyectosFiltrados = busqueda
    ? proyectos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : proyectos;

  // Agrupar por faena
  const proyectosPorFaena: Record<string, ProyectoStats[]> = {};
  proyectosFiltrados.forEach(p => {
    const faena = p.faena || "Sin Faena";
    if (!proyectosPorFaena[faena]) proyectosPorFaena[faena] = [];
    proyectosPorFaena[faena].push(p);
  });

  // Totales
  const totales = proyectos.reduce((acc, p) => ({
    reportes: acc.reportes + p.totalReportes,
    aprobados: acc.aprobados + p.aprobados,
    pendientes: acc.pendientes + p.pendientes,
  }), { reportes: 0, aprobados: 0, pendientes: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando proyectos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mountain className="h-6 w-6 text-purple-600" />
              Faenas y Proyectos
            </h1>
            <p className="text-gray-500 mt-1">
              {faenas.length} faenas, {proyectos.length} proyectos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setMostrarFormFaena(!mostrarFormFaena)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Faena
            </Button>
            <Button
              onClick={() => router.push("/reportes/nuevo")}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* Form nueva faena */}
        {mostrarFormFaena && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Nueva Faena Minera</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  placeholder="Nombre de la faena *"
                  value={nuevaFaena.nombre}
                  onChange={(e) => setNuevaFaena({ ...nuevaFaena, nombre: e.target.value })}
                />
                <Input
                  placeholder="Ubicación"
                  value={nuevaFaena.ubicacion}
                  onChange={(e) => setNuevaFaena({ ...nuevaFaena, ubicacion: e.target.value })}
                />
                <Input
                  placeholder="Cliente"
                  value={nuevaFaena.cliente}
                  onChange={(e) => setNuevaFaena({ ...nuevaFaena, cliente: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setMostrarFormFaena(false)}>
                  Cancelar
                </Button>
                <Button onClick={crearFaena} className="bg-purple-600 hover:bg-purple-700">
                  Crear Faena
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totales.reportes}</p>
                  <p className="text-xs text-gray-500">Total Reportes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{totales.aprobados}</p>
                  <p className="text-xs text-gray-500">Aprobados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{totales.pendientes}</p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-white border-0 shadow-sm"
          />
        </div>

        {/* Faenas y Proyectos */}
        {Object.keys(proyectosPorFaena).length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Mountain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin proyectos</h3>
              <p className="text-gray-500">Los proyectos se crean automáticamente al crear reportes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Faenas registradas */}
            {faenas.map(faena => {
              const proyectosFaena = proyectosPorFaena[faena.nombre] || [];
              const expandida = faenasExpandidas.has(faena.nombre);

              return (
                <Card key={faena.id} className="border-0 shadow-sm overflow-hidden">
                  <div
                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 cursor-pointer"
                    onClick={() => toggleFaena(faena.nombre)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Mountain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{faena.nombre}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {faena.ubicacion && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {faena.ubicacion}
                              </span>
                            )}
                            {faena.cliente && (
                              <span>{faena.cliente}</span>
                            )}
                            <span className="font-medium text-purple-600">
                              {proyectosFaena.length} proyectos
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarFaena(faena.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                        {expandida ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandida && proyectosFaena.length > 0 && (
                    <div className="p-4 space-y-3">
                      {proyectosFaena.map(proyecto => (
                        <ProyectoCard
                          key={proyecto.nombre}
                          proyecto={proyecto}
                          router={router}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  )}

                  {expandida && proyectosFaena.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Sin proyectos en esta faena
                    </div>
                  )}
                </Card>
              );
            })}

            {/* Proyectos sin faena */}
            {proyectosPorFaena["Sin Faena"] && proyectosPorFaena["Sin Faena"].length > 0 && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div
                  className="p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleFaena("Sin Faena")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Sin Faena Asignada</h3>
                        <span className="text-xs text-gray-500">
                          {proyectosPorFaena["Sin Faena"].length} proyectos
                        </span>
                      </div>
                    </div>
                    {faenasExpandidas.has("Sin Faena") ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {faenasExpandidas.has("Sin Faena") && (
                  <div className="p-4 space-y-3">
                    {proyectosPorFaena["Sin Faena"].map(proyecto => (
                      <ProyectoCard
                        key={proyecto.nombre}
                        proyecto={proyecto}
                        router={router}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente separado para el card de proyecto
function ProyectoCard({ proyecto, router, formatDate }: { proyecto: ProyectoStats; router: any; formatDate: (date: string) => string }) {
  return (
    <div
      className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/reportes?proyecto=${encodeURIComponent(proyecto.nombre)}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{proyecto.nombre}</h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {proyecto.totalReportes} reportes
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {proyecto.supervisores.size} supervisores
            </span>
            {proyecto.ultimaActividad && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(proyecto.ultimaActividad)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Avance</span>
          <span className="text-xs font-medium text-gray-700">{proyecto.porcentajeAprobacion}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${proyecto.porcentajeAprobacion}%` }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
          {proyecto.aprobados} aprobados
        </span>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
          {proyecto.pendientes} pendientes
        </span>
        {proyecto.rechazados > 0 && (
          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded">
            {proyecto.rechazados} rechazados
          </span>
        )}
      </div>
    </div>
  );
}
