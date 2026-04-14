import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Service-Worker-Allowed', value: '/' },
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      ],
    },
    // Strict CSP for pages that don't need Google Maps
    {
      source: '/((?!search|workers|helpdesk|worker-profile|register|profile).*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.paystack.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.googleusercontent.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.paystack.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
    // Relaxed CSP for pages that load Google Maps (unsafe-eval required by Maps JS SDK)
    {
      source: '/(search|workers|helpdesk|worker-profile|register|profile)(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://js.paystack.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleusercontent.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://api.anthropic.com https://api.paystack.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
