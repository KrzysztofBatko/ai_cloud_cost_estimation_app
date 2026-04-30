"use client";
import { useUsers } from "@/app/(admin-only)/admin/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronDown } from "lucide-react";

const availableRoles = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

export default function UserManagement() {
  const {
    users,
    fetchingUsers,
    usersError,
    updatingUserEmail,
    fetchUsers,
    updateUserRole,
    currentUserEmail,
  } = useUsers();

  return (
    <Card className="shadow-card">
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
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Role:</span>
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
                            e.target.value as "user" | "admin" | "superadmin",
                          )
                        }
                        disabled={
                          updatingUserEmail === user.email || fetchingUsers
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
  );
}
