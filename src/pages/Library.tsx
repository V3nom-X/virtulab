import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodicTable } from "@/components/chemistry/PeriodicTable";
import { useExperiments } from "@/hooks/useExperiments";
import { getExperimentThumbnail } from "@/data/experimentThumbnails";
import { 
  Search, Grid3X3, List, Clock, BarChart2, Play,
  Atom, FlaskConical, Dna, Globe, Table2, Loader2
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "physics": Atom,
  "chemistry": FlaskConical,
  "biology": Dna,
  "earth_science": Globe,
};

const Library = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState("experiments");

  const { data: experiments = [], isLoading } = useExperiments(
    selectedCategory === "all" ? undefined : selectedCategory,
    selectedDifficulty === "all" ? undefined : selectedDifficulty
  );

  const filteredExperiments = experiments.filter((exp) => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Experiment <span className="text-gold">Library</span></h1>
            <p className="text-muted-foreground">Browse interactive science simulations</p>
          </div>
        </section>

        <section className="py-6 border-b bg-background/95 backdrop-blur-sm z-40">
          <div className="container">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <TabsList>
                  <TabsTrigger value="experiments">Experiments</TabsTrigger>
                  <TabsTrigger value="periodic-table" className="gap-1 data-[state=active]:bg-purple data-[state=active]:text-purple-foreground">
                    <Table2 className="w-4 h-4" />
                    Periodic Table
                  </TabsTrigger>
                </TabsList>

                {activeTab === "experiments" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search experiments..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="earth_science">Earth Science</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                      <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </section>

        <section className="py-8">
          <div className="container">
            {activeTab === "experiments" && (
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">
                      Showing {filteredExperiments.length} experiments
                    </p>
                    <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                      {filteredExperiments.map((exp, idx) => {
                        const Icon = categoryIcons[exp.category] || Atom;
                        return (
                          <Link
                            key={exp.id}
                            to={`/workspace?experiment=${exp.id}&type=${exp.simulation_type || 'pendulum'}`}
                            className="group block animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className={viewMode === "grid" ? "bg-card rounded-xl border overflow-hidden hover-lift" : "flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/30 transition-all"}>
                              {viewMode === "grid" ? (
                                <>
                                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                                    {(() => {
                                      const thumb = getExperimentThumbnail(exp.simulation_type);
                                      return thumb ? (
                                        <img src={thumb} alt={exp.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Icon className="w-16 h-16 text-primary/50" />
                                      );
                                    })()}
                                    <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm capitalize">
                                      <Icon className="w-3 h-3 mr-1" />
                                      {exp.category.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="p-4">
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{exp.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1 capitalize"><BarChart2 className="w-3 h-3" />{exp.difficulty}</span>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exp.duration_minutes} min</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                                    {(() => {
                                      const thumb = getExperimentThumbnail(exp.simulation_type);
                                      return thumb ? (
                                        <img src={thumb} alt={exp.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Icon className="w-8 h-8 text-primary/50" />
                                      );
                                    })()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Badge variant="secondary" className="text-xs capitalize mb-1"><Icon className="w-3 h-3 mr-1" />{exp.category.replace('_', ' ')}</Badge>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{exp.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 capitalize">
                                      <span>{exp.difficulty}</span>
                                      <span>{exp.duration_minutes} min</span>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="shrink-0"><Play className="w-5 h-5" /></Button>
                                </>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === "periodic-table" && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Interactive Periodic Table</h2>
                <p className="text-muted-foreground mb-6">Click on any element to view details. Filter by phase or category.</p>
                <PeriodicTable />
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
