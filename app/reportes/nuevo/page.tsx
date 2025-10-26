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
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Save, Loader2, X, Mic, WifiOff, Wifi } from "lucide-react";

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
  const [audios, setAudios] = useState<{ file: File; duration: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

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
  });

  useEffect(() => {
    fetchPlantillas();
    fetchProyectos();
  }, []);

  // Actualizar dirección automáticamente cuando el GPS la obtenga
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

  async function fetchPlantillas() {
    try {
      const { data } = await supabase
        .from("PlantillaFormulario")
        .select("*");

      if (data) setPlantillas(data);
    } catch (error) {
      console.log('[Offline] No se pudieron cargar plantillas:', error);
      // No hacer nada, simplemente no carga las plantillas
    }
  }

  async function fetchProyectos() {
    try {
      const { data } = await supabase
        .from("Proyecto")
        .select("*")
        .eq("estado", "ACTIVO")
        .order("nombre");

      if (data) setProyectos(data);
    } catch (error) {
      console.log('[Offline] No se pudieron cargar proyectos:', error);
      // No hacer nada, simplemente no carga los proyectos
    }
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

  const removeAudio = (index: number) => {
    setAudios(audios.filter((_, i) => i !== index));
  };

  // Función para agregar logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  // Convertir File a base64
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
      // ===== MODO OFFLINE: Guardar localmente =====
      if (!isOnline) {
        addDebugLog('🔴 MODO OFFLINE - Guardando localmente...');

        // Convertir fotos a base64
        addDebugLog(`📷 Convirtiendo ${fotos.length} fotos a base64...`);
        const fotosBase64: { data: string; nombre: string }[] = [];
        for (const foto of fotos) {
          const base64 = await fileToBase64(foto);
          fotosBase64.push({ data: base64, nombre: foto.name });
        }
        addDebugLog(`✅ Fotos convertidas: ${fotosBase64.length}`);

        // Convertir audio a base64
        let audioBase64: { data: string; nombre: string } | undefined;
        if (audios.length > 0) {
          addDebugLog('🎤 Convirtiendo audio a base64...');
          const audio = audios[0];
          const base64 = await fileToBase64(audio.file);
          audioBase64 = { data: base64, nombre: audio.file.name };
          addDebugLog('✅ Audio convertido');
        }

        // Guardar en IndexedDB
        addDebugLog('💾 Guardando en IndexedDB...');
        const reporteId = await guardarReporteOffline({
          tipoTrabajo: formData.tipoTrabajo,
          supervisorId: "supervisor-001",
          proyectoId: formData.proyectoId || "",
          descripcion: formData.descripcion,
          observaciones: formData.observaciones,
          coordenadas: gps.latitude && gps.longitude ? {
            lat: gps.latitude,
            lng: gps.longitude
          } : undefined,
          fotos: fotosBase64,
          audio: audioBase64,
        });
        addDebugLog(`✅ Guardado con ID: ${reporteId}`);

        alert("✅ Reporte guardado localmente\n\nSe enviará cuando haya conexión.\n\nPuedes ver los reportes pendientes en el menú.");

        addDebugLog('🔀 Navegando a /reportes/pendientes...');
        router.push("/reportes/pendientes");
        addDebugLog('✅ COMPLETADO');
        return;
      }

      // ===== MODO ONLINE: Enviar a Supabase =====
      console.log('[Online] Enviando reporte a Supabase...');

      // 1. Subir fotos a Supabase Storage
      const fotosUrls: string[] = [];
      for (const foto of fotos) {
        const path = `${Date.now()}-${foto.name}`;
        const { url, error } = await uploadFile("reportes-fotos", path, foto);

        if (error) throw error;
        if (url) fotosUrls.push(url);
      }

      // 1b. Subir audios a Supabase Storage
      const audiosData: { url: string; duration: number }[] = [];
      for (const audio of audios) {
        const path = `${Date.now()}-${audio.file.name}`;
        const { url, error } = await uploadFile("reportes-audios", path, audio.file);

        if (error) throw error;
        if (url) audiosData.push({ url, duration: audio.duration });
      }

      // 2. Crear reporte
      const { data: reporte, error: reporteError} = await supabase
        .from("Reporte")
        .insert({
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
          latitud: gps.latitude,
          longitud: gps.longitude,
          supervisorId: "supervisor-001", // Por ahora hardcodeado
          status: "ENVIADO",
        })
        .select()
        .single();

      if (reporteError) throw reporteError;

      // 3. Crear registros de fotos
      if (fotosUrls.length > 0 && reporte) {
        const fotosDataInsert = fotosUrls.map((url, index) => ({
          url,
          reporteId: reporte.id,
          orden: index,
        }));

        const { error: fotosError } = await supabase
          .from("Foto")
          .insert(fotosDataInsert);

        if (fotosError) throw fotosError;
      }

      // 4. Crear registros de audios
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

      alert("✅ Reporte enviado exitosamente!");
      router.push("/reportes");
    } catch (error: any) {
      console.error("Error:", error);
      addDebugLog(`❌ ERROR: ${error.message}`);
      addDebugLog(`Stack: ${error.stack || 'No stack trace'}`);
      alert("❌ Error al crear reporte: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const plantillaActual = plantillas.find(
    (p) => p.tipoTrabajo === formData.tipoTrabajo
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">
              Nuevo Reporte de Terreno
            </CardTitle>
            <CardDescription>
              Complete los datos del reporte y capture fotos del trabajo realizado
            </CardDescription>
          </CardHeader>
        </Card>

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
                <Select
                  id="tipoTrabajo"
                  name="tipoTrabajo"
                  value={formData.tipoTrabajo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {TIPOS_TRABAJO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </Select>
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
                <Select
                  id="proyectoId"
                  name="proyectoId"
                  value={formData.proyectoId}
                  onChange={(e) => {
                    const selectedProyecto = proyectos.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      proyectoId: e.target.value,
                      proyecto: selectedProyecto?.nombre || ""
                    });
                  }}
                >
                  <option value="">Seleccione un proyecto (opcional)</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre} {proyecto.cliente ? `- ${proyecto.cliente}` : ""}
                    </option>
                  ))}
                </Select>
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

          {/* Ubicación con GPS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gps.loading && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {gps.latitude ? "Obteniendo dirección..." : "Obteniendo ubicación GPS..."}
                </p>
              )}
              {gps.error && (
                <p className="text-sm text-red-600">{gps.error}</p>
              )}
              {gps.latitude && gps.longitude && !gps.loading && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-800">
                    Ubicación capturada exitosamente ✓
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    GPS: {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}
                  </p>
                  {gps.direccion && gps.direccion !== "Dirección no disponible" && (
                    <p className="text-xs text-green-700 mt-1">
                      📍 {gps.direccion}, {gps.comuna}
                    </p>
                  )}
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
                  placeholder="Describa el trabajo realizado... (o use el micrófono para dictar)"
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
                  placeholder="Observaciones adicionales... (o use el micrófono para dictar)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
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
                <Camera className="h-5 w-5 mr-2" />
                Capturar Foto
              </Button>

              {fotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${index + 1}`}
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

          {/* Audios de Voz */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audios de Voz ({audios.length})
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
                        <p className="text-sm font-medium text-gray-900">Audio {index + 1}</p>
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
            <CardContent className="pt-6 space-y-3">
              {/* Indicador de conexión */}
              <div className={`p-3 rounded-lg border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Wifi className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Online - Se enviará inmediatamente
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Offline - Se guardará localmente
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.tipoTrabajo}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
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

      {/* Panel de Debug - Solo visible en modo offline */}
      {!isOnline && debugLogs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white p-4 max-h-64 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">📋 Debug Logs</h3>
            <button
              onClick={() => setDebugLogs([])}
              className="text-xs bg-red-500 px-2 py-1 rounded"
            >
              Limpiar
            </button>
          </div>
          <div className="space-y-1 text-xs font-mono">
            {debugLogs.map((log, index) => (
              <div key={index} className="border-b border-gray-700 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
