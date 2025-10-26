"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirmCapture = () => {
    if (imgSrc) {
      // Convert base64 to File
      fetch(imgSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `foto-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          onClose();
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Capturar Foto</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {!imgSrc ? (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: "environment", // Cámara trasera en móviles
                  }}
                />
              ) : (
                <img
                  src={imgSrc}
                  alt="Captura"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex gap-2 justify-center">
              {!imgSrc ? (
                <Button onClick={capture} size="lg" className="gap-2">
                  <Camera className="h-5 w-5" />
                  Tomar Foto
                </Button>
              ) : (
                <>
                  <Button onClick={retake} variant="outline" size="lg">
                    Repetir
                  </Button>
                  <Button onClick={confirmCapture} size="lg" className="gap-2">
                    <Check className="h-5 w-5" />
                    Usar Foto
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
