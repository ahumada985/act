/**
 * Utilidad para enviar reportes por email
 * Nota: Usa Resend (https://resend.com) para envío de emails
 */

import type { ReportFormat } from '@prisma/client';
import type { ReportData } from '@/lib/reports/report-generator';

/**
 * Configuración de email
 */
interface EmailConfig {
  from: string;
  to: string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

/**
 * Envía un email usando Resend (o servicio configurado)
 */
export async function sendEmail(config: EmailConfig): Promise<void> {
  // Para usar Resend:
  // 1. Instalar: npm install resend
  // 2. Configurar RESEND_API_KEY en .env
  // 3. Descomentar el código siguiente

  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: config.subject,
    html: config.html,
    attachments: config.attachments,
  });
  */

  // Por ahora, solo loguear
  console.log('📧 Email a enviar:', {
    from: config.from,
    to: config.to,
    subject: config.subject,
    attachments: config.attachments?.map((a) => a.filename),
  });

  // Simular envío
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Genera el subject del email según los parámetros
 */
export function generateEmailSubject(
  frequency: string,
  reportData: ReportData
): string {
  const date = reportData.generatedAt.toLocaleDateString('es-CL');
  const total = reportData.totalReportes;

  switch (frequency) {
    case 'DAILY':
      return `Reporte Diario ACT - ${date} (${total} reportes)`;
    case 'WEEKLY':
      return `Reporte Semanal ACT - ${date} (${total} reportes)`;
    case 'MONTHLY':
      return `Reporte Mensual ACT - ${date} (${total} reportes)`;
    default:
      return `Reporte ACT - ${date}`;
  }
}

/**
 * Genera el contenido HTML del email
 */
export function generateEmailHTML(
  reportData: ReportData,
  format: ReportFormat,
  hasAttachment: boolean
): string {
  const { totalReportes, stats, filters } = reportData;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .stat-box {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      border-radius: 6px;
      border-left: 4px solid #ff6b00;
    }
    .stat-box .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .stat-box .value {
      font-size: 24px;
      font-weight: bold;
      color: #ff6b00;
    }
    .content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .filters {
      background: #fffbe6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #faad14;
    }
    .filters h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #ad6800;
    }
    .attachment-note {
      background: #e6f7ff;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #1890ff;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #eee;
      margin-top: 30px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reporte ACT</h1>
    <p>Sistema de Reportabilidad para Telecomunicaciones</p>
  </div>

  <div class="content">
    <h2>Resumen del Reporte</h2>
    <p>Se ha generado tu reporte programado con los siguientes resultados:</p>

    <div class="stats">
      <div class="stat-box">
        <div class="label">Total</div>
        <div class="value">${totalReportes}</div>
      </div>
      <div class="stat-box">
        <div class="label">Aprobados</div>
        <div class="value">${stats.porStatus['APROBADO'] || 0}</div>
      </div>
      <div class="stat-box">
        <div class="label">Pendientes</div>
        <div class="value">${
          (stats.porStatus['BORRADOR'] || 0) + (stats.porStatus['ENVIADO'] || 0)
        }</div>
      </div>
    </div>

    ${
      filters && Object.keys(filters).length > 0
        ? `
    <div class="filters">
      <h3>Filtros Aplicados:</h3>
      <ul>
        ${filters.proyecto ? `<li>Proyecto: <strong>${filters.proyecto}</strong></li>` : ''}
        ${filters.tipoTrabajo ? `<li>Tipo: <strong>${filters.tipoTrabajo}</strong></li>` : ''}
        ${filters.region ? `<li>Región: <strong>${filters.region}</strong></li>` : ''}
        ${filters.dateFrom ? `<li>Desde: <strong>${filters.dateFrom}</strong></li>` : ''}
        ${filters.dateTo ? `<li>Hasta: <strong>${filters.dateTo}</strong></li>` : ''}
      </ul>
    </div>
    `
        : ''
    }

    ${
      hasAttachment
        ? `
    <div class="attachment-note">
      <strong>📎 Archivo adjunto:</strong> El reporte completo está adjunto en formato ${format}.
    </div>
    `
        : ''
    }

    <h3>Distribución por Tipo de Trabajo:</h3>
    <ul>
      ${Object.entries(stats.porTipo)
        .map(([tipo, count]) => `<li><strong>${tipo}:</strong> ${count}</li>`)
        .join('')}
    </ul>

    <h3>Distribución por Región:</h3>
    <ul>
      ${Object.entries(stats.porRegion)
        .slice(0, 5)
        .map(([region, count]) => `<li><strong>${region}:</strong> ${count}</li>`)
        .join('')}
    </ul>
  </div>

  <div class="footer">
    <p>Este es un email automático generado por ACT Reportes.</p>
    <p>Por favor no respondas a este mensaje.</p>
    <p>&copy; ${new Date().getFullYear()} ACT - Advanced Communication Technologies</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envía un reporte por email
 */
export async function sendReportEmail(
  emails: string[],
  reportData: ReportData,
  format: ReportFormat,
  frequency: string,
  attachment?: {
    filename: string;
    content: string | Buffer;
  }
): Promise<void> {
  const subject = generateEmailSubject(frequency, reportData);
  const html = generateEmailHTML(reportData, format, !!attachment);

  await sendEmail({
    from: process.env.EMAIL_FROM || 'reportes@act.com',
    to: emails,
    subject,
    html,
    attachments: attachment ? [attachment] : undefined,
  });
}
