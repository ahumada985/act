# 🚀 ROADMAP DE IMPLEMENTACIÓN - ACT Reportes

## ⚠️ Funcionalidades EXCLUIDAS (No implementar)
- ❌ #10: API REST Pública (no necesaria por ahora)
- ❌ #12: Portal de Clientes (se implementará más adelante)
- ❌ #15: Integración ERP/SAP (requiere acceso a sistemas externos)
- ❌ #26: Blockchain (complejidad alta, beneficio bajo)
- ❌ #27: Multi-idioma (no es prioridad)

---

## 📋 PLAN DE IMPLEMENTACIÓN

### 🔴 FASE 1 - FUNDAMENTOS CRÍTICOS (Semana 1-2)

#### 1.1 Sistema de Autenticación ✅ A IMPLEMENTAR
**Prioridad:** CRÍTICA
**Tiempo estimado:** 2-3 días
**Stack:** Supabase Auth

**Tareas:**
- [ ] Configurar Supabase Auth
- [ ] Crear páginas de login/registro
- [ ] Implementar Magic Links
- [ ] Crear middleware de autenticación
- [ ] Proteger rutas
- [ ] Gestión de sesiones
- [ ] Logout y refresh tokens

**Archivos a crear:**
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
middleware.ts
lib/auth/
├── supabase-auth.ts
├── auth-provider.tsx
└── auth-hooks.ts
```

---

#### 1.2 RBAC (Control de Acceso por Roles) ✅ A IMPLEMENTAR
**Prioridad:** CRÍTICA
**Tiempo estimado:** 2-3 días
**Roles:** SUPERVISOR, ADMIN, GERENTE, CLIENTE

**Tareas:**
- [ ] Definir permisos por rol en BD
- [ ] Crear hook `usePermissions()`
- [ ] Componente `<ProtectedRoute>`
- [ ] Componente `<Can do="action">`
- [ ] Middleware de verificación de permisos
- [ ] UI condicional según rol
- [ ] Página de gestión de usuarios (solo ADMIN)

**Permisos:**
```typescript
SUPERVISOR:
  - crear reportes
  - editar sus reportes
  - ver sus reportes
  - subir fotos/audio

ADMIN:
  - todo lo de SUPERVISOR
  - ver todos los reportes
  - editar todos los reportes
  - aprobar/rechazar reportes
  - gestionar usuarios
  - ver dashboard completo

GERENTE:
  - ver todos los reportes (solo lectura)
  - ver dashboard ejecutivo
  - exportar reportes
  - ver analíticas

CLIENTE:
  - ver reportes de sus proyectos (solo lectura)
  - descargar PDFs
  - ver dashboard de sus proyectos
```

**Archivos a crear:**
```
lib/rbac/
├── permissions.ts
├── roles.ts
├── usePermissions.ts
└── ProtectedRoute.tsx
components/auth/
├── Can.tsx
└── RoleGuard.tsx
app/admin/
└── usuarios/page.tsx
```

---

#### 1.3 Sistema de Auditoría ✅ A IMPLEMENTAR
**Prioridad:** CRÍTICA
**Tiempo estimado:** 1-2 días

**Tareas:**
- [ ] Crear tabla `AuditLog` en Prisma
- [ ] Hook `useAudit()` para registrar acciones
- [ ] Middleware automático de auditoría
- [ ] Página de visualización de logs (ADMIN)
- [ ] Filtros de búsqueda de logs
- [ ] Exportación de logs

**Schema Prisma:**
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity      String   // Reporte, Proyecto, Usuario, etc.
  entityId    String?
  changes     Json?    // Cambios realizados
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
}
```

**Archivos a crear:**
```
services/audit.service.ts
hooks/useAudit.ts
app/admin/auditoria/page.tsx
components/audit/AuditLogTable.tsx
```

---

### 🟡 FASE 2 - COMUNICACIÓN Y COLABORACIÓN (Semana 3-4)

