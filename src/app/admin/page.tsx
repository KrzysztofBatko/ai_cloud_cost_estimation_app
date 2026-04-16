"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  Shield,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { useSession } from "next-auth/react";
import EstimationDashboard from "@/app/admin/components/EstimationDashboard";

type PricingSnapshotSummary = {
  id: string;
  region: string;
  pricingAsOf: string;
  source: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
};

export default function Admin() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [newProvider, setNewProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(false);
  const [users, setUsers] = useState<
    {
      email: string;
      name: string | null;
      role: "user" | "admin" | "superadmin";
    }[]
  >([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [updatingUserEmail, setUpdatingUserEmail] = useState<string | null>(
    null,
  );
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pricingSnapshot, setPricingSnapshot] =
    useState<PricingSnapshotSummary | null>(null);
  const [fetchingPricingSnapshot, setFetchingPricingSnapshot] = useState(false);
  const [refreshingPricingSnapshot, setRefreshingPricingSnapshot] = useState(false);
  const [pricingSnapshotError, setPricingSnapshotError] = useState<string | null>(null);

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";
  const isSuperAdmin = session?.user?.role === "superadmin";
  const currentUserEmail = session?.user?.email?.toLowerCase() ?? null;

  const availableRoles = useMemo(
    () => [
      { value: "user", label: "User" },
      { value: "admin", label: "Admin" },
      { value: "superadmin", label: "Superadmin" },
    ],
    [],
  );

  useEffect(() => {
    if (isAdmin) fetchProviders(true);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchPricingSnapshot(true);
  }, [isAdmin]);

  useEffect(() => {
    if (isSuperAdmin) fetchUsers();
  }, [isSuperAdmin]);

  const fetchProviders = async (isInitial?: boolean) => {
    try {
      if (isInitial) setFetchingProviders(true);
      const response = await fetch("/api/providers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        setProviders(result.data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setFetchingProviders(false);
    }
  };

  const addProvider = async () => {
    if (!newProvider.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProvider.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewProvider("");
      await fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersError(null);
      setFetchingUsers(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError("Could not fetch users. Please try again.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const updateUserRole = async (
    email: string,
    role: "user" | "admin" | "superadmin",
  ) => {
    if (currentUserEmail && email.toLowerCase() === currentUserEmail) {
      setUsersError("You cannot change your own role.");
      return;
    }

    try {
      setUsersError(null);
      setUpdatingUserEmail(email);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      const updated = result.data;
      setUsers((prev) =>
        prev.map((user) =>
          user.email === email
            ? {
                ...user,
                role: updated?.role ?? role,
                name: updated?.name ?? user.name,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      setUsersError("Could not change user role.");
    } finally {
      setUpdatingUserEmail(null);
    }
  };

  const fetchPricingSnapshot = async (isInitial?: boolean) => {
    try {
      setPricingSnapshotError(null);
      if (isInitial) {
        setFetchingPricingSnapshot(true);
      }

      const response = await fetch("/api/pricing/refresh");
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      setPricingSnapshot(result.data ?? null);
    } catch (error) {
      console.error("Error fetching pricing snapshot:", error);
      setPricingSnapshotError("Could not load pricing snapshot metadata.");
    } finally {
      setFetchingPricingSnapshot(false);
    }
  };

  const refreshSnapshot = async (force = false) => {
    try {
      setPricingSnapshotError(null);
      setRefreshingPricingSnapshot(true);

      const response = await fetch("/api/pricing/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      setPricingSnapshot(result.data ?? null);
    } catch (error) {
      console.error("Error refreshing pricing snapshot:", error);
      setPricingSnapshotError("Could not refresh pricing snapshot.");
    } finally {
      setRefreshingPricingSnapshot(false);
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <div className="mb-6 text-lg flex items-center gap-3">
          <span>Your access: {session?.user?.role}</span>
          {isAdmin || isSuperAdmin ? (
            <CheckCircle2
              className="h-5 w-5 text-emerald-500"
              aria-label="Access granted"
            />
          ) : (
            <XCircle
              className="h-5 w-5 text-destructive"
              aria-label="Access denied"
            />
          )}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Cloud Providers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="New provider name..."
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProvider()}
              />
              <Button
                onClick={addProvider}
                disabled={loading}
                className="w-24 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-foreground">{p.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProvider(p.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {fetchingProviders && (
                <div className="px-4 py-8 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="shadow-card mt-8">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-accent" />
                <CardTitle>Pricing Snapshot</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPricingSnapshot()}
                  disabled={fetchingPricingSnapshot || refreshingPricingSnapshot}
                  className="gap-2"
                >
                  {(fetchingPricingSnapshot || refreshingPricingSnapshot) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Reload
                </Button>
                <Button
                  size="sm"
                  onClick={() => refreshSnapshot(true)}
                  disabled={refreshingPricingSnapshot}
                  className="gap-2"
                >
                  {refreshingPricingSnapshot ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh snapshot
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pricingSnapshotError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {pricingSnapshotError}
                </div>
              )}

              {pricingSnapshot ? (
                <div className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Pricing snapshot</p>
                    <p className="font-medium text-foreground">{pricingSnapshot.pricingAsOf}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Region</p>
                    <p className="font-medium text-foreground">{pricingSnapshot.region}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Source</p>
                    <p className="font-medium text-foreground">{pricingSnapshot.source}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created at</p>
                    <p className="font-medium text-foreground">{new Date(pricingSnapshot.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created by</p>
                    <p className="font-medium text-foreground">{pricingSnapshot.createdBy ?? "system"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Notes</p>
                    <p className="font-medium text-foreground">{pricingSnapshot.notes ?? "-"}</p>
                  </div>
                </div>
              ) : fetchingPricingSnapshot ? (
                <div className="px-4 py-8 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Card className="shadow-card mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User management</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={fetchingUsers}
                className="gap-2"
              >
                {fetchingUsers && <Loader2 className="h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {usersError}
                </div>
              )}

              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {users.map((user) => {
                  const isSelf =
                    currentUserEmail !== null &&
                    user.email.toLowerCase() === currentUserEmail;

                  return (
                    <div
                      key={user.email}
                      className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_auto] gap-3 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {user.name || "(no name)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Role:
                        </span>
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">
                            Your account ({user.role})
                          </span>
                        ) : (
                          <div className="relative w-full">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                updateUserRole(
                                  user.email,
                                  e.target.value as
                                    | "user"
                                    | "admin"
                                    | "superadmin",
                                )
                              }
                              disabled={
                                updatingUserEmail === user.email ||
                                fetchingUsers
                              }
                              className="w-full appearance-none rounded-md border border-input bg-background px-3 pr-12 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              {availableRoles.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="w-5 flex items-center justify-end">
                        <Loader2
                          className={`h-5 w-5 animate-spin text-muted-foreground ${updatingUserEmail === user.email ? "visible" : "hidden"}`}
                        />
                      </div>
                    </div>
                  );
                })}

                {fetchingUsers && (
                  <div className="px-4 py-8 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!fetchingUsers && users.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No users to display.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="container mx-auto max-w-6xl px-4 pb-12">
        <EstimationDashboard providers={providers} />
      </div>
    </>
  );
}
