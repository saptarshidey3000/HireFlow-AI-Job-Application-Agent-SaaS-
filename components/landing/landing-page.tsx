import { AnalyticsPreview } from "@/components/landing/analytics-preview"
import { ApplicationPreview } from "@/components/landing/application-preview"
import { FeatureSection } from "@/components/landing/feature-section"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { JobDiscovery } from "@/components/landing/job-discovery"
import { Navbar } from "@/components/landing/navbar"
import { ProductIntro } from "@/components/landing/product-intro"
import { SaasSection } from "@/components/landing/saas-section"

export function LandingPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <div className="bg-[#001422] text-white">
      <section className="relative">
        <Navbar isAuthenticated={isAuthenticated} />
        <Hero isAuthenticated={isAuthenticated} />
      </section>
      {/* <ProductIntro />
      <FeatureSection />
      <HowItWorks />
      <JobDiscovery />
      <ApplicationPreview />
      <AnalyticsPreview /> */}
      {/* <SaasSection />
      <FinalCTA />
      <Footer /> */}
    </div>
  )
}
