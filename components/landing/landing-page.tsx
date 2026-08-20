import { Hero } from "@/components/landing/hero"
import { Navbar } from "@/components/landing/navbar"

export function LandingPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <div className="bg-[#001422] text-white">
      <section className="relative">
        <Navbar isAuthenticated={isAuthenticated} />
        <Hero isAuthenticated={isAuthenticated} />
      </section>
    </div>
  )
}
