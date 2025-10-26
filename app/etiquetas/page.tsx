"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  ArrowLeft
} from "lucide-react";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  descripcion: string;
}

const COLORES_DISPONIBLES = [
  { valor: "blue", nombre: "Azul", clase: "bg-blue-100 text-blue-800 border-blue-300" },
  { valor: "green", nombre: "Verde", clase: "bg-green-100 text-green-800 border-green-300" },
  { valor: "yellow", nombre: "Amarillo", clase: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { valor: "red", nombre: "Rojo", clase: "bg-red-100 text-red-800 border-red-300" },
  { valor: "purple", nombre: "Morado", clase: "bg-purple-100 text-purple-800 border-purple-300" },
  { valor: "pink", nombre: "Rosa", clase: "bg-pink-100 text-pink-800 border-pink-300" },
  { valor: "indigo", nombre: "Índigo", clase: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { valor: "gray", nombre: "Gris", clase: "bg-gray-100 text-gray-800 border-gray-300" },
];

export default function EtiquetasPage() {
  const router = useRouter();
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({
    nombre: "",
    color: "blue",
    descripcion: ""
  });

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  function cargarEtiquetas() {
    try {
      const guardadas = localStorage.getItem("etiquetas");
      if (guardadas) {
        setEtiquetas(JSON.parse(guardadas));
      }
    } catch (error) {
      console.error("Error al cargar etiquetas:", error);
    }
  }

  function guardarEtiquetas(nuevasEtiquetas: Etiqueta[]) {
    try {
      localStorage.setItem("etiquetas", JSON.stringify(nuevasEtiquetas));
      setEtiquetas(nuevasEtiquetas);
    } catch (error) {
      console.error("Error al guardar etiquetas:", error);
      alert("Error al guardar etiquetas");
    }
  }

  function agregarEtiqueta() {
    if (!nuevaEtiqueta.nombre.trim()) {
      alert("Por favor ingresa un nombre para la etiqueta");
      return;
    }

    const nueva: Etiqueta = {
      id: Date.now().toString(),
      nombre: nuevaEtiqueta.nombre.trim(),
      color: nuevaEtiqueta.color,
      descripcion: nuevaEtiqueta.descripcion.trim()
    };

    guardarEtiquetas([...etiquetas, nueva]);
    setNuevaEtiqueta({ nombre: "", color: "blue", descripcion: "" });
  }

  function eliminarEtiqueta(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta etiqueta?")) return;
    guardarEtiquetas(etiquetas.filter(e => e.id !== id));
  }

  function actualizarEtiqueta(id: string, cambios: Partial<Etiqueta>) {
    guardarEtiquetas(
      etiquetas.map(e => e.id === id ? { ...e, ...cambios } : e)
    );
    setEditando(null);
  }

  function getColorClass(color: string) {
    return COLORES_DISPONIBLES.find(c => c.valor === color)?.clase || COLORES_DISPONIBLES[0].clase;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/reportes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-600 flex items-center gap-2">
                <Tag className="h-8 w-8" />
                Gestión de Etiquetas
              </CardTitle>
              <CardDescription>
                Crea y administra etiquetas personalizadas para organizar tus reportes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Nueva Etiqueta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Nueva Etiqueta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Urgente, Revisado, etc."
                  value={nuevaEtiqueta.nombre}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, nombre: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') agregarEtiqueta();
                  }}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <select
                  id="color"
                  value={nuevaEtiqueta.color}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {COLORES_DISPONIBLES.map((c) => (
                    <option key={c.valor} value={c.valor}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripción opcional"
                  value={nuevaEtiqueta.descripcion}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, descripcion: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Vista previa:</span>
                <Badge className={getColorClass(nuevaEtiqueta.color)}>
                  {nuevaEtiqueta.nombre || "Etiqueta"}
                </Badge>
              </div>

              <Button
                onClick={agregarEtiqueta}
                className="gap-2"
                disabled={!nuevaEtiqueta.nombre.trim()}
              >
                <Plus className="h-4 w-4" />
                Agregar Etiqueta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Etiquetas */}
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas Existentes ({etiquetas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {etiquetas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No hay etiquetas creadas</p>
                <p className="text-sm">Crea tu primera etiqueta arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {etiquetas.map((etiqueta) => (
                  <div
                    key={etiqueta.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-blue-300 transition"
                  >
                    {editando === etiqueta.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={etiqueta.nombre}
                          onChange={(e) =>
                            setEtiquetas(
                              etiquetas.map(et =>
                                et.id === etiqueta.id
                                  ? { ...et, nombre: e.target.value }
                                  : et
                              )
                            )
                          }
                        />
                        <select
                          value={etiqueta.color}
                          onChange={(e) =>
                            setEtiquetas(
                              etiquetas.map(et =>
                                et.id === etiqueta.id
                                  ? { ...et, color: e.target.value }
                                  : et
                              )
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          {COLORES_DISPONIBLES.map((c) => (
                            <option key={c.valor} value={c.valor}>{c.nombre}</option>
                          ))}
                        </select>
                        <Input
                          value={etiqueta.descripcion}
                          onChange={(e) =>
                            setEtiquetas(
                              etiquetas.map(et =>
                                et.id === etiqueta.id
                                  ? { ...et, descripcion: e.target.value }
                                  : et
                              )
                            )
                          }
                          placeholder="Descripción"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge className={getColorClass(etiqueta.color)}>
                            {etiqueta.nombre}
                          </Badge>
                          {etiqueta.descripcion && (
                            <span className="text-sm text-gray-600">
                              {etiqueta.descripcion}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {editando === etiqueta.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              guardarEtiquetas([...etiquetas]);
                              setEditando(null);
                            }}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Guardar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              cargarEtiquetas();
                              setEditando(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditando(etiqueta.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarEtiqueta(etiqueta.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Cómo usar las etiquetas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las etiquetas te permiten organizar y categorizar tus reportes</li>
                  <li>Puedes asignar múltiples etiquetas a cada reporte</li>
                  <li>Usa las etiquetas para filtrar reportes rápidamente</li>
                  <li>Las etiquetas se guardan localmente en tu navegador</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
