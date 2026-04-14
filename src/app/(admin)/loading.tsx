export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-[#f9f9f7] flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_8px_24px_rgba(26,28,27,0.04)] flex items-center justify-center animate-pulse">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
          >
            shield_person
          </span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="font-heading font-semibold text-[#1a1c1b] text-center tracking-tight">
            Loading admin panel...
          </p>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="h-3 w-20 bg-[#e8e8e6] animate-pulse rounded-full mb-3" />
          <div className="h-6 w-16 bg-[#e8e8e6] animate-pulse rounded-full" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="h-3 w-24 bg-[#e8e8e6] animate-pulse rounded-full mb-3" />
          <div className="h-6 w-14 bg-[#e8e8e6] animate-pulse rounded-full" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="h-3 w-16 bg-[#e8e8e6] animate-pulse rounded-full mb-3" />
          <div className="h-6 w-20 bg-[#e8e8e6] animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  )
}
