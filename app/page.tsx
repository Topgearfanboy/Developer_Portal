"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Property } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import {
  getProperties,
  createNewProperty,
  deactivateProperty,
} from "@/utils/propertyStorage";
import { Button } from "@/components/uiComponents/Button";
import { Alert } from "@/components/shared/Alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { NewPropertyForm } from "@/components/shared/NewPropertyForm";

export default function Home() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProperties = async () => {
      try {
        const loaded = await getProperties();
        setProperties(loaded);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          router.push("/login");
        } else {
          setError("Failed to load properties");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [authLoading, isAuthenticated, router]);

  const handleAddProperty = async (
    name: string,
    zipCode: string,
    county: string,
  ) => {
    try {
      const newProperty = await createNewProperty(name, zipCode, county);
      setProperties([...properties, newProperty]);
      setShowNewPropertyForm(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError("Failed to create property");
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-text mb-8">Dashboard</h1>
        <div className="text-text-muted">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-text-muted">Manage your property investments</p>
        </div>
        <Button
          onClick={() => setShowNewPropertyForm(!showNewPropertyForm)}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Property
        </Button>
      </div>

      <Modal
        isOpen={showNewPropertyForm}
        onClose={() => setShowNewPropertyForm(false)}
        title="New Property"
      >
        <NewPropertyForm
          onSubmit={(name, zipCode, county) => {
            void handleAddProperty(name, zipCode, county);
          }}
          onCancel={() => setShowNewPropertyForm(false)}
        />
      </Modal>

      {error && (
        <Alert className="mb-6" title="Error">
          {error}
        </Alert>
      )}

      {properties.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-10 h-10 text-text-muted/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4"
              />
            </svg>
          }
          title="No properties yet"
          description="Create your first property to start analyzing your real estate investments."
          action={
            <Button
              onClick={() => setShowNewPropertyForm(true)}
              icon={<Plus className="w-5 h-5" />}
            >
              Create First Property
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              name={property.name}
              location={[property.zipCode, property.county]
                .filter(Boolean)
                .join(" · ")}
              blockCount={property.blocks.length}
              href={`/build/${property.id}`}
              onDelete={() => setPropertyToDelete(property)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!propertyToDelete}
        onClose={() => !isDeleting && setPropertyToDelete(null)}
        title="Delete Property?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPropertyToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!propertyToDelete) return;
                setIsDeleting(true);
                try {
                  await deactivateProperty(propertyToDelete.id);
                  setProperties(
                    properties.filter((p) => p.id !== propertyToDelete.id),
                  );
                  setPropertyToDelete(null);
                } catch (err) {
                  if (err instanceof Error && err.message === "Unauthorized") {
                    router.push("/login");
                  } else {
                    setError("Failed to delete property");
                  }
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete Property
            </Button>
          </>
        }
      >
        <p className="text-text-muted">
          Are you sure you want to delete &quot;{propertyToDelete?.name}&quot;?
          This will mark it as inactive and hide it from your dashboard. You can
          restore it later if needed.
        </p>
      </Modal>
    </div>
  );
}
