import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Upload, 
  Star, 
  MessageSquare, 
  Trophy, 
  TrendingUp,
  Heart,
  Eye,
  Clock
} from "lucide-react";

const communityExperiments = [
  { id: 1, title: "Electromagnetic Induction", author: "PhysicsNerd42", likes: 234, views: 1.2, comments: 18, rating: 4.9, category: "Physics" },
  { id: 2, title: "Enzyme Activity Lab", author: "BioExplorer", likes: 189, views: 0.8, comments: 24, rating: 4.7, category: "Biology" },
  { id: 3, title: "Crystal Growth Simulation", author: "ChemWizard", likes: 312, views: 2.1, comments: 45, rating: 4.8, category: "Chemistry" },
  { id: 4, title: "Earthquake Wave Propagation", author: "EarthSciGuru", likes: 156, views: 0.9, comments: 12, rating: 4.6, category: "Earth Science" },
];

const leaderboard = [
  { rank: 1, name: "PhysicsNerd42", points: 12450, experiments: 28 },
  { rank: 2, name: "ChemWizard", points: 11200, experiments: 24 },
  { rank: 3, name: "BioExplorer", points: 9800, experiments: 19 },
  { rank: 4, name: "EarthSciGuru", points: 8900, experiments: 17 },
  { rank: 5, name: "ScienceKid99", points: 7600, experiments: 15 },
];

const Community = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Community Hub</h1>
                <p className="text-muted-foreground">
                  Discover, share, and collaborate on experiments with the VirtuLab community
                </p>
              </div>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Experiment
              </Button>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="trending">
                <div className="flex items-center justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="trending" className="gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger value="new" className="gap-1.5">
                      <Clock className="w-4 h-4" />
                      New
                    </TabsTrigger>
                    <TabsTrigger value="top" className="gap-1.5">
                      <Star className="w-4 h-4" />
                      Top Rated
                    </TabsTrigger>
                  </TabsList>

                  <div className="relative w-64 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search community..." className="pl-10" />
                  </div>
                </div>

                <TabsContent value="trending" className="space-y-4">
                  {communityExperiments.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-all animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{exp.category}</Badge>
                            <span className="flex items-center gap-1 text-sm text-warning">
                              <Star className="w-3 h-3 fill-current" />
                              {exp.rating}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-1 hover:text-primary cursor-pointer transition-colors">
                            {exp.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            by <span className="text-foreground font-medium">{exp.author}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {exp.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {exp.views}k
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {exp.comments}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Try It
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="new">
                  <div className="text-center py-12 text-muted-foreground">
                    New experiments will appear here
                  </div>
                </TabsContent>

                <TabsContent value="top">
                  <div className="text-center py-12 text-muted-foreground">
                    Top rated experiments will appear here
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-warning" />
                  <h3 className="font-semibold">Top Contributors</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div key={user.rank} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.rank === 1 ? "bg-warning text-warning-foreground" :
                        user.rank === 2 ? "bg-muted-foreground/30 text-foreground" :
                        user.rank === 3 ? "bg-orange-500/20 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {user.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.experiments} experiments</p>
                      </div>
                      <div className="text-sm font-medium text-primary">{user.points.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-4">Active Challenges</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Winter Physics Challenge</h4>
                    <p className="text-xs text-muted-foreground mb-2">Create a simulation involving heat transfer</p>
                    <Badge variant="secondary" className="text-xs">5 days left</Badge>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Biology Visualization</h4>
                    <p className="text-xs text-muted-foreground mb-2">Build an interactive cell model</p>
                    <Badge variant="secondary" className="text-xs">12 days left</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Community;
