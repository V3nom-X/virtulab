import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserCog, Search, Loader2, Crown, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "user";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole;
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          role: (userRole?.role as AppRole) || "user"
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    setIsUpdating(true);
    try {
      // Use server-side security definer function for role updates
      const { data, error } = await supabase.rpc('update_user_role', {
        _target_user_id: userId,
        _new_role: newRole,
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));

      toast.success(`Role updated to ${newRole}`);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error updating role:", error);
      const msg = error?.message?.includes('last admin') 
        ? "Cannot remove the last admin" 
        : "Failed to update role. Admin privileges required.";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "moderator":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <UserCog className="w-5 h-5 text-primary" />
              User Role Management
            </CardTitle>
            <CardDescription>Manage user permissions and access levels</CardDescription>
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
                <TableHead>Current Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.full_name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="font-medium">{user.full_name || "Unnamed"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    @{user.username || "no-username"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${getRoleBadgeVariant(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          Change Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change User Role</DialogTitle>
                          <DialogDescription>
                            Update the role for {user.full_name || user.username || "this user"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">
                                {user.full_name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || "Unnamed"}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>New Role</Label>
                            <Select
                              defaultValue={user.role}
                              onValueChange={(value: AppRole) => updateUserRole(user.user_id, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">
                                  <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    User - Standard access
                                  </span>
                                </SelectItem>
                                <SelectItem value="moderator">
                                  <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    Moderator - Can moderate content
                                  </span>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <span className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                    Admin - Full access
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {user.role === "admin" && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                              <p>Changing an admin's role will remove their administrative privileges.</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
