"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Plus,
  BarChart3,
  Briefcase,
  Map,
  Smartphone,
  Image as ImageIcon,
  CheckCircle,
  Wifi,
  Camera,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Detectar si la app es instalable
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar:\n\n1. Toca el menú (⋮) en la esquina superior derecha\n2. Selecciona "Añadir a pantalla de inicio"\n3. Confirma');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  const features = [
    { icon: Camera, title: "Capturas de Fotos", description: "Alta calidad con geolocalización" },
    { icon: MapPin, title: "GPS Integrado", description: "Ubicación automática de reportes" },
    { icon: Wifi, title: "Modo Offline", description: "Funciona sin conexión" },
    { icon: Clock, title: "Histórico Completo", description: "Acceso a todos los reportes" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header con Gradiente Animado */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Logo y Título Principal */}
          <div className="text-center">
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Image
                  src="/logo.png"
                  alt="ACT Logo"
                  width={240}
                  height={96}
                  priority
                  className="relative object-contain"
                />
              </div>
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 animate-fade-in">
              ACT Reportes
            </h1>

            <p className="text-xl sm:text-2xl text-blue-200 mb-8 animate-fade-in font-light">
              Sistema de Reportabilidad para Telecomunicaciones Mineras
            </p>

            {/* Botón de Instalación Destacado */}
            <Button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-8 text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Smartphone className="h-6 w-6 mr-2" />
              Instalar App
            </Button>
            <p className="text-blue-300 mt-3 text-sm">
              ⚡ Acceso instantáneo desde tu pantalla principal
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Características */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <CardContent className="pt-6 text-center">
                <feature.icon className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <p className="font-semibold text-white text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-blue-200">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Acciones Principales - Diseño Mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Nuevo Reporte - Destacado */}
          <Card
            className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400/50 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => router.push("/reportes/nuevo")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Plus className="h-8 w-8" />
                </div>
                Nuevo Reporte
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Crear reporte de terreno con fotos, audio y GPS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 text-lg shadow-lg"
                onClick={(e) => { e.stopPropagation(); router.push("/reportes/nuevo"); }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Ahora
              </Button>
            </CardContent>
          </Card>

          {/* Ver Reportes */}
          <Card
            className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400/50 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={() => router.push("/reportes")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FileText className="h-8 w-8" />
                </div>
                Ver Reportes
              </CardTitle>
              <CardDescription className="text-purple-100 text-base">
                Historial completo de todos los reportes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold py-6 text-lg shadow-lg"
                onClick={(e) => { e.stopPropagation(); router.push("/reportes"); }}
              >
                <FileText className="h-5 w-5 mr-2" />
                Ver Lista
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Herramientas */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Herramientas Disponibles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dashboard */}
          <Card
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => router.push("/dashboard")}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-center text-lg">Dashboard</CardTitle>
              <CardDescription className="text-blue-200 text-center text-sm">
                Estadísticas y gráficos
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Proyectos */}
          <Card
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => router.push("/proyectos")}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-center text-lg">Proyectos</CardTitle>
              <CardDescription className="text-blue-200 text-center text-sm">
                Gestión de proyectos
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Mapa */}
          <Card
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => router.push("/mapa")}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <Map className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-center text-lg">Mapa</CardTitle>
              <CardDescription className="text-blue-200 text-center text-sm">
                Visualización geográfica
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Galería */}
          <Card
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => router.push("/galeria")}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-center text-lg">Galería</CardTitle>
              <CardDescription className="text-blue-200 text-center text-sm">
                Todas las fotos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Estado del Sistema */}
        <Card className="mt-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border-green-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300 text-xl">
              <CheckCircle className="h-6 w-6" />
              Sistema Operativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-white">Base de Datos</p>
                <p className="text-xs text-green-300">Supabase</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-white">Storage</p>
                <p className="text-xs text-green-300">Archivos</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-white">PWA</p>
                <p className="text-xs text-green-300">Instalable</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-white">Offline</p>
                <p className="text-xs text-green-300">Disponible</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-sm font-semibold text-white">Performance</p>
                <p className="text-xs text-green-300">Optimizado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-blue-300 text-sm">
          <p>© 2025 ACT Reportes - Sistema de Reportabilidad para Minería</p>
          <p className="mt-2">Optimizado para trabajo en terreno sin cobertura</p>
        </div>
      </div>
    </main>
  );
}
