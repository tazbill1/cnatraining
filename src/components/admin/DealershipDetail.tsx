import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Activity, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface DealershipDetailProps {
  dealershipId: string;
  dealershipName: string;
  onBack: () => void;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  created_at: string;
}

interface SessionRow {
  id: string;
  scenario_type: string;
  score: number | null;
  status: string | null;
  started_at: string;
  user_id: string;
}

interface InvitationRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export function DealershipDetail({ dealershipId, dealershipName, onBack }: DealershipDetailProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [usersRes, sessionsRes, invitesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, last_active_at, created_at").eq("dealership_id", dealershipId),
        supabase.from("training_sessions").select("id, scenario_type, score, status, started_at, user_id").eq("dealership_id", dealershipId).order("started_at", { ascending: false }).limit(50),
        supabase.from("invitations").select("id, email, status, created_at").eq("dealership_id", dealershipId).order("created_at", { ascending: false }),
      ]);
      setUsers(usersRes.data || []);
      setSessions(sessionsRes.data || []);
      setInvitations(invitesRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [dealershipId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-bold">{dealershipName}</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{sessions.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{invitations.length}</div></CardContent>
        </Card>
      </div>

      {/* Users */}
      <Card>
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.last_active_at ? formatDistanceToNow(new Date(u.last_active_at), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No users yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 20).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium capitalize">{s.scenario_type.replace(/-/g, " ")}</TableCell>
                  <TableCell>{s.score != null ? `${s.score}%` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                      {s.status || "in_progress"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No sessions yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invitations */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invitations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "accepted" ? "default" : "secondary"}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No invitations yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
