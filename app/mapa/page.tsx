"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, Filter, MapPin, Search, ChevronDown, ChevronUp, X, Calendar, Layers } from "lucide-react";

const ReportesMap = dynamic(
  () => import("@/components/maps/ReportesMap").then((mod) => mod.ReportesMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-xl" /> }
);

// Coordenadas aproximadas de la Región Metropolitana
const RM_BOUNDS = {
  latMin: -33.65,
  latMax: -33.30,
  lonMin: -70.85,
  lonMax: -70.45
};

export default function MapaPage() {
  const router = useRouter();
  const [reportes, setReportes] = useState<any[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoTrabajo: "",
    status: "",
    busqueda: "",
    fechaDesde: "",
    fechaHasta: "",
    region: "",
  });

  // Regiones de Chile (simplificado)
  const regiones = [
    { value: "", label: "Todas las regiones" },
    { value: "norte", label: "Norte (I-IV)" },
    { value: "centro", label: "Centro (V-VII)" },
    { value: "sur", label: "Sur (VIII-XII)" },
  ];

  useEffect(() => {
    fetchReportes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes]);

  async function fetchReportes() {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select("id, latitud, longitud, tipoTrabajo, proyecto, direccion, createdAt, status, region")
        .not("latitud", "is", null)
        .not("longitud", "is", null)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Filtrar reportes de la Región Metropolitana
      const reportesSinRM = (data || []).filter(r => {
        const lat = r.latitud;
        const lon = r.longitud;
        // Excluir si está dentro de los límites de la RM
        const estaEnRM = lat >= RM_BOUNDS.latMin && lat <= RM_BOUNDS.latMax &&
                         lon >= RM_BOUNDS.lonMin && lon <= RM_BOUNDS.lonMax;
        return !estaEnRM;
      });

      setReportes(reportesSinRM);
      setReportesFiltrados(reportesSinRM);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let filtered = [...reportes];

    if (filtros.tipoTrabajo) {
      filtered = filtered.filter((r) => r.tipoTrabajo === filtros.tipoTrabajo);
    }

    if (filtros.status) {
      filtered = filtered.filter((r) => r.status === filtros.status);
    }

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      filtered = filtered.filter((r) =>
        r.proyecto?.toLowerCase().includes(busquedaLower) ||
        r.direccion?.toLowerCase().includes(busquedaLower)
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

    // Filtro por región geográfica aproximada
    if (filtros.region) {
      filtered = filtered.filter((r) => {
        const lat = r.latitud;
        switch (filtros.region) {
          case "norte":
            return lat > -30; // Norte de Chile
          case "centro":
            return lat <= -30 && lat > -36; // Centro
          case "sur":
            return lat <= -36; // Sur
          default:
            return true;
        }
      });
    }

    setReportesFiltrados(filtered);
  }

  function limpiarFiltros() {
    setFiltros({ tipoTrabajo: "", status: "", busqueda: "", fechaDesde: "", fechaHasta: "", region: "" });
  }

  const handleMarkerClick = (reporteId: string) => {
    router.push(`/reportes/${reporteId}`);
  };

  // Estadísticas por tipo
  const statsPorTipo = reportesFiltrados.reduce((acc: Record<string, number>, r) => {
    acc[r.tipoTrabajo] = (acc[r.tipoTrabajo] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Map className="h-6 w-6 text-blue-600" />
              Mapa de Operaciones
            </h1>
            <p className="text-gray-500 mt-1">
              {reportesFiltrados.length} reportes en regiones mineras
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Filtros</span>
                {(filtros.tipoTrabajo || filtros.status || filtros.busqueda || filtros.fechaDesde || filtros.fechaHasta || filtros.region) && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Activos</span>
                )}
              </div>
              {mostrarFiltros ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {mostrarFiltros && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar proyecto o dirección..."
                      value={filtros.busqueda}
                      onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                      className="pl-10 bg-white"
                    />
                  </div>

                  <select
                    value={filtros.tipoTrabajo}
                    onChange={(e) => setFiltros({ ...filtros, tipoTrabajo: e.target.value })}
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="">Tipo de trabajo</option>
                    <option value="FIBRA_OPTICA">Fibra Óptica</option>
                    <option value="DATA_CENTER">Data Center</option>
                    <option value="ANTENAS">Antenas</option>
                    <option value="CCTV">CCTV</option>
                    <option value="INSTALACION_RED">Instalación Red</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="OTRO">Otro</option>
                  </select>

                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="">Estado</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={filtros.region}
                    onChange={(e) => setFiltros({ ...filtros, region: e.target.value })}
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                  >
                    {regiones.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <div>
                    <Input
                      type="date"
                      value={filtros.fechaDesde}
                      onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                      className="bg-white"
                      placeholder="Desde"
                    />
                  </div>

                  <div>
                    <Input
                      type="date"
                      value={filtros.fechaHasta}
                      onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                      className="bg-white"
                      placeholder="Hasta"
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={limpiarFiltros} className="gap-2">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {[
            { key: "FIBRA_OPTICA", color: "#3b82f6", label: "Fibra" },
            { key: "DATA_CENTER", color: "#8b5cf6", label: "Data Center" },
            { key: "ANTENAS", color: "#ec4899", label: "Antenas" },
            { key: "CCTV", color: "#f59e0b", label: "CCTV" },
            { key: "INSTALACION_RED", color: "#10b981", label: "Red" },
            { key: "MANTENIMIENTO", color: "#06b6d4", label: "Mant." },
            { key: "OTRO", color: "#6b7280", label: "Otro" },
          ].map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer transition-all ${
                filtros.tipoTrabajo === item.key ? "border-blue-500 shadow-sm" : "border-gray-100 hover:border-gray-200"
              }`}
              onClick={() => setFiltros({ ...filtros, tipoTrabajo: filtros.tipoTrabajo === item.key ? "" : item.key })}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
              <div className="min-w-0">
                <span className="text-xs text-gray-600 truncate block">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{statsPorTipo[item.key] || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mapa */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {reportesFiltrados.length === 0 ? (
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin reportes en esta zona</h3>
              <p className="text-gray-500">No hay reportes que coincidan con los filtros seleccionados</p>
            </CardContent>
          ) : (
            <ReportesMap
              reportes={reportesFiltrados}
              onMarkerClick={handleMarkerClick}
              height="500px"
            />
          )}
        </Card>

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Mostrando reportes fuera de la Región Metropolitana
          </p>
        </div>
      </div>
    </div>
  );
}
