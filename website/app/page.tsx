import { Footer } from "@/components/Footer";
import { GarmentSection } from "@/components/GarmentSection";
import { Header } from "@/components/Header";
import { ImpactSection } from "@/components/ImpactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { StorySection } from "@/components/StorySection";
import { ZonesSection } from "@/components/ZonesSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StorySection />
        <GarmentSection />
        <ZonesSection />
        <ImpactSection />
      </main>
      <Footer />
    </>
  );
}
