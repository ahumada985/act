/**
 * Route handler para callback de autenticación
 * Maneja redirecciones de Magic Links y OAuth
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL de redirección después del login
  return NextResponse.redirect(`${origin}/dashboard`);
}
