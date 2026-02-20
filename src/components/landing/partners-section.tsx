'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Database, Award, Megaphone, ArrowRight } from 'lucide-react'

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
    icon: Database,
    title: 'Data API',
    desc: 'Verified income data for financial inclusion. Banks and lenders can assess creditworthiness.',
    color: 'emerald',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    icon: Award,
    title: 'Sponsorship',
    desc: 'Align your brand with trust and community impact. Premium placements across the platform.',
    color: 'amber',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  {
    icon: Megaphone,
    title: 'Advertising',
    desc: 'Reach workers and households with targeted ads. Service-based and role-based targeting.',
    color: 'violet',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
  },
]

export function PartnersSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Section className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
            For Partners
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Build on our{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">infrastructure</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            DomestIQ&apos;s verified workforce data is valuable to banks, brands, and advertisers. Partner with us.
          </p>
        </Section>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid md:grid-cols-3 gap-6">
          {partnerCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div key={card.title} variants={fadeUp} transition={{ duration: 0.5 }}
                className={`group p-6 rounded-2xl ${card.bg} border border-${card.color}-100/80 hover:shadow-lg transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <Section delay={0.2} className="text-center mt-10">
          <Link href="/partners"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5">
            Learn More
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Section>
      </div>
    </section>
  )
}
