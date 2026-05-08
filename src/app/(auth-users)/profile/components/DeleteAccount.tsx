import { useProfile } from "@/app/(auth-users)/profile/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteAccount() {
  const { clearDeleteError, deleteAccount, deleteError, deleting } =
    useProfile();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const openDeleteConfirmation = () => {
    clearDeleteError();
    setConfirmingDelete(true);
  };

  const cancelDelete = () => {
    clearDeleteError();
    setConfirmingDelete(false);
  };

  return (
    <div className="mt-8 border-t pt-6">
      {confirmingDelete ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="space-y-1">
              <h2 className="font-semibold text-foreground">Delete account?</h2>
              <p className="text-sm text-muted-foreground">
                This will permanently remove your account from the database.
              </p>
            </div>
          </div>

          {deleteError && (
            <p className="mt-3 text-sm text-destructive">{deleteError}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Confirm delete
            </Button>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deleting}
            >
              Keep account
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="destructive" onClick={openDeleteConfirmation}>
          <Trash2 className="h-4 w-4" />
          Delete account
        </Button>
      )}
    </div>
  );
}
