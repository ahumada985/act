"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Play, Pause, X, Check } from "lucide-react";

interface AudioCaptureProps {
  onCapture: (file: File, duration: number) => void;
  onClose: () => void;
}

export function AudioCapture({ onCapture, onClose }: AudioCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      alert("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const confirmCapture = () => {
    if (audioURL) {
      fetch(audioURL)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `audio-${Date.now()}.webm`, {
            type: "audio/webm",
          });
          onCapture(file, duration);
          onClose();
        });
    }
  };

  const retake = () => {
    setAudioURL(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Grabar Audio</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualización */}
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[200px]">
            {isRecording && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <p className="text-2xl font-mono font-bold text-red-600">
                  {formatTime(duration)}
                </p>
                <p className="text-sm text-gray-600">Grabando...</p>
              </div>
            )}

            {!isRecording && !audioURL && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Presiona para comenzar</p>
              </div>
            )}

            {!isRecording && audioURL && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mic className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-mono font-bold text-green-600">
                  {formatTime(duration)}
                </p>
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex gap-2 justify-center">
            {!audioURL ? (
              !isRecording ? (
                <Button onClick={startRecording} size="lg" className="gap-2 w-full">
                  <Mic className="h-5 w-5" />
                  Comenzar Grabación
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="gap-2 w-full"
                >
                  <Square className="h-5 w-5" />
                  Detener
                </Button>
              )
            ) : (
              <div className="flex gap-2 w-full">
                <Button onClick={retake} variant="outline" size="lg" className="flex-1">
                  Repetir
                </Button>
                {!isPlaying ? (
                  <Button onClick={playAudio} variant="outline" size="lg">
                    <Play className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button onClick={pauseAudio} variant="outline" size="lg">
                    <Pause className="h-5 w-5" />
                  </Button>
                )}
                <Button onClick={confirmCapture} size="lg" className="flex-1 gap-2">
                  <Check className="h-5 w-5" />
                  Usar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
