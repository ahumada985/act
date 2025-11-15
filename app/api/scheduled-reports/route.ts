/**
 * API Routes para gestión de reportes programados
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scheduledReportsService } from '@/services/scheduled-reports.service';
import { checkPermission } from '@/lib/rbac/check-permission';
import { PERMISSIONS } from '@/lib/rbac/permissions';

/**
 * GET - Obtener todos los reportes programados
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar permisos
    const canView = await checkPermission(user.id, PERMISSIONS.REPORTES_PROGRAMADOS_VIEW);
    if (!canView) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const reportes = await scheduledReportsService.getAll(activeOnly);

    return NextResponse.json({ reportes });
  } catch (error: any) {
    console.error('Error al obtener reportes programados:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener reportes programados' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear un nuevo reporte programado
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar permisos
    const canCreate = await checkPermission(user.id, PERMISSIONS.REPORTES_PROGRAMADOS_CREATE);
    if (!canCreate) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();

    // Validaciones
    if (!body.nombre || !body.frequency || !body.emails || body.emails.length === 0) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, frequency, emails' },
        { status: 400 }
      );
    }

    const reporte = await scheduledReportsService.create(body);

    return NextResponse.json({ reporte }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear reporte programado:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear reporte programado' },
      { status: 500 }
    );
  }
}
