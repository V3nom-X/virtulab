import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BookOpen,
  Beaker,
  CheckCircle2,
  Calendar,
  Loader2
} from "lucide-react";

interface UserStats {
  experimentsCompleted: number;
  totalTimeSeconds: number;
  averageScore: number;
  badgesEarned: number;
  weeklyExperiments: number;
  weeklyTime: number;
}

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string;
}

interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

interface CategoryProgress {
  name: string;
  completed: number;
  total: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    experimentsCompleted: 0,
    totalTimeSeconds: 0,
    averageScore: 0,
    badgesEarned: 0,
    weeklyExperiments: 0,
    weeklyTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*, experiments(*)')
        .eq('user_id', user.id);

      // Fetch quiz results
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', user.id);

      // Fetch user badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, badges(*)')
        .eq('user_id', user.id);

      // Fetch all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*');

      // Calculate stats
      const completed = progressData?.filter(p => p.completed) || [];
      const totalTime = progressData?.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) || 0;
      const avgScore = quizData?.length 
        ? quizData.reduce((acc, q) => acc + q.score, 0) / quizData.length 
        : 0;

      // Weekly stats (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyProgress = progressData?.filter(p => 
        p.completed_at && new Date(p.completed_at) > weekAgo
      ) || [];

      setStats({
        experimentsCompleted: completed.length,
        totalTimeSeconds: totalTime,
        averageScore: Math.round(avgScore),
        badgesEarned: userBadges?.length || 0,
        weeklyExperiments: weeklyProgress.length,
        weeklyTime: weeklyProgress.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0),
      });

      // Recent activity
      const recent = (progressData || [])
        .sort((a, b) => new Date(b.last_accessed_at || 0).getTime() - new Date(a.last_accessed_at || 0).getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          title: (p.experiments as any)?.title || 'Unknown Experiment',
          date: formatDate(p.last_accessed_at),
          duration: formatDuration(p.time_spent_seconds || 0),
          status: p.completed ? 'Completed' : 'In Progress',
        }));
      setRecentActivity(recent);

      // Badges
      const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      const formattedBadges = (allBadges || []).map(b => ({
        id: b.id,
        name: b.name,
        icon: b.icon || '🏆',
        earned: earnedBadgeIds.has(b.id),
      }));
      setBadges(formattedBadges);

      // Category progress - use actual experiment counts from DB
      const { data: allExperiments } = await supabase
        .from('experiments')
        .select('id, category');

      const categories = ['physics', 'chemistry', 'biology', 'earth_science'];
      const categoryData = categories.map(cat => {
        const totalInCategory = allExperiments?.filter(e => e.category === cat).length || 0;
        const catExperiments = progressData?.filter(p => 
          (p.experiments as any)?.category === cat
        ) || [];
        const catCompleted = catExperiments.filter(p => p.completed).length;
        return {
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
          completed: catCompleted,
          total: totalInCategory || 1,
        };
      });
      setCategoryProgress(categoryData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sign in to view analytics</h2>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your learning progress and achievements
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.experimentsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Experiments Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+{stats.weeklyExperiments} this week</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatTotalTime(stats.totalTimeSeconds)}</p>
                  <p className="text-sm text-muted-foreground">Total Learning Time</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+{formatTotalTime(stats.weeklyTime)} this week</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                Based on {stats.experimentsCompleted} quizzes
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.badgesEarned}</p>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {badges.length - stats.badgesEarned} more to unlock
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress by Category */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Progress by Category
                </h3>
                <div className="space-y-5">
                  {categoryProgress.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {cat.completed}/{cat.total} experiments
                        </span>
                      </div>
                      <Progress value={(cat.completed / cat.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Beaker className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.date} • {activity.duration}</p>
                        </div>
                        <Badge variant={activity.status === "Completed" ? "default" : "secondary"}>
                          {activity.status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 9).map((badge) => (
                  <div
                    key={badge.id}
                    className={`min-h-[92px] rounded-xl flex flex-col items-center justify-center gap-1 p-2.5 text-center overflow-hidden min-w-0 transition-all ${
                      badge.earned 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/50 opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-2xl shrink-0 leading-none">{badge.icon}</span>
                    <span className="text-[10px] font-medium leading-tight break-words line-clamp-2 w-full px-0.5">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Analytics;
