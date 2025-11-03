// Prompts y checklists especializados para análisis IA por tipo de equipo

export type TipoTrabajo =
  | 'FIBRA_OPTICA'
  | 'DATA_CENTER'
  | 'ANTENAS'
  | 'CCTV'
  | 'INSTALACION_RED'
  | 'MANTENIMIENTO'
  | 'OTRO'

export interface ChecklistItem {
  item: string
  categoria: 'seguridad' | 'instalacion' | 'etiquetado' | 'normativa' | 'calidad'
}

export interface PromptConfig {
  checklist: ChecklistItem[]
  prompt: string
  aspectosEspecificos: string[]
}

/**
 * Obtiene el checklist de verificación para un tipo de trabajo específico
 */
export function obtenerChecklistPorTipo(tipoTrabajo: TipoTrabajo): string[] {
  const checklists: Record<TipoTrabajo, ChecklistItem[]> = {
    DATA_CENTER: [
      { item: 'Todos los equipos están correctamente etiquetados', categoria: 'etiquetado' },
      { item: 'El cableado está organizado y usa patch panels', categoria: 'instalacion' },
      { item: 'No hay cables sueltos o colgando', categoria: 'calidad' },
      { item: 'Los equipos tienen ventilación adecuada', categoria: 'seguridad' },
      { item: 'Hay PDUs (distribuidores de energía) visibles', categoria: 'instalacion' },
      { item: 'Los racks tienen puertas y paneles laterales', categoria: 'instalacion' },
      { item: 'El código de colores de cables es consistente', categoria: 'normativa' },
      { item: 'Hay espacios libres entre equipos (1U mínimo)', categoria: 'instalacion' },
      { item: 'Los equipos críticos están conectados a UPS', categoria: 'seguridad' },
      { item: 'Existe aterramiento visible y adecuado', categoria: 'seguridad' },
    ],
    ANTENAS: [
      { item: 'La antena está correctamente montada en el soporte', categoria: 'instalacion' },
      { item: 'Los cables están protegidos con tubing/conduit', categoria: 'seguridad' },
      { item: 'Hay weatherproofing en conectores', categoria: 'instalacion' },
      { item: 'El aterramiento es visible y conforme', categoria: 'seguridad' },
      { item: 'La orientación parece correcta', categoria: 'instalacion' },
      { item: 'No hay obstrucciones en line-of-sight', categoria: 'calidad' },
      { item: 'Los soportes están firmemente instalados', categoria: 'seguridad' },
      { item: 'Hay etiquetas de identificación', categoria: 'etiquetado' },
      { item: 'Los cables están separados (potencia/señal)', categoria: 'normativa' },
      { item: 'Existe protección contra descargas atmosféricas', categoria: 'seguridad' },
    ],
    FIBRA_OPTICA: [
      { item: 'El radio de curvatura de la fibra es adecuado (>30mm)', categoria: 'normativa' },
      { item: 'Las mufas están correctamente selladas', categoria: 'instalacion' },
      { item: 'Hay etiquetado de hilos y tubos', categoria: 'etiquetado' },
      { item: 'Los conectores están limpios y protegidos', categoria: 'calidad' },
      { item: 'La bandeja de fibra está ordenada', categoria: 'instalacion' },
      { item: 'No hay tensión excesiva en cables', categoria: 'seguridad' },
      { item: 'Los colores de fibra siguen estándar TIA-598', categoria: 'normativa' },
      { item: 'Hay protección mecánica adecuada', categoria: 'seguridad' },
      { item: 'Las fusiones están protegidas en bandejas', categoria: 'instalacion' },
      { item: 'Existe documentación de pérdidas (si visible)', categoria: 'calidad' },
    ],
    CCTV: [
      { item: 'La cámara está a altura adecuada (>2.5m)', categoria: 'instalacion' },
      { item: 'El ángulo de visión cubre el área requerida', categoria: 'calidad' },
      { item: 'La fijación es segura y firme', categoria: 'seguridad' },
      { item: 'Los cables están protegidos', categoria: 'instalacion' },
      { item: 'El lente está limpio', categoria: 'calidad' },
      { item: 'Hay etiqueta de identificación', categoria: 'etiquetado' },
      { item: 'El housing está en buen estado', categoria: 'calidad' },
      { item: 'La cámara está nivelada', categoria: 'instalacion' },
      { item: 'Existe protección IP adecuada (IP66+ exterior)', categoria: 'normativa' },
      { item: 'Los IR LEDs están funcionales (si aplica)', categoria: 'calidad' },
    ],
    INSTALACION_RED: [
      { item: 'Los switches están correctamente rackados', categoria: 'instalacion' },
      { item: 'Existe etiquetado de puertos', categoria: 'etiquetado' },
      { item: 'Los cables están organizados con patch panels', categoria: 'instalacion' },
      { item: 'Hay código de colores consistente', categoria: 'normativa' },
      { item: 'Los equipos tienen ventilación adecuada', categoria: 'seguridad' },
      { item: 'Existe documentación visual de conexiones', categoria: 'calidad' },
      { item: 'Los cables son de categoría correcta (Cat6/Cat6a)', categoria: 'normativa' },
      { item: 'No hay exceso de cables enrollados', categoria: 'calidad' },
      { item: 'Existe aterramiento en racks metálicos', categoria: 'seguridad' },
      { item: 'Los equipos están conectados a PDU/UPS', categoria: 'seguridad' },
    ],
    MANTENIMIENTO: [
      { item: 'Se evidencia limpieza de equipos', categoria: 'calidad' },
      { item: 'Los conectores están ajustados', categoria: 'instalacion' },
      { item: 'No hay componentes visiblemente dañados', categoria: 'calidad' },
      { item: 'Los ventiladores están operativos', categoria: 'seguridad' },
      { item: 'No hay acumulación de polvo crítica', categoria: 'calidad' },
      { item: 'Los cables están en buen estado', categoria: 'seguridad' },
      { item: 'Las etiquetas son legibles', categoria: 'etiquetado' },
      { item: 'No hay signos de sobrecalentamiento', categoria: 'seguridad' },
      { item: 'Los equipos están firmemente instalados', categoria: 'instalacion' },
      { item: 'Existe documentación del mantenimiento', categoria: 'normativa' },
    ],
    OTRO: [
      { item: 'La instalación parece profesional', categoria: 'calidad' },
      { item: 'Existe etiquetado básico', categoria: 'etiquetado' },
      { item: 'No hay riesgos de seguridad evidentes', categoria: 'seguridad' },
      { item: 'Los componentes están correctamente fijados', categoria: 'instalacion' },
      { item: 'El área de trabajo está ordenada', categoria: 'calidad' },
    ],
  }

  return checklists[tipoTrabajo].map(item => item.item)
}

