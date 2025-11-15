import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { PrecachePages } from "@/components/pwa/PrecachePages";
import { AppProviders } from "@/components/providers";
import { ErrorBoundary } from "@/components/common";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Northtek Reportes - Sistema de Reportabilidad",
  description: "Sistema de reportes diarios para supervisores de telecomunicaciones",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Northtek Reportes",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[PWA] ✅ SW registrado:', registration.scope);

                      // Forzar actualización
                      registration.update();

                      // Si hay SW esperando, activarlo
                      if (registration.waiting) {
                        console.log('[PWA] SW esperando, activando...');
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                      }

                      // Listener para cuando se instala
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            console.log('[PWA] Estado SW:', this.state);
                            if (this.state === 'activated' && !navigator.serviceWorker.controller) {
                              console.log('[PWA] SW activado, recargando...');
                              window.location.reload();
                            }
                          });
                        }
                      });
                    },
                    function(err) {
                      console.error('[PWA] ❌ SW falló:', err);
                    }
                  );

                  // Recargar cuando SW tome control
                  let refreshing = false;
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    if (!refreshing) {
                      refreshing = true;
                      console.log('[PWA] SW tomó control, recargando...');
                      window.location.reload();
                    }
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppProviders>
            <OfflineIndicator />
            <PrecachePages />
            {children}
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
