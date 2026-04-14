// Komponenta teče na clientu (state, eventi, router)
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Server action za prijavo
import { loginAction } from "./action";
//import { loginAction } from "./actions";
import Image from "next/image";
// FontAwesome ikone za animacijo "loading" stanja

const Login = () => {
  // Router za client-side navigacijo
  const router = useRouter();
  // Napaka pri prijavi (npr. napačno geslo)
  const [error, setError] = useState<string | null>(null);
  // Ali poteka avtentikacija
  const [authenticating, setAuthenticating] = useState(false);

  // Unified handler za credentials in Google login
  async function handleLogin(type: string, formData: FormData) {
    setAuthenticating(true);
    setError(null);

    try {
      // Klic server action
      const result = await loginAction(type, formData);

      // Credentials login ima response
      if (type === "credentials") {
        if (!result.success) {
          setError(result.error);
          setAuthenticating(false);
          return;
        }

        // Uspešna prijava
        router.push("/dashboard");
        router.refresh();
      }
      // Google login tukaj ne pride do konca
      // (redirect se zgodi na serverju)
    } catch (e) {
      // Lovimo redirect ali nepričakovane napake
      console.log("Redirect or other error caught:", e);
      setAuthenticating(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-section">
        <div className="auth-heading">Prijavi se</div>
        <div className="space-y-3">
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (authenticating) return;

              setAuthenticating(true);

              const formData = new FormData(e.currentTarget);
              await handleLogin("credentials", formData);
            }}
          >
            <div className="flex flex-col">
              <label htmlFor="identifier">Uporabniško ime ali e-pošta</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                className="text-input"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Geslo</label>
              <input
                id="password"
                name="password"
                type="password"
                className="text-input"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              disabled={authenticating}
              className="btn submit-btn"
              type="submit"
            >
              {authenticating ? "Prijavljanje..." : "Prijavi se"}
            </button>
          </form>

          <div className="text-center">
            <Link className="text-sm hover:underline" href="/register">
              Še nimate računa? Registrirajte se.
            </Link>
          </div>

          <div className="w-4/5 mx-auto relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary">Ali</span>
            </div>
          </div>

          <form action={(formData) => handleLogin("google", formData)}>
            <button
              className="btn flex w-full items-center justify-center gap-2"
              type="submit"
            >
              <Image src="/google.png" alt="google" width={24} height={24} />
              <span>Prijavi se z Googlom</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
export default Login;
