import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Plus, Building2, Users, Activity, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { DealershipDetail } from "@/components/admin/DealershipDetail";

interface Dealership {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  userCount?: number;
  sessionCount?: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchDealerships();
    } else if (user && !isSuperAdmin) {
      setLoading(false);
    }
  }, [user, isSuperAdmin]);

  const fetchDealerships = async () => {
    try {
      const { data, error } = await supabase
        .from("dealerships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user counts per dealership
      const { data: profiles } = await supabase
        .from("profiles")
        .select("dealership_id");

      const { data: sessions } = await supabase
        .from("training_sessions")
        .select("dealership_id");

      const enriched = (data || []).map((d) => ({
        ...d,
        userCount: (profiles || []).filter((p) => p.dealership_id === d.id).length,
        sessionCount: (sessions || []).filter((s) => s.dealership_id === d.id).length,
      }));

      setDealerships(enriched);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load dealerships", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setSaving(true);
    try {
      const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const { error } = await supabase
        .from("dealerships")
        .insert({ name: newName.trim(), slug });

      if (error) throw error;

      toast({ title: "Dealership created", description: `${newName.trim()} has been added.` });
      setNewName("");
      setNewSlug("");
      setShowAddModal(false);
      fetchDealerships();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create dealership", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (d: Dealership) => {
    const { error } = await supabase
      .from("dealerships")
      .update({ is_active: !d.is_active })
      .eq("id", d.id);

    if (error) {
      toast({ variant: "destructive", title: "Failed to update", description: error.message });
    } else {
      fetchDealerships();
    }
  };

  if (!isSuperAdmin && !loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-8 max-w-4xl mx-auto text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-4">This page is only available to administrators.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {selectedDealership ? (
            <DealershipDetail
              dealershipId={selectedDealership.id}
              dealershipName={selectedDealership.name}
              onBack={() => setSelectedDealership(null)}
            />
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-7 h-7" /> Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">Manage dealerships across the platform</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Dealership
                </Button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dealerships</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dealerships.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dealerships.reduce((sum, d) => sum + (d.userCount || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dealerships.reduce((sum, d) => sum + (d.sessionCount || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dealerships table */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>All Dealerships</CardTitle>
                    <CardDescription>Click a dealership to view details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Users</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead></TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dealerships.map((d) => (
                          <TableRow
                            key={d.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedDealership(d)}
                          >
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell className="text-muted-foreground">{d.slug}</TableCell>
                            <TableCell>{d.userCount || 0}</TableCell>
                            <TableCell>{d.sessionCount || 0}</TableCell>
                            <TableCell>
                              <Badge variant={d.is_active ? "default" : "secondary"}>
                                {d.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); toggleActive(d); }}
                              >
                                {d.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))}
                        {dealerships.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No dealerships yet. Add one to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Add Dealership Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Dealership</DialogTitle>
              <DialogDescription>Create a new dealership on the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Dealership Name</Label>
                <Input
                  placeholder="Sunset Honda"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }}
                />
              </div>
              <div>
                <Label>Slug (URL-friendly identifier)</Label>
                <Input
                  placeholder="sunset-honda"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving || !newName.trim() || !newSlug.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </AuthGuard>
  );
}
