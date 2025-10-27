"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Briefcase,
  Map,
  Image as ImageIcon,
  CheckCircle,
  Camera,
  MapPin,
  Clock,
  Wifi,
  Database,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  MessageSquare,
  File,
  Smartphone,
  Plus
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
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
      setDeferredPrompt(null);
    }
  };

  const technologies = [
    { name: "Next.js 14", description: "Framework React de última generación", icon: Zap },
    { name: "TypeScript", description: "Código type-safe y robusto", icon: Shield },
    { name: "Supabase", description: "Base de datos PostgreSQL en tiempo real", icon: Database },
    { name: "PWA", description: "Instalable y funciona offline", icon: Smartphone },
    { name: "Tailwind CSS", description: "Diseño responsive y moderno", icon: Sparkles },
    { name: "IndexedDB", description: "Almacenamiento local para offline", icon: Database },
  ];

  const features = [
    {
      icon: Camera,
      title: "Captura Multimedia",
      description: "Fotos de alta calidad con compresión automática y marcas de agua opcionales"
    },
    {
      icon: MapPin,
      title: "Geolocalización GPS",
      description: "Coordenadas precisas con geocodificación inversa automática"
    },
    {
      icon: Wifi,
      title: "Modo Offline Completo",
      description: "Guarda reportes localmente y sincroniza cuando vuelva la conexión"
    },
    {
      icon: FileText,
      title: "Reportes Estandarizados",
      description: "Formularios personalizables con validación de datos en tiempo real"
    },
    {
      icon: BarChart3,
      title: "Analytics & Dashboard",
      description: "Estadísticas en tiempo real con gráficos interactivos"
    },
    {
      icon: Map,
      title: "Visualización Geográfica",
      description: "Mapa interactivo con todos los reportes geolocalizados"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Profesional */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="ACT Logo"
                width={200}
                height={80}
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-4">
              ACT Reportes
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Sistema Profesional de Reportabilidad para Proyectos de Telecomunicaciones en Minería
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/reportes/nuevo")}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 px-8 text-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Nuevo Reporte
              </Button>
              <Button
                onClick={handleInstallClick}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-6 px-8 text-lg"
                size="lg"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Instalar Aplicación
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Módulos del Sistema - PRIMERO */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Módulos del Sistema
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Accede a todas las funcionalidades de la plataforma
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-600"
              onClick={() => router.push("/reportes")}
            >
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <p className="font-bold">Reportes</p>
                <p className="text-xs text-gray-500 mt-1">Gestión completa</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-orange-600"
              onClick={() => router.push("/dashboard")}
            >
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                <p className="font-bold">Dashboard</p>
                <p className="text-xs text-gray-500 mt-1">Analíticas</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-purple-600"
              onClick={() => router.push("/proyectos")}
            >
              <CardContent className="pt-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <p className="font-bold">Proyectos</p>
                <p className="text-xs text-gray-500 mt-1">Organización</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-teal-600"
              onClick={() => router.push("/mapa")}
            >
              <CardContent className="pt-6 text-center">
                <Map className="h-12 w-12 mx-auto mb-3 text-teal-600" />
                <p className="font-bold">Mapa</p>
                <p className="text-xs text-gray-500 mt-1">Geolocalización</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-pink-600"
              onClick={() => router.push("/galeria")}
            >
              <CardContent className="pt-6 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-pink-600" />
                <p className="font-bold">Galería</p>
                <p className="text-xs text-gray-500 mt-1">Multimedia</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-600"
              onClick={() => router.push("/proyectos/timeline")}
            >
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-indigo-600" />
                <p className="font-bold">Timeline</p>
                <p className="text-xs text-gray-500 mt-1">Cronología</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-green-600"
              onClick={() => router.push("/proyectos/fases")}
            >
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="font-bold">Fases</p>
                <p className="text-xs text-gray-500 mt-1">Progreso</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-600"
              onClick={() => router.push("/proyectos/avance")}
            >
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <p className="font-bold">Avance</p>
                <p className="text-xs text-gray-500 mt-1">Métricas</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tecnologías */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Tecnologías de Vanguardia
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Stack tecnológico moderno y escalable
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <tech.icon className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                  <p className="font-bold text-sm mb-1">{tech.name}</p>
                  <p className="text-xs text-gray-500">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Características Principales */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Características Principales
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Funcionalidades diseñadas específicamente para trabajo en terreno
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-l-4 border-blue-600">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Ventajas Competitivas */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Ventajas Competitivas
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Por qué ACT Reportes supera a las alternativas tradicionales
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* vs WhatsApp */}
            <Card className="border-2 border-red-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                  <CardTitle className="text-xl">vs WhatsApp</CardTitle>
                </div>
                <CardDescription>Solución informal vs Profesional</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No se pierde información en chats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Trazabilidad completa y auditable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Búsqueda instantánea por filtros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Reportes estandarizados y estructurados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Generación automática de PDFs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dashboard con métricas en tiempo real</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* vs Power Apps */}
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">vs Power Apps</CardTitle>
                </div>
                <CardDescription>Low-code vs Código Nativo</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">UI/UX 100% personalizada a medida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Sin límites de customización</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Performance superior (3-5x más rápido)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No depende de licencias Microsoft</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Sin límites de conectores o APIs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Escalabilidad ilimitada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* vs Excel/Sheets */}
            <Card className="border-2 border-green-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-xl">vs Excel/Sheets</CardTitle>
                </div>
                <CardDescription>Hojas de cálculo vs App Dedicada</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Captura de fotos y audio integrada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">GPS automático con geocodificación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Validación de datos en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Funciona 100% sin conexión</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No hay archivos duplicados o versiones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Control de permisos granular</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© 2025 ACT Reportes - Sistema Profesional de Reportabilidad</p>
          <p className="text-sm text-gray-500">
            Diseñado específicamente para proyectos de telecomunicaciones en minería
          </p>
        </div>
      </footer>
    </div>
  );
}
