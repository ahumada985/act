/**
 * Componente de Error State optimizado
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = React.memo<ErrorStateProps>(({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Reintentar',
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardFooter>
          <Button onClick={onRetry} variant="outline" className="w-full">
            {retryLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  </div>
));

ErrorState.displayName = 'ErrorState';
