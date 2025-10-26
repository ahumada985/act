"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Reporte {
  id: string;
  latitud: number;
  longitud: number;
  tipoTrabajo: string;
  proyecto?: string;
  direccion?: string;
  createdAt: string;
}

interface ReportesMapProps {
  reportes: Reporte[];
  onMarkerClick?: (reporteId: string) => void;
  height?: string;
}

// Componente para ajustar el bounds del mapa
function MapBounds({ reportes }: { reportes: Reporte[] }) {
  const map = useMap();

  useEffect(() => {
    if (reportes.length > 0) {
      const bounds = L.latLngBounds(
        reportes.map(r => [r.latitud, r.longitud])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [reportes, map]);

  return null;
}

export function ReportesMap({ reportes, onMarkerClick, height = "600px" }: ReportesMapProps) {
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

  const getTipoTrabajoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      FIBRA_OPTICA: "#3b82f6",
      DATA_CENTER: "#8b5cf6",
      ANTENAS: "#ec4899",
      CCTV: "#f59e0b",
      INSTALACION_RED: "#10b981",
      MANTENIMIENTO: "#06b6d4",
      OTRO: "#6b7280",
    };
    return colors[tipo] || "#6b7280";
  };

  // Crear icono personalizado por tipo de trabajo
  const createCustomIcon = (tipo: string) => {
    const color = getTipoTrabajoColor(tipo);
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 24 12 24s12-15.9 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `;
    return L.divIcon({
      html: svgIcon,
      className: "custom-marker",
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48]
    });
  };

  // Centro por defecto (Santiago, Chile)
  const defaultCenter: [number, number] = [-33.4489, -70.6693];

  const center: [number, number] = reportes.length > 0
    ? [reportes[0].latitud, reportes[0].longitud]
    : defaultCenter;

  if (reportes.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">No hay reportes con ubicación GPS</p>
          <p className="text-sm mt-2">Los reportes aparecerán aquí cuando tengan coordenadas</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds reportes={reportes} />

        {reportes.map((reporte) => (
          <Marker
            key={reporte.id}
            position={[reporte.latitud, reporte.longitud]}
            icon={createCustomIcon(reporte.tipoTrabajo)}
          >
            {/* Tooltip que aparece al pasar el mouse */}
            <Tooltip
              direction="top"
              offset={[0, -40]}
              opacity={0.95}
              className="custom-tooltip"
            >
              <div className="text-center">
                <div className="font-semibold text-sm mb-1" style={{ color: getTipoTrabajoColor(reporte.tipoTrabajo) }}>
                  {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                </div>
                {reporte.proyecto && (
                  <div className="text-xs font-medium text-gray-800">
                    {reporte.proyecto}
                  </div>
                )}
              </div>
            </Tooltip>

            {/* Popup mejorado que aparece al hacer click */}
            <Popup maxWidth={350} className="custom-popup">
              <div className="p-1">
                {/* Header del popup con color según tipo */}
                <div
                  className="px-4 py-3 rounded-t-lg -mx-1 -mt-1 mb-3"
                  style={{
                    backgroundColor: getTipoTrabajoColor(reporte.tipoTrabajo),
                    background: `linear-gradient(135deg, ${getTipoTrabajoColor(reporte.tipoTrabajo)} 0%, ${getTipoTrabajoColor(reporte.tipoTrabajo)}dd 100%)`
                  }}
                >
                  <h3 className="font-bold text-base text-white text-center">
                    {getTipoTrabajoLabel(reporte.tipoTrabajo)}
                  </h3>
                </div>

                {/* Contenido del popup */}
                <div className="space-y-2 px-2">
                  {reporte.proyecto && (
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">PROYECTO</p>
                      <p className="text-sm font-semibold text-gray-800">{reporte.proyecto}</p>
                    </div>
                  )}

                  {reporte.direccion && (
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">UBICACIÓN</p>
                      <p className="text-sm text-gray-700">{reporte.direccion}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">
                        {new Date(reporte.createdAt).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {onMarkerClick && (
                      <button
                        onClick={() => onMarkerClick(reporte.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                        style={{
                          backgroundColor: getTipoTrabajoColor(reporte.tipoTrabajo),
                          color: 'white'
                        }}
                      >
                        Ver Detalles →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
