// Označi datoteko kot server-only (Next.js Server Actions)
"use server";

import { signIn } from "@/auth";

// Tip rezultata, ki ga vrne login action
type LoginActionResult = { success: boolean; error: string | null };

// Funkcija za prijavo z Google providerjem
// Promise<never> pomeni: funkcija se NE zaključi normalno
// (ker signIn z redirect:true vedno sproži preusmeritev)
async function signInWithGoogle(): Promise<never> {
    try {
        await signIn("google", {
          redirect: true,   // NextAuth bo izvedel redirect
          redirectTo: "/",  // Po prijavi preusmeri na dashboard
        });
        // Ta koda bi se izvedla le, če redirect ne bi uspel
        throw new Error("Google sign-in did not initiate redirect.");
    } catch (error) {
      // Napako ponovno vržemo, da se propagira navzgor
        throw error;
    }
}

// Glavna server action za prijavo
export async function loginAction(type: string, formData: FormData): Promise<LoginActionResult> {
  // Prijava z email/geslom (credentials provider)
  if(type == "credentials"){
    // Pridobimo podatke iz forme
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      await signIn("credentials", {
        email: identifier,
        password,
        redirect: false, // brez avtomatskega redirecta
      });

      // Če je prijava uspešna
      return { success: true, error: null };
    } catch (err: any) {
      return {
        // Napačni podatki ali druga napaka
        success: false,
        error: "Napačno uporabniško ime ali geslo.",
      };
    }
  } else {
    // Prijava z Google računom (OAuth)
    await signInWithGoogle();

    // Ta return je praktično "fallback"
    // (normalno se nikoli ne izvede)
    return { success: false, error: "Redirect failed." };
  }
}
