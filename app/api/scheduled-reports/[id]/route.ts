/**
 * API Routes para gestión individual de reportes programados
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scheduledReportsService } from '@/services/scheduled-reports.service';
import { checkPermission } from '@/lib/rbac/check-permission';
import { PERMISSIONS } from '@/lib/rbac/permissions';

/**
 * GET - Obtener un reporte programado por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const canView = await checkPermission(user.id, PERMISSIONS.REPORTES_PROGRAMADOS_VIEW);
    if (!canView) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const reporte = await scheduledReportsService.getById(params.id);

    return NextResponse.json({ reporte });
  } catch (error: any) {
    console.error('Error al obtener reporte programado:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener reporte programado' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar un reporte programado
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const canEdit = await checkPermission(user.id, PERMISSIONS.REPORTES_PROGRAMADOS_EDIT);
    if (!canEdit) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await request.json();

    const reporte = await scheduledReportsService.update({
      id: params.id,
      ...body,
    });

    return NextResponse.json({ reporte });
  } catch (error: any) {
    console.error('Error al actualizar reporte programado:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar reporte programado' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar un reporte programado
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const canDelete = await checkPermission(user.id, PERMISSIONS.REPORTES_PROGRAMADOS_DELETE);
    if (!canDelete) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    await scheduledReportsService.delete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar reporte programado:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar reporte programado' },
      { status: 500 }
    );
  }
}
