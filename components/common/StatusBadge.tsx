/**
 * Componente de Status Badge optimizado
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, STATUS_LABELS, type ReportStatus } from '@/constants';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const StatusBadge = React.memo<StatusBadgeProps>(({ status, className }) => {
  const colorClass = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <Badge className={`${colorClass} ${className || ''}`} variant="outline">
      {label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';
