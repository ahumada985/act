"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, uploadFile } from "@/lib/supabase/client";
import { CameraCapture } from "@/components/forms/CameraCapture";
import { AudioCapture } from "@/components/forms/AudioCapture";
import { VoiceInput } from "@/components/forms/VoiceInput";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Select import - using native HTML select
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Save, Loader2, X, Mic, ArrowLeft } from "lucide-react";

const TIPOS_TRABAJO = [
  { value: "FIBRA_OPTICA", label: "Fibra Óptica" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "ANTENAS", label: "Antenas" },
  { value: "CCTV", label: "CCTV" },
  { value: "INSTALACION_RED", label: "Instalación de Red" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "OTRO", label: "Otro" },
];

export default function EditarReportePage() {
  const params = useParams();
  const router = useRouter();

  const [showCamera, setShowCamera] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<any[]>([]);
  const [audios, setAudios] = useState<{ file: File; duration: number }[]>([]);
  const [audiosExistentes, setAudiosExistentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [proyectos, setProyectos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tipoTrabajo: "",
    clienteFinal: "",
    ordenTrabajo: "",
    proyectoId: "",
    proyecto: "",
    descripcion: "",
    observaciones: "",
    direccion: "",
    comuna: "",
    region: "",
    latitud: null as number | null,
    longitud: null as number | null,
  });

  useEffect(() => {
    if (params.id) {
      fetchReporte(params.id as string);
    }
    fetchProyectos();
  }, [params.id]);

  async function fetchReporte(id: string) {
    try {
      const { data, error } = await supabase
        .from("Reporte")
        .select(`
          *,
          fotos:Foto(id, url, descripcion, orden),
          audios:Audio(id, url, duracion)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        tipoTrabajo: data.tipoTrabajo,
        clienteFinal: data.clienteFinal || "",
        ordenTrabajo: data.ordenTrabajo || "",
        proyectoId: data.proyectoId || "",
        proyecto: data.proyecto || "",
        descripcion: data.descripcion || "",
        observaciones: data.observaciones || "",
        direccion: data.direccion || "",
        comuna: data.comuna || "",
        region: data.region || "",
        latitud: data.latitud,
        longitud: data.longitud,
      });

      setFotosExistentes(data.fotos || []);
      setAudiosExistentes(data.audios || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar reporte: " + error.message);
      router.push("/reportes");
    } finally {
      setLoadingData(false);
    }
  }

  async function fetchProyectos() {
    const { data } = await supabase
      .from("Proyecto")
      .select("*")
      .order("nombre");

    if (data) setProyectos(data);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCapture = (file: File) => {
    setFotos([...fotos, file]);
  };

  const handleAudioCapture = (file: File, duration: number) => {
    setAudios([...audios, { file, duration }]);
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = async (fotoId: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;

    try {
      const { error } = await supabase.from("Foto").delete().eq("id", fotoId);
      if (error) throw error;
      setFotosExistentes(fotosExistentes.filter(f => f.id !== fotoId));
    } catch (error: any) {
      alert("Error al eliminar foto: " + error.message);
    }
  };

  const removeAudio = (index: number) => {
    setAudios(audios.filter((_, i) => i !== index));
  };

  const removeExistingAudio = async (audioId: string) => {
    if (!confirm("¿Eliminar este audio?")) return;

    try {
      const { error } = await supabase.from("Audio").delete().eq("id", audioId);
      if (error) throw error;
      setAudiosExistentes(audiosExistentes.filter(a => a.id !== audioId));
    } catch (error: any) {
      alert("Error al eliminar audio: " + error.message);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir nuevas fotos
      const fotosUrls: string[] = [];
      for (const foto of fotos) {
        const path = `${Date.now()}-${foto.name}`;
        const { url, error } = await uploadFile("reportes-fotos", path, foto);
        if (error) throw error;
        if (url) fotosUrls.push(url);
      }

      // 2. Subir nuevos audios
      const audiosData: { url: string; duration: number }[] = [];
      for (const audio of audios) {
        const path = `${Date.now()}-${audio.file.name}`;
        const { url, error } = await uploadFile("reportes-audios", path, audio.file);
        if (error) throw error;
        if (url) audiosData.push({ url, duration: audio.duration });
      }

      // 3. Actualizar reporte
      const { error: reporteError } = await supabase
        .from("Reporte")
        .update({
          tipoTrabajo: formData.tipoTrabajo,
          clienteFinal: formData.clienteFinal,
          ordenTrabajo: formData.ordenTrabajo,
          proyectoId: formData.proyectoId || null,
          proyecto: formData.proyecto,
          descripcion: formData.descripcion,
          observaciones: formData.observaciones,
          direccion: formData.direccion,
          comuna: formData.comuna,
          region: formData.region,
          latitud: formData.latitud,
          longitud: formData.longitud,
        })
        .eq("id", params.id);

      if (reporteError) throw reporteError;

      // 4. Insertar nuevas fotos
      if (fotosUrls.length > 0) {
        const maxOrden = fotosExistentes.length > 0
          ? Math.max(...fotosExistentes.map(f => f.orden))
          : -1;

        const fotosDataInsert = fotosUrls.map((url, index) => ({
          url,
          reporteId: params.id,
          orden: maxOrden + index + 1,
        }));

        const { error: fotosError } = await supabase
          .from("Foto")
          .insert(fotosDataInsert);

        if (fotosError) throw fotosError;
      }

      // 5. Insertar nuevos audios
      if (audiosData.length > 0) {
        const audiosDataInsert = audiosData.map((audio) => ({
          url: audio.url,
          duracion: audio.duration,
          reporteId: params.id,
        }));

        const { error: audiosError } = await supabase
          .from("Audio")
          .insert(audiosDataInsert);

        if (audiosError) throw audiosError;
      }

      alert("Reporte actualizado exitosamente!");
      router.push(`/reportes/${params.id}`);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al actualizar reporte: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/reportes/${params.id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">
                Editar Reporte
              </CardTitle>
              <CardDescription>
                Modifica los datos del reporte
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tipoTrabajo">
                  Tipo de Trabajo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="tipoTrabajo"
                  name="tipoTrabajo"
                  value={formData.tipoTrabajo}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccione...</option>
                  {TIPOS_TRABAJO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="ordenTrabajo">Orden de Trabajo</Label>
                <Input
                  id="ordenTrabajo"
                  name="ordenTrabajo"
                  value={formData.ordenTrabajo}
                  onChange={handleInputChange}
                  placeholder="OT-2025-001"
                />
              </div>

              <div>
                <Label htmlFor="clienteFinal">Cliente Final</Label>
                <Input
                  id="clienteFinal"
                  name="clienteFinal"
                  value={formData.clienteFinal}
                  onChange={handleInputChange}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <Label htmlFor="proyectoId">Proyecto</Label>
                <select
                  id="proyectoId"
                  name="proyectoId"
                  value={formData.proyectoId}
                  onChange={(e) => {
                    const selectedProyecto = proyectos.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      proyectoId: e.target.value,
                      proyecto: selectedProyecto?.nombre || formData.proyecto
                    });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccione un proyecto (opcional)</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre} {proyecto.cliente ? `- ${proyecto.cliente}` : ""}
                    </option>
                  ))}
                </select>
                {!formData.proyectoId && (
                  <Input
                    className="mt-2"
                    name="proyecto"
                    value={formData.proyecto}
                    onChange={handleInputChange}
                    placeholder="O ingrese nombre del proyecto manualmente"
                  />
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
            <CardContent className="space-y-4">
              {formData.latitud && formData.longitud && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-800">
                    GPS: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle y número"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input
                    id="comuna"
                    name="comuna"
                    value={formData.comuna}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <VoiceInput
                    onTranscript={(text) => {
                      setFormData(prev => ({
                        ...prev,
                        descripcion: prev.descripcion + " " + text
                      }));
                    }}
                  />
                </div>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describa el trabajo realizado..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <VoiceInput
                    onTranscript={(text) => {
                      setFormData(prev => ({
                        ...prev,
                        observaciones: prev.observaciones + " " + text
                      }));
                    }}
                  />
                </div>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Fotos Existentes */}
          {fotosExistentes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Fotografías Actuales ({fotosExistentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {fotosExistentes.map((foto) => (
                    <div key={foto.id} className="relative group">
                      <img
                        src={foto.url}
                        alt="Foto existente"
                        className="w-full aspect-video object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(foto.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nuevas Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Agregar Nuevas Fotografías ({fotos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full"
                variant="outline"
              >
                <Camera className="h-5 w-5 mr-2" />
                Capturar Foto
              </Button>

              {fotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Nueva foto ${index + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audios Existentes */}
          {audiosExistentes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Audios Actuales ({audiosExistentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {audiosExistentes.map((audio, index) => (
                    <div key={audio.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Audio {index + 1}</p>
                        <p className="text-xs text-gray-600">
                          Duración: {Math.floor(audio.duracion / 60)}:{(audio.duracion % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingAudio(audio.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nuevos Audios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Agregar Nuevos Audios ({audios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={() => setShowAudio(true)}
                className="w-full"
                variant="outline"
              >
                <Mic className="h-5 w-5 mr-2" />
                Grabar Audio
              </Button>

              {audios.length > 0 && (
                <div className="space-y-2">
                  {audios.map((audio, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nuevo Audio {index + 1}</p>
                        <p className="text-xs text-gray-600">
                          Duración: {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAudio(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón Submit */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={loading || !formData.tipoTrabajo}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showAudio && (
        <AudioCapture
          onCapture={handleAudioCapture}
          onClose={() => setShowAudio(false)}
        />
      )}
    </div>
  );
}
