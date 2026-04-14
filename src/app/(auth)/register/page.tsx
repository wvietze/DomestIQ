'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/hooks/use-translation'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full flex justify-center pt-10 pb-6 px-6">
        <span className="font-heading font-bold text-xl text-[#005d42] uppercase tracking-wider">
          DomestIQ
        </span>
      </header>

      <main className="flex-1 flex flex-col px-8 max-w-md mx-auto w-full justify-center">
        <div className="mb-10 text-left">
          <h1 className="font-heading font-bold text-3xl tracking-tight mb-3">
            How can we help you?
          </h1>
          <p className="text-[#44483e] text-lg leading-relaxed">
            Choose how you&apos;d like to use DomestIQ
          </p>
        </div>

        <div className="space-y-6">
          {/* Worker Card */}
          <button
            onClick={() => router.push('/register/worker')}
            className="w-full text-left bg-white rounded-xl overflow-hidden transition-transform active:scale-[0.98] flex group relative"
            style={{ boxShadow: '0 8px 24px 0 rgba(26, 28, 27, 0.06)' }}
          >
            <div className="w-1.5 bg-[#005d42] self-stretch" />
            <div className="flex-1 p-6 flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#f4f4f2] flex items-center justify-center text-[#005d42]">
                <span className="material-symbols-outlined text-3xl">cleaning_services</span>
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-bold text-xl mb-1">
                  {t('auth.worker', "I'm a Worker")}
                </h2>
                <p className="text-sm text-[#44483e] leading-snug">
                  I offer domestic services — cleaning, gardening, painting, and more
                </p>
              </div>
              <div className="self-center text-[#74796d] opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </button>

          {/* Client Card */}
          <button
            onClick={() => router.push('/register/client')}
            className="w-full text-left bg-white rounded-xl overflow-hidden transition-transform active:scale-[0.98] flex group relative"
            style={{ boxShadow: '0 8px 24px 0 rgba(26, 28, 27, 0.06)' }}
          >
            <div className="w-1.5 bg-[#005d42] self-stretch" />
            <div className="flex-1 p-6 flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#f4f4f2] flex items-center justify-center text-[#005d42]">
                <span className="material-symbols-outlined text-3xl">home</span>
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-bold text-xl mb-1">
                  {t('auth.client', 'I Need Help at Home')}
                </h2>
                <p className="text-sm text-[#44483e] leading-snug">
                  I&apos;m looking for reliable help around my home
                </p>
              </div>
              <div className="self-center text-[#74796d] opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </button>
        </div>
      </main>

      <footer className="p-8 w-full max-w-md mx-auto text-center">
        <p className="text-[#44483e] text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#005d42] font-bold ml-1 hover:underline underline-offset-4"
          >
            {t('auth.login', 'Log in')}
          </Link>
        </p>
      </footer>
    </div>
  )
}
