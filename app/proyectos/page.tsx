"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Briefcase, Calendar, Clock, TrendingUp, Layers } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchProyectos();
  }, []);

  useEffect(() => {
    if (busqueda) {
      const filtered = proyectos.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProyectosFiltrados(filtered);
    } else {
      setProyectosFiltrados(proyectos);
    }
  }, [busqueda, proyectos]);

  async function fetchProyectos() {
    try {
      const { data, error } = await supabase
        .from("Proyecto")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setProyectos(data || []);
      setProyectosFiltrados(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar proyectos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el proyecto "${nombre}"?`)) return;

    try {
      const { error } = await supabase
        .from("Proyecto")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Proyecto eliminado exitosamente");
      fetchProyectos();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al eliminar proyecto: " + error.message);
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETADO":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PAUSADO":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando proyectos...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Gestión de Proyectos</h1>
            <p className="text-gray-600 mt-1">
              {proyectosFiltrados.length} de {proyectos.length} proyectos
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => router.push("/proyectos/avance")}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              Avance
            </Button>
            <Button
              onClick={() => router.push("/proyectos/fases")}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Layers className="h-5 w-5" />
              Fases
            </Button>
            <Button
              onClick={() => router.push("/proyectos/timeline")}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Clock className="h-5 w-5" />
              Timeline
            </Button>
            <Button
              onClick={() => router.push("/proyectos/nuevo")}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Buscador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="busqueda">Buscar por nombre, cliente o descripción</Label>
              <Input
                id="busqueda"
                placeholder="Escriba para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Proyectos */}
        {proyectosFiltrados.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay proyectos</CardTitle>
              <CardDescription>
                Comienza creando tu primer proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/proyectos/nuevo")}
                className="w-full"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Primer Proyecto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proyectosFiltrados.map((proyecto) => (
              <Card
                key={proyecto.id}
                className="hover:shadow-lg transition"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {proyecto.nombre}
                              </h3>
                              {proyecto.cliente && (
                                <p className="text-sm text-gray-600">
                                  Cliente: {proyecto.cliente}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                                proyecto.estado
                              )}`}
                            >
                              {proyecto.estado}
                            </span>
                          </div>

                          {proyecto.descripcion && (
                            <p className="text-sm text-gray-700 mb-3">
                              {proyecto.descripcion}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            {proyecto.fechaInicio && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Inicio: {new Date(proyecto.fechaInicio).toLocaleDateString()}</span>
                              </div>
                            )}
                            {proyecto.fechaFin && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Fin: {new Date(proyecto.fechaFin).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/proyectos/${proyecto.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(proyecto.id, proyecto.nombre)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
