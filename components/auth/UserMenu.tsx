/**
 * Menú de usuario con logout y configuraciones
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ROLE_LABELS } from '@/lib/rbac/roles';

export function UserMenu() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();

      await supabase.auth.signOut();
      clearUser();

      toast.success('Sesión cerrada');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
        <User className="h-4 w-4 mr-2" />
        Iniciar Sesión
      </Button>
    );
  }

  const initials = `${user.nombre?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-mining-orange text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/configuracion')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
