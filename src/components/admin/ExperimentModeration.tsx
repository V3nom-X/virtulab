import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  FlaskConical, 
  Search, 
  Loader2, 
  Eye, 
  EyeOff, 
  Trash2, 
  Flag,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CustomExperiment {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export function ExperimentModeration() {
  const [experiments, setExperiments] = useState<CustomExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [selectedExperiment, setSelectedExperiment] = useState<CustomExperiment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      // Fetch experiments
      const { data: experimentsData, error: expError } = await supabase
        .from("custom_experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (expError) throw expError;

      // Fetch profiles separately
      const userIds = [...new Set((experimentsData || []).map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, username")
        .in("user_id", userIds);

      // Map profiles by user_id for quick lookup
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      const experimentsWithUsers = (experimentsData || []).map(exp => {
        const profile = profileMap.get(exp.user_id);
        return {
          ...exp,
          user_name: profile?.full_name || profile?.username || "Unknown"
        };
      });

      setExperiments(experimentsWithUsers);
    } catch (error) {
      console.error("Error fetching experiments:", error);
      toast.error("Failed to load experiments");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (id: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_experiments")
        .update({ is_public: !isPublic })
        .eq("id", id);

      if (error) throw error;

      setExperiments(prev => prev.map(e => 
        e.id === id ? { ...e, is_public: !isPublic } : e
      ));

      toast.success(isPublic ? "Experiment hidden" : "Experiment made public");
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const deleteExperiment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_experiments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setExperiments(prev => prev.filter(e => e.id !== id));
      toast.success("Experiment deleted");
    } catch (error) {
      console.error("Error deleting experiment:", error);
      toast.error("Failed to delete experiment");
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = !searchQuery || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || 
      (filter === "public" && exp.is_public) ||
      (filter === "private" && !exp.is_public);

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Experiment Moderation
            </CardTitle>
            <CardDescription>Review and moderate user-created experiments</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "public" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("public")}
              >
                Public
              </Button>
              <Button
                variant={filter === "private" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("private")}
              >
                Private
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experiment</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiments.map((experiment) => (
                <TableRow key={experiment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{experiment.title}</p>
                      {experiment.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {experiment.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {experiment.user_name}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={experiment.is_public 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                      }
                    >
                      {experiment.is_public ? (
                        <><Eye className="w-3 h-3 mr-1" /> Public</>
                      ) : (
                        <><EyeOff className="w-3 h-3 mr-1" /> Private</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(experiment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => window.open(`/builder?id=${experiment.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleVisibility(experiment.id, experiment.is_public)}
                        >
                          {experiment.is_public ? (
                            <><EyeOff className="w-4 h-4 mr-2" /> Hide</>
                          ) : (
                            <><Eye className="w-4 h-4 mr-2" /> Make Public</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteExperiment(experiment.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExperiments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No experiments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
