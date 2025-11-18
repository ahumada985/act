"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Map, Filter, MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";

// Importar el mapa dinámicamente para evitar problemas con SSR
const ReportesMap = dynamic(
  () => import("@/components/maps/ReportesMap").then((mod) => mod.ReportesMap),
  { ssr: false, loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" /> }
);

export default function MapaPage() {
  const router = useRouter();
  const [reportes, setReportes] = useState<any[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipoTrabajo: "",
    status: "",
    proyectoId: "",
    busqueda: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  useEffect(() => {
    fetchReportes();
    // fetchProyectos(); // DESHABILITADO - tabla Proyecto no existe
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes]);

  async function fetchReportes() {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select("id, latitud, longitud, tipoTrabajo, proyecto, proyectoId, direccion, createdAt, status")
        .not("latitud", "is", null)
        .not("longitud", "is", null)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setReportes(data || []);
      setReportesFiltrados(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar reportes: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // DESHABILITADO - tabla Proyecto no existe
  // async function fetchProyectos() {
  //   try {
  //     const { data, error } = await supabase
  //       .from("Proyecto")
  //       .select("id, nombre")
  //       .eq("estado", "ACTIVO")
  //       .order("nombre");

  //     if (error) throw error;
  //     setProyectos(data || []);
  //   } catch (error: any) {
  //     console.error("Error al cargar proyectos:", error);
  //   }
  // }

  function aplicarFiltros() {
    let filtered = [...reportes];

    if (filtros.tipoTrabajo) {
      filtered = filtered.filter((r) => r.tipoTrabajo === filtros.tipoTrabajo);
    }

    if (filtros.status) {
      filtered = filtered.filter((r) => r.status === filtros.status);
    }

    if (filtros.proyectoId) {
      filtered = filtered.filter((r) => r.proyectoId === filtros.proyectoId);
    }

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      filtered = filtered.filter((r) =>
        r.proyecto?.toLowerCase().includes(busquedaLower) ||
        r.direccion?.toLowerCase().includes(busquedaLower) ||
        r.tipoTrabajo?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtros.fechaDesde) {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(filtros.fechaDesde));
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= fechaHasta);
    }

    setReportesFiltrados(filtered);
  }

  function limpiarFiltros() {
    setFiltros({
      tipoTrabajo: "",
      status: "",
      proyectoId: "",
      busqueda: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  }

  const handleMarkerClick = (reporteId: string) => {
    router.push(`/reportes/${reporteId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando mapa...</CardTitle>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
              <Map className="h-8 w-8" />
              Mapa de Reportes
            </h1>
            <p className="text-gray-600 mt-1">
              {reportesFiltrados.length} de {reportes.length} reportes con ubicación GPS
            </p>
          </div>
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filtros Avanzados</CardTitle>
              </div>
              {mostrarFiltros ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
            <CardDescription>
              {reportesFiltrados.length} de {reportes.length} reportes mostrados
            </CardDescription>
          </CardHeader>

          {mostrarFiltros && (
            <CardContent className="space-y-4">
              {/* Búsqueda de texto */}
              <div>
                <Label htmlFor="busqueda">Búsqueda</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="busqueda"
                    placeholder="Buscar por proyecto, dirección o tipo..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtros principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="proyectoId">Proyecto Minero</Label>
                  <Select
                    id="proyectoId"
                    value={filtros.proyectoId}
                    onChange={(e) => setFiltros({ ...filtros, proyectoId: e.target.value })}
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
                  <Select
                    id="tipoTrabajo"
                    value={filtros.tipoTrabajo}
                    onChange={(e) => setFiltros({ ...filtros, tipoTrabajo: e.target.value })}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="FIBRA_OPTICA">Fibra Óptica</option>
                    <option value="DATA_CENTER">Data Center</option>
                    <option value="ANTENAS">Antenas</option>
                    <option value="CCTV">CCTV</option>
                    <option value="INSTALACION_RED">Instalación Red</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="OTRO">Otro</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    id="status"
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  >
                    <option value="">Todos los estados</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </Select>
                </div>
              </div>

              {/* Filtros de fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaDesde">Desde</Label>
                  <Input
                    id="fechaDesde"
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="fechaHasta">Hasta</Label>
                  <Input
                    id="fechaHasta"
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                  />
                </div>
              </div>

              {/* Botón limpiar */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className="min-w-[150px]"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Leyenda de colores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              Leyenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                <span className="text-xs">Fibra Óptica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#8b5cf6" }}></div>
                <span className="text-xs">Data Center</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ec4899" }}></div>
                <span className="text-xs">Antenas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                <span className="text-xs">CCTV</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                <span className="text-xs">Instalación Red</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#06b6d4" }}></div>
                <span className="text-xs">Mantenimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#6b7280" }}></div>
                <span className="text-xs">Otro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapa */}
        <Card>
          <CardContent className="p-0">
            <ReportesMap
              reportes={reportesFiltrados}
              onMarkerClick={handleMarkerClick}
              height="600px"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