/**
 * Genera el prompt especializado para análisis de IA según tipo de trabajo
 */
export function generarPromptPorTipoEquipo(
  tipoTrabajo: TipoTrabajo,
  checklistItems: string[]
): string {
  const promptsBase: Record<TipoTrabajo, string> = {
    DATA_CENTER: `
Eres un inspector experto en Data Centers y racks de telecomunicaciones para faenas mineras.
Analiza la imagen del rack y verifica los siguientes aspectos con MÁXIMO RIGOR:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

INSTRUCCIONES ESPECÍFICAS:
- Identifica TODOS los componentes visibles en el rack (Switches, Routers, Servers, PDUs, UPS, Patch Panels)
- Verifica el cumplimiento EXACTO de cada punto del checklist
- Detecta CUALQUIER problema de seguridad o instalación incorrecta
- Evalúa el orden y prolijidad del cableado estructurado
- Identifica etiquetado faltante o incorrecto
- Detecta equipos sin conexión o mal instalados
- Verifica ventilación y espacios entre equipos
- Detecta posibles riesgos eléctricos

CONTEXTO: Instalación en faena minera remota, condiciones exigentes.

FORMATO DE RESPUESTA (JSON ESTRICTO):
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100 (número entero),
  "items_verificados": [
    {
      "item": "nombre del item del checklist",
      "cumple": true/false,
      "observacion": "descripción específica de lo observado"
    }
  ],
  "problemas_criticos": ["problema1", "problema2"],
  "recomendaciones": ["recomendacion1", "recomendacion2"],
  "equipos_detectados": [
    {
      "tipo": "Switch/Router/Server/PDU/UPS/Patch Panel/etc",
      "marca": "si es visible o 'No identificada'",
      "cantidad": número,
      "estado": "Correcto/Falta etiqueta/Mal instalado/Otro"
    }
  ],
  "riesgos_seguridad": [
    {
      "tipo": "ELECTRICO/MECANICO/AMBIENTAL",
      "descripcion": "descripción del riesgo",
      "severidad": "CRITICA/ALTA/MEDIA/BAJA"
    }
  ]
}

RESPONDE ÚNICAMENTE CON EL JSON, SIN TEXTO ADICIONAL.
    `.trim(),

    ANTENAS: `
Eres un inspector experto en instalaciones de antenas de telecomunicaciones para faenas mineras.
Analiza la imagen y verifica CON MÁXIMO DETALLE:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS CRÍTICOS A VERIFICAR:
- Orientación correcta de la antena (azimut visible si es posible)
- Estado de montaje y soportes (firmeza, corrosión)
- Cables de alimentación y señal correctamente instalados
- Aterramiento visible y conforme a norma
- Weatherproofing (protección contra intemperie)
- Etiquetado de cables y equipos
- Distancias de seguridad
- Estado general de componentes
- Protección contra descargas atmosféricas

CONTEXTO: Faena minera, exposición a condiciones climáticas extremas.

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "tipo_antena": "Panel/Sectorial/Omnidireccional/Parabólica/Yagi/No identificada",
  "orientacion_estimada": "azimut aproximado si es visible o 'No determinable'",
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "problemas_detectados": ["problema1", "problema2"],
  "riesgos_seguridad": [
    {
      "tipo": "ELECTRICO/MECANICO/CLIMATICO",
      "descripcion": "descripción",
      "severidad": "CRITICA/ALTA/MEDIA/BAJA"
    }
  ],
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),

    FIBRA_OPTICA: `
Eres un inspector experto en instalaciones de fibra óptica para telecomunicaciones mineras.
Analiza la imagen de la instalación CON MÁXIMA PRECISIÓN:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS TÉCNICOS CRÍTICOS:
- Radio de curvatura de la fibra (MÍNIMO 30mm, CRÍTICO)
- Estado de mufas y fusiones (sellado hermético)
- Protección mecánica adecuada
- Etiquetado de hilos y tubos (norma TIA-598)
- Limpieza de conectores
- Color coding correcto (azul, naranja, verde, marrón, gris, blanco, rojo, negro, amarillo, violeta, rosa, aguamarina)
- Organización de bandejas
- Pérdidas visibles (curvas excesivas, tensión)

CONTEXTO: Instalación crítica en faena minera, tolerancia CERO a pérdidas.

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "tipo_instalacion": "Aérea/Subterránea/Indoor/Mixta/No determinada",
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "problemas_criticos": ["problema1", "problema2"],
  "alertas_perdida_señal": ["posible pérdida por curvatura excesiva", "tensión detectada"],
  "codigo_colores_detectado": ["azul", "naranja", "verde"],
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),

    CCTV: `
Eres un inspector experto en sistemas CCTV para seguridad en faenas mineras.
Analiza la instalación de cámaras de seguridad CON MÁXIMO DETALLE:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS CRÍTICOS:
- Ángulo de visión correcto y cobertura del área
- Altura de instalación adecuada (>2.5m normalmente)
- Fijación segura (resistencia a vandalism y clima)
- Cableado protegido (conduit, canaletas)
- Iluminación IR visible (si aplica para visión nocturna)
- Estado del housing/carcasa (IP rating adecuado)
- Limpieza del lente
- Etiquetado (número de cámara, área)

CONTEXTO: Seguridad crítica en faena minera, operación 24/7.

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "tipo_camara": "Domo/Bullet/PTZ/Fisheye/No identificada",
  "cobertura_estimada": "descripción del área que cubre la cámara",
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "problemas_detectados": ["problema1", "problema2"],
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),

    INSTALACION_RED: `
Eres un inspector experto en instalaciones de redes de datos para telecomunicaciones mineras.
Analiza la instalación CON MÁXIMO RIGOR:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS TÉCNICOS:
- Switches/Routers correctamente instalados
- Patch panels organizados
- Código de colores de cables (azul=principal, amarillo=guest, verde=VoIP, rojo=crítico)
- Etiquetado de puertos y cables
- Ventilación adecuada
- Cableado estructurado (Cat6/Cat6a/Cat7)
- Aterramiento en racks metálicos
- Conexión a PDU/UPS

CONTEXTO: Red crítica en faena minera, uptime máximo requerido.

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "equipos_red_detectados": [
    {
      "tipo": "Switch/Router/Firewall/etc",
      "puertos_visibles": número,
      "estado": "descripción"
    }
  ],
  "problemas_criticos": ["problema1", "problema2"],
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),

    MANTENIMIENTO: `
Eres un inspector experto en mantenimiento de equipos de telecomunicaciones para minería.
Analiza el estado post-mantenimiento CON MÁXIMO DETALLE:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS A VERIFICAR:
- Limpieza de equipos (polvo, suciedad)
- Estado de conectores (ajustados, sin corrosión)
- Componentes dañados o deteriorados
- Ventiladores operativos
- Cables en buen estado
- Etiquetas legibles
- Signos de sobrecalentamiento
- Tornillería completa

CONTEXTO: Mantenimiento preventivo/correctivo en faena minera.

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "estado_general": "Excelente/Bueno/Regular/Deficiente",
  "componentes_requieren_atencion": ["componente1", "componente2"],
  "vida_util_estimada": "descripción si es determinable",
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),

    OTRO: `
