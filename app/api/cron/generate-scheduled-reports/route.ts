/**
 * API Route para ejecutar reportes programados
 * Este endpoint debe ser llamado por un cron job (Vercel Cron, GitHub Actions, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { scheduledReportsService } from '@/services/scheduled-reports.service';
import { createClient } from '@/lib/supabase/server';
import {
  prepareReportData,
  generateHTMLReport,
  generateJSONReport,
  generateCSVReport,
} from '@/lib/reports/report-generator';
import { sendReportEmail } from '@/lib/email/send-report';

/**
 * Verifica que la request viene del cron (seguridad)
 */
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET no configurado');
    return true; // En desarrollo, permitir
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * POST - Ejecutar reportes programados pendientes
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del cron
    if (!verifyCronAuth(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔄 Iniciando ejecución de reportes programados...');

    // Obtener reportes que deben ejecutarse
    const dueReports = await scheduledReportsService.getDueReports();

    console.log(`📊 Encontrados ${dueReports.length} reportes para ejecutar`);

    if (dueReports.length === 0) {
      return NextResponse.json({
        message: 'No hay reportes pendientes',
        executed: 0,
      });
    }

    const results = [];

    // Ejecutar cada reporte
    for (const scheduledReport of dueReports) {
      try {
        console.log(`⏳ Procesando reporte: ${scheduledReport.nombre}`);

        // 1. Obtener los datos de reportes con los filtros aplicados
        const supabase = createClient();
        const { data: reportes, error } = await supabase
          .from('Reporte')
          .select('*')
          .order('fecha', { ascending: false });

        if (error) throw error;

        // 2. Preparar datos del reporte
        const reportData = prepareReportData(
          reportes || [],
          scheduledReport.filters || {}
        );

        // 3. Generar el reporte en el formato especificado
        let attachment;

        switch (scheduledReport.format) {
          case 'PDF':
            // Para PDF, necesitarías una librería como puppeteer o pdf-lib
            // Por ahora, enviar HTML
            const html = generateHTMLReport(reportData);
            attachment = {
              filename: `reporte-${scheduledReport.nombre.replace(/\s+/g, '-')}.html`,
              content: html,
            };
            break;

          case 'EXCEL':
            // Para Excel, usar CSV como alternativa simple
            const csv = generateCSVReport(reportData);
            attachment = {
              filename: `reporte-${scheduledReport.nombre.replace(/\s+/g, '-')}.csv`,
              content: csv,
            };
            break;

          case 'JSON':
            const json = generateJSONReport(reportData);
            attachment = {
              filename: `reporte-${scheduledReport.nombre.replace(/\s+/g, '-')}.json`,
              content: json,
            };
            break;
        }

        // 4. Enviar email
        await sendReportEmail(
          scheduledReport.emails,
          reportData,
          scheduledReport.format,
          scheduledReport.frequency,
          attachment
        );

        // 5. Marcar como ejecutado
        await scheduledReportsService.markAsRun(scheduledReport.id, 'SUCCESS');

        results.push({
          id: scheduledReport.id,
          nombre: scheduledReport.nombre,
          status: 'SUCCESS',
          totalReportes: reportData.totalReportes,
        });

        console.log(`✅ Reporte "${scheduledReport.nombre}" ejecutado exitosamente`);
      } catch (error: any) {
        console.error(`❌ Error al ejecutar reporte "${scheduledReport.nombre}":`, error);

        // Marcar como error
        await scheduledReportsService.markAsRun(
          scheduledReport.id,
          'ERROR',
          error.message
        );

        results.push({
          id: scheduledReport.id,
          nombre: scheduledReport.nombre,
          status: 'ERROR',
          error: error.message,
        });
      }
    }

    const successful = results.filter((r) => r.status === 'SUCCESS').length;
    const failed = results.filter((r) => r.status === 'ERROR').length;

    console.log(`✨ Ejecución completada: ${successful} exitosos, ${failed} fallidos`);

    return NextResponse.json({
      message: 'Reportes procesados',
      executed: results.length,
      successful,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('Error al ejecutar reportes programados:', error);
    return NextResponse.json(
      { error: error.message || 'Error al ejecutar reportes programados' },
      { status: 500 }
    );
  }
}

/**
 * GET - Endpoint de health check para el cron
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'scheduled-reports-cron',
    timestamp: new Date().toISOString(),
  });
}
