import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  FlaskConical, 
  Search, 
  Loader2, 
  Eye, 
  EyeOff, 
  Trash2, 
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface DisplayExperiment {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_public?: boolean;
  user_id?: string;
  created_at: string;
  source: 'built-in' | 'custom';
  difficulty?: string | null;
  simulation_type?: string | null;
  user_name?: string;
}

export function ExperimentModeration() {
  const [experiments, setExperiments] = useState<DisplayExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "built-in" | "custom">("all");

  useEffect(() => {
    fetchAllExperiments();
  }, []);

  const fetchAllExperiments = async () => {
    try {
      // Fetch built-in experiments
      const { data: builtIn, error: biError } = await supabase
        .from("experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (biError) throw biError;

      // Fetch custom experiments
      const { data: custom, error: cError } = await supabase
        .from("custom_experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (cError) throw cError;

      // Fetch profiles for custom experiments
      const userIds = [...new Set((custom || []).map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, username")
        .in("user_id", userIds.length ? userIds : ['none']);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      const allExperiments: DisplayExperiment[] = [
        ...(builtIn || []).map(exp => ({
          id: exp.id,
          title: exp.title,
          description: exp.description,
          category: exp.category,
          created_at: exp.created_at,
          source: 'built-in' as const,
          difficulty: exp.difficulty,
          simulation_type: exp.simulation_type,
        })),
        ...(custom || []).map(exp => {
          const profile = profileMap.get(exp.user_id);
          return {
            id: exp.id,
            title: exp.title,
            description: exp.description,
            category: 'custom',
            is_public: exp.is_public ?? false,
            user_id: exp.user_id,
            created_at: exp.created_at,
            source: 'custom' as const,
            user_name: profile?.full_name || profile?.username || "Unknown",
          };
        }),
      ];

      setExperiments(allExperiments);
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
      toast.error("Failed to update visibility");
    }
  };

  const deleteExperiment = async (id: string, source: string) => {
    try {
      const table = source === 'built-in' ? 'experiments' : 'custom_experiments';
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      setExperiments(prev => prev.filter(e => e.id !== id));
      toast.success("Experiment deleted");
    } catch (error) {
      toast.error("Failed to delete experiment");
    }
  };

  const filtered = experiments.filter(exp => {
    const matchesSearch = !searchQuery || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || 
      (filter === "built-in" && exp.source === 'built-in') ||
      (filter === "custom" && exp.source === 'custom');
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              All Experiments ({experiments.length})
            </CardTitle>
            <CardDescription>Built-in and user-created experiments</CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Button>
              <Button variant={filter === "built-in" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("built-in")}>Built-in</Button>
              <Button variant={filter === "custom" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("custom")}>Custom</Button>
            </div>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{exp.title}</p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{exp.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{exp.category.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exp.source === 'built-in' ? 'default' : 'secondary'}>
                      {exp.source === 'built-in' ? 'Built-in' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {exp.source === 'built-in' ? 'VirtuLab' : exp.user_name || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(exp.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/workspace?type=${exp.simulation_type || 'pendulum'}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        {exp.source === 'custom' && (
                          <DropdownMenuItem onClick={() => toggleVisibility(exp.id, exp.is_public || false)}>
                            {exp.is_public ? <><EyeOff className="w-4 h-4 mr-2" /> Hide</> : <><Eye className="w-4 h-4 mr-2" /> Make Public</>}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteExperiment(exp.id, exp.source)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
