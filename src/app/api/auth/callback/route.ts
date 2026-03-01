import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"
import { welcomeClient, welcomeWorker } from "@/lib/email/templates"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check user role and redirect accordingly
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        // Send welcome email on first login (created within last 60 seconds)
        const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0
        const isNewUser = Date.now() - createdAt < 60_000
        if (isNewUser && user.email && !user.email.endsWith('@domestiq.app')) {
          const name = user.user_metadata?.full_name || user.email.split('@')[0]
          const email = profile?.role === 'worker'
            ? welcomeWorker(name)
            : welcomeClient(name)
          sendEmail({ to: user.email, ...email }).catch(() => {})
        }

        if (profile?.role === "worker") {
          return NextResponse.redirect(`${origin}/worker-dashboard`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
