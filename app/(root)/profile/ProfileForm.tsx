"use client";

import { useState } from "react";
import { updateProfile } from "@/app/(root)/profile/action";

type ProfileFormProps = {
  user: {
    name?: string;
    email: string;
    provider?: string;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (result.redirectTo) {
      window.location.assign(result.redirectTo);
      return;
    }

    setSaving(false);
  }

  const isGoogleUser = user.provider === "google";

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" className="authInput" defaultValue={user.name ?? ""} required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="authInput" defaultValue={user.email} required />
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-black">Password</div>
        {isGoogleUser ? (
          <p className="text-sm text-[color:var(--muted)]">
            You are signed in with Google, so password changes are not available here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="currentPassword">Current password</label>
              <input id="currentPassword" name="currentPassword" type="password" className="authInput" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword">New password</label>
              <input id="newPassword" name="newPassword" type="password" className="authInput" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmNewPassword">Repeat new password</label>
              <input id="confirmNewPassword" name="confirmNewPassword" type="password" className="authInput" />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button className="buttonPrimary w-auto px-6" disabled={saving} type="submit">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