#### 2.1 Notificaciones Push Web ✅ A IMPLEMENTAR
**Prioridad:** ALTA
**Tiempo estimado:** 2-3 días

**Tareas:**
- [ ] Configurar Service Worker para push
- [ ] Solicitar permisos de notificación
- [ ] Backend de push notifications (Supabase Functions)
- [ ] Almacenar tokens de push en BD
- [ ] Crear sistema de notificaciones en app
- [ ] Centro de notificaciones (campana)
- [ ] Marcar como leído/no leído
- [ ] Tipos de notificaciones:
  - Reporte aprobado/rechazado
  - Nuevo comentario
  - Nuevo proyecto asignado
  - Recordatorio de reporte pendiente

**Archivos a crear:**
```
public/
└── push-sw.js
lib/notifications/
├── push-notifications.ts
├── notification-service.ts
└── usePushNotifications.ts
components/notifications/
├── NotificationBell.tsx
├── NotificationList.tsx
└── NotificationItem.tsx
app/api/notifications/
├── subscribe/route.ts
└── send/route.ts
```

---

#### 2.2 Chat en Tiempo Real ✅ A IMPLEMENTAR
**Prioridad:** ALTA
**Tiempo estimado:** 3-4 días
**Stack:** Supabase Realtime

**Tareas:**
- [ ] Crear tabla `Chat` y `ChatMessage` en Prisma
- [ ] Configurar Supabase Realtime
- [ ] Componente de chat
- [ ] Lista de conversaciones
- [ ] Envío/recepción de mensajes en tiempo real
- [ ] Indicador de "escribiendo..."
- [ ] Notificaciones de nuevos mensajes
- [ ] Chat por proyecto
- [ ] Chat directo entre usuarios

**Schema Prisma:**
```prisma
model Chat {
  id          String        @id @default(uuid())
  type        ChatType      // PROYECTO, DIRECT
  proyectoId  String?
  proyecto    Proyecto?     @relation(fields: [proyectoId], references: [id])
  messages    ChatMessage[]
  participants ChatParticipant[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ChatMessage {
  id        String   @id @default(uuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([chatId])
  @@index([userId])
}

model ChatParticipant {
  id        String   @id @default(uuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  lastRead  DateTime?

  @@unique([chatId, userId])
}

enum ChatType {
  PROYECTO
  DIRECT
}
```

**Archivos a crear:**
```
services/chat.service.ts
hooks/queries/useChat.ts
components/chat/
├── ChatWindow.tsx
├── ChatList.tsx
├── MessageInput.tsx
├── MessageBubble.tsx
└── TypingIndicator.tsx
app/chat/page.tsx
```

---

#### 2.3 Aprobaciones Multi-nivel ✅ A IMPLEMENTAR
**Prioridad:** ALTA
**Tiempo estimado:** 2-3 días

**Tareas:**
- [ ] Crear tabla `ApprovalWorkflow` en Prisma
- [ ] Definir flujo: Supervisor → Jefe → Gerente → Cliente
- [ ] Estados: PENDIENTE, APROBADO, RECHAZADO, EN_REVISION
- [ ] Comentarios por etapa
- [ ] Notificaciones automáticas
- [ ] Vista de aprobaciones pendientes
- [ ] Histórico de aprobaciones

**Schema Prisma:**
```prisma
model ApprovalWorkflow {
  id          String            @id @default(uuid())
  reporteId   String            @unique
  reporte     Reporte           @relation(fields: [reporteId], references: [id])
  currentStep Int               @default(1)
  status      WorkflowStatus    @default(PENDING)
  steps       ApprovalStep[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model ApprovalStep {
  id          String            @id @default(uuid())
  workflowId  String
  workflow    ApprovalWorkflow  @relation(fields: [workflowId], references: [id])
  stepNumber  Int
  role        UserRole          // Rol requerido para aprobar
  status      StepStatus        @default(PENDING)
  approverId  String?
  approver    User?             @relation(fields: [approverId], references: [id])
  comments    String?
  approvedAt  DateTime?

  @@index([workflowId])
}

enum WorkflowStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
}

enum StepStatus {
  PENDING
  APPROVED
  REJECTED
  SKIPPED
}
```

