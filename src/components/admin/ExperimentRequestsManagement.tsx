import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Loader2, Inbox, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type RequestStatus = "pending" | "approved" | "rejected";

interface ExperimentRequest {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: RequestStatus;
  user_id: string;
  created_at: string;
  submitter?: string;
}

const FILTERS: Array<{ key: "all" | RequestStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export function ExperimentRequestsManagement() {
  const [requests, setRequests] = useState<ExperimentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | RequestStatus>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("experiment_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name")
        .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      const map = new Map((profiles || []).map((p) => [p.user_id, p.username || p.full_name || "Anonymous"]));

      setRequests(
        (data || []).map((r) => ({
          ...(r as ExperimentRequest),
          submitter: map.get(r.user_id) || "Anonymous",
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: RequestStatus) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("experiment_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Request ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [filter, requests]
  );

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests]
  );

  const statusBadge = (s: RequestStatus) => {
    const map = {
      pending: { icon: Clock, cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      approved: { icon: CheckCircle2, cls: "bg-green-500/10 text-green-600 border-green-500/20" },
      rejected: { icon: XCircle, cls: "bg-destructive/10 text-destructive border-destructive/20" },
    }[s];
    const Icon = map.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${map.cls}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{s}</span>
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Experiment Requests
            </CardTitle>
            <CardDescription>Review and respond to user-submitted experiment ideas.</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => {
              const count =
                f.key === "all" ? requests.length : counts[f.key as RequestStatus];
              return (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.key)}
                  className="gap-1.5"
                >
                  {f.label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{count}</Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No {filter !== "all" ? filter : ""} requests.
          </div>
        ) : (
          <ScrollArea className="max-h-[600px] pr-2">
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-4 bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h4 className="font-semibold text-base truncate">{r.title}</h4>
                        {statusBadge(r.status)}
                        {r.category && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {r.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {r.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By <span className="font-medium text-foreground">{r.submitter}</span> ·{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "approved")}
                          className="gap-1"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "rejected")}
                          className="gap-1"
                        >
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    )}
                    {r.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updatingId === r.id}
                        onClick={() => updateStatus(r.id, "pending")}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
