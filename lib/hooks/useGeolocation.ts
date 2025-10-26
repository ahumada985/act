"use client";

import { useState, useEffect } from "react";

interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  direccion: string | null;
  comuna: string | null;
  region: string | null;
}

export function useGeolocation(autoFetch: boolean = true): GeolocationData {
  const [data, setData] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: autoFetch,
    error: null,
    direccion: null,
    comuna: null,
    region: null,
  });

  useEffect(() => {
    if (!autoFetch) return;

    if (!navigator.geolocation) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocalización no soportada en este navegador",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Actualizar coordenadas inmediatamente
        setData({
          latitude: lat,
          longitude: lon,
          accuracy: position.coords.accuracy,
          loading: true, // Seguimos cargando la dirección
          error: null,
          direccion: null,
          comuna: null,
          region: null,
        });

        // Geocodificación inversa usando Nominatim (OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'ACT-Reportes-App',
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            const address = result.address || {};

            // Construir dirección
            const calle = address.road || address.street || "";
            const numero = address.house_number || "";
            const direccion = calle && numero ? `${calle} ${numero}` : calle || "Dirección no disponible";

            setData({
              latitude: lat,
              longitude: lon,
              accuracy: position.coords.accuracy,
              loading: false,
              error: null,
              direccion,
              comuna: address.city || address.town || address.municipality || address.village || "",
              region: address.state || address.region || "Región Metropolitana",
            });
          } else {
            // Si falla la geocodificación, al menos tenemos las coordenadas
            setData({
              latitude: lat,
              longitude: lon,
              accuracy: position.coords.accuracy,
              loading: false,
              error: null,
              direccion: "Dirección no disponible",
              comuna: "",
              region: "",
            });
          }
        } catch (error) {
          // Si falla la geocodificación, al menos tenemos las coordenadas
          setData({
            latitude: lat,
            longitude: lon,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
            direccion: "Dirección no disponible",
            comuna: "",
            region: "",
          });
        }
      },
      (error) => {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [autoFetch]);

  return data;
}
