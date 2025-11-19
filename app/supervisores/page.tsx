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
  Mail,
  Phone,
  UserCircle,
  FileText,
  X,
  Save,
  Camera
} from "lucide-react";

interface Supervisor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  _count?: {
    reportes: number;
  };
}

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
];

export default function SupervisoresPage() {
  const router = useRouter();
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    avatar: AVATARS[0],
  });

  useEffect(() => {
    fetchSupervisores();
  }, []);

  async function fetchSupervisores() {
    try {
      // Obtener supervisores
      const { data: users, error } = await supabase
        .from("User")
        .select("*")
        .eq("role", "SUPERVISOR")
        .order("nombre");

      if (error) throw error;

      // Contar reportes por supervisor
      const { data: reportes } = await supabase
        .from("Reporte")
        .select("supervisorId");

      const conteoReportes: Record<string, number> = {};
      reportes?.forEach(r => {
        if (r.supervisorId) {
          conteoReportes[r.supervisorId] = (conteoReportes[r.supervisorId] || 0) + 1;
        }
      });

      const supervisoresConConteo = (users || []).map(u => ({
        ...u,
        _count: { reportes: conteoReportes[u.id] || 0 }
      }));

      setSupervisores(supervisoresConConteo);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarSupervisor() {
    if (!formData.nombre || !formData.apellido || !formData.email) {
      alert("Complete los campos requeridos");
      return;
    }

    try {
      if (editando) {
        // Actualizar
        const { error } = await supabase
          .from("User")
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            avatar: formData.avatar,
          })
          .eq("id", editando);

        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from("User")
          .insert({
            id: `supervisor-${Date.now()}`,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.telefono,
            avatar: formData.avatar,
            role: "SUPERVISOR",
          });

        if (error) throw error;
      }

      setFormData({ nombre: "", apellido: "", email: "", telefono: "", avatar: AVATARS[0] });
      setMostrarForm(false);
      setEditando(null);
      fetchSupervisores();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al guardar supervisor");
    }
  }

  async function eliminarSupervisor(id: string) {
    if (!confirm("¿Eliminar este supervisor?")) return;

    try {
      const { error } = await supabase
        .from("User")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchSupervisores();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al eliminar supervisor");
    }
  }

  function editarSupervisor(supervisor: Supervisor) {
    setFormData({
      nombre: supervisor.nombre,
      apellido: supervisor.apellido,
      email: supervisor.email,
      telefono: supervisor.telefono || "",
      avatar: supervisor.avatar || AVATARS[0],
    });
    setEditando(supervisor.id);
    setMostrarForm(true);
  }

  function cancelarForm() {
    setFormData({ nombre: "", apellido: "", email: "", telefono: "", avatar: AVATARS[0] });
    setMostrarForm(false);
    setEditando(null);
  }

  // Filtrar
  const supervisoresFiltrados = busqueda
    ? supervisores.filter(s =>
        `${s.nombre} ${s.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    : supervisores;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando supervisores...</p>
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
              Supervisores
            </h1>
            <p className="text-gray-500 mt-1">
              {supervisores.length} supervisores registrados
            </p>
          </div>
          <Button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Supervisor
          </Button>
        </div>

        {/* Form */}
        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editando ? "Editar Supervisor" : "Nuevo Supervisor"}
                </h3>
                <button onClick={cancelarForm}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* Selector de avatar */}
              <div className="mb-4">
                <label className="text-sm text-gray-500 mb-2 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                        formData.avatar === avatar
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img src={avatar} alt="" className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Nombre *</label>
                  <Input
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Apellido *</label>
                  <Input
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Teléfono</label>
                  <Input
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={cancelarForm}>
                  Cancelar
                </Button>
                <Button onClick={guardarSupervisor} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="h-4 w-4" />
                  {editando ? "Guardar Cambios" : "Crear Supervisor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar supervisor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-white border-0 shadow-sm"
          />
        </div>

        {/* Lista de supervisores */}
        {supervisoresFiltrados.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin supervisores</h3>
              <p className="text-gray-500 mb-4">Agrega el primer supervisor del equipo</p>
              <Button onClick={() => setMostrarForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Supervisor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supervisoresFiltrados.map((supervisor) => (
              <Card key={supervisor.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {supervisor.avatar ? (
                        <img src={supervisor.avatar} alt="" className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {supervisor.nombre} {supervisor.apellido}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{supervisor.email}</span>
                      </div>
                      {supervisor.telefono && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{supervisor.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats y acciones */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{supervisor._count?.reportes || 0} reportes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => editarSupervisor(supervisor)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => eliminarSupervisor(supervisor.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
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
