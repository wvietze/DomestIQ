import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { PopiConsentBanner } from "@/components/shared/popi-consent-banner";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { ThemeScript } from "@/components/ui/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://domestiq-kappa.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "DomestIQ - Find Trusted Domestic Workers in South Africa",
    template: "%s | DomestIQ",
  },
  description:
    "Connect with verified maids, gardeners, painters, and more. Trusted by South African households. ID-verified workers, real reviews. Always free for workers.",
  keywords: [
    "domestic workers South Africa", "find a maid", "find a gardener",
    "home services SA", "cleaning services", "trusted workers",
    "verified domestic workers", "Johannesburg", "Cape Town", "Durban",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "DomestIQ",
    title: "DomestIQ - Find Trusted Domestic Workers in South Africa",
    description:
      "Connect with verified maids, gardeners, painters, and more. ID-verified workers, real reviews. Built for Mzansi.",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "DomestIQ - Trusted Domestic Workers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DomestIQ - Find Trusted Domestic Workers",
    description:
      "ID-verified workers, real reviews, 11 SA languages. Built for Mzansi.",
    images: [`${APP_URL}/api/og`],
  },
  robots: {
    index: true,
    follow: true,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to content
        </a>
        <ToastProvider>
          {children}
          <PopiConsentBanner />
          <ServiceWorkerRegister />
          <Analytics />
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