**Archivos a crear:**
```
services/approval.service.ts
hooks/queries/useApprovals.ts
components/approvals/
├── ApprovalWorkflowView.tsx
├── ApprovalStepCard.tsx
└── ApprovalHistory.tsx
app/aprobaciones/page.tsx
```

---

### 🟢 FASE 3 - IA AVANZADA (Semana 5-6)

#### 3.1 IA Generativa para Reportes ✅ A IMPLEMENTAR
**Prioridad:** MEDIA-ALTA
**Tiempo estimado:** 2-3 días
**Stack:** OpenAI GPT-4 Vision / Claude API

**Tareas:**
- [ ] Integración con API de IA generativa
- [ ] Generación automática de descripciones desde fotos
- [ ] Sugerencias de observaciones
- [ ] Resumen de avance de proyecto
- [ ] Detección de anomalías
- [ ] Botón "Generar descripción" en formulario
- [ ] Edición manual post-generación

**Archivos a crear:**
```
app/api/ai/
├── generate-description/route.ts
├── suggest-observations/route.ts
└── analyze-images/route.ts
lib/ai/
├── openai-client.ts
└── prompts.ts
components/ai/
├── AIDescriptionGenerator.tsx
└── AISuggestionsPanel.tsx
```

---

#### 3.2 OCR - Reconocimiento de Texto ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2 días
**Stack:** Google Cloud Vision API / Tesseract.js

**Tareas:**
- [ ] Integración con API de OCR
- [ ] Extracción de texto de fotos
- [ ] Detección de:
  - Placas y códigos
  - Números de serie
  - Medidores
  - Documentos (OT)
- [ ] Auto-rellenar campos desde OCR
- [ ] Componente de captura + OCR

**Archivos a crear:**
```
app/api/ocr/
└── extract-text/route.ts
lib/ocr/
├── vision-api.ts
└── text-parser.ts
components/ocr/
├── OCRCapture.tsx
└── OCRResults.tsx
```

---

#### 3.3 Reportes Programados ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2-3 días
**Stack:** Cron jobs (Vercel Cron / Supabase Edge Functions)

**Tareas:**
- [ ] Crear tabla `ScheduledReport` en Prisma
- [ ] Configurar cron jobs
- [ ] Generación automática de reportes
- [ ] Envío por email (Resend / SendGrid)
- [ ] Templates de email
- [ ] Configuración de frecuencia (diaria, semanal, mensual)
- [ ] UI de gestión de reportes programados

**Schema Prisma:**
```prisma
model ScheduledReport {
  id          String          @id @default(uuid())
  name        String
  frequency   ReportFrequency // DAILY, WEEKLY, MONTHLY
  recipients  String[]        // Emails
  filters     Json?           // Filtros a aplicar
  format      ReportFormat    // PDF, EXCEL
  isActive    Boolean         @default(true)
  lastRun     DateTime?
  nextRun     DateTime?
  createdBy   String
  creator     User            @relation(fields: [createdBy], references: [id])
  createdAt   DateTime        @default(now())

  @@index([nextRun])
}

enum ReportFrequency {
  DAILY
  WEEKLY
  MONTHLY
}

enum ReportFormat {
  PDF
  EXCEL
  BOTH
}
```

**Archivos a crear:**
```
app/api/cron/
└── generate-scheduled-reports/route.ts
services/scheduled-reports.service.ts
lib/email/
├── email-client.ts
└── templates/
    ├── daily-report.tsx
    ├── weekly-report.tsx
    └── monthly-report.tsx
app/admin/reportes-programados/page.tsx
```

---

### 🟢 FASE 4 - ANALÍTICAS Y GESTIÓN (Semana 7-8)

#### 4.1 Dashboard Ejecutivo ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2-3 días

