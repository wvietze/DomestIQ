'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
}

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
            <div className="w-20 h-20 mx-auto bg-[#005d42] rounded-3xl flex items-center justify-center shadow-lg">
              <Icon name="auto_awesome" className="text-white" style={{ fontSize: '40px' }} />
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#1a1c1b]">
              Welcome to DomestIQ!
            </h1>
            <p className="text-lg text-[#3e4943] max-w-sm mx-auto">
              Find trusted, verified domestic workers near you. Safe, simple, and transparent.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-sm mx-auto">
              {[
                { icon: 'shield', text: 'ID Verified Workers' },
                { icon: 'star', text: 'Real Reviews' },
                { icon: 'chat', text: 'Direct Messaging' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f4f4f2]">
                  <Icon name={item.icon} className="text-[#005d42]" style={{ fontSize: '16px' }} />
                  <span className="text-xs font-medium text-[#1a1c1b]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold text-[#1a1c1b]">Set Your Location</h2>
              <p className="text-[#3e4943]">So we can show workers near you</p>
            </div>

            <button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full h-14 text-base gap-2 flex items-center justify-center border border-[#bdc9c1] text-[#1a1c1b] bg-white rounded-lg transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {detectingLocation ? (
                <Icon name="progress_activity" className="animate-spin" style={{ fontSize: '20px' }} />
              ) : locationDetected ? (
                <Icon name="location_on" className="text-[#005d42]" style={{ fontSize: '20px' }} />
              ) : (
                <Icon name="near_me" style={{ fontSize: '20px' }} />
              )}
              <span className="ml-2">
                {locationDetected ? 'Location Detected!' : detectingLocation ? 'Detecting...' : 'Use My Location'}
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#bdc9c1]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f9f9f7] px-2 text-[#6e7a73]">or select city</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SA_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={cn(
                    'p-3 text-sm rounded-lg border transition-all text-center active:scale-[0.98]',
                    selectedCity === city
                      ? 'border-[#005d42] bg-[#97f5cc]/30 text-[#005d42] font-medium'
                      : 'border-[#bdc9c1] text-[#1a1c1b] bg-white hover:border-[#005d42]'
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
              <h2 className="font-heading text-2xl font-bold text-[#1a1c1b]">How It Works</h2>
              <p className="text-[#3e4943]">Find and book in 3 easy steps</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: 'search', title: 'Search', desc: 'Browse verified workers by service type, location, and availability.' },
                { icon: 'calendar_today', title: 'Book', desc: 'Pick a date and time that works for you. Workers accept within minutes.' },
                { icon: 'chat', title: 'Connect', desc: 'Chat with your worker, leave reviews, and build a trusted relationship.' },
              ].map((item, i) => (
                <Card key={i} className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#f4f4f2]">
                      <Icon name={item.icon} className="text-[#005d42]" style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-[#1a1c1b]">{item.title}</h3>
                      <p className="text-sm text-[#3e4943] mt-0.5">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f7]">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 py-4 px-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === step ? 'w-8 bg-[#005d42]' : i < step ? 'w-2 bg-[#005d42]' : 'w-2 bg-[#bdc9c1]'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 max-w-md mx-auto w-full">
        <div key={step} className="transition-all">
          {renderStep()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#bdc9c1] p-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="h-14 px-6 border-[#bdc9c1] text-[#1a1c1b] bg-white">
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
            className="flex-1 h-14 text-lg bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg active:scale-[0.98]"
          >
            {step === TOTAL_STEPS - 1 ? 'Browse Workers' : 'Next'}
            {step < TOTAL_STEPS - 1 && <Icon name="arrow_forward" className="ml-2" style={{ fontSize: '20px' }} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
