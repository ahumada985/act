import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { PrecachePages } from "@/components/pwa/PrecachePages";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACT Reportes - Sistema de Reportabilidad",
  description: "Sistema de reportes diarios para supervisores de telecomunicaciones",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ACT Reportes",
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('[PWA] SW registrado:', registration.scope);
                  },
                  function(err) {
                    console.log('[PWA] SW falló:', err);
                  }
                );
              });
            }
          `}
        </Script>
        <OfflineIndicator />
        <PrecachePages />
        {children}
      </body>
    </html>
  );
}
