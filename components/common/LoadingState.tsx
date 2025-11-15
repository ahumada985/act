/**
 * Componente de Loading State optimizado
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export const LoadingState = React.memo<LoadingStateProps>(({
  message = 'Cargando...',
  description,
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          {message}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  </div>
));

LoadingState.displayName = 'LoadingState';
