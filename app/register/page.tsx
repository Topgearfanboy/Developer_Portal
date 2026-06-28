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
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [euConfirmed, setEuConfirmed] = useState(false);
  const [californiaConfirmed, setCaliforniaConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ageConfirmed) {
      setError("You must confirm you are 18 years of age or older");
      return;
    }

    if (!euConfirmed) {
      setError("You must confirm you do not reside in the European Union");
      return;
    }

    if (!californiaConfirmed) {
      setError("You must confirm you do not live or operate in California");
      return;
    }

    if (!termsAccepted) {
      setError("You must agree to the Terms and Conditions and Privacy Policy");
      return;
    }

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

        <div className="flex items-start gap-3">
          <input
            id="age"
            type="checkbox"
            required
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="age" className="text-sm text-gray-600 cursor-pointer">
            I confirm that I am <strong>18 years of age or older</strong>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="eu"
            type="checkbox"
            required
            checked={euConfirmed}
            onChange={(e) => setEuConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="eu" className="text-sm text-gray-600 cursor-pointer">
            I confirm that I do <strong>not</strong> reside in the{" "}
            <strong>European Union</strong>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-500 font-medium"
              target="_blank"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-500 font-medium"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="california"
            type="checkbox"
            required
            checked={californiaConfirmed}
            onChange={(e) => setCaliforniaConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="california"
            className="text-sm text-gray-600 cursor-pointer"
          >
            I confirm that I do <strong>not</strong> live or operate in{" "}
            <strong>California</strong>
          </label>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={
            loading ||
            !ageConfirmed ||
            !euConfirmed ||
            !californiaConfirmed ||
            !termsAccepted
          }
          className="w-full"
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
