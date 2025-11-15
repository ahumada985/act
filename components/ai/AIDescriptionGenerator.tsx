/**
 * Componente para generar descripciones con IA
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { TipoTrabajo } from '@/types';

interface AIDescriptionGeneratorProps {
  tipoTrabajo: TipoTrabajo;
  imageUrls?: string[];
  context?: string;
  onGenerated: (descripcion: string) => void;
}

export function AIDescriptionGenerator({
  tipoTrabajo,
  imageUrls,
  context,
  onGenerated,
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoTrabajo,
          imageUrls,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar descripción');
      }

      const data = await response.json();
      const descripcion = data.descripcion || '';

      setGeneratedText(descripcion);
      toast.success('Descripción generada con IA');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al generar descripción');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUse = () => {
    if (generatedText) {
      onGenerated(generatedText);
      toast.success('Descripción aplicada');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Generar Descripción con IA</Label>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar con IA
            </>
          )}
        </Button>
      </div>

      {generatedText && (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold text-blue-700 flex items-center">
                <Sparkles className="mr-1 h-3 w-3" />
                Generado por IA
              </p>
              <Button
                type="button"
                onClick={handleGenerate}
                size="sm"
                variant="ghost"
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="min-h-[120px] bg-white"
              placeholder="La IA generará una descripción aquí..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleUse} size="sm" className="flex-1">
              Usar esta descripción
            </Button>
            <Button
              type="button"
              onClick={() => setGeneratedText('')}
              size="sm"
              variant="outline"
            >
              Descartar
            </Button>
          </div>
        </div>
      )}

      {imageUrls && imageUrls.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 La IA analizará {imageUrls.length} imagen(es) para generar la descripción
        </p>
      )}
    </div>
  );
}
