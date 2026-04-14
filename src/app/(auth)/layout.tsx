export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f9f9f7] text-[#1a1c1b]">
      {children}
    </div>
  )
}
