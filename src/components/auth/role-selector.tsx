'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Home, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'client' | 'worker'

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const router = useRouter()

  const roles = [
    {
      id: 'client' as Role,
      title: 'I Need Help',
      subtitle: 'Find trusted workers near you',
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      features: ['Search verified workers', 'Book & schedule', 'Pay securely', 'Rate & review'],
    },
    {
      id: 'worker' as Role,
      title: 'I Offer Services',
      subtitle: 'Get discovered by households',
      icon: Briefcase,
      color: 'from-emerald-500 to-emerald-600',
      borderColor: 'border-emerald-500',
      features: ['Create your profile', 'Set your rates', 'Manage bookings', 'Build reputation'],
    },
  ]

  const handleContinue = () => {
    if (selectedRole === 'worker') router.push('/register/worker')
    else if (selectedRole === 'client') router.push('/register/client')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Join DomestIQ</h1>
        <p className="text-muted-foreground mt-1">How would you like to use the platform?</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id
          return (
            <Card
              key={role.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-lg',
                isSelected ? `ring-2 ring-offset-2 ${role.borderColor} shadow-lg` : 'hover:border-gray-300'
              )}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={cn('w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br', role.color)}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">{role.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{role.subtitle}</p>
                <ul className="text-left space-y-2">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={cn('w-1.5 h-1.5 rounded-full bg-gradient-to-br', role.color)} />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Button className="w-full h-12 text-base" disabled={!selectedRole} onClick={handleContinue}>
        Continue <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
