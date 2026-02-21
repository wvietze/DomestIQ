import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fullName,
      phone,
      city,
      selectedServices,
      availableDays,
      popiConsent,
      avatarBase64,
      idDocBase64,
      password: customPassword,
    } = body

    if (!fullName || !city || !selectedServices?.length || !popiConsent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Generate a unique Worker ID (DQ + 5 digits)
    let workerCode = ''
    let internalEmail = ''
    let attempts = 0

    while (attempts < 10) {
      const num = Math.floor(10000 + Math.random() * 90000) // 10000-99999
      workerCode = `DQ${num}`
      internalEmail = `dq${num}@domestiq.app`

      // Check if this email already exists
      const { data: existing } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      })

      // Try to create the user — if email collision, retry
      const pwd = customPassword || generatePassword()
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email: internalEmail,
          password: pwd,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: 'worker',
            worker_code: workerCode,
            registered_via: 'helpdesk',
          },
        })

      if (authError) {
        if (
          authError.message?.includes('already') ||
          authError.message?.includes('duplicate')
        ) {
          attempts++
          continue
        }
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      const userId = authData.user.id

      // Create profile
      await admin.from('profiles').upsert({
        id: userId,
        role: 'worker',
        full_name: fullName,
        phone: phone || null,
        popi_consent: popiConsent,
        preferred_language: 'en',
      })

      // Upload avatar if provided
      let avatarUrl = null
      if (avatarBase64) {
        const base64Data = avatarBase64.split(',')[1] || avatarBase64
        const buffer = Buffer.from(base64Data, 'base64')
        const path = `${userId}/avatar.jpg`
        await admin.storage
          .from('avatars')
          .upload(path, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })
        const { data: urlData } = admin.storage
          .from('avatars')
          .getPublicUrl(path)
        avatarUrl = urlData.publicUrl
        await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
      }

      // Create worker profile
      const { data: workerProfile } = await admin
        .from('worker_profiles')
        .insert({
          user_id: userId,
          profile_completeness: calculateCompleteness({
            fullName,
            avatarBase64,
            selectedServices,
            availableDays,
            city,
            idDocBase64,
            popiConsent,
          }),
        })
        .select()
        .single()

      if (workerProfile) {
        // Link services
        const { data: services } = await admin
          .from('services')
          .select('id, name')

        if (services) {
          const serviceLinks = selectedServices
            .map((sId: string) => {
              const svc = services.find(
                (s: { id: string; name: string }) =>
                  s.name.toLowerCase().replace(/\s+/g, '-') === sId
              )
              return svc
                ? { worker_id: workerProfile.id, service_id: svc.id }
                : null
            })
            .filter(Boolean)

          if (serviceLinks.length > 0) {
            await admin.from('worker_services').insert(serviceLinks)
          }
        }

        // Set availability
        if (availableDays?.length > 0) {
          const availabilityRecords = availableDays.map((day: number) => ({
            worker_id: workerProfile.id,
            day_of_week: day,
            is_available: true,
            start_time: '08:00',
            end_time: '17:00',
          }))
          await admin.from('worker_availability').insert(availabilityRecords)
        }
      }

      // Upload ID document if provided
      if (idDocBase64) {
        const base64Data = idDocBase64.split(',')[1] || idDocBase64
        const buffer = Buffer.from(base64Data, 'base64')
        const path = `${userId}/id-document.jpg`
        await admin.storage
          .from('documents')
          .upload(path, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })
        const { data: urlData } = admin.storage
          .from('documents')
          .getPublicUrl(path)
        await admin.from('documents').insert({
          user_id: userId,
          document_type: 'id_document',
          file_url: urlData.publicUrl,
          file_name: 'id-document.jpg',
        })
      }

      // Record consent
      if (popiConsent) {
        await admin.from('consent_records').insert({
          user_id: userId,
          consent_type: 'popi',
          consent_given: true,
          consent_text: 'POPI Act consent given at helpdesk registration',
        })
      }

      return NextResponse.json({
        success: true,
        workerCode,
        password: customPassword || pwd,
        fullName,
        userId,
      })
    }

    return NextResponse.json(
      { error: 'Could not generate unique Worker ID. Please try again.' },
      { status: 500 }
    )
  } catch (err) {
    console.error('Helpdesk registration error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    )
  }
}

function generatePassword(): string {
  // Generate a simple, memorable 6-char password: 3 letters + 3 digits
  const letters = 'abcdefghjkmnpqrstuvwxyz' // removed confusing chars i,l,o
  const digits = '23456789' // removed confusing 0,1
  let pwd = ''
  for (let i = 0; i < 3; i++) pwd += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 3; i++) pwd += digits[Math.floor(Math.random() * digits.length)]
  return pwd
}

function calculateCompleteness(data: {
  fullName: string
  avatarBase64?: string
  selectedServices: string[]
  availableDays: number[]
  city: string
  idDocBase64?: string
  popiConsent: boolean
}): number {
  let score = 0
  if (data.fullName) score += 15
  if (data.avatarBase64) score += 20
  if (data.selectedServices.length > 0) score += 20
  if (data.availableDays.length > 0) score += 15
  if (data.city) score += 15
  if (data.idDocBase64) score += 10
  if (data.popiConsent) score += 5
  return score
}
