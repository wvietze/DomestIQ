'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LogoPulse,
  OrbitDots,
  HouseBuild,
  WaveBars,
  GradientSpinner,
  MorphingShapes,
  StackingBlocks,
  RippleRings,
  BouncingDots,
  ProgressSweep,
} from '@/components/loading'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

const animations = [
  {
    name: 'Logo Pulse',
    description: 'Brand logo scales and glows rhythmically',
    component: LogoPulse,
  },
  {
    name: 'Orbit Dots',
    description: '3 colored dots orbit in a circle',
    component: OrbitDots,
  },
  {
    name: 'House Build',
    description: 'SVG house draws itself line by line',
    component: HouseBuild,
  },
  {
    name: 'Wave Bars',
    description: 'Equalizer bars rise and fall in sequence',
    component: WaveBars,
  },
  {
    name: 'Gradient Spinner',
    description: 'Ring with gradient sweep rotation',
    component: GradientSpinner,
  },
  {
    name: 'Morphing Shapes',
    description: 'Shape morphs from circle to square to triangle',
    component: MorphingShapes,
  },
  {
    name: 'Stacking Blocks',
    description: '3 blocks drop and stack sequentially',
    component: StackingBlocks,
  },
  {
    name: 'Ripple Rings',
    description: 'Concentric rings expand outward from center',
    component: RippleRings,
  },
  {
    name: 'Bouncing Dots',
    description: '3 dots bounce in sequence',
    component: BouncingDots,
  },
  {
    name: 'Progress Sweep',
    description: 'Circular arc sweeps 360 degrees',
    component: ProgressSweep,
  },
]

export default function LoadingAnimationsDemo() {
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null)

  return (
    <>
      {/* Fullscreen preview overlay */}
      {fullscreenIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
          onClick={() => setFullscreenIdx(null)}
        >
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="sm" onClick={() => setFullscreenIdx(null)}>
              Close
            </Button>
          </div>
          <p className="absolute top-6 left-6 text-sm font-medium text-muted-foreground">
            {animations[fullscreenIdx].name}
          </p>
          {(() => {
            const Comp = animations[fullscreenIdx].component
            return <Comp size="full" />
          })()}
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-12"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="space-y-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demo
          </Link>
          <h1 className="text-2xl font-bold">Loading Animations</h1>
          <p className="text-muted-foreground">
            10 branded loading animations — click any card to preview full-screen.
            Each works at sm, md, lg, and full sizes.
          </p>
        </motion.div>

        {/* Grid of animation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {animations.map((anim, i) => {
            const Comp = anim.component
            return (
              <motion.div
                key={anim.name}
                variants={fadeUp}
                className="border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setFullscreenIdx(i)}
              >
                {/* Preview area */}
                <div className="h-[200px] bg-gray-50/50 flex items-center justify-center border-b">
                  <Comp size="lg" />
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{anim.name}</h3>
                    <p className="text-sm text-muted-foreground">{anim.description}</p>
                  </div>

                  {/* Inline size demos */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">sm</span>
                      <Comp size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">md</span>
                      <Comp size="md" />
                    </div>
                  </div>

                  {/* Mock button with inline loader */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                      <Comp size="sm" />
                      <span>Loading</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
