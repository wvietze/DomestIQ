import Link from "next/link"
import { Briefcase, Search, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Join DomestIQ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you want to use DomestIQ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Worker Card */}
        <Link href="/register/worker" className="group">
          <div className="relative h-full rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 p-6 text-center card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                I&apos;m a Worker
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find households that need your skills
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Client Card */}
        <Link href="/register/client" className="group">
          <div className="relative h-full rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 p-6 text-center card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
                <Search className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                I&apos;m looking for a Worker
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find trusted workers near you
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  )
}
