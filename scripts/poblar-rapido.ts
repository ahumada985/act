import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TIPOS_TRABAJO = [
  'FIBRA_OPTICA',
  'DATA_CENTER',
  'ANTENAS',
  'CCTV',
  'INSTALACION_RED',
  'MANTENIMIENTO',
] as const;

const ESTADOS = ['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO'] as const;

const PROYECTOS = [
  'Mina El Teniente - Fibra Óptica',
  'Mina Escondida - Red Datos',
  'Mina Los Pelambres - Sistema CCTV',
  'Mina Chuquicamata - Antenas 4G/5G',
  'Mina Collahuasi - Data Center',
  'Mina Los Bronces - Backbone Fibra',
  'Mina Candelaria - Red Comunicaciones',
  'Mina El Salvador - Sistemas Digitales',
  'Mina Centinela - Infraestructura TI',
  'Mina Gabriela Mistral - Red Minera',
  'Mina Radomiro Tomic - Telecomunicaciones',
  'Mina Andina - Conectividad Industrial',
];

const COMUNAS = [
  'Calama',
  'Antofagasta',
  'Copiapó',
  'Diego de Almagro',
  'Rancagua',
  'Los Andes',
  'Salamanca',
  'Pozo Almonte',
  'María Elena',
  'Taltal',
];

const CLIENTES = [
  'Codelco Chile',
  'BHP Billiton',
  'Anglo American',
  'Antofagasta Minerals',
  'Teck Resources',
  'Glencore',
  'Lundin Mining',
  'KGHM Internacional',
  'Freeport-McMoRan',
  'Capstone Copper',
];

const DESCRIPCIONES = [
  'Instalación de fibra óptica en zona de extracción. Ductos protegidos contra polvo y vibración.',
  'Tendido de cable backbone entre rajo y planta concentradora. Certificación OK.',
  'Instalación de antenas en torre de comunicaciones mina. Cobertura 4G verificada.',
  'Sistema CCTV perimetral instalado. 24 cámaras PTZ operativas en sector chancado.',
  'Configuración de switches industriales en subestación eléctrica. Red operativa.',
  'Empalmes de fibra en galería nivel -200. Pérdidas bajo 0.3dB. Conforme.',
  'Data Center modular instalado en zona administrativa. Climatización y UPS OK.',
  'Red WiFi industrial desplegada en área de mantención. 15 AP operativos.',
  'Cableado estructurado categoría 6A en edificio de operaciones. Certificado.',
  'Sistema de radiocomunicación instalado. Cobertura interior mina verificada.',
  'Enlace microondas punto a punto configurado. 1Gbps entre campamento y mina.',
  'Actualización de core de red en centro de control. Migración sin incidentes.',
];

const REGIONES = [
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  "Región del Libertador Gral. Bernardo O'Higgins",
];

const ZONAS_MINERAS = [
  { lat: -22.45, lon: -68.93 },
  { lat: -23.65, lon: -70.4 },
  { lat: -27.36, lon: -70.33 },
  { lat: -34.17, lon: -70.74 },
  { lat: -32.41, lon: -70.29 },
  { lat: -31.71, lon: -70.95 },
  { lat: -20.96, lon: -68.63 },
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

function randomCoords() {
  const zona = randomItem(ZONAS_MINERAS);
  return {
    latitud: zona.lat + (Math.random() - 0.5) * 0.1,
    longitud: zona.lon + (Math.random() - 0.5) * 0.1,
  };
}

async function main() {
  console.log('🚀 Iniciando población de datos con Prisma...\n');

  try {
    // Verificar si hay usuarios
    const users = await prisma.user.findMany({
      where: { role: { in: ['SUPERVISOR', 'ADMIN'] } },
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios SUPERVISOR o ADMIN');
      console.log('💡 Crea primero un usuario en Supabase Auth y en la tabla User');
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuario(s)`);
    users.forEach((u) => console.log(`   - ${u.nombre} ${u.apellido} (${u.role})`));
    console.log('');

    const cantidadReportes = 25;
    console.log(`📝 Creando ${cantidadReportes} reportes...\n`);

    for (let i = 0; i < cantidadReportes; i++) {
      const supervisor = randomItem(users);
      const coords = randomCoords();

      const reporte = await prisma.reporte.create({
        data: {
          tipoTrabajo: randomItem(TIPOS_TRABAJO),
          clienteFinal: randomItem(CLIENTES),
          ordenTrabajo: `OT-2025-${String(1000 + i).padStart(4, '0')}`,
          proyecto: randomItem(PROYECTOS),
          descripcion: randomItem(DESCRIPCIONES),
          observaciones:
            Math.random() > 0.5
              ? 'Sin observaciones adicionales'
              : 'Revisar informe técnico adjunto',
          direccion: `Sector Mina ${Math.floor(Math.random() * 99) + 1}`,
          comuna: randomItem(COMUNAS),
          region: randomItem(REGIONES),
          latitud: coords.latitud,
          longitud: coords.longitud,
          supervisorId: supervisor.id,
          status: randomItem(ESTADOS),
          fecha: randomDate(30),
        },
      });

      // Agregar 2-4 fotos por reporte
      const numFotos = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < numFotos; j++) {
        await prisma.foto.create({
          data: {
            url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
            reporteId: reporte.id,
            orden: j,
            descripcion: `Foto ${j + 1} del trabajo - ${randomItem(['Panorámica', 'Detalle instalación', 'Equipo instalado', 'Vista general'])}`,
          },
        });
      }

      console.log(
        `✅ Reporte ${i + 1}/${cantidadReportes}: ${reporte.proyecto} (${numFotos} fotos)`
      );
    }

    console.log('\n✨ ¡Población de datos completada exitosamente!');
    console.log(`📊 Creados ${cantidadReportes} reportes con fotos`);
    console.log('\n🎉 Ahora puedes ver las estadísticas en el dashboard!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
