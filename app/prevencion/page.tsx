"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  Users,
  Calendar,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";

interface DocumentoSeguridad {
  nombre: string;
  tipo: string;
  url?: string;
}

interface PrevencionRiesgo {
  id: string;
  proyectoNombre: string;
  actividad: string;
  personasInvolucradas: string;
  documentos: DocumentoSeguridad[];
  fecha: string;
  estado?: string;
}

const TIPOS_DOCUMENTOS = [
  "AST (Análisis Seguro de Trabajo)",
  "Permiso de Trabajo",
  "Check List EPP",
  "Procedimiento de Trabajo",
  "Plan de Emergencia",
  "Registro de Capacitación",
  "Informe de Incidente",
  "Otro"
];

export default function PrevencionPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<PrevencionRiesgo[]>([]);
  const [proyectos, setProyectos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [verDetalle, setVerDetalle] = useState<PrevencionRiesgo | null>(null);

  const [formData, setFormData] = useState({
    proyectoNombre: "",
    actividad: "",
    personasInvolucradas: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  const [documentos, setDocumentos] = useState<DocumentoSeguridad[]>([]);
  const [nuevoDoc, setNuevoDoc] = useState({ nombre: "", tipo: TIPOS_DOCUMENTOS[0] });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Obtener registros de prevención
      const { data: prevData, error } = await supabase
        .from("prevencionriesgo")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;

      // Mapear nombres de columnas de BD a interfaz
      const registrosMapeados = (prevData || []).map(r => ({
        id: r.id,
        proyectoNombre: r.proyectonombre,
        actividad: r.actividad,
        personasInvolucradas: r.personasinvolucradas,
        documentos: r.documentos || [],
        fecha: r.fecha,
        estado: r.estado
      }));
      setRegistros(registrosMapeados);

      // Obtener proyectos únicos de reportes
      const { data: reportes } = await supabase
        .from("Reporte")
        .select("proyecto")
        .not("proyecto", "is", null);

      const uniqueProyectos = [...new Set((reportes || []).map(r => r.proyecto).filter(Boolean))];
      setProyectos(uniqueProyectos);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarRegistro() {
    if (!formData.proyectoNombre || !formData.actividad || !formData.personasInvolucradas) {
      alert("Complete los campos requeridos");
      return;
    }

    try {
      const datos = {
        proyectonombre: formData.proyectoNombre,
        actividad: formData.actividad,
        personasinvolucradas: formData.personasInvolucradas,
        documentos: documentos,
        fecha: formData.fecha,
      };

      if (editando) {
        const { error } = await supabase
          .from("prevencionriesgo")
          .update(datos)
          .eq("id", editando);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("prevencionriesgo")
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
      alert("Error al guardar registro");
    }
  }

  async function eliminarRegistro(id: string) {
    if (!confirm("¿Eliminar este registro de prevención?")) return;

    try {
      const { error } = await supabase
        .from("prevencionriesgo")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al eliminar registro");
    }
  }

  function editarRegistro(registro: PrevencionRiesgo) {
    setFormData({
      proyectoNombre: registro.proyectoNombre,
      actividad: registro.actividad,
      personasInvolucradas: registro.personasInvolucradas,
      fecha: registro.fecha,
    });
    setDocumentos(registro.documentos || []);
    setEditando(registro.id);
    setMostrarForm(true);
  }

  function resetForm() {
    setFormData({
      proyectoNombre: "",
      actividad: "",
      personasInvolucradas: "",
      fecha: new Date().toISOString().split('T')[0],
    });
    setDocumentos([]);
    setNuevoDoc({ nombre: "", tipo: TIPOS_DOCUMENTOS[0] });
    setMostrarForm(false);
    setEditando(null);
  }

  function agregarDocumento() {
    if (!nuevoDoc.nombre) {
      alert("Ingrese nombre del documento");
      return;
    }
    setDocumentos([...documentos, { ...nuevoDoc }]);
    setNuevoDoc({ nombre: "", tipo: TIPOS_DOCUMENTOS[0] });
  }

  function eliminarDocumento(index: number) {
    setDocumentos(documentos.filter((_, i) => i !== index));
  }

  // Filtrar
  const registrosFiltrados = busqueda
    ? registros.filter(r =>
        r.proyectoNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.actividad.toLowerCase().includes(busqueda.toLowerCase())
      )
    : registros;

  // Agrupar por proyecto
  const registrosPorProyecto: Record<string, PrevencionRiesgo[]> = {};
  registrosFiltrados.forEach(r => {
    if (!registrosPorProyecto[r.proyectoNombre]) {
      registrosPorProyecto[r.proyectoNombre] = [];
    }
    registrosPorProyecto[r.proyectoNombre].push(r);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando registros...</p>
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
              <Shield className="h-6 w-6 text-blue-600" />
              Prevención de Riesgos
            </h1>
            <p className="text-gray-500 mt-1">
              {registros.length} registros de seguridad
            </p>
          </div>
          <Button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>

        {/* Form */}
        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editando ? "Editar Registro" : "Nuevo Registro de Seguridad"}
                </h3>
                <button onClick={resetForm}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Proyecto *</label>
                    <select
                      value={formData.proyectoNombre}
                      onChange={(e) => setFormData({ ...formData, proyectoNombre: e.target.value })}
                      className="w-full h-10 px-3 border rounded-md text-sm"
                    >
                      <option value="">Seleccionar proyecto...</option>
                      {proyectos.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Fecha *</label>
                    <Input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Actividad / Descripción *</label>
                  <textarea
                    placeholder="Describa la actividad de riesgo..."
                    value={formData.actividad}
                    onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Personal Involucrado *</label>
                  <textarea
                    placeholder="Lista de trabajadores involucrados..."
                    value={formData.personasInvolucradas}
                    onChange={(e) => setFormData({ ...formData, personasInvolucradas: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[60px] resize-none"
                  />
                </div>

                {/* Documentos */}
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Documentos de Seguridad</label>

                  {documentos.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {documentos.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{doc.nombre}</span>
                            <span className="text-xs text-gray-400">({doc.tipo})</span>
                          </div>
                          <button
                            onClick={() => eliminarDocumento(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del documento"
                      value={nuevoDoc.nombre}
                      onChange={(e) => setNuevoDoc({ ...nuevoDoc, nombre: e.target.value })}
                      className="flex-1"
                    />
                    <select
                      value={nuevoDoc.tipo}
                      onChange={(e) => setNuevoDoc({ ...nuevoDoc, tipo: e.target.value })}
                      className="h-10 px-2 border rounded-md text-sm w-48"
                    >
                      {TIPOS_DOCUMENTOS.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={agregarDocumento}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={guardarRegistro} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="h-4 w-4" />
                  {editando ? "Guardar Cambios" : "Crear Registro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Detalle */}
        {verDetalle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg border-0 shadow-xl bg-white">
              <CardContent className="p-6 bg-white rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Detalle del Registro</h3>
                  <button onClick={() => setVerDetalle(null)}>
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500">Proyecto</label>
                    <p className="font-medium">{verDetalle.proyectoNombre}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Fecha</label>
                    <p className="font-medium">
                      {new Date(verDetalle.fecha).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Actividad</label>
                    <p className="text-sm">{verDetalle.actividad}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Personal Involucrado</label>
                    <p className="text-sm whitespace-pre-wrap">{verDetalle.personasInvolucradas}</p>
                  </div>
                  {verDetalle.documentos && verDetalle.documentos.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500">Documentos</label>
                      <div className="space-y-1 mt-1">
                        {verDetalle.documentos.map((doc, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            <span>{doc.nombre}</span>
                            <span className="text-xs text-gray-400">({doc.tipo})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setVerDetalle(null)}>
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por proyecto o actividad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-white border-0 shadow-sm"
          />
        </div>

        {/* Lista agrupada por proyecto */}
        {Object.keys(registrosPorProyecto).length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin registros</h3>
              <p className="text-gray-500 mb-4">Crea el primer registro de prevención</p>
              <Button onClick={() => setMostrarForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(registrosPorProyecto).map(([proyecto, regs]) => (
              <div key={proyecto}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {proyecto}
                  </span>
                  <span className="text-xs text-gray-400">({regs.length})</span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {regs.map(registro => (
                    <Card key={registro.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {new Date(registro.fecha).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setVerDetalle(registro)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => editarRegistro(registro)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => eliminarRegistro(registro.id)}
                              className="p-1.5 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                          {registro.actividad}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {registro.personasInvolucradas.split('\n').length} personas
                            </span>
                          </div>
                          {registro.documentos && registro.documentos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{registro.documentos.length} docs</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
