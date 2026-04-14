import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { PopiConsentBanner } from "@/components/shared/popi-consent-banner";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  themeColor: "#005d42",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols icon font. display=block prevents ligatures like
            'favorite' from rendering as literal text during the font-load
            fallback window. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
      </head>
      <body
        className={`${sora.variable} ${manrope.variable} ${geistMono.variable} min-h-screen antialiased`}
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
