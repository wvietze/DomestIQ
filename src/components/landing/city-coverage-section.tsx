'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from '@/lib/hooks/use-translation'

const cities = [
  { name: 'Paarl', province: 'Western Cape', launched: true },
  { name: 'Cape Town', province: 'Western Cape', launched: true },
  { name: 'Johannesburg', province: 'Gauteng', launched: false },
  { name: 'Pretoria', province: 'Gauteng', launched: false },
  { name: 'Durban', province: 'KwaZulu-Natal', launched: false },
  { name: 'Gqeberha', province: 'Eastern Cape', launched: false },
  { name: 'Bloemfontein', province: 'Free State', launched: false },
  { name: 'East London', province: 'Eastern Cape', launched: false },
  { name: 'Polokwane', province: 'Limpopo', launched: false },
]

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

export function CityCoverageSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { t } = useTranslation()

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-[#f4f4f2]/80 to-[#f9f9f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#9ffdd3] text-[#005d42] border border-[#97f5cc] mb-4">
            <span className="material-symbols-outlined text-sm">location_on</span> {t('landing.cities.badge', 'Coverage')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1b]">
            {t('landing.cities.heading_1', 'Across')}{' '}
            <span className="text-[#005d42]">{t('landing.cities.heading_2', 'South Africa')}</span>
          </h2>
          <p className="mt-4 text-lg text-[#3e4943] max-w-2xl mx-auto">
            {t('landing.cities.subtext', 'Workers and households connecting in major metros. Growing every week.')}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {cities.map((city) => (
            <motion.div
              key={city.name}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="group p-5 rounded-2xl bg-white border border-[#e8e8e6] hover:border-[#bdc9c1] hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#1a1c1b]">{city.name}</h3>
                  <p className="text-sm text-[#3e4943]">{city.province}</p>
                </div>
                {city.launched ? (
                  <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-semibold px-2.5 py-1 bg-[#9ffdd3]/60 text-[#005d42] rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005d42] animate-pulse" />
                    {t('landing.cities.now_live', 'Now Live')}
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 bg-[#ffdcc3] text-[#904d00] rounded-full">
                    {t('landing.cities.launching_soon', 'Launching Soon')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-[#3e4943] mb-4">{t('landing.cities.not_listed', "Don't see your city? Register anyway — we're expanding fast!")}</p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-[#005d42] hover:bg-[#047857] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-[#005d42]/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            {t('landing.cities.cta', 'Register Now')}
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
