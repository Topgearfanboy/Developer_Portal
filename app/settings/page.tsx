"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/uiComponents/Button";
import { Alert } from "@/components/shared/Alert";
import { Modal } from "@/components/shared/Modal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { User, Trash2 } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch {
        setError("Failed to load account settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError(null);

    try {
      const response = await fetch("/api/auth/deactivate", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeactivateError(data.error || "Failed to deactivate account.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setDeactivateError("An error occurred. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-text mb-2">
            Account Settings
          </h1>
          <p className="text-text-muted mb-8">
            Manage your account information and preferences.
          </p>

          {error && (
            <Alert className="mb-6" title="Error">
              {error}
            </Alert>
          )}

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">Profile</h2>
                <p className="text-sm text-text-muted mt-1">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                {user.name && (
                  <p className="text-sm text-text-muted">
                    <span className="font-medium">Name:</span> {user.name}
                  </p>
                )}
                <p className="text-sm text-text-muted">
                  <span className="font-medium">Member since:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text mb-2">
                Danger Zone
              </h2>

              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 className="w-4 h-4" />}
                data-testid="delete-account-button"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Deactivate Account?"
        size="sm"
        data-testid="delete-account-modal"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deactivating}
              data-testid="cancel-delete-button"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeactivate}
              loading={deactivating}
              disabled={deactivating}
              data-testid="confirm-delete-button"
            >
              Delete Account
            </Button>
          </>
        }
      >
        <p className="text-text-muted">
          Are you sure you want to delete your account?
        </p>
        {deactivateError && (
          <Alert className="mt-4" title="Error">
            {deactivateError}
          </Alert>
        )}
      </Modal>
    </div>
  );
}
