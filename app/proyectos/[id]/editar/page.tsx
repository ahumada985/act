"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, ArrowLeft } from "lucide-react";

export default function EditarProyectoPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cliente: "",
    estado: "ACTIVO",
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchProyecto(params.id as string);
    }
  }, [params.id]);

  async function fetchProyecto(id: string) {
    try {
      const { data, error } = await supabase
        .from("Proyecto")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        cliente: data.cliente || "",
        estado: data.estado,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : "",
        fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : "",
      });
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cargar proyecto: " + error.message);
      router.push("/proyectos");
    } finally {
      setLoadingData(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("Proyecto")
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          cliente: formData.cliente || null,
          estado: formData.estado,
          fechaInicio: formData.fechaInicio || null,
          fechaFin: formData.fechaFin || null,
        })
        .eq("id", params.id);

      if (error) throw error;

      alert("Proyecto actualizado exitosamente!");
      router.push("/proyectos");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al actualizar proyecto: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando proyecto...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/proyectos")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">
                Editar Proyecto
              </CardTitle>
              <CardDescription>
                Modifica los datos del proyecto
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Instalación Red Fibra Óptica"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  placeholder="Ej: Movistar, Entel, Claro"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe el alcance del proyecto..."
                />
              </div>

              <div>
                <Label htmlFor="estado">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="CANCELADO">Cancelado</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha de Fin</Label>
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={loading || !formData.nombre}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
