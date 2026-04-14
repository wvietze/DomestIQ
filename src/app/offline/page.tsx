'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f9f9f7] flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 py-2 px-4 rounded-full bg-[#e8e8e6]">
        <span className="text-xs font-bold tracking-widest text-[#3e4943] uppercase">
          No connection
        </span>
      </div>

      <div className="relative mb-10">
        <div className="w-32 h-32 rounded-full bg-[#f4f4f2] flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200", fontSize: '72px' }}
          >
            wifi_off
          </span>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-bold mb-3 tracking-tight text-[#1a1c1b]">
        You&apos;re offline
      </h2>
      <p className="text-[#3e4943] max-w-xs mb-8 leading-relaxed">
        Check your connection and try again. DomestIQ needs internet to connect
        you with workers.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="bg-[#005d42] text-white px-12 py-4 rounded-lg font-bold text-lg shadow-sm active:scale-[0.98] transition-transform mb-6"
      >
        Retry
      </button>

      <span className="text-sm font-medium text-[#6e7a73]">
        Some features are available offline
      </span>
    </div>
  )
}
