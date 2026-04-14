'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  )
}

const partnerCards = [
  {
    icon: 'database',
    title: 'Data API',
    desc: 'Verified income data for financial inclusion. Banks and lenders can assess creditworthiness.',
    bg: 'bg-[#9ffdd3]/30',
    iconBg: 'bg-[#9ffdd3]',
    iconColor: 'text-[#005d42]',
    borderColor: 'border-[#97f5cc]',
  },
  {
    icon: 'workspace_premium',
    title: 'Sponsorship',
    desc: 'Align your brand with trust and community impact. Premium placements across the platform.',
    bg: 'bg-[#ffdcc3]/30',
    iconBg: 'bg-[#ffdcc3]',
    iconColor: 'text-[#904d00]',
    borderColor: 'border-[#ffdcc3]',
  },
  {
    icon: 'campaign',
    title: 'Advertising',
    desc: 'Reach workers and households with targeted ads. Service-based and role-based targeting.',
    bg: 'bg-[#f4f4f2]',
    iconBg: 'bg-[#e8e8e6]',
    iconColor: 'text-[#1a1c1b]',
    borderColor: 'border-[#e2e3e1]',
  },
]

export function PartnersSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-[#f9f9f7] to-[#f4f4f2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Section className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#9ffdd3] text-[#005d42] border border-[#97f5cc] mb-4">
            For Partners
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1b]">
            Build on our{' '}
            <span className="text-[#005d42]">infrastructure</span>
          </h2>
          <p className="mt-4 text-lg text-[#3e4943] max-w-2xl mx-auto">
            DomestIQ&apos;s verified workforce data is valuable to banks, brands, and advertisers. Partner with us.
          </p>
        </Section>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid md:grid-cols-3 gap-6">
          {partnerCards.map((card) => (
            <motion.div key={card.title} variants={fadeUp} transition={{ duration: 0.5 }}
              className={`group p-6 rounded-2xl ${card.bg} border ${card.borderColor} hover:shadow-lg transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>{card.icon}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#1a1c1b]">{card.title}</h3>
              <p className="text-sm text-[#3e4943] leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <Section delay={0.2} className="text-center mt-10">
          <Link href="/partners"
            className="group inline-flex items-center gap-2 bg-[#005d42] hover:bg-[#047857] text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-[#005d42]/25 transition-all duration-300 hover:-translate-y-0.5">
            Learn More
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </Section>
      </div>
    </section>
  )
}
