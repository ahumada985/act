"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportePDF } from "@/lib/pdf/reportePDF";
import { Header } from "@/components/layout/Header";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import {
  ArrowLeft,
  Download,
  MapPin,
  Calendar,
  User,
  FileText,
  Loader2,
  Mic,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function ReporteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [reporte, setReporte] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchReporte(params.id as string);
    }
  }, [params.id]);

  async function fetchReporte(id: string) {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select(`
          *,
          supervisor:User(nombre, apellido, email),
          fotos:Foto(id, url, descripcion, orden),
          audios:Audio(id, url, duracion, createdAt)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setReporte(data);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar reporte: " + error.message);
    } finally {
      setLoading(false);
    }
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Reporte")
        .delete()
        .eq("id", params.id);

      if (error) throw error;

      alert("Reporte eliminado exitosamente");
      router.push("/reportes");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al eliminar reporte: " + error.message);
    }
  };

  const handleAprobar = async () => {
    if (!confirm("¿Aprobar este reporte?")) return;

    try {
      const { error } = await supabase
        .from("Reporte")
        .update({ status: "APROBADO" })
        .eq("id", params.id);

      if (error) throw error;

      alert("Reporte aprobado exitosamente");
      fetchReporte(params.id as string);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al aprobar reporte: " + error.message);
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt("Motivo del rechazo (opcional):");
    if (motivo === null) return; // Usuario canceló

    try {
      const { error } = await supabase
        .from("Reporte")
        .update({
          status: "RECHAZADO",
          observaciones: reporte.observaciones
            ? `${reporte.observaciones}\n\nRECHAZADO: ${motivo}`
            : `RECHAZADO: ${motivo}`
        })
        .eq("id", params.id);

      if (error) throw error;

      alert("Reporte rechazado");
      fetchReporte(params.id as string);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al rechazar reporte: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando reporte...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Reporte no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/reportes")}>
              Volver a Reportes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
        {/* Header con acciones */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/reportes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex gap-2 flex-wrap">
            {reporte.status === "ENVIADO" && (
              <>
                <Button
                  onClick={handleAprobar}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>

                <Button
                  onClick={handleRechazar}
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={() => router.push(`/reportes/${params.id}/editar`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>

            <Button
              variant="outline"
              onClick={handleDelete}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>

            <PDFDownloadLink
              document={
                <ReportePDF
                  reporte={reporte}
                  supervisor={reporte.supervisor}
                  fotos={reporte.fotos}
                />
              }
              fileName={`reporte-${reporte.tipoTrabajo}-${new Date(reporte.createdAt).toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <Button className="gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                </CardTitle>
                {reporte.proyecto && (
                  <CardDescription className="text-lg mt-1">
                    {reporte.proyecto}
                  </CardDescription>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reporte.supervisor && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Supervisor</p>
                    <p className="text-sm text-gray-900">
                      {reporte.supervisor.nombre} {reporte.supervisor.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{reporte.supervisor.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Fecha de Creación</p>
                  <p className="text-sm text-gray-900">{formatDateTime(reporte.createdAt)}</p>
                </div>
              </div>

              {reporte.ordenTrabajo && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Orden de Trabajo</p>
                    <p className="text-sm text-gray-900">{reporte.ordenTrabajo}</p>
                  </div>
                </div>
              )}

              {reporte.clienteFinal && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Cliente Final</p>
                    <p className="text-sm text-gray-900">{reporte.clienteFinal}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reporte.direccion && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Dirección</p>
                <p className="text-sm text-gray-900">{reporte.direccion}</p>
              </div>
            )}

            {(reporte.comuna || reporte.region) && (
              <div className="flex gap-4">
                {reporte.comuna && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Comuna</p>
                    <p className="text-sm text-gray-900">{reporte.comuna}</p>
                  </div>
                )}
                {reporte.region && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Región</p>
                    <p className="text-sm text-gray-900">{reporte.region}</p>
                  </div>
                )}
              </div>
            )}

            {reporte.latitud && reporte.longitud && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  Coordenadas GPS
                </p>
                <p className="text-xs text-green-700">
                  Latitud: {reporte.latitud.toFixed(6)}
                </p>
                <p className="text-xs text-green-700">
                  Longitud: {reporte.longitud.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Descripción */}
        {reporte.descripcion && (
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {reporte.descripcion}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {reporte.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {reporte.observaciones}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Fotos */}
        {reporte.fotos && reporte.fotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fotografías ({reporte.fotos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reporte.fotos
                  .sort((a: any, b: any) => a.orden - b.orden)
                  .map((foto: any, index: number) => (
                    <div key={foto.id} className="space-y-2">
                      <img
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border shadow-sm hover:shadow-lg transition cursor-pointer hover:scale-105"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      />
                      {foto.descripcion && (
                        <p className="text-xs text-gray-600">{foto.descripcion}</p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audios */}
        {reporte.audios && reporte.audios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audios de Voz ({reporte.audios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reporte.audios
                  .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((audio: any, index: number) => (
                    <div
                      key={audio.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Audio {index + 1}</p>
                        <p className="text-xs text-gray-600">
                          Duración: {formatDuration(audio.duracion || 0)}
                        </p>
                      </div>
                      <audio
                        controls
                        className="h-10"
                        preload="metadata"
                      >
                        <source src={audio.url} type="audio/webm" />
                        <source src={audio.url} type="audio/mp3" />
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox para fotos */}
      {lightboxOpen && reporte.fotos && reporte.fotos.length > 0 && (
        <ImageLightbox
          images={reporte.fotos.sort((a: any, b: any) => a.orden - b.orden)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
