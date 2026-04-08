import { HeroSection } from '@/components/HeroSection'
import { InteractiveDemo } from '@/components/InteractiveDemo'
import { InstallSection } from '@/components/InstallSection'
import { PatternSection } from '@/components/PatternSection'
import { PrimitivesSection } from '@/components/PrimitivesSection'
import { CliSection } from '@/components/CliSection'
import { FooterSection } from '@/components/FooterSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <InteractiveDemo />
      <InstallSection />
      <PatternSection />
      <PrimitivesSection />
      <CliSection />
      <FooterSection />
    </main>
  )
}
