/**
 * Hook principal de autenticación
 * Proporciona información del usuario actual y estado de sesión
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { type UserRole } from './roles';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  telefono?: string;
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (user) {
          // Obtener datos completos del usuario de la tabla User
          const { data: userData, error } = await supabase
            .from('User')
            .select('id, email, nombre, apellido, role, telefono')
            .eq('id', user.id)
            .single();

          if (!error && userData) {
            setAuthUser(userData as AuthUser);
          }
        } else {
          setAuthUser(null);
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userData } = await supabase
          .from('User')
          .select('id, email, nombre, apellido, role, telefono')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setAuthUser(userData as AuthUser);
        }
      } else {
        setAuthUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
  };

  return {
    user: authUser,
    supabaseUser: user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
}
