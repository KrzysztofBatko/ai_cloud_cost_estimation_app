import { ENDPOINTS } from "@/lib/api/utils";
import type { Role, User } from "@/types/api";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export function useUsers() {
  const t = useTranslations("admin.errors");
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [updatingUserEmail, setUpdatingUserEmail] = useState<string | null>(
    null,
  );
  const [usersError, setUsersError] = useState<string | null>(null);

  const currentUserEmail = session?.user?.email?.toLowerCase() ?? null;

  const fetchUsers = useCallback(async () => {
    try {
      setUsersError(null);
      setFetchingUsers(true);

      const response = await fetch(ENDPOINTS.USERS);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || response.statusText);
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError(t("usersFetch"));
    } finally {
      setFetchingUsers(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = useCallback(
    async (email: string, role: Role) => {
      if (currentUserEmail && email.toLowerCase() === currentUserEmail) {
        setUsersError(t("ownRole"));
        return;
      }

      try {
        setUsersError(null);
        setUpdatingUserEmail(email);

        const response = await fetch(ENDPOINTS.USERS, {
          method: "PUT",
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
        setUsersError(t("userRoleUpdate"));
      } finally {
        setUpdatingUserEmail(null);
      }
    },
    [currentUserEmail, t],
  );

  return {
    users,
    fetchingUsers,
    usersError,
    updatingUserEmail,
    fetchUsers,
    updateUserRole,
    currentUserEmail,
  };
}
