"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import {
  Plus,
  MapPin,
  Calendar,
  User,
  FileText,
  Filter,
  X,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  LayoutGrid,
  LayoutList,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Eye,
  Trash2,
  Mountain,
  Camera,
  Clock,
  Building2,
  Zap,
  Wifi,
  HardHat,
  ChevronRight
} from "lucide-react";
import * as XLSX from 'xlsx';
import { Header } from "@/components/layout/Header";

type ViewMode = "cards" | "table";
type SortField = "createdAt" | "tipoTrabajo" | "status" | "proyecto";
type SortOrder = "asc" | "desc";

export default function ReportesPage() {
  const router = useRouter();
  const [reportes, setReportes] = useState<any[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedReportes, setSelectedReportes] = useState<Set<string>>(new Set());
  const [faenasExpandidas, setFaenasExpandidas] = useState<Set<string>>(new Set());

  const [filtros, setFiltros] = useState({
    tipoTrabajo: "",
    status: "",
    busqueda: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    fetchReportes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes, sortField, sortOrder]);

  async function fetchReportes() {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select(`
          *,
          supervisor:User(nombre, apellido, email, avatar),
          fotos:Foto(id, url)
        `)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setReportes(data || []);
      setReportesFiltrados(data || []);

      // Expandir todas las faenas por defecto
      const faenas = new Set((data || []).map(r => r.proyecto || "Sin Faena").filter(Boolean));
      setFaenasExpandidas(faenas as Set<string>);
    } catch (error: any) {
      console.error("Error fetching reportes:", error);
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
      const busqueda = filtros.busqueda.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.proyecto?.toLowerCase().includes(busqueda) ||
          r.ordenTrabajo?.toLowerCase().includes(busqueda) ||
          r.descripcion?.toLowerCase().includes(busqueda) ||
          r.direccion?.toLowerCase().includes(busqueda)
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

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setReportesFiltrados(filtered);
  }

  function limpiarFiltros() {
    setFiltros({
      tipoTrabajo: "",
      status: "",
      busqueda: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  }

  function exportarExcel() {
    const datos = reportesFiltrados.map((r) => ({
      'Fecha': formatDateTime(r.createdAt),
      'Tipo de Trabajo': getTipoTrabajoLabel(r.tipoTrabajo),
      'Estado': r.status,
      'Supervisor': r.supervisor ? `${r.supervisor.nombre} ${r.supervisor.apellido}` : '',
      'Faena/Proyecto': r.proyecto || '',
      'OT': r.ordenTrabajo || '',
      'Dirección': r.direccion || '',
      'Descripción': r.descripcion || '',
      'Fotos': r.fotos?.length || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");
    XLSX.writeFile(wb, `reportes-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async function cambiarEstado(reporteId: string, nuevoEstado: string) {
    try {
      const { error } = await supabase
        .from("Reporte")
        .update({ status: nuevoEstado })
        .eq("id", reporteId);

      if (error) throw error;

      setReportes(prev =>
        prev.map(r => r.id === reporteId ? { ...r, status: nuevoEstado } : r)
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  }

  async function eliminarReporte(reporteId: string) {
    if (!confirm("¿Estás seguro de eliminar este reporte?")) return;

    try {
      const { error } = await supabase
        .from("Reporte")
        .delete()
        .eq("id", reporteId);

      if (error) throw error;

      setReportes(prev => prev.filter(r => r.id !== reporteId));
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  function toggleSelectReporte(id: string) {
    const newSelected = new Set(selectedReportes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReportes(newSelected);
  }

  function toggleSelectAll() {
    if (selectedReportes.size === reportesFiltrados.length) {
      setSelectedReportes(new Set());
    } else {
      setSelectedReportes(new Set(reportesFiltrados.map(r => r.id)));
    }
  }

  async function aprobarSeleccionados() {
    for (const id of selectedReportes) {
      await cambiarEstado(id, "APROBADO");
    }
    setSelectedReportes(new Set());
  }

  function toggleFaena(faena: string) {
    const newSet = new Set(faenasExpandidas);
    if (newSet.has(faena)) {
      newSet.delete(faena);
    } else {
      newSet.add(faena);
    }
    setFaenasExpandidas(newSet);
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "BORRADOR":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      case "ENVIADO":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "APROBADO":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "RECHAZADO":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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

  const getTipoTrabajoIcon = (tipo: string) => {
    switch (tipo) {
      case "FIBRA_OPTICA":
        return <Wifi className="h-4 w-4" />;
      case "DATA_CENTER":
        return <Building2 className="h-4 w-4" />;
      case "ANTENAS":
        return <Zap className="h-4 w-4" />;
      case "MANTENIMIENTO":
        return <HardHat className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Agrupar reportes por faena
  const reportesPorFaena = reportesFiltrados.reduce((acc, reporte) => {
    const faena = reporte.proyecto || "Sin Faena";
    if (!acc[faena]) {
      acc[faena] = [];
    }
    acc[faena].push(reporte);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-slate-600 font-medium">Cargando reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Reportes de Campo
              </h1>
              <p className="text-slate-500 mt-2">
                Gestión y seguimiento de reportes por faena minera
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="flex gap-3">
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{reportes.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                <p className="text-2xl font-bold text-emerald-600">
                  {reportes.filter(r => r.status === "APROBADO").length}
                </p>
                <p className="text-xs text-slate-500">Aprobados</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                <p className="text-2xl font-bold text-blue-600">
                  {reportes.filter(r => r.status === "ENVIADO").length}
                </p>
                <p className="text-xs text-slate-500">Pendientes</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2.5 rounded-md transition-all ${viewMode === "cards" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 rounded-md transition-all ${viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={exportarExcel}
              variant="outline"
              className="gap-2 bg-white border-slate-200 hover:bg-slate-50"
              disabled={reportesFiltrados.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              onClick={() => router.push("/reportes/nuevo")}
              className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* Acciones masivas */}
        {selectedReportes.size > 0 && (
          <div className="bg-blue-600 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {selectedReportes.size} reportes seleccionados
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={aprobarSeleccionados}
                  className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedReportes(new Set())}
                  className="gap-2 border-white/30 text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card className="border-0 shadow-sm mb-6 bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700">Filtros</span>
                {(filtros.tipoTrabajo || filtros.status || filtros.busqueda || filtros.fechaDesde || filtros.fechaHasta) && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Activos</span>
                )}
              </div>
              {mostrarFiltros ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {mostrarFiltros && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    placeholder="Buscar..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    className="bg-white border-slate-200"
                  />

                  <select
                    value={filtros.tipoTrabajo}
                    onChange={(e) => setFiltros({ ...filtros, tipoTrabajo: e.target.value })}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
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
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="">Estado</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>

                  <Button variant="outline" onClick={limpiarFiltros} className="gap-2 border-slate-200">
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Desde</label>
                    <Input
                      type="date"
                      value={filtros.fechaDesde}
                      onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Hasta</label>
                    <Input
                      type="date"
                      value={filtros.fechaHasta}
                      onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de reportes */}
        {reportesFiltrados.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Sin reportes</h3>
              <p className="text-slate-500 mb-6">Comienza creando tu primer reporte de campo</p>
              <Button
                onClick={() => router.push("/reportes/nuevo")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Reporte
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          /* Vista Tabla */
          <Card className="border-0 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReportes.size === reportesFiltrados.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => toggleSort("createdAt")}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Fecha
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => toggleSort("tipoTrabajo")}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Tipo
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => toggleSort("proyecto")}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Faena
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Supervisor</th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => toggleSort("status")}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Estado
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportesFiltrados.map((reporte) => (
                    <tr key={reporte.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedReportes.has(reporte.id)}
                          onChange={() => toggleSelectReporte(reporte.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {formatDateTime(reporte.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-blue-50 rounded text-blue-600">
                            {getTipoTrabajoIcon(reporte.tipoTrabajo)}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 max-w-[150px] truncate">
                        {reporte.proyecto || "-"}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {reporte.supervisor ? `${reporte.supervisor.nombre} ${reporte.supervisor.apellido}` : "-"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(reporte.status)}`}>
                          {reporte.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/reportes/${reporte.id}`)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </button>
                          {reporte.status === "ENVIADO" && (
                            <>
                              <button
                                onClick={() => cambiarEstado(reporte.id, "APROBADO")}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              </button>
                              <button
                                onClick={() => cambiarEstado(reporte.id, "RECHAZADO")}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => eliminarReporte(reporte.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Vista Cards agrupada por faena */
          <div className="space-y-6">
            {Object.entries(reportesPorFaena).map(([faena, reportesGrupo]) => (
              <div key={faena} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                {/* Header de faena */}
                <button
                  onClick={() => toggleFaena(faena)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Mountain className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900">{faena}</h3>
                      <p className="text-sm text-slate-500">{reportesGrupo.length} reportes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {reportesGrupo.filter(r => r.status === "APROBADO").length > 0 && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                          {reportesGrupo.filter(r => r.status === "APROBADO").length} aprobados
                        </span>
                      )}
                      {reportesGrupo.filter(r => r.status === "ENVIADO").length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {reportesGrupo.filter(r => r.status === "ENVIADO").length} pendientes
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${faenasExpandidas.has(faena) ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Reportes de la faena */}
                {faenasExpandidas.has(faena) && (
                  <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reportesGrupo.map((reporte) => (
                      <div
                        key={reporte.id}
                        onClick={() => router.push(`/reportes/${reporte.id}`)}
                        className="group bg-slate-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        {/* Imagen */}
                        <div className="relative mb-3">
                          {reporte.fotos && reporte.fotos.length > 0 ? (
                            <div className="aspect-video rounded-lg overflow-hidden bg-slate-200">
                              <img
                                src={reporte.fotos[0].url}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center">
                              <Camera className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                          {reporte.fotos && reporte.fotos.length > 1 && (
                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                              +{reporte.fotos.length - 1}
                            </span>
                          )}
                          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(reporte.status)}`}>
                            {reporte.status}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-blue-100 rounded text-blue-600">
                              {getTipoTrabajoIcon(reporte.tipoTrabajo)}
                            </span>
                            <h4 className="font-semibold text-slate-900 truncate flex-1">
                              {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                            </h4>
                          </div>

                          {reporte.descripcion && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {reporte.descripcion}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                              {reporte.supervisor?.avatar ? (
                                <img
                                  src={reporte.supervisor.avatar}
                                  alt=""
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                                  <User className="h-3 w-3 text-slate-500" />
                                </div>
                              )}
                              <span className="text-xs text-slate-500 truncate max-w-[100px]">
                                {reporte.supervisor ? `${reporte.supervisor.nombre}` : "Sin asignar"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              {new Date(reporte.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        </div>

                        {/* Acciones rápidas */}
                        {reporte.status === "ENVIADO" && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => cambiarEstado(reporte.id, "APROBADO")}
                              className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => cambiarEstado(reporte.id, "RECHAZADO")}
                              className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
