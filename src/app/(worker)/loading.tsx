export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-[#f9f9f7] flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex items-center justify-center animate-pulse">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
          >
            badge
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="font-heading font-semibold text-[#1a1c1b] text-center tracking-tight">
            Loading your work...
          </p>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-10 flex flex-col gap-3">
        <div className="bg-white p-4 rounded-xl flex items-center gap-4 border-l-4 border-[#005d42] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#e8e8e6] animate-pulse flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-3/4 bg-[#e8e8e6] animate-pulse rounded-full" />
            <div className="h-3 w-1/2 bg-[#e8e8e6] animate-pulse rounded-full" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl flex items-center gap-4 border-l-4 border-[#005d42]/40 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#e8e8e6] animate-pulse flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 w-2/3 bg-[#e8e8e6] animate-pulse rounded-full" />
            <div className="h-3 w-1/3 bg-[#e8e8e6] animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
