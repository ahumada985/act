/**
 * Configuración del sistema de cron para reportes programados
 *
 * OPCIONES DE DEPLOYMENT:
 *
 * 1. Vercel Cron (Recomendado para Vercel):
 *    - Agregar vercel.json en la raíz con la configuración de cron
 *    - Vercel llamará automáticamente al endpoint en el horario configurado
 *    - Ver: vercel.example.json
 *
 * 2. GitHub Actions (Para cualquier hosting):
 *    - Crear .github/workflows/cron-reports.yml
 *    - Configurar el schedule con cron syntax
 *    - Llamar al endpoint API
 *
 * 3. Node-cron (Para servidores propios):
 *    - Ejecutar este archivo en tu servidor
 *    - Usar PM2 para mantenerlo corriendo
 *
 * 4. System cron (Linux/Unix):
 *    - Agregar a crontab: 0 * * * * curl -X POST https://tu-dominio.com/api/cron/generate-scheduled-reports
 */

import cron from 'node-cron';

/**
 * Ejecuta el endpoint de generación de reportes
 */
async function executeScheduledReports() {
  try {
    console.log('🔄 Ejecutando reportes programados...');

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/generate-scheduled-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Reportes ejecutados:', data);
    } else {
      console.error('❌ Error al ejecutar reportes:', data);
    }
  } catch (error) {
    console.error('❌ Error en cron:', error);
  }
}

/**
 * Configurar y ejecutar el cron job
 * Se ejecuta cada hora
 */
export function startCronJob() {
  // Ejecutar cada hora en el minuto 0
  // Formato: segundo minuto hora dia mes dia-semana
  cron.schedule('0 * * * *', () => {
    executeScheduledReports();
  });

  console.log('✅ Cron job iniciado - Se ejecutará cada hora');
}

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
  console.log('🚀 Iniciando servidor de cron jobs...');
  startCronJob();

  // Mantener el proceso vivo
  process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo cron jobs...');
    process.exit(0);
  });
}
