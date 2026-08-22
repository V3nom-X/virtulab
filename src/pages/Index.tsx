import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ParallaxVideoSection } from "@/components/home/ParallaxVideoSection";
import { FeaturedExperiments } from "@/components/home/FeaturedExperiments";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TechLogos } from "@/components/home/TechLogos";
import { Footer } from "@/components/home/Footer";
import ShaderBackground from "@/components/ui/ShaderBackground";
import { WeeklyDropStrip } from "@/components/home/WeeklyDropStrip";

const Index = () => {
  return (
    <Layout showNav>
      <ShaderBackground />
      <HeroSection />
      <WeeklyDropStrip />
      <ParallaxVideoSection />
      <CategoryTiles />
      <FeaturesSection />
      <TechLogos />
      <Footer />
    </Layout>
  );
};

export default Index;