**Tareas:**
- [ ] KPIs personalizables (drag & drop)
- [ ] Comparación período anterior
- [ ] Proyección de tendencias
- [ ] Alertas de desviaciones
- [ ] Filtros de fecha personalizados
- [ ] Exportación de dashboard a PDF
- [ ] Guardar configuraciones de dashboard

**Archivos a crear:**
```
app/dashboard-ejecutivo/page.tsx
components/dashboard/
├── DashboardBuilder.tsx
├── KPICard.tsx
├── TrendChart.tsx
├── ComparisonWidget.tsx
└── AlertPanel.tsx
```

---

#### 4.2 Análisis Predictivo ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 3-4 días
**Stack:** Simple ML con TensorFlow.js / Estadísticas avanzadas

**Tareas:**
- [ ] Predicción de tiempo de finalización
- [ ] Identificación de proyectos en riesgo
- [ ] Análisis de patrones de fallas
- [ ] Recomendaciones automáticas
- [ ] Gráficos de predicción
- [ ] Alertas proactivas

**Archivos a crear:**
```
lib/analytics/
├── predictive-model.ts
├── risk-analyzer.ts
└── pattern-detector.ts
components/analytics/
├── PredictionChart.tsx
├── RiskIndicator.tsx
└── RecommendationsPanel.tsx
app/analiticas/page.tsx
```

---

#### 4.3 Gamificación ✅ A IMPLEMENTAR
**Prioridad:** BAJA-MEDIA
**Tiempo estimado:** 2 días

**Tareas:**
- [ ] Sistema de puntos por acciones
- [ ] Ranking de supervisores
- [ ] Badges y logros
- [ ] Metas mensuales
- [ ] Leaderboard
- [ ] Notificaciones de logros

**Schema Prisma:**
```prisma
model UserPoints {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  totalPoints Int      @default(0)
  level       Int      @default(1)
  badges      Badge[]
  updatedAt   DateTime @updatedAt
}

model Badge {
  id          String      @id @default(uuid())
  name        String
  description String
  icon        String
  condition   Json        // Condición para obtener badge
  users       UserPoints[]
}

model Achievement {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // REPORTE_COMPLETADO, CALIDAD_ALTA, etc.
  points      Int
  createdAt   DateTime @default(now())

  @@index([userId])
}
```

**Archivos a crear:**
```
services/gamification.service.ts
components/gamification/
├── PointsDisplay.tsx
├── Leaderboard.tsx
├── BadgeList.tsx
└── AchievementToast.tsx
app/ranking/page.tsx
```

---

### 🟢 FASE 5 - GESTIÓN AVANZADA (Semana 9-10)

#### 5.1 Gestión de Materiales ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2-3 días

**Tareas:**
- [ ] Tabla de materiales en BD
- [ ] Registro de materiales usados por reporte
- [ ] Stock de materiales
- [ ] Alertas de stock bajo
- [ ] Historial de uso
- [ ] Códigos QR para materiales
- [ ] Escaneo de códigos

**Schema Prisma:**
```prisma
model Material {
  id          String            @id @default(uuid())
  nombre      String
  codigo      String            @unique
  descripcion String?
  unidad      String            // m, kg, unidad, etc.
  stock       Float             @default(0)
  stockMinimo Float             @default(0)
  precio      Float?
  categoria   String?
  qrCode      String?
  uso         MaterialUsage[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([codigo])
}

model MaterialUsage {
  id          String   @id @default(uuid())
  materialId  String
  material    Material @relation(fields: [materialId], references: [id])
  reporteId   String
  reporte     Reporte  @relation(fields: [reporteId], references: [id])
  cantidad    Float
  createdAt   DateTime @default(now())

  @@index([materialId])
  @@index([reporteId])
}
```

**Archivos a crear:**
```
services/materiales.service.ts
hooks/queries/useMateriales.ts
components/materiales/
├── MaterialList.tsx
├── MaterialForm.tsx
├── QRScanner.tsx
└── StockAlerts.tsx
app/materiales/page.tsx
```

