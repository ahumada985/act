"use client";

import { useEffect, useState } from "react";

export default function DebugSW() {
  const [logs, setLogs] = useState<string[]>([]);
  const [swStatus, setSWStatus] = useState<string>("checking...");
  const [caches, setCaches] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  useEffect(() => {
    const checkSW = async () => {
      addLog("=== DIAGNÓSTICO SERVICE WORKER ===");

      // 1. Verificar soporte
      if (!("serviceWorker" in navigator)) {
        addLog("❌ Service Worker NO soportado");
        setSWStatus("NO SOPORTADO");
        return;
      }
      addLog("✅ Service Worker soportado");

      // 2. Verificar registro
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          addLog("⚠️ Service Worker NO REGISTRADO");
          addLog("Intentando registrar...");

          const reg = await navigator.serviceWorker.register("/sw.js");
          addLog(`✅ Service Worker registrado: ${reg.scope}`);
          setSWStatus("REGISTRADO AHORA");
        } else {
          addLog(`✅ Service Worker YA registrado: ${registration.scope}`);
          setSWStatus("REGISTRADO");

          if (registration.active) {
            addLog(`✅ SW Activo: ${registration.active.scriptURL}`);
          }
          if (registration.waiting) {
            addLog(`⚠️ SW Esperando: ${registration.waiting.scriptURL}`);
          }
          if (registration.installing) {
            addLog(`⏳ SW Instalando: ${registration.installing.scriptURL}`);
          }
        }

        // 3. Verificar control
        if (navigator.serviceWorker.controller) {
          addLog(`✅ Página CONTROLADA por SW`);
        } else {
          addLog(`⚠️ Página NO controlada por SW (recarga necesaria)`);
        }
      } catch (error) {
        addLog(`❌ Error registrando SW: ${error}`);
        setSWStatus("ERROR");
      }

      // 4. Verificar cachés
      try {
        const cacheNames = await window.caches.keys();
        addLog(`📦 Cachés encontrados: ${cacheNames.length}`);
        setCaches(cacheNames);

        for (const cacheName of cacheNames) {
          const cache = await window.caches.open(cacheName);
          const keys = await cache.keys();
          addLog(`  - ${cacheName}: ${keys.length} recursos`);
        }
      } catch (error) {
        addLog(`❌ Error leyendo cachés: ${error}`);
      }

      // 5. Test de fetch offline
      addLog("=== TEST OFFLINE ===");
      try {
        const response = await fetch("/");
        addLog(`✅ Fetch / exitoso: ${response.status}`);
      } catch (error) {
        addLog(`❌ Fetch / falló: ${error}`);
      }
    };

    checkSW();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleForceActivate = async () => {
    addLog("🔄 Forzando activación de SW...");
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      addLog("❌ No hay SW registrado");
      return;
    }

    addLog(`📊 Estado: installing=${!!registration.installing}, waiting=${!!registration.waiting}, active=${!!registration.active}`);
    addLog(`📊 Controller: ${!!navigator.serviceWorker.controller}`);

    if (registration.waiting) {
      addLog("✅ Hay SW esperando, enviando SKIP_WAITING...");
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Esperar a que tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        addLog("✅ ¡SW tomó control! Recargando...");
        window.location.reload();
      });
    } else if (registration.installing) {
      addLog("⏳ SW todavía instalando, esperando que termine...");
      registration.installing.addEventListener('statechange', function() {
        addLog(`📊 Nuevo estado: ${this.state}`);
        if (this.state === 'installed') {
          addLog("✅ SW instalado, recargando...");
          window.location.reload();
        }
      });
    } else if (registration.active && !navigator.serviceWorker.controller) {
      addLog("⚠️ SW activo pero no controla página, recargando...");
      window.location.reload();
    } else if (navigator.serviceWorker.controller) {
      addLog("✅ ¡SW ya está controlando!");
    } else {
      addLog("❓ Estado desconocido, recargando...");
      window.location.reload();
    }
  };

  const handleUnregister = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      addLog("🗑️ Service Worker desregistrado");
      window.location.reload();
    }
  };

  const handleClearCache = async () => {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    addLog("🗑️ Todos los cachés eliminados");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔍 Debug Service Worker</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-2">Estado:</h2>
          <p className="text-lg font-mono">{swStatus}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-2">Acciones:</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleForceActivate}
              className="bg-green-500 text-white px-4 py-2 rounded font-bold"
            >
              ⚡ ACTIVAR SW
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              🔄 Recargar
            </button>
            <button
              onClick={handleUnregister}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              🗑️ Desregistrar SW
            </button>
            <button
              onClick={handleClearCache}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              🗑️ Limpiar Caché
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-2">Cachés ({caches.length}):</h2>
          <ul className="font-mono text-sm">
            {caches.map((cache) => (
              <li key={cache} className="py-1">
                📦 {cache}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-black text-green-400 rounded-lg shadow p-4 font-mono text-sm overflow-auto max-h-96">
          <h2 className="font-bold mb-2 text-white">Logs:</h2>
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
