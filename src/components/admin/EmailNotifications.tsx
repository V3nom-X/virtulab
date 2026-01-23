import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users, 
  Bell, 
  Settings2, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to VirtuLab! 🔬",
    body: "Hello {{name}},\n\nWelcome to VirtuLab! We're excited to have you join our community of science enthusiasts.\n\nGet started by exploring our library of interactive experiments.\n\nBest,\nThe VirtuLab Team",
    isActive: true
  },
  {
    id: "experiment_shared",
    name: "Experiment Shared",
    subject: "Someone shared an experiment with you!",
    body: "Hello {{name}},\n\n{{sharer_name}} has shared an experiment with you: {{experiment_name}}\n\nClick here to view it: {{link}}\n\nHappy experimenting!",
    isActive: true
  },
  {
    id: "weekly_digest",
    name: "Weekly Digest",
    subject: "Your weekly VirtuLab digest 📊",
    body: "Hello {{name}},\n\nHere's what happened this week:\n- {{stats}}\n\nKeep up the great work!\n\nBest,\nThe VirtuLab Team",
    isActive: false
  }
];

export function EmailNotifications() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Broadcast message state
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "active">("all");

  // Settings
  const [settings, setSettings] = useState({
    welcomeEmail: true,
    experimentShared: true,
    weeklyDigest: false,
    systemAlerts: true
  });

  const handleTemplateToggle = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success("Template updated");
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id ? selectedTemplate : t
    ));
    toast.success("Template saved");
    setSelectedTemplate(null);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastBody) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSending(true);
    
    // Simulate sending (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Broadcast sent successfully!");
    setBroadcastSubject("");
    setBroadcastBody("");
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="gap-2">
            <Send className="w-4 h-4" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage automated email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map(template => (
                <div 
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      template.isActive ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Mail className={`w-5 h-5 ${template.isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Template Editor Dialog */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Template: {selectedTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    value={selectedTemplate.body}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {"{{name}}"}, {"{{email}}"}, {"{{link}}"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate}>Save Template</Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="broadcast" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Broadcast
              </CardTitle>
              <CardDescription>Send a message to all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="flex gap-2">
                  <Button
                    variant={broadcastTarget === "all" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setBroadcastTarget("all")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    All Users
                  </Button>
                  <Button
                    variant={broadcastTarget === "active" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setBroadcastTarget("active")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Active Users (7 days)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Important announcement..."
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your message here..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>This will send an email to {broadcastTarget === "all" ? "all registered users" : "users active in the last 7 days"}.</p>
              </div>

              <Button 
                onClick={handleSendBroadcast} 
                disabled={isSending || !broadcastSubject || !broadcastBody}
                className="w-full"
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Broadcast</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure which emails are sent automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Welcome Emails</Label>
                  <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
                </div>
                <Switch 
                  checked={settings.welcomeEmail}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, welcomeEmail: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Experiment Shared Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify users when experiments are shared with them</p>
                </div>
                <Switch 
                  checked={settings.experimentShared}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, experimentShared: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Send weekly activity summary</p>
                </div>
                <Switch 
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, weeklyDigest: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send critical system notifications</p>
                </div>
                <Switch 
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, systemAlerts: checked }))}
                />
              </div>

              <Button className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
