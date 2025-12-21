import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Clock, 
  BarChart2, 
  Play,
  Star,
  Atom,
  FlaskConical,
  Dna,
  Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const experiments = [
  { id: 1, title: "Pendulum Motion", category: "Physics", difficulty: "Beginner", duration: "15 min", rating: 4.8, image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop" },
  { id: 2, title: "Chemical Reactions", category: "Chemistry", difficulty: "Intermediate", duration: "20 min", rating: 4.9, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop" },
  { id: 3, title: "Cell Division", category: "Biology", difficulty: "Intermediate", duration: "25 min", rating: 4.7, image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop" },
  { id: 4, title: "Plate Tectonics", category: "Earth Science", difficulty: "Beginner", duration: "18 min", rating: 4.6, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop" },
  { id: 5, title: "Electric Circuits", category: "Physics", difficulty: "Advanced", duration: "30 min", rating: 4.9, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
  { id: 6, title: "Acid-Base Titration", category: "Chemistry", difficulty: "Intermediate", duration: "22 min", rating: 4.5, image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop" },
  { id: 7, title: "DNA Extraction", category: "Biology", difficulty: "Beginner", duration: "20 min", rating: 4.8, image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=300&fit=crop" },
  { id: 8, title: "Weather Patterns", category: "Earth Science", difficulty: "Intermediate", duration: "25 min", rating: 4.4, image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop" },
  { id: 9, title: "Projectile Motion", category: "Physics", difficulty: "Intermediate", duration: "18 min", rating: 4.7, image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400&h=300&fit=crop" },
  { id: 10, title: "Photosynthesis", category: "Biology", difficulty: "Beginner", duration: "15 min", rating: 4.6, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop" },
  { id: 11, title: "Electrochemistry", category: "Chemistry", difficulty: "Advanced", duration: "35 min", rating: 4.8, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
  { id: 12, title: "Solar System", category: "Earth Science", difficulty: "Beginner", duration: "20 min", rating: 4.9, image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop" },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Physics": Atom,
  "Chemistry": FlaskConical,
  "Biology": Dna,
  "Earth Science": Globe,
};

const Library = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || exp.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Experiment Library</h1>
            <p className="text-muted-foreground">
              Browse 200+ interactive science simulations across all disciplines
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b sticky top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search experiments..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Earth Science">Earth Science</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container">
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredExperiments.length} experiments
            </p>

            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredExperiments.map((exp, idx) => {
                  const Icon = categoryIcons[exp.category] || Atom;
                  return (
                    <Link
                      key={exp.id}
                      to={`/workspace?experiment=${exp.id}`}
                      className="group block animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="bg-card rounded-xl border overflow-hidden hover-lift">
                        <div className="relative h-40">
                          <img
                            src={exp.image}
                            alt={exp.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                            </div>
                          </div>
                          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
                            <Icon className="w-3 h-3 mr-1" />
                            {exp.category}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart2 className="w-3 h-3" />
                              {exp.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exp.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              {exp.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExperiments.map((exp, idx) => {
                  const Icon = categoryIcons[exp.category] || Atom;
                  return (
                    <Link
                      key={exp.id}
                      to={`/workspace?experiment=${exp.id}`}
                      className="group block animate-fade-in"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/30 transition-all">
                        <img
                          src={exp.image}
                          alt={exp.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              <Icon className="w-3 h-3 mr-1" />
                              {exp.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{exp.difficulty}</span>
                            <span>{exp.duration}</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              {exp.rating}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Play className="w-5 h-5" />
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </Layout>
  );
};

export default Library;
