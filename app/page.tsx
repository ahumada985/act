"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Briefcase,
  Map,
  Image as ImageIcon,
  Clock,
  TrendingUp,
  Plus,
  Layers
} from "lucide-react";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  const router = useRouter();

  const modules = [
    {
      icon: FileText,
      title: "Reportes",
      description: "Ver y gestionar todos los reportes",
      href: "/reportes",
      color: "blue"
    },
    {
      icon: Plus,
      title: "Nuevo Reporte",
      description: "Crear reporte en terreno",
      href: "/reportes/nuevo",
      color: "green",
      primary: true
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "Métricas y estadísticas",
      href: "/dashboard",
      color: "emerald"
    },
    {
      icon: Briefcase,
      title: "Proyectos",
      description: "Organizar por proyecto",
      href: "/proyectos",
      color: "purple"
    },
    {
      icon: Map,
      title: "Mapa",
      description: "Ubicaciones GPS",
      href: "/mapa",
      color: "amber"
    },
    {
      icon: ImageIcon,
      title: "Galería",
      description: "Evidencia fotográfica",
      href: "/galeria",
      color: "pink"
    },
    {
      icon: Clock,
      title: "Timeline",
      description: "Cronología de eventos",
      href: "/proyectos/timeline",
      color: "indigo"
    },
    {
      icon: Layers,
      title: "Fases",
      description: "Etapas de trabajo",
      href: "/proyectos/fases",
      color: "cyan"
    },
    {
      icon: TrendingUp,
      title: "Avance",
      description: "Progreso de proyectos",
      href: "/proyectos/avance",
      color: "teal"
    }
  ];

  const getColorClasses = (color: string, primary?: boolean) => {
    if (primary) {
      return {
        card: "bg-blue-600 hover:bg-blue-700 border-blue-600",
        icon: "bg-white/20",
        iconColor: "text-white",
        title: "text-white",
        desc: "text-blue-100"
      };
    }

    const colors: Record<string, any> = {
      blue: { bg: "bg-blue-50", hover: "hover:bg-blue-100", icon: "bg-blue-100", iconColor: "text-blue-600" },
      green: { bg: "bg-green-50", hover: "hover:bg-green-100", icon: "bg-green-100", iconColor: "text-green-600" },
      emerald: { bg: "bg-emerald-50", hover: "hover:bg-emerald-100", icon: "bg-emerald-100", iconColor: "text-emerald-600" },
      purple: { bg: "bg-purple-50", hover: "hover:bg-purple-100", icon: "bg-purple-100", iconColor: "text-purple-600" },
      amber: { bg: "bg-amber-50", hover: "hover:bg-amber-100", icon: "bg-amber-100", iconColor: "text-amber-600" },
      pink: { bg: "bg-pink-50", hover: "hover:bg-pink-100", icon: "bg-pink-100", iconColor: "text-pink-600" },
      indigo: { bg: "bg-indigo-50", hover: "hover:bg-indigo-100", icon: "bg-indigo-100", iconColor: "text-indigo-600" },
      cyan: { bg: "bg-cyan-50", hover: "hover:bg-cyan-100", icon: "bg-cyan-100", iconColor: "text-cyan-600" },
      teal: { bg: "bg-teal-50", hover: "hover:bg-teal-100", icon: "bg-teal-100", iconColor: "text-teal-600" }
    };

    const c = colors[color] || colors.blue;
    return {
      card: `${c.bg} ${c.hover} border-transparent`,
      icon: c.icon,
      iconColor: c.iconColor,
      title: "text-gray-900",
      desc: "text-gray-600"
    };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header simple */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Image
                    src="/logo.png"
                    alt="Northtek Logo"
                    width={100}
                    height={40}
                    priority
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Northtek Reportes</h1>
                  <p className="text-sm text-gray-500">Sistema de Reportabilidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Acción principal */}
          <div className="mb-8">
            <Button
              onClick={() => router.push("/reportes/nuevo")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 text-base"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Nuevo Reporte
            </Button>
          </div>

          {/* Grid de módulos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => {
              const colors = getColorClasses(module.color, module.primary);
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 border ${colors.card}`}
                  onClick={() => router.push(module.href)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
                        <module.icon className={`h-5 w-5 ${colors.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${colors.title}`}>{module.title}</h3>
                        <p className={`text-sm ${colors.desc}`}>{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer mínimo */}
        <div className="mt-auto py-6 text-center text-sm text-gray-400">
          © 2025 Northtek
        </div>
      </div>
    </ProtectedRoute>
  );
}