---

#### 5.2 Rutas y Recorridos ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2 días

**Tareas:**
- [ ] Tracking de ruta del supervisor
- [ ] Almacenamiento de ubicaciones (cada X minutos)
- [ ] Visualización de recorrido en mapa
- [ ] Distancia total recorrida
- [ ] Tiempo en cada ubicación
- [ ] Reporte de recorridos

**Schema Prisma:**
```prisma
model LocationTracking {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  latitud   Float
  longitud  Float
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
}

model DailyRoute {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  fecha           DateTime
  distanciaTotal  Float    // en km
  tiempoTotal     Int      // en minutos
  puntos          Json     // Array de coordenadas
  createdAt       DateTime @default(now())

  @@index([userId, fecha])
}
```

**Archivos a crear:**
```
services/tracking.service.ts
hooks/useLocationTracking.ts
components/tracking/
├── RouteMap.tsx
├── RouteStats.tsx
└── TrackingControls.tsx
app/recorridos/page.tsx
```

---

#### 5.3 Workflows Automatizados ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 3-4 días

**Tareas:**
- [ ] Motor de workflows
- [ ] Triggers configurables
- [ ] Acciones encadenadas
- [ ] Editor visual de workflows
- [ ] Ejemplos:
  - "Si reporte rechazado → notificar supervisor"
  - "Si puntuación IA < 50 → marcar para revisión"
  - "Si proyecto sin actividad 7 días → alertar gerente"
- [ ] Logs de ejecución de workflows

**Schema Prisma:**
```prisma
model Workflow {
  id          String          @id @default(uuid())
  name        String
  description String?
  trigger     Json            // Condición que dispara
  actions     Json            // Acciones a ejecutar
  isActive    Boolean         @default(true)
  executions  WorkflowExecution[]
  createdBy   String
  creator     User            @relation(fields: [createdBy], references: [id])
  createdAt   DateTime        @default(now())
}

model WorkflowExecution {
  id          String   @id @default(uuid())
  workflowId  String
  workflow    Workflow @relation(fields: [workflowId], references: [id])
  status      String   // SUCCESS, FAILED, PENDING
  input       Json
  output      Json?
  error       String?
  executedAt  DateTime @default(now())

  @@index([workflowId])
}
```

**Archivos a crear:**
```
lib/workflows/
├── workflow-engine.ts
├── triggers.ts
└── actions.ts
services/workflows.service.ts
components/workflows/
├── WorkflowBuilder.tsx
├── TriggerEditor.tsx
├── ActionEditor.tsx
└── WorkflowExecutionLog.tsx
app/admin/workflows/page.tsx
```

---

#### 5.4 Plantillas Dinámicas ✅ A IMPLEMENTAR
**Prioridad:** MEDIA
**Tiempo estimado:** 2-3 días

**Tareas:**
- [ ] Editor visual de formularios
- [ ] Campos personalizados por cliente/proyecto
- [ ] Validaciones customizadas
- [ ] Campos condicionales
- [ ] Versionado de plantillas
- [ ] Preview de plantilla
- [ ] Asignación de plantilla a proyecto

**Archivos a crear:**
```
components/templates/
├── TemplateEditor.tsx
├── FieldBuilder.tsx
├── FieldTypeSelector.tsx
├── ValidationEditor.tsx
└── TemplatePreview.tsx
app/admin/plantillas/page.tsx
services/templates.service.ts
```

---

#### 5.5 Búsqueda Semántica ✅ A IMPLEMENTAR
**Prioridad:** BAJA-MEDIA
**Tiempo estimado:** 2 días
**Stack:** OpenAI Embeddings / Algolia

**Tareas:**
- [ ] Integración con API de embeddings
- [ ] Indexación de reportes
- [ ] Búsqueda por lenguaje natural
- [ ] Ejemplos:
  - "Reportes de fibra en Antofagasta este mes"
  - "Proyectos con problemas en la última semana"
