"use client";

import { pdf } from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from 'react';
import { ReportePDF } from "@/lib/pdf/reportePDF";

interface PDFDownloadButtonProps {
  reporte: any;
  supervisor?: any;
  fotos?: any[];
}

export function PDFDownloadButton({ reporte, supervisor, fotos }: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(
        <ReportePDF
          reporte={reporte}
          supervisor={supervisor}
          fotos={fotos}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${reporte.tipoTrabajo}-${new Date(reporte.createdAt).toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="gap-2"
      disabled={loading}
      onClick={handleDownload}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Descargar PDF
        </>
      )}
    </Button>
  );
}
