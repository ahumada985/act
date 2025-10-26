"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Image from "next/image";

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="bg-white shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="ACT Logo"
                width={150}
                height={60}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-gray-100 rounded-full">
                <WifiOff className="h-16 w-16 text-gray-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-700">
              Sin Conexión
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              No hay conexión a internet en este momento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 text-center">
                <strong>Modo Offline Activo</strong>
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Algunas funciones pueden estar limitadas sin conexión a internet.
                Los datos que veas son de la última vez que estuviste conectado.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Intentar Reconectar
              </Button>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Volver al Inicio
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-700 mb-3 text-center">
                ¿Qué puedes hacer sin conexión?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Ver reportes guardados en caché</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Navegar por páginas ya visitadas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Ver fotos e imágenes guardadas</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <span className="mr-2">✗</span>
                  <span>Crear nuevos reportes (requiere conexión)</span>
                </li>
                <li className="flex items-start text-gray-400">
                  <span className="mr-2">✗</span>
                  <span>Sincronizar datos con el servidor</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 text-center">
              <strong>Consejo:</strong> Cuando recuperes la conexión, la app se sincronizará automáticamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
