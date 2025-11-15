/**
 * Componente de filtros de reportes
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIPOS_TRABAJO, STATUS_REPORTE } from '@/constants';
import { X, Search } from 'lucide-react';
import type { FiltrosReportes } from '@/stores';

interface ReportesFiltersProps {
  filtros: FiltrosReportes;
  onChange: (filtros: Partial<FiltrosReportes>) => void;
  onClear: () => void;
}

export const ReportesFilters = React.memo<ReportesFiltersProps>(
  ({ filtros, onChange, onClear }) => {
    const hasActiveFilters = Object.keys(filtros).length > 0;

    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-600"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="busqueda">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Buscar..."
                  className="pl-9"
                  value={filtros.busqueda || ''}
                  onChange={(e) => onChange({ busqueda: e.target.value })}
                />
              </div>
            </div>

            {/* Tipo de Trabajo */}
            <div className="space-y-2">
              <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
              <Select
                value={filtros.tipoTrabajo || ''}
                onValueChange={(value) =>
                  onChange({ tipoTrabajo: value as any || undefined })
                }
              >
                <SelectTrigger id="tipoTrabajo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {TIPOS_TRABAJO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={filtros.status || ''}
                onValueChange={(value) =>
                  onChange({ status: value as any || undefined })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.values(STATUS_REPORTE).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Desde */}
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={filtros.fechaDesde || ''}
                onChange={(e) => onChange({ fechaDesde: e.target.value })}
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={filtros.fechaHasta || ''}
                onChange={(e) => onChange({ fechaHasta: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ReportesFilters.displayName = 'ReportesFilters';
