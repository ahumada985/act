"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCircle,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Phone,
  CreditCard,
  Briefcase,
  UserPlus
} from "lucide-react";

interface Integrante {
  id: string;
  nombre: string;
  rut: string;
  cargo: string;
  telefono?: string;
}

interface Cuadrilla {
  id: string;
  nombre: string;
  supervisorId: string;
  supervisor?: {
    id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  };
  integrantes: Integrante[];
}

interface Supervisor {
  id: string;
  nombre: string;
  apellido: string;
  avatar?: string;
}

export default function CuadrillasPage() {
  const router = useRouter();
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  // Form cuadrilla
  const [formData, setFormData] = useState({
    nombre: "",
    supervisorId: "",
  });

  // Form integrante
  const [mostrarFormIntegrante, setMostrarFormIntegrante] = useState<string | null>(null);
  const [integranteData, setIntegranteData] = useState({
    nombre: "",
    rut: "",
    cargo: "",
    telefono: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener supervisores
      const { data: sups } = await supabase
        .from("User")
        .select("id, nombre, apellido, avatar")
        .eq("role", "SUPERVISOR")
        .order("nombre");

      setSupervisores(sups || []);

      // Obtener cuadrillas
      const { data: cuads, error } = await supabase
        .from("Cuadrilla")
        .select("*")
        .order("nombre");

      if (error) throw error;

      // Obtener integrantes
      const { data: integrantes } = await supabase
        .from("IntegranteCuadrilla")
        .select("*");

      // Combinar datos
      const cuadrillasCompletas = (cuads || []).map(c => ({
        ...c,
        supervisor: sups?.find(s => s.id === c.supervisorId),
        integrantes: (integrantes || []).filter(i => i.cuadrillaId === c.id)
      }));

      setCuadrillas(cuadrillasCompletas);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarCuadrilla() {
    if (!formData.nombre || !formData.supervisorId) {
      alert("Complete los campos requeridos");
      return;
    }

    try {
      if (editando) {
        const { error } = await supabase
          .from("Cuadrilla")
          .update({
            nombre: formData.nombre,
            supervisorId: formData.supervisorId,
          })
          .eq("id", editando);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("Cuadrilla")
          .insert({
            id: crypto.randomUUID(),
            nombre: formData.nombre,
            supervisorId: formData.supervisorId,
          });

        if (error) throw error;
      }

      setFormData({ nombre: "", supervisorId: "" });
      setMostrarForm(false);
      setEditando(null);
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al guardar cuadrilla");
    }
  }

  async function eliminarCuadrilla(id: string) {
    if (!confirm("¿Eliminar esta cuadrilla y todos sus integrantes?")) return;

    try {
      const { error } = await supabase
        .from("Cuadrilla")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al eliminar cuadrilla");
    }
  }

  async function agregarIntegrante(cuadrillaId: string) {
    if (!integranteData.nombre || !integranteData.rut || !integranteData.cargo) {
      alert("Complete nombre, RUT y cargo");
      return;
    }

    try {
      const { error } = await supabase
        .from("IntegranteCuadrilla")
        .insert({
          id: crypto.randomUUID(),
          cuadrillaId,
          nombre: integranteData.nombre,
          rut: integranteData.rut,
          cargo: integranteData.cargo,
          telefono: integranteData.telefono,
        });

      if (error) throw error;

      setIntegranteData({ nombre: "", rut: "", cargo: "", telefono: "" });
      setMostrarFormIntegrante(null);
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al agregar integrante");
    }
  }

  async function eliminarIntegrante(id: string) {
    if (!confirm("¿Eliminar este integrante?")) return;

    try {
      const { error } = await supabase
        .from("IntegranteCuadrilla")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
    }
  }

  function editarCuadrilla(cuadrilla: Cuadrilla) {
    setFormData({
      nombre: cuadrilla.nombre,
      supervisorId: cuadrilla.supervisorId,
    });
    setEditando(cuadrilla.id);
    setMostrarForm(true);
  }

  function toggleExpandir(id: string) {
    const newSet = new Set(expandidas);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandidas(newSet);
  }

  function cancelarForm() {
    setFormData({ nombre: "", supervisorId: "" });
    setMostrarForm(false);
    setEditando(null);
  }

  // Filtrar
  const cuadrillasFiltradas = busqueda
    ? cuadrillas.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        `${c.supervisor?.nombre} ${c.supervisor?.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
      )
    : cuadrillas;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando cuadrillas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Cuadrillas
            </h1>
            <p className="text-gray-500 mt-1">
              {cuadrillas.length} cuadrillas • {cuadrillas.reduce((acc, c) => acc + c.integrantes.length, 0)} integrantes
            </p>
          </div>
          <Button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Cuadrilla
          </Button>
        </div>

        {/* Form Cuadrilla */}
        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editando ? "Editar Cuadrilla" : "Nueva Cuadrilla"}
                </h3>
                <button onClick={cancelarForm}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Nombre Cuadrilla *</label>
                  <Input
                    placeholder="Ej: Cuadrilla Norte"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Supervisor *</label>
                  <select
                    value={formData.supervisorId}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md text-sm"
                  >
                    <option value="">Seleccionar supervisor...</option>
                    {supervisores.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.nombre} {sup.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={cancelarForm}>
                  Cancelar
                </Button>
                <Button onClick={guardarCuadrilla} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="h-4 w-4" />
                  {editando ? "Guardar Cambios" : "Crear Cuadrilla"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cuadrilla..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-white border-0 shadow-sm"
          />
        </div>

        {/* Lista de cuadrillas */}
        {cuadrillasFiltradas.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin cuadrillas</h3>
              <p className="text-gray-500 mb-4">Crea la primera cuadrilla de trabajo</p>
              <Button onClick={() => setMostrarForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuadrilla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cuadrillasFiltradas.map((cuadrilla) => (
              <Card key={cuadrilla.id} className="border-0 shadow-sm">
                <CardContent className="p-0">
                  {/* Header cuadrilla */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpandir(cuadrilla.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandidas.has(cuadrilla.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cuadrilla.nombre}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {cuadrilla.supervisor && (
                              <div className="flex items-center gap-1">
                                {cuadrilla.supervisor.avatar ? (
                                  <img
                                    src={cuadrilla.supervisor.avatar}
                                    alt=""
                                    className="w-4 h-4 rounded-full"
                                  />
                                ) : (
                                  <UserCircle className="h-4 w-4" />
                                )}
                                <span>{cuadrilla.supervisor.nombre} {cuadrilla.supervisor.apellido}</span>
                              </div>
                            )}
                            <span>•</span>
                            <span>{cuadrilla.integrantes.length} integrantes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => editarCuadrilla(cuadrilla)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => eliminarCuadrilla(cuadrilla.id)}
                          className="p-1.5 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Integrantes (expandible) */}
                  {expandidas.has(cuadrilla.id) && (
                    <div className="border-t bg-gray-50 p-4">
                      {cuadrilla.integrantes.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">Sin integrantes</p>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {cuadrilla.integrantes.map(integrante => (
                            <div
                              key={integrante.id}
                              className="flex items-center justify-between bg-white p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <UserCircle className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{integrante.nombre}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      {integrante.rut}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      {integrante.cargo}
                                    </span>
                                    {integrante.telefono && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {integrante.telefono}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => eliminarIntegrante(integrante.id)}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form agregar integrante */}
                      {mostrarFormIntegrante === cuadrilla.id ? (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Nuevo Integrante</h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input
                              placeholder="Nombre completo *"
                              value={integranteData.nombre}
                              onChange={(e) => setIntegranteData({ ...integranteData, nombre: e.target.value })}
                              className="text-sm"
                            />
                            <Input
                              placeholder="RUT *"
                              value={integranteData.rut}
                              onChange={(e) => setIntegranteData({ ...integranteData, rut: e.target.value })}
                              className="text-sm"
                            />
                            <Input
                              placeholder="Cargo *"
                              value={integranteData.cargo}
                              onChange={(e) => setIntegranteData({ ...integranteData, cargo: e.target.value })}
                              className="text-sm"
                            />
                            <Input
                              placeholder="Teléfono"
                              value={integranteData.telefono}
                              onChange={(e) => setIntegranteData({ ...integranteData, telefono: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMostrarFormIntegrante(null);
                                setIntegranteData({ nombre: "", rut: "", cargo: "", telefono: "" });
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => agregarIntegrante(cuadrilla.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Agregar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMostrarFormIntegrante(cuadrilla.id)}
                          className="w-full gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Agregar Integrante
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
