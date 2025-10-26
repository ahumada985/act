"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, BarChart3, Database, Briefcase, Map } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="bg-white shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="ACT Logo"
                width={200}
                height={80}
                priority
                className="object-contain"
              />
            </div>
            <CardTitle className="text-4xl font-bold text-blue-600">
              ACT Reportes
            </CardTitle>
            <CardDescription className="text-xl">
              Sistema de Reportabilidad para Telecomunicaciones
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/reportes/nuevo")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Plus className="h-6 w-6" />
                Nuevo Reporte
              </CardTitle>
              <CardDescription>
                Crear un reporte de terreno con fotos y GPS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push("/reportes/nuevo")}>
                Comenzar Reporte
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/reportes")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <FileText className="h-6 w-6" />
                Ver Reportes
              </CardTitle>
              <CardDescription>
                Lista de todos los reportes creados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/reportes")}>
                Ver Lista
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/proyectos")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Briefcase className="h-6 w-6" />
                Gestión de Proyectos
              </CardTitle>
              <CardDescription>
                Administrar proyectos de telecomunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/proyectos")}>
                Ver Proyectos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/dashboard")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <BarChart3 className="h-6 w-6" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Estadísticas y gráficos de reportes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                Ver Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/mapa")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-600">
                <Map className="h-6 w-6" />
                Mapa de Reportes
              </CardTitle>
              <CardDescription>
                Visualizar reportes en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/mapa")}>
                Ver Mapa
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => router.push("/demo")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Database className="h-6 w-6" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Verificar conexión con Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/demo")}>
                Ver Estado
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Sistema Operativo ✓</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-sm font-semibold">Base de Datos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-sm font-semibold">Storage</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">✓</p>
                <p className="text-sm font-semibold">Formularios</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">📱</p>
                <p className="text-sm font-semibold">PWA Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
