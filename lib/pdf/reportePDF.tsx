import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    width: '60%',
    color: '#1e293b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  image: {
    marginVertical: 10,
    maxHeight: 300,
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  gpsInfo: {
    backgroundColor: '#d1fae5',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
});

interface ReportePDFProps {
  reporte: any;
  supervisor?: any;
  fotos?: any[];
}

export function ReportePDF({ reporte, supervisor, fotos }: ReportePDFProps) {
  const getTipoTrabajoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      FIBRA_OPTICA: "Fibra Óptica",
      DATA_CENTER: "Data Center",
      ANTENAS: "Antenas",
      CCTV: "CCTV",
      INSTALACION_RED: "Instalación Red",
      MANTENIMIENTO: "Mantenimiento",
      OTRO: "Otro",
    };
    return labels[tipo] || tipo;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <Text style={styles.title}>NORTHTEK REPORTES</Text>
          <Text style={styles.subtitle}>Reporte de Terreno - Telecomunicaciones</Text>
        </View>

        {/* Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Trabajo:</Text>
            <Text style={styles.value}>{getTipoTrabajoLabel(reporte.tipoTrabajo)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.badge}>{reporte.status}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Creación:</Text>
            <Text style={styles.value}>{formatDate(reporte.createdAt)}</Text>
          </View>

          {reporte.ordenTrabajo && (
            <View style={styles.row}>
              <Text style={styles.label}>Orden de Trabajo:</Text>
              <Text style={styles.value}>{reporte.ordenTrabajo}</Text>
            </View>
          )}

          {reporte.proyecto && (
            <View style={styles.row}>
              <Text style={styles.label}>Proyecto:</Text>
              <Text style={styles.value}>{reporte.proyecto}</Text>
            </View>
          )}

          {reporte.clienteFinal && (
            <View style={styles.row}>
              <Text style={styles.label}>Cliente Final:</Text>
              <Text style={styles.value}>{reporte.clienteFinal}</Text>
            </View>
          )}
        </View>

        {/* Supervisor */}
        {supervisor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUPERVISOR</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>
                {supervisor.nombre} {supervisor.apellido}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{supervisor.email}</Text>
            </View>
          </View>
        )}

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UBICACIÓN</Text>

          {reporte.direccion && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{reporte.direccion}</Text>
            </View>
          )}

          {reporte.comuna && (
            <View style={styles.row}>
              <Text style={styles.label}>Comuna:</Text>
              <Text style={styles.value}>{reporte.comuna}</Text>
            </View>
          )}

          {reporte.region && (
            <View style={styles.row}>
              <Text style={styles.label}>Región:</Text>
              <Text style={styles.value}>{reporte.region}</Text>
            </View>
          )}

          {reporte.latitud && reporte.longitud && (
            <View style={styles.gpsInfo}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>
                Coordenadas GPS:
              </Text>
              <Text style={{ fontSize: 9 }}>
                Latitud: {reporte.latitud.toFixed(6)}
              </Text>
              <Text style={{ fontSize: 9 }}>
                Longitud: {reporte.longitud.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        {reporte.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPCIÓN DEL TRABAJO</Text>
            <Text style={{ lineHeight: 1.5 }}>{reporte.descripcion}</Text>
          </View>
        )}

        {/* Observaciones */}
        {reporte.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
            <Text style={{ lineHeight: 1.5 }}>{reporte.observaciones}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generado con Northtek Reportes - {new Date().toLocaleDateString('es-CL')}
          </Text>
          <Text style={{ marginTop: 3 }}>
            Sistema de Reportabilidad para Telecomunicaciones
          </Text>
        </View>
      </Page>

      {/* Página de Fotos (si hay) */}
      {fotos && fotos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Image src="/logo.png" style={styles.logo} />
            <Text style={styles.title}>FOTOGRAFÍAS</Text>
            <Text style={styles.subtitle}>
              Registro fotográfico del trabajo realizado
            </Text>
          </View>

          {fotos.map((foto, index) => (
            <View key={foto.id} style={styles.section}>
              <Text style={{ fontSize: 10, marginBottom: 5, fontWeight: 'bold' }}>
                Foto {index + 1} de {fotos.length}
              </Text>
              <Image src={foto.url} style={styles.image} />
              {foto.descripcion && (
                <Text style={{ fontSize: 9, color: '#64748b', marginTop: 5 }}>
                  {foto.descripcion}
                </Text>
              )}
            </View>
          ))}

          <View style={styles.footer}>
            <Text>
              Generado con Northtek Reportes - {new Date().toLocaleDateString('es-CL')}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
