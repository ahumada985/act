import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// URL de una imagen de prueba pública
const IMAGEN_PRUEBA = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800';

const TIPOS_TRABAJO = [
  'FIBRA_OPTICA',
  'DATA_CENTER',
  'ANTENAS',
  'CCTV',
  'INSTALACION_RED',
  'MANTENIMIENTO',
  'OTRO'
];

const ESTADOS = ['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO'];

// 🏔️ PROYECTOS MINEROS DE TELECOMUNICACIONES
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
  'Mina Andina - Conectividad Industrial'
];

// 🏔️ COMUNAS Y REGIONES MINERAS DE CHILE
const COMUNAS = [
  'Calama',           // Chuquicamata, Radomiro Tomic
  'Antofagasta',      // Escondida, Centinela
  'Copiapó',          // Candelaria
  'Diego de Almagro', // El Salvador
  'Rancagua',         // El Teniente
  'Los Andes',        // Los Bronces, Andina
  'Salamanca',        // Los Pelambres
  'Pozo Almonte',     // Collahuasi
  'María Elena',      // Gabriela Mistral
  'Taltal'            // Otras operaciones
];

// ⛏️ EMPRESAS MINERAS Y CLIENTES
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
  'Capstone Copper'
];

// 📝 DESCRIPCIONES ESPECÍFICAS PARA MINERÍA
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
  'Actualización de core de red en centro de control. Migración sin incidentes.'
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
  // Coordenadas de diferentes zonas mineras de Chile
  const zonasMineras = [
    { lat: -22.45, lon: -68.93, nombre: 'Calama (Chuquicamata)' },
    { lat: -23.65, lon: -70.40, nombre: 'Antofagasta (Escondida)' },
    { lat: -27.36, lon: -70.33, nombre: 'Copiapó (Candelaria)' },
    { lat: -34.17, lon: -70.74, nombre: 'Rancagua (El Teniente)' },
    { lat: -32.41, lon: -70.29, nombre: 'Los Andes (Los Bronces)' },
    { lat: -31.71, lon: -70.95, nombre: 'Salamanca (Los Pelambres)' },
    { lat: -20.96, lon: -68.63, nombre: 'Collahuasi' },
  ];

  const zona = randomItem(zonasMineras);
  return {
    latitud: zona.lat + (Math.random() - 0.5) * 0.1,
    longitud: zona.lon + (Math.random() - 0.5) * 0.1
  };
}

async function poblarDatos() {
  console.log('🚀 Iniciando población de datos...\n');

  try {
    // Obtener supervisores
    const { data: supervisores, error: supervisoresError } = await supabase
      .from('User')
      .select('id, nombre, apellido')
      .eq('role', 'SUPERVISOR');

    if (supervisoresError) throw supervisoresError;

    if (!supervisores || supervisores.length === 0) {
      console.log('❌ No hay supervisores en la base de datos');
      console.log('💡 Primero debes tener al menos un usuario con role SUPERVISOR');
      return;
    }

    console.log(`✅ Encontrados ${supervisores.length} supervisor(es)`);
    supervisores.forEach(s => console.log(`   - ${s.nombre} ${s.apellido} (${s.id})`));
    console.log('');

    const cantidadReportes = 25;
    console.log(`📝 Creando ${cantidadReportes} reportes...\n`);

    for (let i = 0; i < cantidadReportes; i++) {
      const supervisor = randomItem(supervisores);
      const coords = randomCoords();
      const comuna = randomItem(COMUNAS);
      const tipoTrabajo = randomItem(TIPOS_TRABAJO);
      const proyecto = randomItem(PROYECTOS);

      // Crear reporte
      const { data: reporte, error: reporteError } = await supabase
        .from('Reporte')
        .insert({
          tipoTrabajo,
          clienteFinal: randomItem(CLIENTES),
          ordenTrabajo: `OT-2025-${String(1000 + i).padStart(4, '0')}`,
          proyecto,
          descripcion: randomItem(DESCRIPCIONES),
          observaciones: Math.random() > 0.5 ? 'Sin observaciones adicionales' : 'Revisar informe técnico adjunto',
          direccion: `Av. Principal ${Math.floor(Math.random() * 9999) + 1}`,
          comuna,
          region: randomItem([
            'Región de Antofagasta',
            'Región de Atacama',
            'Región de Coquimbo',
            'Región de Valparaíso',
            'Región Metropolitana',
            'Región del Libertador Gral. Bernardo O\'Higgins'
          ]),
          latitud: coords.latitud,
          longitud: coords.longitud,
          supervisorId: supervisor.id,
          status: randomItem(ESTADOS),
          createdAt: randomDate(30).toISOString(),
        })
        .select()
        .single();

      if (reporteError) {
        console.error(`❌ Error creando reporte ${i + 1}:`, reporteError);
        continue;
      }

      // Agregar entre 1 y 4 fotos por reporte
      const numFotos = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numFotos; j++) {
        const { error: fotoError } = await supabase
          .from('Foto')
          .insert({
            url: IMAGEN_PRUEBA,
            reporteId: reporte.id,
            orden: j,
            descripcion: `Foto ${j + 1} del trabajo`
          });

        if (fotoError) {
          console.error(`❌ Error agregando foto ${j + 1} al reporte ${i + 1}:`, fotoError);
        }
      }

      // Agregar audios aleatoriamente (50% de probabilidad)
      if (Math.random() > 0.5) {
        const numAudios = Math.floor(Math.random() * 2) + 1;
        for (let k = 0; k < numAudios; k++) {
          const { error: audioError } = await supabase
            .from('Audio')
            .insert({
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              duracion: Math.floor(Math.random() * 120) + 30,
              reporteId: reporte.id
            });

          if (audioError) {
            console.error(`❌ Error agregando audio ${k + 1} al reporte ${i + 1}:`, audioError);
          }
        }
      }

      console.log(`✅ Reporte ${i + 1}/${cantidadReportes} creado: ${proyecto} - ${tipoTrabajo} (${numFotos} fotos)`);
    }

    console.log('\n✨ Población de datos completada exitosamente!');
    console.log(`📊 Creados ${cantidadReportes} reportes con fotos y audios`);
    console.log('\n🎉 Ahora puedes ver las estadísticas en el dashboard!\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar
poblarDatos();
