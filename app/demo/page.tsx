"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const { data: usersData, error: usersError } = await supabase
        .from("User")
        .select("*");

      const { data: plantillasData, error: plantillasError } = await supabase
        .from("PlantillaFormulario")
        .select("*");

      if (usersError) throw usersError;
      if (plantillasError) throw plantillasError;

      setUsers(usersData || []);
      setPlantillas(plantillasData || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Conexión</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchData} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-blue-600">
              ACT Reportes - Conexión Exitosa ✅
            </CardTitle>
            <CardDescription>
              Base de datos Supabase conectada correctamente
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios en Sistema ({users.length})</CardTitle>
              <CardDescription>
                Usuarios de prueba creados en la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <p className="font-semibold text-gray-800">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Rol: {user.role}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Plantillas de Formularios ({plantillas.length})
              </CardTitle>
              <CardDescription>
                Tipos de trabajo configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plantillas.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className="p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <p className="font-semibold text-gray-800">
                      {plantilla.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      {plantilla.descripcion}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tipo: {plantilla.tipoTrabajo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Array.isArray(plantilla.campos) ? plantilla.campos.length : 0} campos configurados
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-green-700">
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <p className="text-2xl font-bold text-green-600">✅</p>
                <p className="text-sm font-semibold">Supabase</p>
                <p className="text-xs text-gray-500">Conectado</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <p className="text-2xl font-bold text-green-600">✅</p>
                <p className="text-sm font-semibold">Base de Datos</p>
                <p className="text-xs text-gray-500">7 tablas</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <p className="text-2xl font-bold text-green-600">✅</p>
                <p className="text-sm font-semibold">Storage</p>
                <p className="text-xs text-gray-500">2 buckets</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <p className="text-2xl font-bold text-blue-600">🚀</p>
                <p className="text-sm font-semibold">Next.js</p>
                <p className="text-xs text-gray-500">Funcionando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✅</span>
                <span>Supabase configurado completamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✅</span>
                <span>Base de datos con datos de prueba</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">🔄</span>
                <span>Crear página de login</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">🔄</span>
                <span>Formulario de reporte con captura de fotos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">🔄</span>
                <span>Dashboard con lista de reportes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">⏳</span>
                <span>Generación de PDFs</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
