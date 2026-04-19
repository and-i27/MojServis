"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { writeClient } from '@/sanity/lib/WriteClient';
import { requireUser } from "@/lib/requireUser";

type UpdateProfileResult = {
  success: boolean;
  error: string | null;
  message?: string;
};

type ProfileUserRecord = {
  _id: string;
  provider?: string;
  passwordHash?: string;
};

export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  try {
    const { userId } = await requireUser();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmNewPassword = String(formData.get("confirmNewPassword") || "");

    if (!name) {
      return { success: false, error: "Ime je obvezno." };
    }

    if (!email) {
      return { success: false, error: "E - pošta je obvezna." };
    }

    const existingUser = await writeClient.fetch(
      `*[_type == "user" && email == $email && _id != $userId][0]{ _id }`,
      { email, userId }
    );

    if (existingUser?._id) {
      return { success: false, error: "Ta e - pošta je že v uporabi." };
    }

    const user: ProfileUserRecord | null = await writeClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ _id, provider, passwordHash }`,
      { userId }
    );

    if (!user?._id) {
      return { success: false, error: "Profil ni najden." };
    }

    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmNewPassword);
    const patchData: { name: string; email: string; passwordHash?: string } = { name, email };

    if (wantsPasswordChange) {
      if (user.provider === "google") {
        return {
          success: false,
          error: "Ta račun uporablja prijavo prek Googla, zato spreminjanje gesla ni na voljo tukaj.",
        };
      }

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return {
          success: false,
          error: "Za spreminjanje gesla izpolnite trenutno geslo in oba polja za novo geslo.",
        };
      }

      if (!user.passwordHash) {
        return { success: false, error: "Spreminjanje gesla ni na voljo za ta račun." };
      }

      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidCurrentPassword) {
        return { success: false, error: "Trenutno geslo je napačno." };
      }

      if (newPassword.length < 6) {
        return { success: false, error: "Novo geslo mora imeti vsaj 6 znakov." };
      }

      if (newPassword !== confirmNewPassword) {
        return { success: false, error: "Nova gesla se ne ujemata." };
      }

      patchData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await writeClient.patch(userId).set(patchData).commit();

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true, error: "Profil uspešno posodobljen." };
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return { success: false, error: "Pri posodabljanju profila je prišlo do napake." };
  }
}
