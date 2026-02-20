import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const logoUrl = 'https://domestiq-kappa.vercel.app/icons/icon-512x512.png'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 40%, #eff6ff 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #059669, #10b981, #f59e0b)',
            display: 'flex',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            width={88}
            height={88}
            alt="DomestIQ"
            style={{ borderRadius: 22 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: '#111827', letterSpacing: -1 }}>
              domest<span style={{ color: '#059669' }}>IQ</span>
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#374151',
            fontWeight: 500,
            marginBottom: 40,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Find Trusted Domestic Workers in South Africa
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['ID Verified', 'Real Reviews', '11 Languages', 'Free for Workers'].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 50,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#059669',
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Bottom text */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 18,
            color: '#9ca3af',
          }}
        >
          Built for Mzansi. Built for us.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
