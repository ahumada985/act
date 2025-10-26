import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);

    // Listeners
    const handleOnline = () => {
      console.log('[Network] 🟢 ONLINE');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[Network] 🔴 OFFLINE');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
