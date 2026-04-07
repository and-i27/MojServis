
// Server Action – teče izključno na strežniku
"use server";

import bcrypt from "bcryptjs";    // Hashiranje gesel
import { signIn } from "@/auth";  // NextAuth signIn
import { writeClient } from "@/sanity/lib/WriteClient"; // Sanity client

// Server action za registracijo uporabnika
export async function registerUser(formData: FormData) {
  try {
    // Pridobivanje podatkov iz forme
    const name = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const repeatPassword = formData.get("repeatPassword") as string;

    // Preverjanje obveznih polj
    if (!name || !email || !password) {
      return { success: false, error: "Missing required fields" };
    }

    // Preverjanje ujemanja gesel
    if (password !== repeatPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Preverimo, ali uporabnik že obstaja
    const existingUser = await writeClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hashiranje gesla (bcrypt)
    const passwordHash = await bcrypt.hash(password, 10);

     // Ustvarimo novega uporabnika v Sanity
    await writeClient.create({
      _type: "user",
      name,
      email,
      passwordHash,
    });

    // Samodejna prijava po uspešni registraciji
    await signIn("credentials", {
      email,
      password,
      redirect: false, // redirect ureja client
    });

    // Uspešna registracija
    return { success: true, error: null };
  } catch (err) {
    // Fallback napaka
    console.error("REGISTER ERROR:", err);
    return { success: false, error: "Registration failed. Try again." };
  }
}
