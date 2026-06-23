"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shared/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Alert } from "@/components/shared/Alert";
import { Button } from "@/components/uiComponents/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Use hard navigation to ensure cookie is picked up by middleware
      window.location.href = "/";
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Start analyzing real estate investments"
      footer={
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}

        <FormField
          id="name"
          label="Name (optional)"
          value={name}
          onChange={setName}
        />

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

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