- [ ] Sugerencias de búsqueda
- [ ] Historial de búsquedas

**Archivos a crear:**
```
lib/search/
├── semantic-search.ts
└── embeddings.ts
components/search/
├── SemanticSearchBar.tsx
└── SearchSuggestions.tsx
app/api/search/
└── semantic/route.ts
```

---

## 📊 RESUMEN DE FASES

| Fase | Funcionalidades | Tiempo Estimado | Prioridad |
|------|----------------|-----------------|-----------|
| **1** | Auth + RBAC + Auditoría | 5-7 días | 🔴 CRÍTICA |
| **2** | Push + Chat + Aprobaciones | 7-10 días | 🟡 ALTA |
| **3** | IA Generativa + OCR + Reportes Prog. | 6-8 días | 🟢 MEDIA-ALTA |
| **4** | Dashboard Ejecutivo + Predictivo + Gamif. | 7-9 días | 🟢 MEDIA |
| **5** | Materiales + Rutas + Workflows + Plantillas + Búsqueda | 11-14 días | 🟢 MEDIA |

**TOTAL ESTIMADO:** ~36-48 días de desarrollo (~1.5-2 meses)

---

## 🎯 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Semana 1-2: SEGURIDAD
1. Autenticación (login, registro, magic links)
2. RBAC (roles y permisos)
3. Auditoría

### Semana 3-4: COLABORACIÓN
4. Notificaciones Push
5. Chat en tiempo real
6. Aprobaciones multi-nivel

### Semana 5-6: IA
7. IA Generativa
8. OCR
9. Reportes Programados

### Semana 7-8: ANALÍTICAS
10. Dashboard Ejecutivo
11. Análisis Predictivo
12. Gamificación

### Semana 9-10: GESTIÓN
13. Materiales
14. Rutas y Recorridos
15. Workflows
16. Plantillas Dinámicas
17. Búsqueda Semántica

---

## ⚙️ CONSIDERACIONES TÉCNICAS

### Dependencias Nuevas a Instalar:
```bash
# Autenticación
npm install @supabase/auth-helpers-nextjs @supabase/auth-ui-react

# Chat en tiempo real
npm install @supabase/realtime-js

# Notificaciones Push
npm install web-push

# IA
npm install openai @anthropic-ai/sdk

# OCR
npm install tesseract.js @google-cloud/vision

# Email
npm install resend @react-email/components

# Gamificación
npm install framer-motion confetti-react

# Workflows
npm install reactflow dagre

# Búsqueda
npm install @algolia/client-search
```

### Migraciones de Base de Datos:
Cada fase requerirá nuevas migraciones de Prisma. Total estimado: ~15-20 migraciones.

### Costos Externos:
- OpenAI API: ~$20-50/mes (según uso)
- Google Cloud Vision: ~$10-30/mes
- Resend (emails): Plan gratuito hasta 3,000/mes
- Algolia (búsqueda): Plan gratuito hasta 10k búsquedas/mes

---

## ❓ SOBRE LA API REST

**Tu pregunta:** "¿Es necesario lo de la API?"

**Respuesta:**
- **NO es necesaria** si solo vas a usar la app web internamente
- **SÍ es útil** si en el futuro quieres:
  - Integraciones con apps móviles nativas
  - Conectar con sistemas externos (ERP, otros softwares)
  - Webhooks para automatizaciones
  - Acceso programático desde scripts

**Recomendación:** Dejamos la API para una fase posterior si surge la necesidad. Por ahora no la implementamos.

---

## 🚀 PRÓXIMO PASO

¿Quieres que empiece con **FASE 1 - Autenticación + RBAC + Auditoría**?

Puedo comenzar ahora mismo con:
1. Configurar Supabase Auth
2. Crear las páginas de login/registro
3. Implementar middleware de autenticación
4. Proteger las rutas existentes

---

**Última actualización:** 2025-11-09
**Estado:** ✅ Roadmap completo definido, listo para implementar
