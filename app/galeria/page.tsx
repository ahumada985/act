"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink
} from "lucide-react";

interface FotoConContexto {
  url: string;
  reporteId: string;
  reporteTipo: string;
  reporteStatus: string;
  reporteFecha: string;
  reporteDireccion?: string;
  proyectoNombre?: string;
  proyectoId?: string;
  cliente?: string;
}

export default function GaleriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState<FotoConContexto[]>([]);
  const [fotosFiltradas, setFotosFiltradas] = useState<FotoConContexto[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    proyectoId: "",
    tipoTrabajo: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const [fotoSeleccionada, setFotoSeleccionada] = useState<number | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  useEffect(() => {
    fetchFotos();
    // fetchProyectos(); // DESHABILITADO - tabla Proyecto no existe
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, fotos]);

  async function fetchFotos() {
    try {
      const { data: reportes, error } = await supabase
        .from("Reporte")
        .select("id, tipoTrabajo, status, createdAt, direccion, images, proyecto, proyectoId")
        .not("images", "is", null)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Extraer todas las fotos de todos los reportes
      const todasLasFotos: FotoConContexto[] = [];

      reportes?.forEach((reporte) => {
        if (Array.isArray(reporte.images) && reporte.images.length > 0) {
          reporte.images.forEach((url: string) => {
            todasLasFotos.push({
              url,
              reporteId: reporte.id,
              reporteTipo: reporte.tipoTrabajo,
              reporteStatus: reporte.status,
              reporteFecha: reporte.createdAt,
              reporteDireccion: reporte.direccion,
              proyectoNombre: reporte.proyecto,
              proyectoId: reporte.proyectoId,
              cliente: "" // Se llenará al obtener proyectos
            });
          });
        }
      });

      setFotos(todasLasFotos);
      setFotosFiltradas(todasLasFotos);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar fotos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // DESHABILITADO - tabla Proyecto no existe
  // async function fetchProyectos() {
  //   try {
  //     const { data, error } = await supabase
  //       .from("Proyecto")
  //       .select("id, nombre, cliente")
  //       .order("nombre");

  //     if (error) throw error;
  //     setProyectos(data || []);
  //   } catch (error: any) {
  //     console.error("Error al cargar proyectos:", error);
  //   }
  // }

  function aplicarFiltros() {
    let filtered = [...fotos];

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      filtered = filtered.filter((f) =>
        f.proyectoNombre?.toLowerCase().includes(busquedaLower) ||
        f.reporteDireccion?.toLowerCase().includes(busquedaLower) ||
        f.reporteTipo?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtros.proyectoId) {
      filtered = filtered.filter((f) => f.proyectoId === filtros.proyectoId);
    }

    if (filtros.tipoTrabajo) {
      filtered = filtered.filter((f) => f.reporteTipo === filtros.tipoTrabajo);
    }

    if (filtros.fechaDesde) {
      filtered = filtered.filter((f) => new Date(f.reporteFecha) >= new Date(filtros.fechaDesde));
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter((f) => new Date(f.reporteFecha) <= fechaHasta);
    }

    setFotosFiltradas(filtered);
  }

  function limpiarFiltros() {
    setFiltros({
      busqueda: "",
      proyectoId: "",
      tipoTrabajo: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  }

  function abrirLightbox(index: number) {
    setFotoSeleccionada(index);
  }

  function cerrarLightbox() {
    setFotoSeleccionada(null);
  }

  function navegarFoto(direccion: "anterior" | "siguiente") {
    if (fotoSeleccionada === null) return;

    if (direccion === "anterior") {
      setFotoSeleccionada(fotoSeleccionada > 0 ? fotoSeleccionada - 1 : fotosFiltradas.length - 1);
    } else {
      setFotoSeleccionada(fotoSeleccionada < fotosFiltradas.length - 1 ? fotoSeleccionada + 1 : 0);
    }
  }

  const fotoActual = fotoSeleccionada !== null ? fotosFiltradas[fotoSeleccionada] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando galería...</CardTitle>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-blue-600 flex items-center gap-2">
                  <ImageIcon className="h-8 w-8" />
                  Galería de Fotos
                </CardTitle>
                <CardDescription className="mt-1">
                  {fotosFiltradas.length} de {fotos.length} fotos de reportes mineros
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {mostrarFiltros ? "Ocultar" : "Mostrar"} Filtros
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filtros */}
        {mostrarFiltros && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
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
                  <select
                    id="proyectoId"
                    value={filtros.proyectoId}
                    onChange={(e) => setFiltros({ ...filtros, proyectoId: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
                  <select
                    id="tipoTrabajo"
                    value={filtros.tipoTrabajo}
                    onChange={(e) => setFiltros({ ...filtros, tipoTrabajo: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Todos los tipos</option>
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
                  <Label htmlFor="fechaDesde">Desde</Label>
                  <Input
                    id="fechaDesde"
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
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
          </Card>
        )}

        {/* Grid de Fotos */}
        {fotosFiltradas.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay fotos</CardTitle>
              <CardDescription>
                No se encontraron fotos con los filtros seleccionados
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotosFiltradas.map((foto, index) => (
              <Card
                key={`${foto.reporteId}-${index}`}
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => abrirLightbox(index)}
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={foto.url}
                    alt={`Foto de ${foto.proyectoNombre || "reporte"}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {foto.proyectoNombre && (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {foto.proyectoNombre}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {foto.reporteTipo?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(foto.reporteFecha).toLocaleDateString('es-CL')}</span>
                    </div>
                    {foto.reporteDireccion && (
                      <div className="flex items-start gap-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{foto.reporteDireccion}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {fotoActual && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={cerrarLightbox}
          >
            <button
              onClick={cerrarLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navegarFoto("anterior");
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition z-10"
            >
              <ChevronLeft className="h-12 w-12" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navegarFoto("siguiente");
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition z-10"
            >
              <ChevronRight className="h-12 w-12" />
            </button>

            <div
              className="max-w-6xl max-h-[90vh] w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex items-center justify-center mb-4">
                <img
                  src={fotoActual.url}
                  alt={`Foto de ${fotoActual.proyectoNombre || "reporte"}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
              </div>

              <Card className="bg-white bg-opacity-95">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {fotoActual.proyectoNombre && (
                        <h3 className="text-lg font-bold text-gray-900">
                          {fotoActual.proyectoNombre}
                        </h3>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {fotoActual.reporteTipo?.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          className={
                            fotoActual.reporteStatus === "APROBADO"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : fotoActual.reporteStatus === "ENVIADO"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          {fotoActual.reporteStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(fotoActual.reporteFecha).toLocaleDateString('es-CL')}</span>
                        </div>
                      </div>

                      {fotoActual.reporteDireccion && (
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{fotoActual.reporteDireccion}</span>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/reportes/${fotoActual.reporteId}`)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Ver Reporte Completo
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      {(fotoSeleccionada || 0) + 1} / {fotosFiltradas.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

