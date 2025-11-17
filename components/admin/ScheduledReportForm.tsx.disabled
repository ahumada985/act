/**
 * Formulario para crear/editar reportes programados
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import type { ReportFrequency, ReportFormat, TipoTrabajo } from '@prisma/client';

const FREQUENCY_OPTIONS: Array<{ value: ReportFrequency; label: string }> = [
  { value: 'DAILY', label: 'Diario' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensual' },
];

const FORMAT_OPTIONS: Array<{ value: ReportFormat; label: string }> = [
  { value: 'PDF', label: 'PDF (HTML)' },
  { value: 'EXCEL', label: 'Excel (CSV)' },
  { value: 'JSON', label: 'JSON' },
];

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const TIPOS_TRABAJO = [
  'FIBRA_OPTICA',
  'DATA_CENTER',
  'ANTENAS',
  'CCTV',
  'INSTALACION_RED',
  'MANTENIMIENTO',
  'OTRO',
];

interface ScheduledReportFormData {
  nombre: string;
  descripcion?: string;
  frequency: ReportFrequency;
  format: ReportFormat;
  emails: string[];
  filters?: {
    proyecto?: string;
    tipoTrabajo?: string;
    region?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
}

interface ScheduledReportFormProps {
  onSubmit: (data: ScheduledReportFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ScheduledReportFormData>;
  isLoading?: boolean;
}

export function ScheduledReportForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: ScheduledReportFormProps) {
  const [formData, setFormData] = useState<ScheduledReportFormData>({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    frequency: initialData?.frequency || 'WEEKLY',
    format: initialData?.format || 'PDF',
    emails: initialData?.emails || [],
    filters: initialData?.filters || {},
    dayOfWeek: initialData?.dayOfWeek ?? 1,
    dayOfMonth: initialData?.dayOfMonth ?? 1,
    hour: initialData?.hour ?? 8,
  });

  const [emailInput, setEmailInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (formData.emails.length === 0) {
      alert('Debe agregar al menos un email');
      return;
    }

    await onSubmit(formData);
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Validación básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Email inválido');
      return;
    }

    if (formData.emails.includes(email)) {
      alert('Email ya agregado');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      emails: [...prev.emails, email],
    }));
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.filter((e) => e !== email),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre y Descripción */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">
            Nombre del Reporte <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
            placeholder="Reporte Semanal de Avance"
            required
          />
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Descripción opcional del reporte"
            rows={2}
          />
        </div>
      </div>

      {/* Frecuencia y Formato */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency">Frecuencia</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value: ReportFrequency) =>
              setFormData((prev) => ({ ...prev, frequency: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="format">Formato</Label>
          <Select
            value={formData.format}
            onValueChange={(value: ReportFormat) =>
              setFormData((prev) => ({ ...prev, format: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuración de horario */}
      <div className="space-y-4">
        <Label>Configuración de Ejecución</Label>

        {formData.frequency === 'WEEKLY' && (
          <div>
            <Label htmlFor="dayOfWeek">Día de la Semana</Label>
            <Select
              value={formData.dayOfWeek?.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, dayOfWeek: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia.value} value={dia.value.toString()}>
                    {dia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.frequency === 'MONTHLY' && (
          <div>
            <Label htmlFor="dayOfMonth">Día del Mes</Label>
            <Input
              id="dayOfMonth"
              type="number"
              min="1"
              max="31"
              value={formData.dayOfMonth}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dayOfMonth: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>
        )}

        <div>
          <Label htmlFor="hour">Hora de Ejecución</Label>
          <Input
            id="hour"
            type="number"
            min="0"
            max="23"
            value={formData.hour}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, hour: parseInt(e.target.value) || 0 }))
            }
          />
          <p className="text-xs text-gray-500 mt-1">Hora en formato 24 horas (0-23)</p>
        </div>
      </div>

      {/* Emails */}
      <div>
        <Label>
          Destinatarios (Emails) <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEmail();
              }
            }}
            placeholder="email@ejemplo.com"
          />
          <Button type="button" variant="outline" onClick={handleAddEmail}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.emails.map((email) => (
            <Badge key={email} variant="secondary" className="pr-1">
              {email}
              <button
                type="button"
                onClick={() => handleRemoveEmail(email)}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtros Opcionales */}
      <div className="space-y-4 border-t pt-4">
        <Label>Filtros Opcionales</Label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="proyecto">Proyecto</Label>
            <Input
              id="proyecto"
              value={formData.filters?.proyecto || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, proyecto: e.target.value },
                }))
              }
              placeholder="Nombre del proyecto"
            />
          </div>

          <div>
            <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
            <Select
              value={formData.filters?.tipoTrabajo || ''}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, tipoTrabajo: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {TIPOS_TRABAJO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              value={formData.filters?.region || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, region: e.target.value },
                }))
              }
              placeholder="Región"
            />
          </div>

          <div>
            <Label htmlFor="dateFrom">Desde</Label>
            <Input
              id="dateFrom"
              type="date"
              value={formData.filters?.dateFrom || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, dateFrom: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Crear Reporte'
          )}
        </Button>
      </div>
    </form>
  );
}
