import { Logo } from '@/components/shared/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-dots opacity-30" />

      {/* Decorative orbs */}
      <div className="hero-orb-blue -top-60 -right-60" />
      <div className="hero-orb-green -bottom-60 -left-60" />
      <div className="hero-orb-amber top-1/3 -left-40" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="large" href="/" />
        </div>
        {children}
      </div>
    </div>
  )
}
