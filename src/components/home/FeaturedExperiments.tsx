import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, BarChart2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const experiments = [
  {
    id: 1,
    title: "Pendulum Motion",
    description: "Explore simple harmonic motion and discover how length, mass, and gravity affect oscillation.",
    category: "Physics",
    difficulty: "Beginner",
    duration: "15 min",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 2,
    title: "Chemical Reactions",
    description: "Mix virtual chemicals and observe reaction rates, color changes, and precipitate formation.",
    category: "Chemistry",
    difficulty: "Intermediate",
    duration: "20 min",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: 3,
    title: "Cell Division",
    description: "Watch mitosis and meiosis unfold in real-time with interactive controls for each phase.",
    category: "Biology",
    difficulty: "Intermediate",
    duration: "25 min",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: 4,
    title: "Plate Tectonics",
    description: "Simulate continental drift and explore how earthquakes and volcanoes form at plate boundaries.",
    category: "Earth Science",
    difficulty: "Beginner",
    duration: "18 min",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: 5,
    title: "Electric Circuits",
    description: "Build virtual circuits with resistors, capacitors, and LEDs. Measure voltage and current in real-time.",
    category: "Physics",
    difficulty: "Advanced",
    duration: "30 min",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    color: "from-yellow-500/20 to-amber-500/20",
  },
];

export function FeaturedExperiments() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % experiments.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + experiments.length) % experiments.length);
  };

  const visibleExperiments = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % experiments.length;
      items.push(experiments[index]);
    }
    return items;
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured <span className="text-gold">Experiments</span></h2>
            <p className="text-muted-foreground max-w-lg">
              Hand-picked simulations to jumpstart your scientific exploration
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full hover:border-midnight hover:text-midnight">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full hover:border-midnight hover:text-midnight">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleExperiments().map((experiment, idx) => (
            <Link
              key={experiment.id}
              to={`/workspace?experiment=${experiment.id}`}
              className={`group block animate-scale-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative bg-card rounded-2xl overflow-hidden border hover-lift">
                {/* Image */}
                <div className={`relative h-48 bg-gradient-to-br ${experiment.color}`}>
                  <img
                    src={experiment.image}
                    alt={experiment.title}
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge className="absolute top-4 left-4 bg-background/80 text-foreground backdrop-blur-sm">
                    {experiment.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {experiment.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {experiment.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4" />
                      {experiment.difficulty}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {experiment.duration}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-1">
            {experiments.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={next} className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/library">
            <Button variant="outline" size="lg">
              View All Experiments
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
