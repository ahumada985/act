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

const PROYECTOS = [
  'Proyecto Metro Santiago',
  'Red Fibra Óptica Región Metropolitana',
  'Instalación Antenas 5G',
  'Sistema CCTV Mall Plaza',
  'Data Center Banco Chile',
  'Mantenimiento Torres Entel',
  'Conectividad Escuela Rural',
  'Red Campus Universidad',
  'Sistema Seguridad Aeropuerto',
  'Fibra Óptica Edificio Corporativo'
];

const COMUNAS = [
  'Santiago',
  'Providencia',
  'Las Condes',
  'Vitacura',
  'Maipú',
  'Puente Alto',
  'La Florida',
  'San Bernardo',
  'Ñuñoa',
  'Recoleta'
];

const CLIENTES = [
  'Movistar Chile',
  'Entel',
  'Claro',
  'WOM',
  'VTR',
  'GTD',
  'Mundo Pacífico',
  'Telefónica',
  'Nextel',
  'Netline'
];

const DESCRIPCIONES = [
  'Instalación completada según especificaciones técnicas. Todo operativo.',
  'Tendido de fibra óptica en ductos subterráneos. Sin inconvenientes.',
  'Configuración y puesta en marcha de equipamiento. Pruebas exitosas.',
  'Mantenimiento preventivo realizado. Sistema operando correctamente.',
  'Instalación de antenas con orientación óptima. Señal verificada.',
  'Cableado estructurado completo. Certificación de enlaces OK.',
  'Sistema de cámaras instalado y configurado. Grabación activa.',
  'Empalmes de fibra realizados. Pérdidas dentro de rango aceptable.',
  'Equipos instalados en rack. Documentación actualizada.',
  'Trabajo finalizado según cronograma. Cliente conforme.'
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
  // Coordenadas aproximadas de Santiago, Chile
  const latBase = -33.45;
  const lonBase = -70.66;
  return {
    latitud: latBase + (Math.random() - 0.5) * 0.2,
    longitud: lonBase + (Math.random() - 0.5) * 0.2
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
          region: 'Región Metropolitana',
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
