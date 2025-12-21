import { Link } from "react-router-dom";
import { Atom, FlaskConical, Dna, Globe } from "lucide-react";

const categories = [
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, waves, electricity, magnetism, and thermodynamics",
    icon: Atom,
    count: 58,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Reactions, molecular structures, acids, bases, and compounds",
    icon: FlaskConical,
    count: 52,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "biology",
    name: "Biology",
    description: "Cells, genetics, ecosystems, anatomy, and evolution",
    icon: Dna,
    count: 48,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "earth-science",
    name: "Earth Science",
    description: "Geology, meteorology, oceanography, and astronomy",
    icon: Globe,
    count: 42,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
];

export function CategoryTiles() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Explore by Category</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Dive deep into your favorite science field or discover something new
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/library?category=${category.id}`}
                className="group block animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`relative p-6 rounded-2xl ${category.bgColor} border border-transparent hover:border-primary/20 transition-all duration-300 hover-lift overflow-hidden`}>
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Count */}
                  <div className="text-sm font-medium text-primary">
                    {category.count} experiments →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
