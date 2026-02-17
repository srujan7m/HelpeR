import { Navbar } from '@/components/marketing/navbar'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { Workflow } from '@/components/marketing/workflow'
import { Testimonials } from '@/components/marketing/testimonials'
import { CTA } from '@/components/marketing/cta'
import { Footer } from '@/components/marketing/footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  )
}
