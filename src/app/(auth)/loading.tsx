export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-[#f9f9f7] flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex items-center justify-center animate-pulse">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
          >
            lock
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="font-heading font-semibold text-[#1a1c1b] text-center tracking-tight">
            Just a moment...
          </p>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}
