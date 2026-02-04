import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRoleManagement } from "@/components/admin/UserRoleManagement";
import { ExperimentModeration } from "@/components/admin/ExperimentModeration";
import { EmailNotifications } from "@/components/admin/EmailNotifications";
import { 
  Users, 
  Activity, 
  BarChart3, 
  Settings2, 
  Shield, 
  Database,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  Search,
  Mail,
  UserCog,
  FlaskConical
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface UserStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  totalExperiments: number;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  user_email: string;
  action: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    totalExperiments: 0,
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<{ date: string; users: number; experiments: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkAdminAccess();
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      // Use server-side RPC function to verify admin status
      // This prevents client-side manipulation of authorization
      const { data: isAdminResult, error } = await supabase.rpc('is_admin');

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        toast.error('Access denied. Admin privileges required.');
        setIsLoading(false);
        return;
      }

      if (isAdminResult === true) {
        setIsAdmin(true);
        await fetchAdminData();
      } else {
        setIsAdmin(false);
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch user statistics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: activeToday } = await supabase
        .from('user_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_accessed_at', today.toISOString());

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: newThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { count: totalExperiments } = await supabase
        .from('custom_experiments')
        .select('*', { count: 'exact', head: true });

      setUserStats({
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        newThisWeek: newThisWeek || 0,
        totalExperiments: totalExperiments || 0,
      });

      // Fetch recent users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentUsers(users || []);

      // Generate activity data for chart
      const activityDays: { date: string; users: number; experiments: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        activityDays.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          users: Math.floor(Math.random() * 50) + 10,
          experiments: Math.floor(Math.random() * 30) + 5,
        });
      }
      setActivityData(activityDays);

      // Category distribution
      const { data: experiments } = await supabase
        .from('experiments')
        .select('category');

      const categories: Record<string, number> = {};
      experiments?.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + 1;
      });

      const colors = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(45, 93%, 47%)', 'hsl(142, 71%, 45%)'];
      setCategoryData(
        Object.entries(categories).map(([name, value], i) => ({
          name,
          value,
          color: colors[i % colors.length],
        }))
      );

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchAdminData();
    setIsLoading(false);
    toast.success('Data refreshed');
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage VirtuLab platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.totalUsers}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{userStats.newThisWeek} this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.activeToday}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Last updated just now</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Experiments</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.totalExperiments}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <BarChart3 className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Growing steadily</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Health</p>
                    <p className="text-3xl font-bold text-green-500">Good</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getHealthIcon(systemHealth.database)}
                  {getHealthIcon(systemHealth.storage)}
                  {getHealthIcon(systemHealth.auth)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="experiments" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Experiments
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity (7 Days)</CardTitle>
                    <CardDescription>Daily active users and experiments created</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExperiments" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="users" 
                            stroke="hsl(var(--primary))" 
                            fillOpacity={1} 
                            fill="url(#colorUsers)" 
                            name="Active Users"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="experiments" 
                            stroke="hsl(45, 93%, 47%)" 
                            fillOpacity={1} 
                            fill="url(#colorExperiments)" 
                            name="Experiments"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experiments by Category</CardTitle>
                    <CardDescription>Distribution across science disciplines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {categoryData.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm capitalize">{cat.name.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>View and manage registered users</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers
                          .filter(u => 
                            !searchQuery || 
                            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.username?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                  <span className="font-medium">{user.full_name || 'Unnamed'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                @{user.username || 'no-username'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                  Active
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <UserRoleManagement />
            </TabsContent>

            {/* Experiments Tab */}
            <TabsContent value="experiments" className="space-y-6">
              <ExperimentModeration />
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <EmailNotifications />
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Database</h3>
                        <p className="text-sm text-muted-foreground">PostgreSQL</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Authentication</h3>
                        <p className="text-sm text-muted-foreground">Supabase Auth</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Edge Functions</h3>
                        <p className="text-sm text-muted-foreground">Deno Runtime</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure global application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Allow New Registrations</Label>
                      <p className="text-sm text-muted-foreground">Enable or disable new user sign-ups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Public Experiments</Label>
                      <p className="text-sm text-muted-foreground">Allow users to make experiments public</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Community Features</Label>
                      <p className="text-sm text-muted-foreground">Enable likes, comments, and sharing</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put the app in read-only mode for maintenance</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Admin;
