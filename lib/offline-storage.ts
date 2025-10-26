// Servicio de almacenamiento offline con IndexedDB

const DB_NAME = 'act-reportes-offline';
const DB_VERSION = 1;
const STORE_NAME = 'reportes-pendientes';

// Tipo para reporte offline
export interface ReporteOffline {
  id: string;
  tipoTrabajo: string;
  supervisorId: string;
  proyectoId: string;
  descripcion: string;
  observaciones?: string;
  coordenadas?: { lat: number; lng: number };
  fotos?: { data: string; nombre: string }[]; // Base64
  audio?: { data: string; nombre: string }; // Base64
  createdAt: string;
  estado: 'pendiente' | 'enviando' | 'error';
  intentos: number;
  errorMsg?: string;
}

// Inicializar DB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('estado', 'estado', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// Guardar reporte offline
export async function guardarReporteOffline(reporte: Omit<ReporteOffline, 'id' | 'createdAt' | 'estado' | 'intentos'>): Promise<string> {
  console.log('[IndexedDB] Abriendo base de datos...');
  const db = await openDB();
  console.log('[IndexedDB] ✅ Base de datos abierta');

  const reporteCompleto: ReporteOffline = {
    ...reporte,
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    estado: 'pendiente',
    intentos: 0,
  };

  console.log('[IndexedDB] Creando transacción...');
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      console.log('[IndexedDB] Agregando reporte a store...');
      const request = store.add(reporteCompleto);

      request.onsuccess = () => {
        console.log('[IndexedDB] ✅ Reporte guardado:', reporteCompleto.id);
        resolve(reporteCompleto.id);
      };

      request.onerror = () => {
        console.error('[IndexedDB] ❌ Error en request:', request.error);
        reject(request.error);
      };

      transaction.onerror = () => {
        console.error('[IndexedDB] ❌ Error en transaction:', transaction.error);
        reject(transaction.error);
      };
    } catch (error) {
      console.error('[IndexedDB] ❌ Error creando transacción:', error);
      reject(error);
    }
  });
}

// Obtener todos los reportes pendientes
export async function obtenerReportesPendientes(): Promise<ReporteOffline[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const reportes = request.result as ReporteOffline[];
      console.log('[Offline] Reportes pendientes:', reportes.length);
      resolve(reportes);
    };
    request.onerror = () => reject(request.error);
  });
}

// Obtener un reporte por ID
export async function obtenerReportePorId(id: string): Promise<ReporteOffline | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Actualizar estado de reporte
export async function actualizarEstadoReporte(id: string, estado: ReporteOffline['estado'], errorMsg?: string): Promise<void> {
  const db = await openDB();
  const reporte = await obtenerReportePorId(id);

  if (!reporte) {
    throw new Error('Reporte no encontrado');
  }

  reporte.estado = estado;
  reporte.intentos += 1;
  if (errorMsg) {
    reporte.errorMsg = errorMsg;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(reporte);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Eliminar reporte (cuando se envía exitosamente)
export async function eliminarReporte(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('[Offline] Reporte eliminado:', id);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Contar reportes pendientes
export async function contarReportesPendientes(): Promise<number> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Limpiar todos los reportes (solo para debug)
export async function limpiarTodosLosReportes(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      console.log('[Offline] Todos los reportes eliminados');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}
