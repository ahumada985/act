"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-white font-semibold transition-transform duration-300 ${
        isOnline
          ? 'bg-green-600 translate-y-0'
          : 'bg-red-600 translate-y-0'
      }`}
      style={{
        transform: showNotification || !isOnline ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" />
            <span>Conexión restaurada - Sincronizando...</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span>Sin conexión - Modo offline activo</span>
          </>
        )}
      </div>
    </div>
  );
}
