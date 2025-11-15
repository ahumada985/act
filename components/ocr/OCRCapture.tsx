/**
 * Componente para captura y extracción de texto con OCR
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, FileText, Loader2, Check, X } from 'lucide-react';
import { extractTextFromImage, extractCodes, parseExtractedText } from '@/lib/ocr/tesseract-client';
import { toast } from 'sonner';

interface OCRCaptureProps {
  onTextExtracted: (data: { text: string; parsed: Record<string, string> }) => void;
  type?: 'general' | 'codes' | 'numbers';
}

export function OCRCapture({ onTextExtracted, type = 'general' }: OCRCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [parsedData, setParsedData] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Procesar OCR
    await processOCR(file);
  };

  const processOCR = async (file: File) => {
    setIsProcessing(true);
    toast.info('Procesando imagen con OCR...');

    try {
      const imageUrl = URL.createObjectURL(file);

      let result;
      if (type === 'codes') {
        const codes = await extractCodes(imageUrl);
        result = {
          text: codes.join('\n'),
          confidence: 0,
          words: [],
        };
      } else {
        result = await extractTextFromImage(imageUrl);
      }

      const text = result.text;
      const parsed = parseExtractedText(text);

      setExtractedText(text);
      setParsedData(parsed);

      if (text.trim()) {
        toast.success(`Texto extraído (${Math.round(result.confidence)}% confianza)`);
      } else {
        toast.warning('No se encontró texto en la imagen');
      }

      URL.revokeObjectURL(imageUrl);
    } catch (error: any) {
      console.error('Error en OCR:', error);
      toast.error('Error al extraer texto de la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseText = () => {
    onTextExtracted({
      text: extractedText,
      parsed: parsedData,
    });
    toast.success('Texto aplicado');
    handleClear();
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setExtractedText('');
    setParsedData({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id="ocr-file-input"
        />
        <label htmlFor="ocr-file-input" className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            asChild
          >
            <span>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar y Extraer Texto
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg border"
              />

              {extractedText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Texto Extraído:
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                    {extractedText}
                  </div>

                  {Object.keys(parsedData).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600">
                        Campos Detectados:
                      </p>
                      {Object.entries(parsedData).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-xs p-2 bg-blue-50 rounded"
                        >
                          <span className="font-medium capitalize">{key}:</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleUseText}
                      size="sm"
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Usar Texto
                    </Button>
                    <Button
                      type="button"
                      onClick={handleClear}
                      size="sm"
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Descartar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-500">
        💡 Útil para extraer: órdenes de trabajo, números de serie, códigos de equipos, placas, etc.
      </p>
    </div>
  );
}
