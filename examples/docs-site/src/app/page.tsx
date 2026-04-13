import { HeroSection } from '@/components/HeroSection'
import { InstallSection } from '@/components/InstallSection'
import { PatternSection } from '@/components/PatternSection'
import { PrimitivesSection } from '@/components/PrimitivesSection'
import { CustomizationSection } from '@/components/CustomizationSection'
import { CliSection } from '@/components/CliSection'
import { FooterSection } from '@/components/FooterSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <InstallSection />
      <PatternSection />
      <PrimitivesSection />
      <CustomizationSection />
      <CliSection />
      <FooterSection />
    </main>
  )
}
