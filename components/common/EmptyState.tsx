/**
 * Componente de Empty State optimizado
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = React.memo<EmptyStateProps>(({
  title = 'Sin datos',
  message,
  icon,
  actionLabel,
  onAction,
}) => (
  <Card className="w-full">
    <CardHeader className="text-center">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <CardTitle>{title}</CardTitle>
      <CardDescription>{message}</CardDescription>
    </CardHeader>
    {actionLabel && onAction && (
      <CardContent className="flex justify-center">
        <Button onClick={onAction}>{actionLabel}</Button>
      </CardContent>
    )}
  </Card>
));

EmptyState.displayName = 'EmptyState';
