import { LogoSlider } from "@/components/ui/logo-slider";

const TechLogo = ({ name, color }: { name: string; color: string }) => (
  <div className="flex items-center gap-2 px-3">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${color}20`, color }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{name}</span>
  </div>
);

const logos = [
  <TechLogo key="react" name="React.js" color="#61DAFB" />,
  <TechLogo key="typescript" name="TypeScript" color="#3178C6" />,
  <TechLogo key="tailwind" name="Tailwind CSS" color="#06B6D4" />,
  <TechLogo key="vite" name="Vite" color="#646CFF" />,
  <TechLogo key="threejs" name="Three.js" color="#000000" />,
  <TechLogo key="canvas" name="Canvas API" color="#E44D26" />,
  <TechLogo key="framer" name="Framer Motion" color="#0055FF" />,
  <TechLogo key="gsap" name="GSAP" color="#88CE02" />,
  <TechLogo key="recharts" name="Recharts" color="#8884D8" />,
  <TechLogo key="supabase" name="Cloud DB" color="#3ECF8E" />,
  <TechLogo key="radix" name="Radix UI" color="#1C2024" />,
  <TechLogo key="chartjs" name="Chart.js" color="#FF6384" />,
  <TechLogo key="matterjs" name="Matter.js" color="#4B5562" />,
  <TechLogo key="zod" name="Zod" color="#3068B7" />,
];

export function TechLogos() {
  return (
    <section className="py-12 border-y bg-background">
      <div className="container mb-6">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Built With Modern Technologies
        </p>
      </div>
      <LogoSlider logos={logos} speed={40} direction="left" />
    </section>
  );
}
