/**
 * Página de Recuperación de Contraseña
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Email enviado! Revisa tu bandeja de entrada');
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      toast.error(error.message || 'Error al enviar email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            {emailSent
              ? 'Revisa tu email para restablecer tu contraseña'
              : 'Ingresa tu email y te enviaremos un link de recuperación'}
          </CardDescription>
        </CardHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Link de Recuperación
                  </>
                )}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                📧 Hemos enviado un email a <strong>{email}</strong> con
                instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Si no recibes el email en unos minutos, revisa tu carpeta de spam.
            </p>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Intentar con otro email
              </Button>

              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al login
                </Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
