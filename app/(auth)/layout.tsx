/**
 * Layout para páginas de autenticación
 * Sin header ni sidebar
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación - Northtek Reportes',
  description: 'Inicia sesión o regístrate en Northtek Reportes',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
