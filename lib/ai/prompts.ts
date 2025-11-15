/**
 * Prompts para IA Generativa
 */

import type { TipoTrabajo } from '@/types';

/**
 * Prompt para generar descripción de reporte desde fotos
 */
export function getDescriptionPrompt(tipoTrabajo: TipoTrabajo, context?: string): string {
  const basePrompt = `Eres un asistente experto en reportes de telecomunicaciones para proyectos mineros en Chile.

Tu tarea es generar una descripción profesional y técnica del trabajo realizado basándote en las imágenes proporcionadas.

Tipo de trabajo: ${getTipoTrabajoLabel(tipoTrabajo)}

Instrucciones:
1. Analiza cuidadosamente las imágenes
2. Describe el trabajo realizado de manera clara y profesional
3. Incluye detalles técnicos relevantes (equipos, materiales, ubicación)
4. Menciona el estado de avance o completitud
5. Usa terminología técnica apropiada para ${getTipoTrabajoLabel(tipoTrabajo)}
6. Máximo 3 párrafos

${context ? `Contexto adicional: ${context}` : ''}

Genera la descripción:`;

  return basePrompt;
}

/**
 * Prompt para generar observaciones/recomendaciones
 */
export function getObservationsPrompt(
  tipoTrabajo: TipoTrabajo,
  descripcion: string,
  analisisIA?: any
): string {
  const basePrompt = `Eres un supervisor técnico experto en proyectos de telecomunicaciones mineros.

Basándote en la siguiente descripción del trabajo y análisis de imágenes, genera observaciones y recomendaciones profesionales.

Tipo de trabajo: ${getTipoTrabajoLabel(tipoTrabajo)}

Descripción del trabajo:
${descripcion}

${analisisIA ? `Análisis de IA de las imágenes: ${JSON.stringify(analisisIA)}` : ''}

Genera observaciones considerando:
1. Aspectos de seguridad
2. Calidad del trabajo
3. Cumplimiento de estándares
4. Recomendaciones de mejora
5. Puntos a verificar en próxima inspección

Formato: Lista de 3-5 observaciones puntuales y profesionales.`;

  return basePrompt;
}

/**
 * Prompt para analizar imágenes y detectar anomalías
 */
export function getImageAnalysisPrompt(tipoTrabajo: TipoTrabajo): string {
  const checklistItems = getChecklistByTipo(tipoTrabajo);

  return `Analiza esta imagen de un proyecto de ${getTipoTrabajoLabel(tipoTrabajo)} y proporciona:

1. Descripción de lo que ves
2. Estado del trabajo (completo, en progreso, iniciado)
3. Problemas o anomalías detectadas
4. Cumplimiento de estándares de seguridad
5. Checklist:
${checklistItems.map((item) => `   - ${item}`).join('\n')}

Responde en formato JSON con esta estructura:
{
  "descripcion": "...",
  "estado": "completo|en_progreso|iniciado",
  "problemas": ["problema1", "problema2"],
  "seguridad": {"cumple": true/false, "observaciones": "..."},
  "checklist": {
    "item1": true/false,
    "item2": true/false
  },
  "recomendaciones": ["rec1", "rec2"]
}`;
}

/**
 * Prompt para resumir avance de proyecto
 */
export function getProjectSummaryPrompt(
  proyectoNombre: string,
  reportes: any[]
): string {
  return `Genera un resumen ejecutivo del proyecto "${proyectoNombre}" basado en los siguientes reportes:

${reportes
  .map(
    (r, i) => `
Reporte ${i + 1}:
- Fecha: ${r.fecha}
- Tipo: ${r.tipoTrabajo}
- Estado: ${r.status}
- Descripción: ${r.descripcion?.substring(0, 200)}
`
  )
  .join('\n')}

Genera un resumen ejecutivo que incluya:
1. Resumen general del avance (1 párrafo)
2. Tipos de trabajos realizados
3. Estado actual del proyecto
4. Hitos alcanzados
5. Próximos pasos recomendados

Formato: Profesional, conciso, máximo 4 párrafos.`;
}

/**
 * Prompt para detectar patrones y tendencias
 */
export function getTrendsPrompt(reportes: any[]): string {
  return `Analiza los siguientes reportes y detecta patrones, tendencias o anomalías:

${reportes
  .map(
    (r, i) => `
${i + 1}. ${r.fecha} - ${r.tipoTrabajo} - ${r.status}
${r.descripcion?.substring(0, 150)}
${r.observaciones ? `Obs: ${r.observaciones.substring(0, 100)}` : ''}
`
  )
  .join('\n')}

Genera un análisis que incluya:
1. Patrones identificados en los reportes
2. Tendencias positivas o negativas
3. Problemas recurrentes
4. Recomendaciones basadas en los datos
5. Métricas clave (tiempo promedio, tasa de aprobación, etc.)

Sé específico y usa datos de los reportes.`;
}

/**
 * Obtiene checklist específico por tipo de trabajo
 */
function getChecklistByTipo(tipo: TipoTrabajo): string[] {
  const checklists: Record<TipoTrabajo, string[]> = {
    FIBRA_OPTICA: [
      '¿El empalme está correctamente sellado?',
      '¿Los cables están etiquetados?',
      '¿Se respetan los radios de curvatura?',
      '¿Hay bandejas organizadoras?',
      '¿Se realizaron pruebas de atenuación?',
    ],
    DATA_CENTER: [
      '¿El cableado está organizado?',
      '¿Hay adecuada ventilación?',
      '¿Los racks están correctamente identificados?',
      '¿Se instaló sistema de monitoreo?',
      '¿Cumple con estándares de temperatura?',
    ],
    ANTENAS: [
      '¿La antena está alineada correctamente?',
      '¿Los soportes están seguros?',
      '¿Hay sistema de puesta a tierra?',
      '¿Se verificó la señal?',
      '¿Cumple con altura regulada?',
    ],
    CCTV: [
      '¿Las cámaras tienen visión clara?',
      '¿El ángulo de cobertura es adecuado?',
      '¿Hay protección contra intemperie?',
      '¿El cableado está protegido?',
      '¿Se probó la grabación?',
    ],
    INSTALACION_RED: [
      '¿Los puntos de red están operativos?',
      '¿Se realizaron pruebas de conectividad?',
      '¿El etiquetado es claro?',
      '¿Se documentó el esquema de red?',
      '¿Cumple con estándares de cableado?',
    ],
    MANTENIMIENTO: [
      '¿Se identificó el problema?',
      '¿Se realizó la reparación?',
      '¿Se probó el funcionamiento?',
      '¿Se documentó lo realizado?',
      '¿Se previenen futuros problemas?',
    ],
    OTRO: [
      '¿El trabajo está completo?',
      '¿Cumple con especificaciones?',
      '¿Se documentó correctamente?',
      '¿Hay aspectos pendientes?',
    ],
  };

  return checklists[tipo] || checklists.OTRO;
}

/**
 * Obtiene label legible del tipo de trabajo
 */
function getTipoTrabajoLabel(tipo: TipoTrabajo): string {
  const labels: Record<TipoTrabajo, string> = {
    FIBRA_OPTICA: 'Fibra Óptica',
    DATA_CENTER: 'Data Center',
    ANTENAS: 'Antenas',
    CCTV: 'CCTV',
    INSTALACION_RED: 'Instalación de Red',
    MANTENIMIENTO: 'Mantenimiento',
    OTRO: 'Otro',
  };

  return labels[tipo] || tipo;
}
