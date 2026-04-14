"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { writeClient } from '@/sanity/lib/WriteClient';
import { requireUser } from "@/lib/requireUser";

type UpdateProfileResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
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
      return { success: false, error: "Name is required." };
    }

    if (!email) {
      return { success: false, error: "Email is required." };
    }

    const existingUser = await writeClient.fetch(
      `*[_type == "user" && email == $email && _id != $userId][0]{ _id }`,
      { email, userId }
    );

    if (existingUser?._id) {
      return { success: false, error: "Email is already in use." };
    }

    const user: ProfileUserRecord | null = await writeClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ _id, provider, passwordHash }`,
      { userId }
    );

    if (!user?._id) {
      return { success: false, error: "Profile not found." };
    }

    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmNewPassword);
    const patchData: { name: string; email: string; passwordHash?: string } = { name, email };

    if (wantsPasswordChange) {
      if (user.provider === "google") {
        return {
          success: false,
          error: "This account uses Google sign-in, so password changes are not available here.",
        };
      }

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return {
          success: false,
          error: "To change password, fill in current password and both new password fields.",
        };
      }

      if (!user.passwordHash) {
        return { success: false, error: "Password change is not available for this account." };
      }

      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidCurrentPassword) {
        return { success: false, error: "Current password is incorrect." };
      }

      if (newPassword.length < 6) {
        return { success: false, error: "New password must be at least 6 characters long." };
      }

      if (newPassword !== confirmNewPassword) {
        return { success: false, error: "New passwords do not match." };
      }

      patchData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await writeClient.patch(userId).set(patchData).commit();

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true, error: null, redirectTo: "/profile" };
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return { success: false, error: "Failed to update profile." };
  }
}