Eres un inspector experto en instalaciones de telecomunicaciones para faenas mineras.
Analiza la instalación general:

CHECKLIST DE CONFORMIDAD:
${checklistItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

ASPECTOS GENERALES:
- Calidad profesional de la instalación
- Etiquetado presente
- Seguridad general
- Fijación de componentes
- Orden del área

FORMATO JSON:
{
  "cumplimiento_general": "CONFORME" | "NO_CONFORME" | "PARCIALMENTE_CONFORME",
  "puntuacion": 0-100,
  "items_verificados": [
    {
      "item": "nombre del item",
      "cumple": true/false,
      "observacion": "detalles específicos"
    }
  ],
  "observaciones_generales": "descripción de lo observado",
  "recomendaciones": ["recomendacion1", "recomendacion2"]
}

RESPONDE ÚNICAMENTE CON EL JSON.
    `.trim(),
  }

  return promptsBase[tipoTrabajo]
}

/**
 * Mapeo de tipos de trabajo en español para display
 */
export const nombresTipoTrabajo: Record<TipoTrabajo, string> = {
  FIBRA_OPTICA: 'Fibra Óptica',
  DATA_CENTER: 'Data Center',
  ANTENAS: 'Antenas',
  CCTV: 'CCTV',
  INSTALACION_RED: 'Instalación de Red',
  MANTENIMIENTO: 'Mantenimiento',
  OTRO: 'Otro',
}
