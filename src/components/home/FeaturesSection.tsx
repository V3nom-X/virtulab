import { 
  Zap, 
  Sliders, 
  LineChart, 
  BookOpen, 
  PenTool, 
  Users, 
  Wifi, 
  Brain,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Simulations",
    description: "Physics-accurate experiments running at 60fps with instant visual feedback.",
  },
  {
    icon: Sliders,
    title: "Interactive Controls",
    description: "Adjust variables like mass, temperature, and voltage with precise sliders.",
  },
  {
    icon: LineChart,
    title: "Data Visualization",
    description: "Generate graphs, charts, and tables from your experiment results.",
  },
  {
    icon: BookOpen,
    title: "Guided Learning",
    description: "Step-by-step tutorials with hints, checkpoints, and video demos.",
  },
  {
    icon: PenTool,
    title: "Custom Builder",
    description: "Create your own experiments with drag-and-drop components.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Work together in real-time with synchronized views and chat.",
  },
  {
    icon: Wifi,
    title: "Offline Mode",
    description: "Download experiments and continue learning without internet.",
  },
  {
    icon: Brain,
    title: "AI Assessment",
    description: "Auto-graded quizzes with detailed feedback and certificates.",
  },
  {
    icon: Shield,
    title: "Accessibility",
    description: "WCAG 2.1 compliant with screen reader support and keyboard nav.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Everything You Need to <span className="text-gold">Learn Science</span>
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mt-4 mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            VirtuLab provides a complete virtual laboratory experience with powerful tools 
            for students, teachers, and curious minds
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-card rounded-xl border hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                  idx % 3 === 0 ? 'bg-gold/10' : idx % 3 === 1 ? 'bg-purple/10' : 'bg-midnight/10'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    idx % 3 === 0 ? 'text-gold' : idx % 3 === 1 ? 'text-purple' : 'text-midnight'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
