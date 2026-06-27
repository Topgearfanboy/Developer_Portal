"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/uiComponents/Navbar";
import { getProperties } from "@/utils/propertyStorage";
import { Button } from "@/components/uiComponents/Button";
import { Alert } from "@/components/shared/Alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { PropertyCard } from "@/components/shared/PropertyCard";
import type { Property } from "@/types";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          router.push("/login");
          return;
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch properties
        const props = await getProperties();
        setProperties(props);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
          router.push("/login");
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6" title="Error">
            {error}
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Properties</h2>
          <Button href="/" data-testid="dashboard-new-property-button">
            + New Property
          </Button>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            title="No properties yet"
            description="Create your first property to start analyzing your real estate investments."
            action={<Button href="/build">Create your first analysis</Button>}
          />
        ) : (
          <div
            data-testid="dashboard-property-grid"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                name={property.name}
                location={
                  [property.zipCode, property.county]
                    .filter(Boolean)
                    .join(" · ") || "No location"
                }
                blockCount={property.blocks.length}
                createdAt={new Date(property.createdAt).toLocaleDateString()}
                href={`/build/${property.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
