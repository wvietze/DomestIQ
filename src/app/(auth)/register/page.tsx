import Link from "next/link"
import { Briefcase, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
          <Card className="h-full transition-shadow hover:shadow-md hover:border-primary/50">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                I&apos;m a Worker
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find households that need your skills
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Client Card */}
        <Link href="/register/client" className="group">
          <Card className="h-full transition-shadow hover:shadow-md hover:border-primary/50">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Search className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                I&apos;m looking for a Worker
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find trusted workers near you
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </p>
    </div>
  )
}
