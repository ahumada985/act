/**
 * Generador de reportes en diferentes formatos
 */

import type { Reporte, TipoTrabajo, ReportStatus } from '@prisma/client';
import type { ScheduledReportFilters } from '@/services/scheduled-reports.service';

export interface ReportData {
  reportes: Reporte[];
  filters: ScheduledReportFilters;
  generatedAt: Date;
  totalReportes: number;
  stats: {
    porTipo: Record<string, number>;
    porStatus: Record<string, number>;
    porRegion: Record<string, number>;
  };
}

/**
 * Genera estadísticas del reporte
 */
export function generateReportStats(reportes: Reporte[]): ReportData['stats'] {
  const porTipo: Record<string, number> = {};
  const porStatus: Record<string, number> = {};
  const porRegion: Record<string, number> = {};

  reportes.forEach((reporte) => {
    // Por tipo
    const tipo = reporte.tipoTrabajo || 'SIN_TIPO';
    porTipo[tipo] = (porTipo[tipo] || 0) + 1;

    // Por status
    const status = reporte.status || 'SIN_STATUS';
    porStatus[status] = (porStatus[status] || 0) + 1;

    // Por región
    const region = reporte.region || 'SIN_REGION';
    porRegion[region] = (porRegion[region] || 0) + 1;
  });

  return { porTipo, porStatus, porRegion };
}

/**
 * Genera reporte en formato JSON
 */
export function generateJSONReport(data: ReportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Genera reporte en formato CSV
 */
export function generateCSVReport(data: ReportData): string {
  const headers = [
    'ID',
    'Fecha',
    'Status',
    'Tipo de Trabajo',
    'Proyecto',
    'Orden de Trabajo',
    'Cliente Final',
    'Región',
    'Comuna',
    'Dirección',
    'Latitud',
    'Longitud',
    'Descripción',
    'Observaciones',
  ];

  const rows = data.reportes.map((reporte) => [
    reporte.id,
    reporte.fecha.toISOString(),
    reporte.status,
    reporte.tipoTrabajo,
    reporte.proyecto || '',
    reporte.ordenTrabajo || '',
    reporte.clienteFinal || '',
    reporte.region || '',
    reporte.comuna || '',
    reporte.direccion || '',
    reporte.latitud?.toString() || '',
    reporte.longitud?.toString() || '',
    reporte.descripcion || '',
    reporte.observaciones || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Genera HTML para el reporte
 */
export function generateHTMLReport(data: ReportData): string {
  const { reportes, stats, filters, generatedAt } = data;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte ACT - ${generatedAt.toLocaleDateString('es-CL')}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 4px solid #ff6b00;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #ff6b00;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #ff6b00;
    }
    .stat-card h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .stat-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .filters {
      background: #fffbe6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #faad14;
    }
    .filters h3 {
      font-size: 14px;
      color: #ad6800;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #ff6b00;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.borrador { background: #e6f7ff; color: #1890ff; }
    .badge.enviado { background: #fff7e6; color: #fa8c16; }
    .badge.aprobado { background: #f6ffed; color: #52c41a; }
    .badge.rechazado { background: #fff1f0; color: #f5222d; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reporte de Campo ACT</h1>
      <div class="meta">
        Generado el ${generatedAt.toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>

    ${
      filters && Object.keys(filters).length > 0
        ? `
    <div class="filters">
      <h3>Filtros Aplicados</h3>
      ${filters.proyecto ? `<div>Proyecto: <strong>${filters.proyecto}</strong></div>` : ''}
      ${filters.tipoTrabajo ? `<div>Tipo de Trabajo: <strong>${filters.tipoTrabajo}</strong></div>` : ''}
      ${filters.region ? `<div>Región: <strong>${filters.region}</strong></div>` : ''}
      ${filters.dateFrom ? `<div>Desde: <strong>${filters.dateFrom}</strong></div>` : ''}
      ${filters.dateTo ? `<div>Hasta: <strong>${filters.dateTo}</strong></div>` : ''}
    </div>
    `
        : ''
    }

    <div class="stats">
      <div class="stat-card">
        <h3>Total Reportes</h3>
        <div class="value">${reportes.length}</div>
      </div>
      <div class="stat-card">
        <h3>Aprobados</h3>
        <div class="value">${stats.porStatus['APROBADO'] || 0}</div>
      </div>
      <div class="stat-card">
        <h3>Pendientes</h3>
        <div class="value">${(stats.porStatus['BORRADOR'] || 0) + (stats.porStatus['ENVIADO'] || 0)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Status</th>
          <th>Tipo</th>
          <th>Proyecto</th>
          <th>OT</th>
          <th>Región</th>
          <th>Comuna</th>
        </tr>
      </thead>
      <tbody>
        ${reportes
          .map(
            (r) => `
          <tr>
            <td>${new Date(r.fecha).toLocaleDateString('es-CL')}</td>
            <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
            <td>${r.tipoTrabajo}</td>
            <td>${r.proyecto || '-'}</td>
            <td>${r.ordenTrabajo || '-'}</td>
            <td>${r.region || '-'}</td>
            <td>${r.comuna || '-'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>ACT Reportes - Sistema de Reportabilidad para Telecomunicaciones</p>
      <p>Este reporte fue generado automáticamente</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Prepara los datos del reporte aplicando filtros
 */
export function prepareReportData(
  reportes: Reporte[],
  filters: ScheduledReportFilters
): ReportData {
  let filteredReportes = [...reportes];

  // Aplicar filtros
  if (filters.proyecto) {
    filteredReportes = filteredReportes.filter((r) => r.proyecto === filters.proyecto);
  }

  if (filters.tipoTrabajo) {
    filteredReportes = filteredReportes.filter((r) => r.tipoTrabajo === filters.tipoTrabajo);
  }

  if (filters.region) {
    filteredReportes = filteredReportes.filter((r) => r.region === filters.region);
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    filteredReportes = filteredReportes.filter((r) => new Date(r.fecha) >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    filteredReportes = filteredReportes.filter((r) => new Date(r.fecha) <= to);
  }

  const stats = generateReportStats(filteredReportes);

  return {
    reportes: filteredReportes,
    filters,
    generatedAt: new Date(),
    totalReportes: filteredReportes.length,
    stats,
  };
}
