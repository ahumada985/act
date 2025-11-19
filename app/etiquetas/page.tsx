"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft,
  Info
} from "lucide-react";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  descripcion: string;
}

const COLORES_DISPONIBLES = [
  { valor: "blue", nombre: "Azul", clase: "bg-blue-100 text-blue-700 border-blue-200" },
  { valor: "green", nombre: "Verde", clase: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { valor: "yellow", nombre: "Amarillo", clase: "bg-amber-100 text-amber-700 border-amber-200" },
  { valor: "red", nombre: "Rojo", clase: "bg-red-100 text-red-700 border-red-200" },
  { valor: "purple", nombre: "Morado", clase: "bg-violet-100 text-violet-700 border-violet-200" },
  { valor: "pink", nombre: "Rosa", clase: "bg-pink-100 text-pink-700 border-pink-200" },
  { valor: "indigo", nombre: "Índigo", clase: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { valor: "gray", nombre: "Gris", clase: "bg-gray-100 text-gray-700 border-gray-200" },
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

  function getColorClass(color: string) {
    return COLORES_DISPONIBLES.find(c => c.valor === color)?.clase || COLORES_DISPONIBLES[0].clase;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/reportes")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-6 w-6 text-orange-600" />
              Etiquetas
            </h1>
            <p className="text-gray-500 mt-0.5">
              {etiquetas.length} etiquetas
            </p>
          </div>
        </div>

        {/* Nueva Etiqueta */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Etiqueta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-xs text-gray-500">Nombre</Label>
                <Input
                  placeholder="Ej: Urgente"
                  value={nuevaEtiqueta.nombre}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, nombre: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') agregarEtiqueta();
                  }}
                  className="bg-white"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Color</Label>
                <select
                  value={nuevaEtiqueta.color}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, color: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm"
                >
                  {COLORES_DISPONIBLES.map((c) => (
                    <option key={c.valor} value={c.valor}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Descripción</Label>
                <Input
                  placeholder="Opcional"
                  value={nuevaEtiqueta.descripcion}
                  onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, descripcion: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Vista previa:</span>
                <Badge className={getColorClass(nuevaEtiqueta.color)}>
                  {nuevaEtiqueta.nombre || "Etiqueta"}
                </Badge>
              </div>

              <Button
                onClick={agregarEtiqueta}
                disabled={!nuevaEtiqueta.nombre.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {etiquetas.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin etiquetas</h3>
              <p className="text-gray-500">Crea tu primera etiqueta arriba</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                {etiquetas.map((etiqueta) => (
                  <div
                    key={etiqueta.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    {editando === etiqueta.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          className="bg-white"
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
                          className="h-10 rounded-md border border-input bg-white px-3 text-sm"
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
                          className="bg-white"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Badge className={getColorClass(etiqueta.color)}>
                          {etiqueta.nombre}
                        </Badge>
                        {etiqueta.descripcion && (
                          <span className="text-sm text-gray-500">
                            {etiqueta.descripcion}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 ml-3">
                      {editando === etiqueta.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              guardarEtiquetas([...etiquetas]);
                              setEditando(null);
                            }}
                            className="h-8 w-8"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              cargarEtiquetas();
                              setEditando(null);
                            }}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditando(etiqueta.id)}
                            className="h-8 w-8 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarEtiqueta(etiqueta.id)}
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="border-0 shadow-sm mt-6 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Cómo usar las etiquetas</p>
                <ul className="space-y-1 text-gray-600">
                  <li>Las etiquetas te permiten organizar tus reportes</li>
                  <li>Puedes asignar múltiples etiquetas a cada reporte</li>
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
