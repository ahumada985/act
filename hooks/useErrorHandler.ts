/**
 * Hook para manejo centralizado de errores usando Sonner
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useErrorHandler() {
  const handleError = useCallback(
    (error: Error | unknown, customMessage?: string) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const finalMessage = customMessage || errorMessage;

      console.error('[ErrorHandler]', error);
      toast.error(finalMessage);
    },
    []
  );

  const handleSuccess = useCallback(
    (message: string) => {
      toast.success(message);
    },
    []
  );

  const handleWarning = useCallback(
    (message: string) => {
      toast.warning(message);
    },
    []
  );

  const handleInfo = useCallback(
    (message: string) => {
      toast.info(message);
    },
    []
  );

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}
