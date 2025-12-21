import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Palette, 
  Accessibility, 
  Key,
  LogOut,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

const Settings = () => {
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
                <User className="w-5 h-5" />
                <h2 className="font-semibold">Profile</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    BM
                  </div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue="Benjamin Menya" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="benjamin@example.com" className="mt-1.5" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5" />
                <h2 className="font-semibold">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                    <Button variant="secondary" className="flex-1 gap-2">
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
                <Accessibility className="w-5 h-5" />
                <h2 className="font-semibold">Accessibility</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Reduce Motion</p>
                    <p className="text-sm text-muted-foreground">Minimize animations</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">High Contrast</p>
                    <p className="text-sm text-muted-foreground">Increase color contrast</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Color Blind Mode</p>
                    <p className="text-sm text-muted-foreground">Adjust colors for color blindness</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5" />
                <h2 className="font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">New Experiments</p>
                    <p className="text-sm text-muted-foreground">Get notified about new content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Community Updates</p>
                    <p className="text-sm text-muted-foreground">Activity from people you follow</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card rounded-xl border border-destructive/20 p-6">
              <h2 className="font-semibold text-destructive mb-4">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Sign Out</p>
                  <p className="text-sm text-muted-foreground">Sign out from your account</p>
                </div>
                <Button variant="destructive" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
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
