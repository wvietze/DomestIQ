'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles, Shield, Star, MapPin, Search, Calendar,
  CreditCard, MessageSquare, ArrowRight, Navigation, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SA_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Pietermaritzburg', 'Polokwane',
]

const TOTAL_STEPS = 3

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useOnboarding()
  const [step, setStep] = useState(0)
  const [selectedCity, setSelectedCity] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)

  const handleComplete = () => {
    completeOnboarding()
    router.push('/search')
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationDetected(true)
        setDetectingLocation(false)
      },
      () => {
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/25"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome to DomestIQ!
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Find trusted, verified domestic workers near you. Safe, simple, and transparent.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-sm mx-auto">
              {[
                { icon: Shield, text: 'ID Verified Workers', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Star, text: 'Real Reviews', color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: CreditCard, text: 'Secure Payments', color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map(item => (
                <div key={item.text} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl', item.bg)}>
                  <item.icon className={cn('w-4 h-4', item.color)} />
                  <span className="text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Set Your Location</h2>
              <p className="text-muted-foreground">So we can show workers near you</p>
            </div>

            <Button
              variant="outline"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full h-14 text-base gap-2"
            >
              {detectingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : locationDetected ? (
                <MapPin className="w-5 h-5 text-emerald-600" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              {locationDetected ? 'Location Detected!' : detectingLocation ? 'Detecting...' : 'Use My Location'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or select city</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SA_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={cn(
                    'p-3 text-sm rounded-lg border transition-all text-center',
                    selectedCity === city
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-border hover:border-blue-300'
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">Find and book in 3 easy steps</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Search, title: 'Search', desc: 'Browse verified workers by service type, location, and availability.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Calendar, title: 'Book', desc: 'Pick a date and time that works for you. Workers accept within minutes.', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: MessageSquare, title: 'Connect', desc: 'Chat with your worker, leave reviews, and build a trusted relationship.', color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                        <Icon className={cn('w-6 h-6', item.color)} />
                      </div>
                      <div>
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 py-4 px-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === step ? 'w-8 bg-blue-600' : i < step ? 'w-2 bg-blue-600' : 'w-2 bg-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="h-14 px-6">
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (step === TOTAL_STEPS - 1) {
                handleComplete()
              } else {
                setStep(s => s + 1)
              }
            }}
            className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {step === TOTAL_STEPS - 1 ? 'Browse Workers' : 'Next'}
            {step < TOTAL_STEPS - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
