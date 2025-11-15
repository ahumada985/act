/**
 * Schemas de validación con Zod para endpoints de API
 * CRÍTICO: Previene injection attacks y valida tipos correctamente
 */

import { z } from 'zod';

// Enum de tipos de trabajo
export const TipoTrabajoSchema = z.enum([
  'DATA_CENTER',
  'ANTENAS',
  'FIBRA_OPTICA',
  'CCTV',
  'INSTALACION_RED',
  'MANTENIMIENTO',
  'OTRO',
]);

// Validación de URL o base64 de imagen
export const ImageUrlSchema = z
  .string()
  .max(10000) // Límite para base64
  .refine(
    (val) =>
      val.startsWith('data:image/') || // base64
      (val.startsWith('https://') && val.length < 2048), // URL
    {
      message: 'Debe ser una URL HTTPS válida o imagen base64',
    }
  );

// Schema para análisis de imágenes
export const AnalyzeImageRequestSchema = z.object({
  tipoTrabajo: TipoTrabajoSchema,
  imageUrl: ImageUrlSchema,
  checklistItems: z
    .array(z.string().max(200).min(1))
    .max(20)
    .optional(),
});

// Schema para generar descripción
export const GenerateDescriptionRequestSchema = z.object({
  tipoTrabajo: TipoTrabajoSchema,
  imageUrls: z.array(ImageUrlSchema).max(10).optional(),
  context: z.string().max(500).optional(),
});

// Schema para sugerir observaciones
export const SuggestObservationsRequestSchema = z.object({
  tipoTrabajo: TipoTrabajoSchema,
  descripcion: z.string().min(10).max(5000),
  context: z.string().max(500).optional(),
});

// Schema para reportes programados
export const ScheduledReportCreateSchema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().max(500).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  format: z.enum(['PDF', 'EXCEL', 'JSON']),
  emails: z
    .array(z.string().email())
    .min(1, 'Debe haber al menos un email')
    .max(10, 'Máximo 10 emails'),
  filters: z
    .object({
      proyecto: z.string().max(100).optional(),
      tipoTrabajo: TipoTrabajoSchema.optional(),
      region: z.string().max(100).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    })
    .optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  hour: z.number().min(0).max(23).default(8),
});

// Schema para actualizar reporte programado
export const ScheduledReportUpdateSchema = ScheduledReportCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

// Schema para enviar notificación
export const SendNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.any()).optional(),
});

// Schema para mensaje de chat
export const SendChatMessageSchema = z.object({
  chatId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

// Schema para crear chat
export const CreateChatSchema = z.object({
  type: z.enum(['PROYECTO', 'DIRECT']),
  proyectoId: z.string().uuid().optional(),
  nombre: z.string().max(100).optional(),
  participantIds: z.array(z.string().uuid()).min(1).max(50),
});

// Schema para aprobación
export const ApproveStepSchema = z.object({
  workflowId: z.string().uuid(),
  stepNumber: z.number().int().positive(),
  comments: z.string().max(1000).optional(),
});

// Helper para validar y parsear body de request
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown
): z.infer<T> {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
    throw error;
  }
}

// Ejemplo de uso en endpoints:
/*
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateBody(AnalyzeImageRequestSchema, body);

    // Usar validatedData con tipos seguros
    const { tipoTrabajo, imageUrl } = validatedData;

    // ...
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
*/
