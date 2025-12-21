import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BookOpen,
  Beaker,
  CheckCircle2,
  Calendar
} from "lucide-react";

const recentActivity = [
  { id: 1, title: "Pendulum Motion", date: "Today", duration: "15 min", status: "Completed" },
  { id: 2, title: "Electric Circuits", date: "Yesterday", duration: "28 min", status: "In Progress" },
  { id: 3, title: "Cell Division", date: "Dec 18", duration: "22 min", status: "Completed" },
  { id: 4, title: "Chemical Reactions", date: "Dec 17", duration: "18 min", status: "Completed" },
];

const badges = [
  { id: 1, name: "First Experiment", icon: "🎯", earned: true },
  { id: 2, name: "Physics Pro", icon: "⚡", earned: true },
  { id: 3, name: "Chemistry Starter", icon: "🧪", earned: true },
  { id: 4, name: "Biology Beginner", icon: "🧬", earned: false },
  { id: 5, name: "Week Streak", icon: "🔥", earned: true },
  { id: 6, name: "Master Builder", icon: "🏗️", earned: false },
];

const Analytics = () => {
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
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Experiments Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+3 this week</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8.5h</p>
                  <p className="text-sm text-muted-foreground">Total Learning Time</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+2.1h this week</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                <span>+5% improvement</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                2 more to unlock
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Physics</span>
                      <span className="text-sm text-muted-foreground">12/58 experiments</span>
                    </div>
                    <Progress value={21} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Chemistry</span>
                      <span className="text-sm text-muted-foreground">6/52 experiments</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Biology</span>
                      <span className="text-sm text-muted-foreground">4/48 experiments</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Earth Science</span>
                      <span className="text-sm text-muted-foreground">2/42 experiments</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
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
                  ))}
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
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                      badge.earned 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/50 opacity-50"
                    }`}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-[10px] text-center font-medium leading-tight">{badge.name}</span>
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
