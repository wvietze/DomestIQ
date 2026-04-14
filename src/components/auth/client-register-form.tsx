'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { WaveBars } from '@/components/loading'
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
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#1a1c1b]">Create Your Account</h2>
          <p className="text-sm text-[#3e4943]">Find trusted workers near you</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-[#1a1c1b]">Full Name</Label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#3e4943]">person</span>
              <Input id="fullName" placeholder="Your full name" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className="pl-10 h-12 text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-[#1a1c1b]">Email</Label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#3e4943]">mail</span>
              <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="pl-10 h-12 text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" required />
            </div>
          </div>
          <div>
            <Label htmlFor="phone" className="text-[#1a1c1b]">Phone (optional)</Label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#3e4943]">phone</span>
              <Input id="phone" type="tel" placeholder="072 123 4567" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="pl-10 h-12 text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-[#1a1c1b]">Password</Label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#3e4943]">lock</span>
              <Input id="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} className="pl-10 h-12 text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" required />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-[#1a1c1b]">Confirm Password</Label>
            <div className="relative mt-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#3e4943]">lock</span>
              <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} className="pl-10 h-12 text-base bg-[#f4f4f2] border-none focus:ring-2 focus:ring-[#005d42]/30" required />
            </div>
          </div>
          {error && <p className="text-sm text-[#ba1a1a] text-center">{error}</p>}
          <div className="text-xs text-[#3e4943] text-center">
            By signing up you agree to our <a href="/terms" className="text-[#005d42] underline">Terms</a> and <a href="/privacy" className="text-[#005d42] underline">Privacy Policy</a>
          </div>
          <Button type="submit" className="w-full h-12 text-base bg-[#005d42] hover:bg-[#047857] text-white font-bold rounded-lg active:scale-[0.98] transition-all" disabled={loading}>
            {loading ? <WaveBars size="sm" /> : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
