import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  Upload, 
  Star, 
  MessageSquare, 
  Trophy, 
  TrendingUp,
  Heart,
  Eye,
  Clock,
  Loader2
} from "lucide-react";

interface CommunityExperiment {
  id: string;
  title: string;
  description: string | null;
  author: string;
  likes: number;
  comments: number;
  created_at: string;
  user_id: string;
  is_liked?: boolean;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  experiments: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: string;
  end_date: string;
  points: number;
}

const Community = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState<CommunityExperiment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, [user]);

  const fetchCommunityData = async () => {
    try {
      // Fetch public experiments
      const { data: expData } = await supabase
        .from('custom_experiments')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      // Fetch likes count for each experiment
      const experimentsWithStats = await Promise.all(
        (expData || []).map(async (exp) => {
          const { count: likesCount } = await supabase
            .from('experiment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('experiment_id', exp.id);

          const { count: commentsCount } = await supabase
            .from('experiment_comments')
            .select('*', { count: 'exact', head: true })
            .eq('experiment_id', exp.id);

          // Check if current user liked this experiment
          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('experiment_likes')
              .select('id')
              .eq('experiment_id', exp.id)
              .eq('user_id', user.id)
              .single();
            isLiked = !!likeData;
          }

          // Get author profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', exp.user_id)
            .single();

          return {
            id: exp.id,
            title: exp.title,
            description: exp.description,
            author: profile?.username || profile?.full_name || 'Anonymous',
            likes: likesCount || 0,
            comments: commentsCount || 0,
            created_at: exp.created_at,
            user_id: exp.user_id,
            is_liked: isLiked,
          };
        })
      );

      setExperiments(experimentsWithStats);

      // Fetch challenges
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });

      setChallenges(challengeData || []);

      // Build leaderboard from user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, score')
        .eq('completed', true);

      // Aggregate scores by user
      const userScores: Record<string, number> = {};
      const userExperiments: Record<string, number> = {};
      
      (progressData || []).forEach(p => {
        userScores[p.user_id] = (userScores[p.user_id] || 0) + (p.score || 10);
        userExperiments[p.user_id] = (userExperiments[p.user_id] || 0) + 1;
      });

      // Get profiles for top users
      const topUserIds = Object.entries(userScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', topUserIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p.username || p.full_name || 'Anonymous'])
      );

      const leaderboardData = topUserIds.map((userId, idx) => ({
        rank: idx + 1,
        name: profileMap.get(userId) || 'Anonymous',
        points: userScores[userId] || 0,
        experiments: userExperiments[userId] || 0,
      }));

      setLeaderboard(leaderboardData);

    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (experimentId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast.error('Please sign in to like experiments');
      return;
    }

    try {
      if (currentlyLiked) {
        await supabase
          .from('experiment_likes')
          .delete()
          .eq('experiment_id', experimentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('experiment_likes')
          .insert({ experiment_id: experimentId, user_id: user.id });
      }

      // Update local state
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId 
          ? { 
              ...exp, 
              is_liked: !currentlyLiked, 
              likes: currentlyLiked ? exp.likes - 1 : exp.likes + 1 
            }
          : exp
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filteredExperiments = experiments.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
              <Button className="gap-2" disabled>
                <Upload className="w-4 h-4" />
                Build an Experiment
                <Badge variant="secondary" className="ml-1 text-[10px]">Coming Soon</Badge>
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
                    <Input 
                      placeholder="Search community..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <TabsContent value="trending" className="space-y-4">
                  {filteredExperiments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No experiments found. Be the first to share!</p>
                    </div>
                  ) : (
                    filteredExperiments
                      .sort((a, b) => b.likes - a.likes)
                      .map((exp, idx) => (
                        <div
                          key={exp.id}
                          className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-all animate-fade-in"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1 hover:text-primary cursor-pointer transition-colors">
                                {exp.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                by <span className="text-foreground font-medium">{exp.author}</span>
                              </p>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {exp.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <button 
                                  className={`flex items-center gap-1 transition-colors ${
                                    exp.is_liked ? 'text-red-500' : 'hover:text-red-500'
                                  }`}
                                  onClick={() => handleLike(exp.id, exp.is_liked || false)}
                                >
                                  <Heart className={`w-4 h-4 ${exp.is_liked ? 'fill-current' : ''}`} />
                                  {exp.likes}
                                </button>
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
                      ))
                  )}
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                  {filteredExperiments
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((exp, idx) => (
                      <div
                        key={exp.id}
                        className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-all animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{exp.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              by <span className="text-foreground font-medium">{exp.author}</span>
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <button 
                                className={`flex items-center gap-1 ${exp.is_liked ? 'text-red-500' : ''}`}
                                onClick={() => handleLike(exp.id, exp.is_liked || false)}
                              >
                                <Heart className={`w-4 h-4 ${exp.is_liked ? 'fill-current' : ''}`} />
                                {exp.likes}
                              </button>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {exp.comments}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Try It</Button>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="top" className="space-y-4">
                  {filteredExperiments
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 10)
                    .map((exp, idx) => (
                      <div
                        key={exp.id}
                        className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-all animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              idx === 0 ? 'bg-yellow-500 text-white' :
                              idx === 1 ? 'bg-gray-400 text-white' :
                              idx === 2 ? 'bg-orange-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{exp.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {exp.author} • {exp.likes} likes
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Try It</Button>
                        </div>
                      </div>
                    ))}
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
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No contributors yet</p>
                  ) : (
                    leaderboard.map((user) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Challenges */}
              <div className="bg-card rounded-xl border p-5 relative overflow-hidden">
                <h3 className="font-semibold mb-2">Active Challenges</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compete in weekly science challenges and earn points.
                </p>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
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
