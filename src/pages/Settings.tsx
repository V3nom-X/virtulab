import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { MfaSettings } from "@/components/settings/MfaSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Bell, 
  Palette, 
  Accessibility, 
  LogOut,
  Moon,
  Sun,
  Monitor,
  Loader2,
  Camera,
  Trash2
} from "lucide-react";
import { useTheme } from "next-themes";

interface Preferences {
  reduce_motion: boolean;
  high_contrast: boolean;
  color_blind_mode: boolean;
  parallax_enabled: boolean;
  cinematic_video_enabled: boolean;
  email_notifications: boolean;
  new_experiments_notifications: boolean;
  community_updates_notifications: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut, deleteAccount, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  const [preferences, setPreferences] = useState<Preferences>({
    reduce_motion: false,
    high_contrast: false,
    color_blind_mode: false,
    parallax_enabled: true,
    cinematic_video_enabled: true,
    email_notifications: true,
    new_experiments_notifications: true,
    community_updates_notifications: false
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || profile.username || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences({
        reduce_motion: data.reduce_motion || false,
        high_contrast: data.high_contrast || false,
        color_blind_mode: data.color_blind_mode || false,
        parallax_enabled: (data as any).parallax_enabled !== false,
        cinematic_video_enabled: (data as any).cinematic_video_enabled !== false,
        email_notifications: data.email_notifications ?? true,
        new_experiments_notifications: data.new_experiments_notifications ?? true,
        community_updates_notifications: data.community_updates_notifications || false
      });
    }
  };

  const savePreferences = async (newPrefs: Partial<Preferences>) => {
    if (!user) return;
    
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ 
        user_id: user.id,
        ...updatedPrefs
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    const { error } = await updateProfile({ 
      full_name: displayName 
    });
    
    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Profile updated!');
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await deleteAccount();
    
    if (error) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    } else {
      toast.success('Account deleted');
      navigate('/');
    }
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="max-w-2xl space-y-8">
            {/* Profile Section */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gold" />
                <h2 className="font-semibold">Profile</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        getInitials()
                      )}
                    </div>
                  </div>
                  <label>
                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                      <span>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        Change Avatar
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      disabled
                      className="mt-1.5" 
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>

            <MfaSettings />

            {/* Appearance */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-purple" />
                <h2 className="font-semibold">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="flex gap-3">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'} 
                      className="flex-1 gap-2"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'} 
                      className="flex-1 gap-2"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'} 
                      className="flex-1 gap-2"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="w-4 h-4" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Accessibility className="w-5 h-5 text-midnight" />
                <h2 className="font-semibold">Accessibility</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Reduce Motion</p>
                    <p className="text-sm text-muted-foreground break-words">Minimize animations across the app</p>
                  </div>
                  <Switch 
                    className="shrink-0"
                    aria-label="Reduce motion"
                    checked={preferences.reduce_motion}
                    onCheckedChange={(checked) => savePreferences({ reduce_motion: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Parallax Effects</p>
                    <p className="text-sm text-muted-foreground break-words">
                      Subtle scroll-driven motion. {preferences.reduce_motion && "Disabled while Reduce Motion is on."}
                    </p>
                  </div>
                  <Switch 
                    className="shrink-0"
                    aria-label="Parallax effects"
                    checked={preferences.parallax_enabled && !preferences.reduce_motion}
                    disabled={preferences.reduce_motion}
                    onCheckedChange={(checked) => savePreferences({ parallax_enabled: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Cinematic Video Motion</p>
                    <p className="text-sm text-muted-foreground break-words">
                      Autoplay the cinematic lab background video on the home page. {preferences.reduce_motion && "Disabled while Reduce Motion is on."}
                    </p>
                  </div>
                  <Switch
                    className="shrink-0"
                    aria-label="Cinematic video motion"
                    checked={preferences.cinematic_video_enabled && !preferences.reduce_motion}
                    disabled={preferences.reduce_motion}
                    onCheckedChange={(checked) => savePreferences({ cinematic_video_enabled: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">High Contrast</p>
                    <p className="text-sm text-muted-foreground break-words">Increase color contrast</p>
                  </div>
                  <Switch 
                    className="shrink-0"
                    aria-label="High contrast"
                    checked={preferences.high_contrast}
                    onCheckedChange={(checked) => savePreferences({ high_contrast: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Color Blind Mode</p>
                    <p className="text-sm text-muted-foreground break-words">Adjust colors for color blindness</p>
                  </div>
                  <Switch 
                    className="shrink-0"
                    aria-label="Color blind mode"
                    checked={preferences.color_blind_mode}
                    onCheckedChange={(checked) => savePreferences({ color_blind_mode: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border p-6 opacity-60">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5" />
                <h2 className="font-semibold">Notifications</h2>
                <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  Coming Soon
                </span>
              </div>
              <div className="space-y-4 pointer-events-none">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-sm text-muted-foreground break-words">Receive updates via email</p>
                  </div>
                  <Switch className="shrink-0" aria-label="Email notifications" checked={preferences.email_notifications} disabled />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">New Experiments</p>
                    <p className="text-sm text-muted-foreground break-words">Get notified about new content</p>
                  </div>
                  <Switch className="shrink-0" aria-label="New experiments notifications" checked={preferences.new_experiments_notifications} disabled />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Community Updates</p>
                    <p className="text-sm text-muted-foreground break-words">Activity from people you follow</p>
                  </div>
                  <Switch className="shrink-0" aria-label="Community updates notifications" checked={preferences.community_updates_notifications} disabled />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Email notifications will be available in a future update
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-card rounded-xl border border-destructive/20 p-6">
              <h2 className="font-semibold text-destructive mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Sign out from your account</p>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-2" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data including experiments, progress, and badges.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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

export default Settings;
