'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Lock, User, Loader2, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ClientRegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName, phone: formData.phone, role: 'client' } },
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Create Your Account</h2>
          <p className="text-sm text-muted-foreground">Find trusted workers near you</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="fullName" placeholder="Your full name" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className="pl-10 h-12 text-base" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="pl-10 h-12 text-base" required />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="072 123 4567" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="pl-10 h-12 text-base" />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} className="pl-10 h-12 text-base" required />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} className="pl-10 h-12 text-base" required />
            </div>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <div className="text-xs text-muted-foreground text-center">
            By signing up you agree to our <a href="/terms" className="text-primary underline">Terms</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a>
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
