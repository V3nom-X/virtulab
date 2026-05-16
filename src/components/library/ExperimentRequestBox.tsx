import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150, "Title too long"),
  description: z.string().trim().min(10, "Please add more detail").max(2000, "Description too long"),
  category: z.string().trim().max(50).optional().or(z.literal("")),
});

export function ExperimentRequestBox() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a request");
      return;
    }
    const parsed = schema.safeParse({ title, description, category });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("experiment_requests").insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category || null,
      });
      if (error) throw error;
      toast.success("Request submitted — thank you!");
      setTitle("");
      setDescription("");
      setCategory("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mt-10 border-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-gold" />
          Request an Experiment
        </CardTitle>
        <CardDescription>
          Missing something? Suggest an experiment and our team will review it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary underline underline-offset-4">Sign in</Link> to submit a request.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Label htmlFor="er-title">Title</Label>
              <Input id="er-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis simulation" maxLength={150} required />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="er-cat">Category (optional)</Label>
              <Input id="er-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Physics, Chemistry, Biology…" maxLength={50} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="er-desc">Description</Label>
              <Textarea id="er-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe the experiment and what it should teach…" maxLength={2000} rows={3} required />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
