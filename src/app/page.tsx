"use client";

import { useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropzone } from "@/components/ui/Dropzone";
import { Input } from "@/components/ui/Input";

/**
 * Step 1 — "Your details" (Figma: Desktop - 2, node 3:458).
 *
 * State is local for now. Persisting the profile to IndexedDB is the next
 * piece of work; nothing here is saved or sent anywhere yet.
 */

interface BusinessProfileDraft {
  businessName: string;
  yourName: string;
  email: string;
  phone: string;
  address: string;
}

const EMPTY_PROFILE: BusinessProfileDraft = {
  businessName: "",
  yourName: "",
  email: "",
  phone: "",
  address: "",
};

export default function YourDetailsPage() {
  const [profile, setProfile] = useState<BusinessProfileDraft>(EMPTY_PROFILE);
  const [logo, setLogo] = useState<File | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  function update(field: keyof BusinessProfileDraft) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((current) => ({ ...current, [field]: event.target.value }));
      if (field === "businessName") setNameError(null);
    };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Business name is the one required field — everything else is optional
    // per the brief, and the invoice header needs something to print.
    if (profile.businessName.trim() === "") {
      setNameError("Add a business or display name so your invoice has a header.");
      return;
    }

    setNameError(null);
    // Saving the profile and moving to step 2 comes next.
  }

  return (
    <div className="min-h-dvh bg-surface-default pb-[80px]">
      <AppHeader currentStep={1} />

      <main className="mx-auto w-full max-w-[845px] px-[24px]">
        <div className="mt-[64px] flex flex-col items-center gap-[12px] text-center text-text-primary">
          <h1 className="type-display-3-regular w-full">First,</h1>
          <p className="type-heading-1-regular w-full">
            What should your customers call you?
          </p>
        </div>

        <form className="mt-[32px]" noValidate onSubmit={handleSubmit}>
          <Card
            title="Your business info"
            description="This shows up at the top of every invoice. You'll only enter it once."
            footer={<Button type="submit">Continue</Button>}
          >
            <Input
              label="Business or display name"
              placeholder="e.g. SeanKT Design"
              value={profile.businessName}
              onChange={update("businessName")}
              error={nameError ?? undefined}
              autoComplete="organization"
              required
            />

            <Input
              label="Your name (optional)"
              placeholder="e.g. SeanKT"
              helperText="Add this if your business name isn't your name."
              value={profile.yourName}
              onChange={update("yourName")}
              autoComplete="name"
            />

            <Dropzone
              label="Logo"
              prompt="Drop your logo here or "
              hint="PNG, JPG or SVG. Appears at the top of your invoice."
              accept="image/png,image/jpeg,image/svg+xml"
              file={logo}
              onFileChange={setLogo}
            />

            {/* Side by side on desktop, stacked once there isn't room. */}
            <div className="flex w-full flex-col items-start gap-[16px] sm:flex-row">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                helperText="Where clients can reach you."
                value={profile.email}
                onChange={update("email")}
                autoComplete="email"
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="(555) 555-5555"
                value={profile.phone}
                onChange={update("phone")}
                autoComplete="tel"
              />
            </div>

            <Input
              label="Address (optional)"
              placeholder="Street, city, state, ZIP"
              helperText="Some clients need this for their records."
              value={profile.address}
              onChange={update("address")}
              autoComplete="street-address"
            />

            <p className="type-utility-2-regular w-full text-text-tertiary">
              Saved only in this browser. Nothing is uploaded.
            </p>
          </Card>
        </form>
      </main>
    </div>
  );
}
