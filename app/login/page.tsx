"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shared/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Alert } from "@/components/shared/Alert";
import { Button } from "@/components/uiComponents/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LOGIN] Form submitted", { email });
    setError("");
    setLoading(true);

    try {
      console.log("[LOGIN] Sending request to /api/auth/login");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[LOGIN] Response status:", response.status);
      const data = await response.json();
      console.log("[LOGIN] Response data:", data);

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      console.log("[LOGIN] Success, redirecting to /");
      // Use hard navigation to ensure cookie is picked up by middleware
      window.location.href = "/";
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your properties and analysis"
      footer={
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}

        <FormField
          id="email"
          label="Email address"
          type="email"
          required
          value={email}
          onChange={setEmail}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          required
          value={password}
          onChange={setPassword}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
