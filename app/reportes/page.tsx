"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Select import - using native HTML select
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { Plus, MapPin, Calendar, User, FileText, Filter, X, FileSpreadsheet, Save, Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import * as XLSX from 'xlsx';
import { Header } from "@/components/layout/Header";

export default function ReportesPage() {
  const router = useRouter();
  const [reportes, setReportes] = useState<any[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    tipoTrabajo: "",
    status: "",
    busqueda: "",
    proyectoId: "",
    fechaDesde: "",
    fechaHasta: "",
    conGPS: "",
    conFotos: "",
  });

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [filtrosGuardados, setFiltrosGuardados] = useState<any[]>([]);
  const [nombreFiltro, setNombreFiltro] = useState("");
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  useEffect(() => {
    fetchReportes();
    // fetchProyectos(); // DESHABILITADO - tabla Proyecto no existe
    cargarFiltrosGuardados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reportes]);

  async function fetchReportes() {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select(`
          *,
          supervisor:User(nombre, apellido, email),
          fotos:Foto(id, url)
        `)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setReportes(data || []);
      setReportesFiltrados(data || []);
    } catch (error: any) {
      console.error("Error fetching reportes:", error);
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
  //       .order("nombre");

  //     if (error) throw error;
  //     setProyectos(data || []);
  //   } catch (error: any) {
  //     console.error("Error al cargar proyectos:", error);
  //   }
  // }

  function cargarFiltrosGuardados() {
    try {
      const guardados = localStorage.getItem("filtrosGuardados");
      if (guardados) {
        setFiltrosGuardados(JSON.parse(guardados));
      }
    } catch (error) {
      console.error("Error al cargar filtros guardados:", error);
    }
  }

  function guardarFiltro() {
    if (!nombreFiltro.trim()) {
      alert("Por favor ingresa un nombre para el filtro");
      return;
    }

    const nuevoFiltro = {
      id: Date.now().toString(),
      nombre: nombreFiltro,
      filtros: { ...filtros }
    };

    const nuevosGuardados = [...filtrosGuardados, nuevoFiltro];
    setFiltrosGuardados(nuevosGuardados);
    localStorage.setItem("filtrosGuardados", JSON.stringify(nuevosGuardados));
    setNombreFiltro("");
    alert(`Filtro "${nombreFiltro}" guardado exitosamente`);
  }

  function cargarFiltro(filtroGuardado: any) {
    setFiltros(filtroGuardado.filtros);
  }

  function eliminarFiltro(id: string) {
    const nuevosGuardados = filtrosGuardados.filter(f => f.id !== id);
    setFiltrosGuardados(nuevosGuardados);
    localStorage.setItem("filtrosGuardados", JSON.stringify(nuevosGuardados));
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
          r.direccion?.toLowerCase().includes(busqueda) ||
          r.supervisor?.nombre?.toLowerCase().includes(busqueda) ||
          r.supervisor?.apellido?.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.proyectoId) {
      filtered = filtered.filter((r) => r.proyectoId === filtros.proyectoId);
    }

    if (filtros.fechaDesde) {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(filtros.fechaDesde));
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= fechaHasta);
    }

    if (filtros.conGPS === "si") {
      filtered = filtered.filter((r) => r.latitud && r.longitud);
    } else if (filtros.conGPS === "no") {
      filtered = filtered.filter((r) => !r.latitud || !r.longitud);
    }

    if (filtros.conFotos === "si") {
      filtered = filtered.filter((r) => r.fotos && r.fotos.length > 0);
    } else if (filtros.conFotos === "no") {
      filtered = filtered.filter((r) => !r.fotos || r.fotos.length === 0);
    }

    setReportesFiltrados(filtered);
  }

  function limpiarFiltros() {
    setFiltros({
      tipoTrabajo: "",
      status: "",
      busqueda: "",
      proyectoId: "",
      fechaDesde: "",
      fechaHasta: "",
      conGPS: "",
      conFotos: "",
    });
  }

  function exportarExcel() {
    const datos = reportesFiltrados.map((r) => ({
      'Fecha': formatDateTime(r.createdAt),
      'Tipo de Trabajo': getTipoTrabajoLabel(r.tipoTrabajo),
      'Estado': r.status,
      'Supervisor': r.supervisor ? `${r.supervisor.nombre} ${r.supervisor.apellido}` : '',
      'Proyecto': r.proyecto || '',
      'Orden de Trabajo': r.ordenTrabajo || '',
      'Cliente Final': r.clienteFinal || '',
      'Dirección': r.direccion || '',
      'Comuna': r.comuna || '',
      'Región': r.region || '',
      'Descripción': r.descripcion || '',
      'Observaciones': r.observaciones || '',
      'Latitud': r.latitud || '',
      'Longitud': r.longitud || '',
      'Cantidad Fotos': r.fotos?.length || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 18 }, // Fecha
      { wch: 18 }, // Tipo de Trabajo
      { wch: 10 }, // Estado
      { wch: 20 }, // Supervisor
      { wch: 25 }, // Proyecto
      { wch: 15 }, // OT
      { wch: 20 }, // Cliente
      { wch: 30 }, // Dirección
      { wch: 15 }, // Comuna
      { wch: 15 }, // Región
      { wch: 50 }, // Descripción
      { wch: 40 }, // Observaciones
      { wch: 12 }, // Latitud
      { wch: 12 }, // Longitud
      { wch: 8 },  // Fotos
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Reportes");

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `reportes-act-${fecha}.xlsx`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BORRADOR":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "ENVIADO":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "APROBADO":
        return "bg-green-100 text-green-800 border-green-300";
      case "RECHAZADO":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando reportes...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Reportes de Terreno</h1>
            <p className="text-gray-600 mt-1">
              {reportesFiltrados.length} de {reportes.length} {reportes.length === 1 ? "reporte" : "reportes"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportarExcel}
              variant="outline"
              size="lg"
              className="gap-2"
              disabled={reportesFiltrados.length === 0}
            >
              <FileSpreadsheet className="h-5 w-5" />
              Exportar Excel
            </Button>
            <Button
              onClick={() => router.push("/reportes/nuevo")}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* Filtros Guardados */}
        {filtrosGuardados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                Filtros Guardados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {filtrosGuardados.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                  >
                    <button
                      onClick={() => cargarFiltro(f)}
                      className="text-sm text-blue-700 hover:text-blue-900"
                    >
                      {f.nombre}
                    </button>
                    <button
                      onClick={() => eliminarFiltro(f.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setMostrarAvanzados(!mostrarAvanzados)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
              {mostrarAvanzados ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="busqueda">Buscar</Label>
                <Input
                  id="busqueda"
                  placeholder="Proyecto, OT, descripción..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
                <select
                  id="tipoTrabajo"
                  value={filtros.tipoTrabajo}
                  onChange={(e) => setFiltros({ ...filtros, tipoTrabajo: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Todos</option>
                  <option value="FIBRA_OPTICA">Fibra Óptica</option>
                  <option value="DATA_CENTER">Data Center</option>
                  <option value="ANTENAS">Antenas</option>
                  <option value="CCTV">CCTV</option>
                  <option value="INSTALACION_RED">Instalación Red</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Todos</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Filtros Avanzados */}
            {mostrarAvanzados && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <h4 className="font-semibold text-sm text-gray-700">Filtros Avanzados</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DESHABILITADO - tabla Proyecto no existe */}
                  {/* <div>
                    <Label htmlFor="proyectoId">Proyecto</Label>
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
                  </div> */}

                  <div>
                    <Label htmlFor="fechaDesde">Fecha Desde</Label>
                    <Input
                      id="fechaDesde"
                      type="date"
                      value={filtros.fechaDesde}
                      onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fechaHasta">Fecha Hasta</Label>
                    <Input
                      id="fechaHasta"
                      type="date"
                      value={filtros.fechaHasta}
                      onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="conGPS">Con GPS</Label>
                    <select
                      id="conGPS"
                      value={filtros.conGPS}
                      onChange={(e) => setFiltros({ ...filtros, conGPS: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Todos</option>
                      <option value="si">Con GPS</option>
                      <option value="no">Sin GPS</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="conFotos">Con Fotos</Label>
                    <select
                      id="conFotos"
                      value={filtros.conFotos}
                      onChange={(e) => setFiltros({ ...filtros, conFotos: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Todos</option>
                      <option value="si">Con Fotos</option>
                      <option value="no">Sin Fotos</option>
                    </select>
                  </div>
                </div>

                {/* Guardar Filtro */}
                <div className="pt-4 border-t">
                  <Label htmlFor="nombreFiltro">Guardar este filtro</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="nombreFiltro"
                      placeholder="Nombre del filtro..."
                      value={nombreFiltro}
                      onChange={(e) => setNombreFiltro(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') guardarFiltro();
                      }}
                    />
                    <Button
                      onClick={guardarFiltro}
                      variant="outline"
                      className="gap-2"
                      disabled={!nombreFiltro.trim()}
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {reportesFiltrados.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay reportes</CardTitle>
              <CardDescription>
                Comienza creando tu primer reporte de terreno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/reportes/nuevo")}
                className="w-full"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Primer Reporte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reportesFiltrados.map((reporte) => (
              <Card
                key={reporte.id}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/reportes/${reporte.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Fotos */}
                    {reporte.fotos && reporte.fotos.length > 0 && (
                      <div className="w-full md:w-48 h-32 flex-shrink-0">
                        <img
                          src={reporte.fotos[0].url}
                          alt="Foto del reporte"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {reporte.fotos.length > 1 && (
                          <div className="text-xs text-center mt-1 text-gray-600">
                            +{reporte.fotos.length - 1} fotos más
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                          </h3>
                          {reporte.proyecto && (
                            <p className="text-sm text-gray-600">
                              {reporte.proyecto}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            reporte.status
                          )}`}
                        >
                          {reporte.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {reporte.supervisor && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="h-4 w-4" />
                            <span>
                              {reporte.supervisor.nombre} {reporte.supervisor.apellido}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(reporte.createdAt)}</span>
                        </div>

                        {reporte.direccion && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {reporte.direccion}
                              {reporte.comuna && `, ${reporte.comuna}`}
                            </span>
                          </div>
                        )}

                        {reporte.ordenTrabajo && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="h-4 w-4" />
                            <span>OT: {reporte.ordenTrabajo}</span>
                          </div>
                        )}
                      </div>

                      {reporte.descripcion && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {reporte.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
