"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, uploadFile } from "@/lib/supabase/client";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { guardarReporteOffline } from "@/lib/offline-storage";
import { CameraCapture } from "@/components/forms/CameraCapture";
import { AudioCapture } from "@/components/forms/AudioCapture";
import { VoiceInput } from "@/components/forms/VoiceInput";
import { AnalisisIAPanel } from "@/components/ia/AnalisisIAPanel";
import { AIDescriptionGenerator } from "@/components/ai/AIDescriptionGenerator";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Save, Loader2, X, Mic, WifiOff, Wifi, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { TipoTrabajo } from "@/lib/ia/prompts";
import type { AnalisisIA } from "@/app/api/vision/analyze/route";

const TIPOS_TRABAJO = [
  { value: "FIBRA_OPTICA", label: "Fibra Óptica" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "ANTENAS", label: "Antenas" },
  { value: "CCTV", label: "CCTV" },
  { value: "INSTALACION_RED", label: "Instalación de Red" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "OTRO", label: "Otro" },
];

export default function NuevoReportePage() {
  const router = useRouter();
  const gps = useGeolocation(true);
  const isOnline = useOnlineStatus();

  const [showCamera, setShowCamera] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [audios, setAudios] = useState<{ file: File; duration: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<AnalisisIA | null>(null);

  const [formData, setFormData] = useState({
    tipoTrabajo: "",
    clienteFinal: "",
    ordenTrabajo: "",
    proyecto: "",
    descripcion: "",
    observaciones: "",
    direccion: "",
    comuna: "",
    region: "",
  });

  useEffect(() => {
    if (gps.direccion && !formData.direccion) {
      setFormData(prev => ({
        ...prev,
        direccion: gps.direccion || "",
        comuna: gps.comuna || "",
        region: gps.region || "",
      }));
    }
  }, [gps.direccion, gps.comuna, gps.region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCapture = (file: File) => {
    setFotos([...fotos, file]);
    const url = URL.createObjectURL(file);
    setFotosUrls([...fotosUrls, url]);
  };

  const handleAudioCapture = (file: File, duration: number) => {
    setAudios([...audios, { file, duration }]);
  };

  const removePhoto = (index: number) => {
    if (fotosUrls[index]) {
      URL.revokeObjectURL(fotosUrls[index]);
    }
    setFotos(fotos.filter((_, i) => i !== index));
    setFotosUrls(fotosUrls.filter((_, i) => i !== index));
    if (index === fotos.length - 1) {
      setAnalisisIA(null);
    }
  };

  const removeAudio = (index: number) => {
    setAudios(audios.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isOnline) {
        const fotosBase64: { data: string; nombre: string }[] = [];
        for (const foto of fotos) {
          const base64 = await fileToBase64(foto);
          fotosBase64.push({ data: base64, nombre: foto.name });
        }

        let audioBase64: { data: string; nombre: string } | undefined;
        if (audios.length > 0) {
          const audio = audios[0];
          const base64 = await fileToBase64(audio.file);
          audioBase64 = { data: base64, nombre: audio.file.name };
        }

        await guardarReporteOffline({
          tipoTrabajo: formData.tipoTrabajo,
          supervisorId: "supervisor-001",
          proyectoId: "",
          descripcion: formData.descripcion,
          observaciones: formData.observaciones,
          coordenadas: gps.latitude && gps.longitude ? {
            lat: gps.latitude,
            lng: gps.longitude
          } : undefined,
          fotos: fotosBase64,
          audio: audioBase64,
        });

        setFormData({
          tipoTrabajo: "",
          clienteFinal: "",
          ordenTrabajo: "",
          proyecto: "",
          descripcion: "",
          observaciones: "",
          direccion: "",
          comuna: "",
          region: "",
        });
        setFotos([]);
        setAudios([]);

        alert("Reporte guardado localmente. Se enviará cuando haya conexión.");
        return;
      }

      const fotosUrlsArray: string[] = [];
      for (const foto of fotos) {
        const path = `${Date.now()}-${foto.name}`;
        const { url, error } = await uploadFile("reportes-fotos", path, foto);
        if (error) throw error;
        if (url) fotosUrlsArray.push(url);
      }

      const audiosData: { url: string; duration: number }[] = [];
      for (const audio of audios) {
        const path = `${Date.now()}-${audio.file.name}`;
        const { url, error } = await uploadFile("reportes-audios", path, audio.file);
        if (error) throw error;
        if (url) audiosData.push({ url, duration: audio.duration });
      }

      const { data: reporte, error: reporteError} = await supabase
        .from("Reporte")
        .insert({
          tipoTrabajo: formData.tipoTrabajo,
          clienteFinal: formData.clienteFinal,
          ordenTrabajo: formData.ordenTrabajo,
          proyecto: formData.proyecto,
          descripcion: formData.descripcion,
          observaciones: formData.observaciones,
          direccion: formData.direccion,
          comuna: formData.comuna,
          region: formData.region,
          latitud: gps.latitude,
          longitud: gps.longitude,
          supervisorId: "supervisor-001",
          status: "ENVIADO",
          analisis_ia: analisisIA || null,
          conformidad_ia: analisisIA?.cumplimiento_general || null,
          puntuacion_ia: analisisIA?.puntuacion || null,
          validado_por_humano: false,
        })
        .select()
        .single();

      if (reporteError) throw reporteError;

      if (fotosUrlsArray.length > 0 && reporte) {
        const fotosDataInsert = fotosUrlsArray.map((url, index) => ({
          url,
          reporteId: reporte.id,
          orden: index,
        }));

        const { error: fotosError } = await supabase
          .from("Foto")
          .insert(fotosDataInsert);

        if (fotosError) throw fotosError;
      }

      if (audiosData.length > 0 && reporte) {
        const audiosDataInsert = audiosData.map((audio) => ({
          url: audio.url,
          duracion: audio.duration,
          reporteId: reporte.id,
        }));

        const { error: audiosError } = await supabase
          .from("Audio")
          .insert(audiosDataInsert);

        if (audiosError) throw audiosError;
      }

      alert("Reporte enviado exitosamente!");
      router.push("/reportes");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al crear reporte: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Reporte</h1>
            <p className="text-gray-500 mt-1">Complete los datos del reporte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de trabajo */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Tipo de Trabajo *</Label>
                  <select
                    name="tipoTrabajo"
                    value={formData.tipoTrabajo}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="">Seleccione...</option>
                    {TIPOS_TRABAJO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Orden de Trabajo</Label>
                    <Input
                      name="ordenTrabajo"
                      value={formData.ordenTrabajo}
                      onChange={handleInputChange}
                      placeholder="OT-2025-001"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Cliente</Label>
                    <Input
                      name="clienteFinal"
                      value={formData.clienteFinal}
                      onChange={handleInputChange}
                      placeholder="Nombre cliente"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Proyecto</Label>
                  <Input
                    name="proyecto"
                    value={formData.proyecto}
                    onChange={handleInputChange}
                    placeholder="Nombre del proyecto"
                    className="bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gps.loading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Obteniendo ubicación...
                  </div>
                )}

                {gps.latitude && gps.longitude && !gps.loading && (
                  <div className="p-3 bg-emerald-50 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm">
                      <span className="font-medium text-emerald-700">GPS capturado</span>
                      <span className="text-emerald-600 ml-2">{gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-500">Dirección</Label>
                  <Input
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Calle y número"
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Comuna</Label>
                    <Input
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Región</Label>
                    <Input
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.tipoTrabajo && fotosUrls.length > 0 && (
                  <AIDescriptionGenerator
                    tipoTrabajo={formData.tipoTrabajo as TipoTrabajo}
                    imageUrls={fotosUrls}
                    context={formData.proyecto}
                    onGenerated={(descripcion) => {
                      setFormData(prev => ({ ...prev, descripcion }));
                    }}
                  />
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">Descripción del trabajo</Label>
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
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describa el trabajo realizado..."
                    className="bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">Observaciones</Label>
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
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Observaciones adicionales..."
                    className="bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fotos */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-pink-600" />
                  Fotografías ({fotos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Foto
                </Button>

                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {fotos.map((foto, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(foto)}
                          alt={`Foto ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Análisis IA */}
            {fotos.length > 0 && formData.tipoTrabajo && fotosUrls.length > 0 && (
              <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-violet-700">Análisis IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalisisIAPanel
                    fotoUrl={fotosUrls[fotosUrls.length - 1]}
                    tipoEquipo={formData.tipoTrabajo as TipoTrabajo}
                    onAnalisisCompleto={(analisis) => {
                      setAnalisisIA(analisis);
                    }}
                    disabled={!isOnline}
                  />
                  {!isOnline && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                      <WifiOff className="h-4 w-4" />
                      Requiere conexión a internet
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audios */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="h-4 w-4 text-cyan-600" />
                  Audios ({audios.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowAudio(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Grabar Audio
                </Button>

                {audios.length > 0 && (
                  <div className="space-y-2">
                    {audios.map((audio, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                          <Mic className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Audio {index + 1}</p>
                          <p className="text-xs text-gray-500">
                            {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAudio(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className={`p-3 rounded-lg ${isOnline ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <Wifi className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Offline - Se guardará localmente</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.tipoTrabajo}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isOnline ? 'Enviar Reporte' : 'Guardar Offline'}
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
    </ProtectedRoute>
  );
}
