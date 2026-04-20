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
  const [errorColor, setErrorColor] = useState<string | null>(null);
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
      setErrorColor("text-red-500");
    } else {
      setError(result.error);
      setErrorColor("text-green-500");
    }

    setSaving(false);
  }

  const isGoogleUser = user.provider === "google";

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">Ime</label>
          <input id="name" name="name" type="text" className="text-input" defaultValue={user.name ?? ""} required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold">E - pošta</label>
          <input id="email" name="email" type="email" className="text-input" defaultValue={user.email} required />
        </div>
      </div>

      <div className="rounded-lg bg-white text-secondary p-4">
        <div className="mb-3 text-sm font-semibold">Geslo</div>
        {isGoogleUser ? (
          <p className="text-sm">
            Prijavljeni ste z Googlom, zato gesla ne morete spremeniti tukaj!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="currentPassword">Trenutno geslo</label>
              <input id="currentPassword" name="currentPassword" type="password" className="text-input" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword">Novo geslo</label>
              <input id="newPassword" name="newPassword" type="password" className="text-input" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmNewPassword"> Ponovite novo geslo</label>
              <input id="confirmNewPassword" name="confirmNewPassword" type="password" className="text-input" />
            </div>
          </div>
        )}
      </div>

      {error && <p className={`text-sm ${errorColor}`}>{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn w-full sm:w-auto px-6" disabled={saving} type="submit">
          {saving ? "Shranjujem..." : "Shrani profil"}
        </button>
      </div>
    </form>
  );
}
