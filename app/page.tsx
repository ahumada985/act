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
  Camera,
  MapPin,
  Clock,
  Wifi,
  Database,
  Zap,
  Shield,
  TrendingUp,
  Smartphone,
  Plus,
  CheckCircle2,
  ArrowRight,
  Layers,
  Signal,
  Globe,
  Lock
} from "lucide-react";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
      alert('Para instalar:\n\n1. Toca el menú en la esquina superior derecha\n2. Selecciona "Añadir a pantalla de inicio"\n3. Confirma');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const features = [
    {
      icon: Camera,
      title: "Captura Inteligente",
      description: "Fotografías con geolocalización automática y compresión optimizada"
    },
    {
      icon: MapPin,
      title: "GPS de Alta Precisión",
      description: "Coordenadas exactas con geocodificación inversa automática"
    },
    {
      icon: Wifi,
      title: "Funciona Sin Conexión",
      description: "Trabaja offline y sincroniza cuando vuelvas a tener red"
    },
    {
      icon: Shield,
      title: "Seguro y Confiable",
      description: "Datos encriptados y respaldados en la nube"
    },
    {
      icon: BarChart3,
      title: "Analíticas en Tiempo Real",
      description: "Dashboard con métricas y KPIs de tus proyectos"
    },
    {
      icon: Zap,
      title: "Rápido y Eficiente",
      description: "Interfaz optimizada para trabajo en terreno"
    },
  ];

  const stats = [
    { value: "100%", label: "Offline Ready" },
    { value: "GPS", label: "Integrado" },
    { value: "IA", label: "Análisis" },
    { value: "PWA", label: "Instalable" },
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-white">
      {/* Hero Section - Diseño Limpio y Profesional */}
      <header className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="Northtek Logo"
                  width={180}
                  height={72}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Northtek Reportes
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-3 font-light">
              Sistema Profesional de Reportabilidad
            </p>
            <p className="text-base text-blue-200/80 mb-10 max-w-xl mx-auto">
              Gestiona reportes técnicos en terreno con captura de fotos, GPS y modo offline.
              Diseñado para proyectos de telecomunicaciones en minería.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => router.push("/reportes/nuevo")}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-6 px-8 text-base shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Reporte
              </Button>
              <Button
                onClick={handleInstallClick}
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-6 px-8 text-base backdrop-blur-sm"
                size="lg"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Instalar App
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Módulos del Sistema */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Módulos del Sistema
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Accede a todas las funcionalidades desde un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/reportes")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Reportes</p>
                <p className="text-xs text-gray-500 mt-1">Ver todos</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/dashboard")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-600 transition-colors">
                  <BarChart3 className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Dashboard</p>
                <p className="text-xs text-gray-500 mt-1">Analíticas</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/proyectos")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 transition-colors">
                  <Briefcase className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Proyectos</p>
                <p className="text-xs text-gray-500 mt-1">Organizar</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/mapa")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-600 transition-colors">
                  <Map className="h-6 w-6 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Mapa</p>
                <p className="text-xs text-gray-500 mt-1">Ubicaciones</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/galeria")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-600 transition-colors">
                  <ImageIcon className="h-6 w-6 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Galería</p>
                <p className="text-xs text-gray-500 mt-1">Fotos</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/proyectos/timeline")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 transition-colors">
                  <Clock className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Timeline</p>
                <p className="text-xs text-gray-500 mt-1">Cronología</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/proyectos/fases")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-600 transition-colors">
                  <Layers className="h-6 w-6 text-cyan-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Fases</p>
                <p className="text-xs text-gray-500 mt-1">Etapas</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white group"
              onClick={() => router.push("/proyectos/avance")}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-600 transition-colors">
                  <TrendingUp className="h-6 w-6 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900">Avance</p>
                <p className="text-xs text-gray-500 mt-1">Progreso</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Diseñado para el Terreno
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Funcionalidades pensadas para trabajo en campo, sin complicaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a reportar ahora
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Crea tu primer reporte en menos de 2 minutos. Sin complicaciones.
          </p>
          <Button
            onClick={() => router.push("/reportes/nuevo")}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-6 px-8 text-base"
            size="lg"
          >
            Crear Nuevo Reporte
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Tecnologías */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Tecnología Moderna
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Next.js 14</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span className="text-sm font-medium">Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-5 w-5" />
              <span className="text-sm font-medium">Offline First</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">TypeScript</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Northtek Logo"
              width={120}
              height={48}
              className="object-contain opacity-80"
            />
          </div>
          <p className="mb-2 text-sm">
            © 2025 Northtek Reportes
          </p>
          <p className="text-xs text-gray-500">
            Sistema de reportabilidad para proyectos de telecomunicaciones en minería
          </p>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}
