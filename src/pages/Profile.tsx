import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Camera, Award, Beaker, Clock, Target, Heart, Edit2, Save, X, Loader2
} from "lucide-react";

interface UserStats {
  experimentsCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  badgesEarned: number;
}

interface EarnedBadge {
  id: string;
  name: string;
  icon: string;
  earned_at: string;
}

interface FavoriteChannel {
  id: string;
  channel_id: string;
  channel_name: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: ''
  });
  
  const [stats, setStats] = useState<UserStats>({
    experimentsCompleted: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    badgesEarned: 0
  });
  
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [favoriteChannels, setFavoriteChannels] = useState<FavoriteChannel[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchBadges();
      fetchFavoriteChannels();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', user.id);

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id);

      const completed = progress?.filter(p => p.completed)?.length || 0;
      const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0;
      const avgScore = quizResults?.length 
        ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
        : 0;

      setStats({
        experimentsCompleted: completed,
        totalTimeSpent: totalTime,
        averageScore: avgScore,
        badgesEarned: userBadges?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBadges = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_badges')
        .select('id, earned_at, badges(name, icon)')
        .eq('user_id', user.id);

      if (data) {
        setBadges(data.map((b: any) => ({
          id: b.id,
          name: b.badges?.name || 'Unknown',
          icon: b.badges?.icon || '🏆',
          earned_at: b.earned_at
        })));
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchFavoriteChannels = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('favorite_channels')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        setFavoriteChannels(data);
      }
    } catch (error) {
      console.error('Error fetching favorite channels:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(editForm);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      toast.success('Avatar updated!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    }
    
    setIsUploading(false);
  };

  const removeFavoriteChannel = async (id: string) => {
    const { error } = await supabase
      .from('favorite_channels')
      .delete()
      .eq('id', id);

    if (!error) {
      setFavoriteChannels(prev => prev.filter(c => c.id !== id));
      toast.success('Channel removed from favorites');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
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

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{profile?.full_name || profile?.username || 'User'}</h1>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {profile?.username && <p className="text-muted-foreground">@{profile.username}</p>}
                    {profile?.bio && <p className="text-sm mt-2">{profile.bio}</p>}
                    <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-midnight/20 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.experimentsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Experiments</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-gold/20 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-purple/20 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-midnight/20 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-midnight/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-midnight" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.badgesEarned}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="badges">
            <TabsList>
              <TabsTrigger value="badges" className="gap-2 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
                <Award className="w-4 h-4" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="mt-6">
              <div className="bg-card rounded-xl border border-purple/20 p-6">
                <h3 className="font-semibold mb-4">Earned Badges</h3>
                {badges.length === 0 ? (
                  <p className="text-muted-foreground">No badges earned yet. Complete experiments to earn badges!</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <span className="text-3xl mb-2 block">{badge.icon}</span>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Favorite Channels</h3>
                {favoriteChannels.length === 0 ? (
                  <p className="text-muted-foreground">No favorite channels yet. Visit the Videos page to save your favorites!</p>
                ) : (
                  <div className="space-y-3">
                    {favoriteChannels.map((channel) => (
                      <div key={channel.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{channel.channel_name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFavoriteChannel(channel.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Profile;
