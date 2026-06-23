"use client";

import { useState } from "react";
import { Button } from "@/components/uiComponents/Button";

interface NewPropertyFormProps {
  onSubmit: (name: string, zipCode: string, county: string) => void;
  onCancel: () => void;
}

export function NewPropertyForm({ onSubmit, onCancel }: NewPropertyFormProps) {
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [county, setCounty] = useState("");
  const [touched, setTouched] = useState({ name: false, zipCode: false });

  const nameError = !name.trim() ? "Property name is required" : null;
  const zipCodeError =
    zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)
      ? "Zip code must be 5 digits (e.g., 90210) or 5+4 format"
      : null;

  const handleSubmit = () => {
    setTouched({ name: true, zipCode: true });
    if (name.trim() && !zipCodeError) {
      onSubmit(name, zipCode, county);
      setName("");
      setZipCode("");
      setCounty("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Property Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          placeholder="e.g., Downtown Apartment"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            touched.name && nameError ? "border-red-500" : "border-border"
          }`}
          autoFocus
        />
        {touched.name && nameError && (
          <p className="text-red-500 text-sm mt-1">{nameError}</p>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text mb-2">
            Zip Code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, zipCode: true }))}
            placeholder="e.g., 90210"
            maxLength={10}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              touched.zipCode && zipCodeError
                ? "border-red-500"
                : "border-border"
            }`}
          />
          {touched.zipCode && zipCodeError && (
            <p className="text-red-500 text-sm mt-1">{zipCodeError}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-text mb-2">
            County
          </label>
          <input
            type="text"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            placeholder="e.g., Los Angeles County"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit}>Create Property</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
