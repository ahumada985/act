"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, X, FileText, Briefcase, BarChart3, Map, Image as ImageIcon, Tag, Upload, MessageSquare } from "lucide-react";
import { contarReportesPendientes } from "@/lib/offline-storage";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [reportesPendientes, setReportesPendientes] = useState(0);

  // Cargar contador de reportes pendientes
  useEffect(() => {
    cargarContadorPendientes();

    // Recargar cada 5 segundos
    const interval = setInterval(cargarContadorPendientes, 5000);
    return () => clearInterval(interval);
  }, []);

  async function cargarContadorPendientes() {
    try {
      const count = await contarReportesPendientes();
      setReportesPendientes(count);
    } catch (error) {
      console.error('Error cargando reportes pendientes:', error);
    }
  }

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delaySearch = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  async function performSearch() {
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const searchLower = searchTerm.toLowerCase();

      // Buscar en reportes
      const { data: reportes } = await supabase
        .from("Reporte")
        .select("id, tipoTrabajo, proyecto, ordenTrabajo, direccion, createdAt")
        .or(`proyecto.ilike.%${searchLower}%,ordenTrabajo.ilike.%${searchLower}%,descripcion.ilike.%${searchLower}%,direccion.ilike.%${searchLower}%`)
        .limit(5);

      // Buscar en proyectos - DESHABILITADO (tabla Proyecto no existe)
      // const { data: proyectos } = await supabase
      //   .from("Proyecto")
      //   .select("id, nombre, cliente, descripcion")
      //   .or(`nombre.ilike.%${searchLower}%,cliente.ilike.%${searchLower}%,descripcion.ilike.%${searchLower}%`)
      //   .limit(5);

      const results = [
        ...(reportes || []).map(r => ({ ...r, type: "reporte" })),
        // ...(proyectos || []).map(p => ({ ...p, type: "proyecto" }))
      ];

      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleResultClick = (result: any) => {
    if (result.type === "reporte") {
      router.push(`/reportes/${result.id}`);
    } else {
      router.push(`/proyectos`);
    }
    setSearchTerm("");
    setShowResults(false);
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

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition flex-shrink-0"
            onClick={() => router.push("/")}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Image
                src="/logo.png"
                alt="Northtek Logo"
                width={120}
                height={48}
                priority
                className="object-contain"
              />
            </div>
            <div className="border-l border-gray-300 pl-3 hidden sm:block">
              <h1 className="text-xl font-bold text-blue-600">Northtek</h1>
              <p className="text-xs text-gray-600">Sistema de Reportabilidad</p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar reportes o proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showResults && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowResults(false)}
                />
                <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">Buscando...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron resultados
                    </div>
                  ) : (
                    searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition"
                      >
                        <div className="flex items-start gap-3">
                          {result.type === "reporte" ? (
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {result.type === "reporte"
                                ? getTipoTrabajoLabel(result.tipoTrabajo)
                                : result.nombre
                              }
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {result.type === "reporte"
                                ? (result.proyecto || result.ordenTrabajo || result.direccion)
                                : (result.cliente || result.descripcion)
                              }
                            </p>
                            <span className="text-xs text-gray-400">
                              {result.type === "reporte" ? "Reporte" : "Proyecto"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navegación */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Reportes Pendientes - Visible siempre si hay reportes */}
            {reportesPendientes > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/reportes/pendientes")}
                title="Reportes Pendientes"
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2 relative"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Pendientes</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {reportesPendientes}
                </span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              title="Inicio"
              className="hidden md:flex gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              title="Dashboard"
              className="hidden lg:flex gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reportes")}
              title="Reportes"
              className="hidden md:flex gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>Reportes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/proyectos")}
              title="Proyectos"
              className="hidden md:flex gap-2"
            >
              <Briefcase className="h-4 w-4" />
              <span>Proyectos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/mapa")}
              title="Mapa"
              className="hidden lg:flex gap-2"
            >
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/galeria")}
              title="Galería"
              className="hidden lg:flex gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Galería</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/etiquetas")}
              title="Etiquetas"
              className="hidden xl:flex gap-2"
            >
              <Tag className="h-4 w-4" />
              <span>Etiquetas</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/chat")}
              title="Chat"
              className="hidden md:flex gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>

            {/* Notificaciones y Usuario */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
