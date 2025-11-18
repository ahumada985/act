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
  TrendingUp,
  Smartphone,
  Plus,
  HardHat,
  Mountain,
  Pickaxe,
  Radio,
  Truck,
  AlertTriangle,
  Target,
  Wrench,
  Signal
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
    { name: "Next.js 14", description: "Rendimiento óptimo en faenas", icon: Zap },
    { name: "TypeScript", description: "Código seguro y confiable", icon: Shield },
    { name: "Supabase", description: "Base de datos en tiempo real", icon: Database },
    { name: "PWA", description: "Funciona sin conexión", icon: Smartphone },
    { name: "GPS Integrado", description: "Geolocalización precisa", icon: MapPin },
    { name: "Modo Offline", description: "Opera en zonas remotas", icon: Signal },
  ];

  const features = [
    {
      icon: Camera,
      title: "Registro Fotográfico",
      description: "Captura de alta calidad con geolocalización automática y marca de tiempo para evidencia técnica"
    },
    {
      icon: MapPin,
      title: "GPS en Faena",
      description: "Coordenadas precisas UTM/WGS84 con geocodificación inversa, ideal para zonas remotas"
    },
    {
      icon: Wifi,
      title: "Modo Offline Total",
      description: "Trabaja sin conexión en rajo, túneles o zonas sin cobertura. Sincroniza al volver a red"
    },
    {
      icon: HardHat,
      title: "Reportes de Seguridad",
      description: "Formularios estandarizados para cumplimiento normativo y protocolos de seguridad minera"
    },
    {
      icon: BarChart3,
      title: "Dashboard Operacional",
      description: "Métricas en tiempo real de avance, KPIs de proyecto y análisis de productividad"
    },
    {
      icon: Map,
      title: "Mapa de Operaciones",
      description: "Visualización geográfica de todos los puntos de trabajo en la faena minera"
    },
  ];

  const useCases = [
    {
      icon: Radio,
      title: "Telecomunicaciones",
      description: "Instalación de fibra óptica, antenas, repetidores y sistemas de comunicación en faenas",
      color: "orange"
    },
    {
      icon: Truck,
      title: "Infraestructura",
      description: "Seguimiento de obras civiles, montaje de equipos y construcción de instalaciones",
      color: "amber"
    },
    {
      icon: Wrench,
      title: "Mantenimiento",
      description: "Reportes de mantención preventiva y correctiva de equipos e infraestructura crítica",
      color: "yellow"
    },
    {
      icon: AlertTriangle,
      title: "Seguridad y HSE",
      description: "Inspecciones de seguridad, hallazgos y cumplimiento de protocolos HSEC",
      color: "red"
    },
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section - Tema Minero */}
      <header className="relative overflow-hidden">
        {/* Patrón de fondo estilo minero */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="ACT Reportes Logo"
                  width={220}
                  height={90}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Título Principal */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mountain className="h-10 w-10 text-white" />
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                ACT Reportes
              </h1>
              <Pickaxe className="h-10 w-10 text-white" />
            </div>

            <p className="text-xl sm:text-2xl text-white/90 mb-4 font-medium">
              Sistema de Reportabilidad para Faenas Mineras
            </p>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Gestión profesional de reportes técnicos en terreno. Diseñado para operar en condiciones extremas de la minería chilena.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/reportes/nuevo")}
                className="bg-slate-900 text-white hover:bg-slate-800 font-bold py-6 px-8 text-lg shadow-xl"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Reporte en Terreno
              </Button>
              <Button
                onClick={handleInstallClick}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-6 px-8 text-lg bg-white/10 backdrop-blur"
                size="lg"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Instalar App
              </Button>
            </div>

            {/* Badge de confianza */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <HardHat className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium">
                Operando en las principales faenas de Chile
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Módulos del Sistema */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Centro de Control
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Accede a todas las herramientas de gestión desde un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-orange-500/20 hover:border-orange-500 transition-all group"
              onClick={() => router.push("/reportes")}
            >
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-orange-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Reportes</p>
                <p className="text-xs text-slate-400 mt-1">Gestión completa</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-amber-500/20 hover:border-amber-500 transition-all group"
              onClick={() => router.push("/dashboard")}
            >
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Dashboard</p>
                <p className="text-xs text-slate-400 mt-1">Métricas KPI</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-yellow-500/20 hover:border-yellow-500 transition-all group"
              onClick={() => router.push("/proyectos")}
            >
              <CardContent className="pt-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-yellow-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Proyectos</p>
                <p className="text-xs text-slate-400 mt-1">Por faena</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-teal-500/20 hover:border-teal-500 transition-all group"
              onClick={() => router.push("/mapa")}
            >
              <CardContent className="pt-6 text-center">
                <Map className="h-12 w-12 mx-auto mb-3 text-teal-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Mapa</p>
                <p className="text-xs text-slate-400 mt-1">Geolocalización</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-pink-500/20 hover:border-pink-500 transition-all group"
              onClick={() => router.push("/galeria")}
            >
              <CardContent className="pt-6 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-pink-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Galería</p>
                <p className="text-xs text-slate-400 mt-1">Evidencia foto</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all group"
              onClick={() => router.push("/proyectos/timeline")}
            >
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Timeline</p>
                <p className="text-xs text-slate-400 mt-1">Cronología</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-green-500/20 hover:border-green-500 transition-all group"
              onClick={() => router.push("/proyectos/fases")}
            >
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Fases</p>
                <p className="text-xs text-slate-400 mt-1">Etapas obra</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all group"
              onClick={() => router.push("/proyectos/avance")}
            >
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-cyan-500 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-white">Avance</p>
                <p className="text-xs text-slate-400 mt-1">% Completado</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Casos de Uso Mineros */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Soluciones para Minería
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Adaptado a las necesidades específicas de cada área operacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-${useCase.color}-500/20 flex items-center justify-center mb-4`}>
                    <useCase.icon className={`h-7 w-7 text-${useCase.color}-500`} />
                  </div>
                  <CardTitle className="text-lg text-white">{useCase.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Características Principales */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Diseñado para el Terreno
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Funcionalidades robustas para condiciones extremas de trabajo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <feature.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-2 text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-sm text-slate-400">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Stack Tecnológico */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Tecnología de Clase Mundial
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Infraestructura robusta y escalable para operaciones críticas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="text-center bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all">
                <CardContent className="pt-6">
                  <tech.icon className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                  <p className="font-bold text-sm mb-1 text-white">{tech.name}</p>
                  <p className="text-xs text-slate-400">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Beneficios Clave */}
        <section className="mb-20">
          <Card className="bg-gradient-to-r from-orange-600 to-amber-500 border-0 shadow-2xl">
            <CardContent className="py-12 px-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                ¿Por qué ACT Reportes?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">100% Offline</h3>
                  <p className="text-white/80">
                    Opera en rajo abierto, túneles o zonas sin cobertura. Sincroniza automáticamente.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Cumplimiento Normativo</h3>
                  <p className="text-white/80">
                    Reportes estandarizados que cumplen con protocolos HSEC y normativas mineras.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Trazabilidad Total</h3>
                  <p className="text-white/80">
                    Cada reporte con timestamp, GPS y evidencia fotográfica verificable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mountain className="h-6 w-6 text-orange-500" />
            <span className="text-white font-bold text-lg">ACT Reportes</span>
          </div>
          <p className="mb-2">© 2025 ACT Reportes - Sistema Profesional de Reportabilidad Minera</p>
          <p className="text-sm text-slate-500">
            Diseñado para telecomunicaciones e infraestructura en faenas mineras de Chile
          </p>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}
