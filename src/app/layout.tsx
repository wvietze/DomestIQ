import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { PopiConsentBanner } from "@/components/shared/popi-consent-banner";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DomestIQ - Find Trusted Workers",
  description:
    "Connect with trusted domestic workers in South Africa",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ToastProvider>
          {children}
          <PopiConsentBanner />
          <ServiceWorkerRegister />
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
