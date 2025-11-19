"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Plus,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  GanttChart,
  Edit
} from "lucide-react";

interface TareaGantt {
  id: string;
  proyectoNombre: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  completada: boolean;
  orden: number;
}

export default function GanttPage() {
  const router = useRouter();
  const [tareas, setTareas] = useState<TareaGantt[]>([]);
  const [proyectos, setProyectos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  // Navegación de fechas
  const [mesActual, setMesActual] = useState(new Date());

  // Faenas mineras predefinidas
  const FAENAS_MINERAS = [
    "Minera Escondida",
    "Minera Spence",
    "Minera Centinela",
    "Quebrada Blanca",
    "Minera Collahuasi"
  ];

  const [formData, setFormData] = useState({
    proyectoNombre: "",
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener tareas Gantt
      const { data: tareasData, error } = await supabase
        .from("tareagantt")
        .select("*")
        .order("orden");

      if (error) throw error;

      // Mapear nombres de columnas de BD (minúsculas) a interfaz (camelCase)
      const tareasMapeadas = (tareasData || []).map(t => ({
        id: t.id,
        proyectoNombre: t.proyectonombre,
        nombre: t.nombre,
        fechaInicio: t.fechainicio,
        fechaFin: t.fechafin,
        completada: t.completada,
        orden: t.orden
      }));
      setTareas(tareasMapeadas);

      // Usar solo faenas mineras predefinidas
      setProyectos(FAENAS_MINERAS);

      if (FAENAS_MINERAS.length > 0 && !proyectoSeleccionado) {
        setProyectoSeleccionado(FAENAS_MINERAS[0]);
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarTarea() {
    if (!formData.proyectoNombre || !formData.nombre || !formData.fechaInicio || !formData.fechaFin) {
      alert("Complete todos los campos");
      return;
    }

    if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
      alert("La fecha fin debe ser mayor o igual a la fecha inicio");
      return;
    }

    try {
      const tareasProyecto = tareas.filter(t => t.proyectoNombre === formData.proyectoNombre);
      const maxOrden = tareasProyecto.length > 0
        ? Math.max(...tareasProyecto.map(t => t.orden))
        : 0;

      const datos = {
        proyectonombre: formData.proyectoNombre,
        nombre: formData.nombre,
        fechainicio: formData.fechaInicio,
        fechafin: formData.fechaFin,
        completada: false,
        orden: editando ? tareas.find(t => t.id === editando)?.orden || maxOrden + 1 : maxOrden + 1,
      };

      if (editando) {
        const { error } = await supabase
          .from("tareagantt")
          .update(datos)
          .eq("id", editando);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tareagantt")
          .insert({
            id: crypto.randomUUID(),
            ...datos
          });

        if (error) throw error;
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al guardar tarea");
    }
  }

  async function eliminarTarea(id: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;

    try {
      const { error } = await supabase
        .from("tareagantt")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
    }
  }

  async function toggleCompletada(tarea: TareaGantt) {
    try {
      const { error } = await supabase
        .from("tareagantt")
        .update({ completada: !tarea.completada })
        .eq("id", tarea.id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
    }
  }

  function editarTarea(tarea: TareaGantt) {
    setFormData({
      proyectoNombre: tarea.proyectoNombre,
      nombre: tarea.nombre,
      fechaInicio: tarea.fechaInicio,
      fechaFin: tarea.fechaFin,
    });
    setEditando(tarea.id);
    setMostrarForm(true);
  }

  function resetForm() {
    setFormData({
      proyectoNombre: proyectoSeleccionado,
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setMostrarForm(false);
    setEditando(null);
  }

  // Calcular días del mes
  const diasMes = useMemo(() => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias = [];

    for (let d = primerDia; d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      dias.push(new Date(d));
    }

    return dias;
  }, [mesActual]);

  // Filtrar tareas por proyecto
  const tareasProyecto = useMemo(() => {
    return tareas
      .filter(t => t.proyectoNombre === proyectoSeleccionado)
      .sort((a, b) => a.orden - b.orden);
  }, [tareas, proyectoSeleccionado]);

  // Calcular posición de barra
  function calcularBarra(tarea: TareaGantt) {
    const inicio = new Date(tarea.fechaInicio);
    const fin = new Date(tarea.fechaFin);
    const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

    // Si la tarea está completamente fuera del mes, no mostrar
    if (fin < primerDiaMes || inicio > ultimoDiaMes) {
      return null;
    }

    // Ajustar inicio y fin al mes visible
    const inicioVisible = inicio < primerDiaMes ? primerDiaMes : inicio;
    const finVisible = fin > ultimoDiaMes ? ultimoDiaMes : fin;

    const diasTotales = diasMes.length;
    const diaInicio = inicioVisible.getDate();
    const diaFin = finVisible.getDate();

    const left = ((diaInicio - 1) / diasTotales) * 100;
    const width = ((diaFin - diaInicio + 1) / diasTotales) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }

  function navegarMes(direccion: number) {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando Gantt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GanttChart className="h-6 w-6 text-blue-600" />
              Carta Gantt
            </h1>
            <p className="text-gray-500 mt-1">
              Planificación de tareas por proyecto
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={proyectoSeleccionado}
              onChange={(e) => setProyectoSeleccionado(e.target.value)}
              className="h-10 px-3 border rounded-md text-sm"
            >
              {proyectos.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <Button
              onClick={() => {
                const proyecto = proyectoSeleccionado || proyectos[0] || "";
                setFormData({
                  proyectoNombre: proyecto,
                  nombre: "",
                  fechaInicio: new Date().toISOString().split('T')[0],
                  fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                setMostrarForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Form */}
        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editando ? "Editar Tarea" : "Nueva Tarea"}
                </h3>
                <button onClick={resetForm}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Proyecto</label>
                  <select
                    value={formData.proyectoNombre}
                    onChange={(e) => setFormData({ ...formData, proyectoNombre: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  >
                    {proyectos.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Nombre Tarea *</label>
                  <Input
                    placeholder="Ej: Instalación equipos"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Fecha Inicio *</label>
                  <Input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Fecha Fin *</label>
                  <Input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={guardarTarea} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="h-4 w-4" />
                  {editando ? "Guardar" : "Crear"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegación de meses */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => navegarMes(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {mesActual.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navegarMes(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Gantt Chart */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {tareasProyecto.length === 0 ? (
              <div className="py-16 text-center">
                <GanttChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin tareas</h3>
                <p className="text-gray-500 mb-4">Agrega tareas para este proyecto</p>
                <Button
                  onClick={() => {
                    setFormData({ ...formData, proyectoNombre: proyectoSeleccionado });
                    setMostrarForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header con días */}
                  <div className="flex border-b bg-gray-50">
                    <div className="w-64 flex-shrink-0 px-4 py-2 font-medium text-sm text-gray-700 border-r">
                      Tarea
                    </div>
                    <div className="flex-1 flex">
                      {diasMes.map((dia, i) => (
                        <div
                          key={i}
                          className={`flex-1 text-center text-xs py-2 border-r last:border-r-0 ${
                            dia.getDay() === 0 || dia.getDay() === 6
                              ? "bg-gray-100 text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {dia.getDate()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filas de tareas */}
                  {tareasProyecto.map(tarea => {
                    const barra = calcularBarra(tarea);
                    return (
                      <div key={tarea.id} className="flex border-b last:border-b-0 hover:bg-gray-50">
                        <div className="w-64 flex-shrink-0 px-4 py-3 border-r">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCompletada(tarea)}
                              className="flex-shrink-0"
                            >
                              {tarea.completada ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300" />
                              )}
                            </button>
                            <span className={`text-sm truncate ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {tarea.nombre}
                            </span>
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => editarTarea(tarea)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Edit className="h-3 w-3 text-gray-400" />
                              </button>
                              <button
                                onClick={() => eliminarTarea(tarea.id)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 relative py-3 px-1">
                          {barra && (
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${
                                tarea.completada
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ left: barra.left, width: barra.width }}
                            >
                              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium truncate px-1">
                                {tarea.nombre}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        {tareasProyecto.length > 0 && (
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Completada</span>
            </div>
            <div className="ml-auto">
              {tareasProyecto.filter(t => t.completada).length} de {tareasProyecto.length} completadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
