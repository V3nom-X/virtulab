import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedExperiments } from "@/components/home/FeaturedExperiments";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { Footer } from "@/components/home/Footer";
import ShaderBackground from "@/components/ui/ShaderBackground";

const Index = () => {
  return (
    <Layout stickyNav>
      <ShaderBackground />
      <HeroSection />
      <FeaturedExperiments />
      <CategoryTiles />
      <FeaturesSection />
      <Footer />
    </Layout>
  );
};

export default Index;
