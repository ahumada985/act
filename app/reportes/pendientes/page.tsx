"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useReportesOffline } from "@/hooks/useReportesOffline";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react";

export default function ReportesPendientesPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { reportesPendientes, eliminarReporte, actualizarEstado, recargar } = useReportesOffline();
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });

  const supabase = createClient();

  // Enviar un reporte a Supabase
  const enviarReporte = async (reporte: any) => {
    console.log('[Envío] Enviando reporte:', reporte.id);

    try {
      // Actualizar estado a "enviando"
      await actualizarEstado(reporte.id, 'enviando');

      // Subir fotos si existen
      const fotosUrls: string[] = [];
      if (reporte.fotos && reporte.fotos.length > 0) {
        for (const foto of reporte.fotos) {
          // Convertir base64 a blob
          const response = await fetch(foto.data);
          const blob = await response.blob();

          // Subir a Supabase Storage
          const fileName = `${Date.now()}-${foto.nombre}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fotos-reportes')
            .upload(fileName, blob);

          if (uploadError) throw uploadError;

          // Obtener URL pública
          const { data: urlData } = supabase.storage
            .from('fotos-reportes')
            .getPublicUrl(fileName);

          fotosUrls.push(urlData.publicUrl);
        }
      }

      // Subir audio si existe
      let audioUrl: string | null = null;
      if (reporte.audio) {
        const response = await fetch(reporte.audio.data);
        const blob = await response.blob();

        const fileName = `${Date.now()}-${reporte.audio.nombre}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-reportes')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('audio-reportes')
          .getPublicUrl(fileName);

        audioUrl = urlData.publicUrl;
      }

      // Crear reporte en Supabase
      const { data, error } = await supabase
        .from('reportes')
        .insert({
          tipo_trabajo: reporte.tipoTrabajo,
          supervisor_id: reporte.supervisorId,
          proyecto_id: reporte.proyectoId,
          descripcion: reporte.descripcion,
          observaciones: reporte.observaciones,
          coordenadas: reporte.coordenadas,
          fotos: fotosUrls,
          audio: audioUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Eliminar de IndexedDB
      await eliminarReporte(reporte.id);

      console.log('[Envío] ✅ Reporte enviado exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('[Envío] ❌ Error:', error);
      await actualizarEstado(reporte.id, 'error', error.message);
      return { success: false, error: error.message };
    }
  };

  // Enviar todos los reportes pendientes
  const enviarTodos = async () => {
    if (!isOnline) {
      alert('No hay conexión a internet');
      return;
    }

    if (reportesPendientes.length === 0) {
      alert('No hay reportes pendientes');
      return;
    }

    setEnviando(true);
    setProgreso({ actual: 0, total: reportesPendientes.length });

    let exitosos = 0;
    let fallidos = 0;

    for (let i = 0; i < reportesPendientes.length; i++) {
      const reporte = reportesPendientes[i];
      setProgreso({ actual: i + 1, total: reportesPendientes.length });

      const result = await enviarReporte(reporte);
      if (result.success) {
        exitosos++;
      } else {
        fallidos++;
      }
    }

    setEnviando(false);
    await recargar();

    alert(`✅ Enviados: ${exitosos}\n❌ Fallidos: ${fallidos}`);

    if (fallidos === 0) {
      router.push('/reportes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📤 Reportes Pendientes</h1>
              <p className="text-gray-600">
                {reportesPendientes.length} {reportesPendientes.length === 1 ? 'reporte' : 'reportes'} esperando envío
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-5 w-5" />
                  <span className="font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-5 w-5" />
                  <span className="font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón de enviar todos */}
        {reportesPendientes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <Button
              onClick={enviarTodos}
              disabled={!isOnline || enviando}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {enviando ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Enviando {progreso.actual}/{progreso.total}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Todos los Reportes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Lista de reportes */}
        <div className="space-y-4">
          {reportesPendientes.map((reporte) => (
            <div key={reporte.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{reporte.tipoTrabajo}</h3>
                    {reporte.estado === 'pendiente' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        ⏳ Pendiente
                      </span>
                    )}
                    {reporte.estado === 'enviando' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        📤 Enviando...
                      </span>
                    )}
                    {reporte.estado === 'error' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        ❌ Error
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-2">{reporte.descripcion}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(reporte.createdAt).toLocaleString()}</span>
                    {reporte.fotos && reporte.fotos.length > 0 && (
                      <span>📷 {reporte.fotos.length} fotos</span>
                    )}
                    {reporte.audio && <span>🎤 Audio</span>}
                  </div>

                  {reporte.errorMsg && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      {reporte.errorMsg}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarReporte(reporte.id)}
                  disabled={enviando}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {reportesPendientes.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">¡Todo al día!</h2>
            <p className="text-gray-600">No hay reportes pendientes de envío</p>
            <Button
              onClick={() => router.push('/reportes')}
              className="mt-4"
            >
              Ver Reportes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
