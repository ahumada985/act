/**
 * Error Boundary para capturar errores de React
 * Documentación: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componente de fallback por defecto
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-red-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">
                Oops! Algo salió mal
              </CardTitle>
              <CardDescription className="text-red-700">
                La aplicación encontró un error inesperado
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                Stack Trace (solo en desarrollo)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            onClick={resetErrorBoundary}
            variant="default"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Error Boundary Component
 *
 * Uso:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Con componente personalizado:
 * ```tsx
 * <ErrorBoundary fallback={CustomErrorComponent}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error a servicio de monitoreo (ej: Sentry, LogRocket, etc.)
    console.error('[ErrorBoundary] Error capturado:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Aquí puedes enviar el error a tu servicio de logging
    // Ejemplo: logErrorToService(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para lanzar errores desde componentes funcionales
 * Útil para testing del Error Boundary
 *
 * Uso:
 * ```tsx
 * const throwError = useErrorBoundary();
 *
 * <button onClick={() => throwError(new Error('Test error'))}>
 *   Lanzar error
 * </button>
 * ```
 */
export function useErrorBoundary() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
