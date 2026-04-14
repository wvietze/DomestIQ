'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin area error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] bg-[#f9f9f7] flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 py-2 px-4 rounded-full bg-[#e8e8e6]">
        <span className="text-xs font-bold tracking-widest text-[#3e4943] uppercase">
          Admin error
        </span>
      </div>

      <div className="relative mb-10">
        <div className="w-32 h-32 rounded-full bg-[#f4f4f2] flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#005d42]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 200", fontSize: '72px' }}
          >
            shield_person
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#ba1a1a]">bolt</span>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-bold mb-3 tracking-tight text-[#1a1c1b]">
        Something went wrong
      </h2>
      <p className="text-[#3e4943] max-w-xs mb-8 leading-relaxed">
        The admin panel hit an unexpected error. Please try again.
      </p>

      {error.digest && (
        <p className="text-[10px] font-mono text-[#6e7a73] mb-6 tracking-wider uppercase">
          Ref: {error.digest}
        </p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="bg-[#005d42] text-white w-full py-4 rounded-lg font-bold text-lg shadow-sm active:scale-[0.98] transition-transform"
        >
          Try Again
        </button>
        <Link
          href="/admin"
          className="text-[#3e4943] w-full py-4 rounded-lg font-bold text-lg bg-[#e8e8e6]/60 active:bg-[#e8e8e6] transition-colors text-center"
        >
          Admin Home
        </Link>
      </div>
    </div>
  )
}
