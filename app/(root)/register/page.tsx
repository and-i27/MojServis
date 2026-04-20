// Client component (state, eventi, router)
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Server action za registracijo
import { registerUser } from "./actions";

const RegisterPage = () => {
  // Router za navigacijo
  const router = useRouter();
  // State za napake
  const [error, setError] = useState<string | null>(null);

  // Submit handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Zberemo podatke iz forme
    const formData = new FormData(e.currentTarget);
    // Klic server actiona
    const result = await registerUser(formData);

    // Če registracija ni uspela, pokažemo napako
    if (!result?.success) {
      setError(result.error);
    }

    // Uspešna registracija → home
    router.push("/");
    router.refresh();
  }

  return (
    <div className="auth-page">
      <section className="auth-section">
        <div className="auth-heading">Registracija</div>
        <form className="auth-form space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="username">Uporabniško ime</label>
            <input
              id="username"
              name="username"
              type="text"
              className="text-input"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email">E - pošta</label>
            <input
              id="email"
              name="email"
              type="email"
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

          <div className="flex flex-col">
            <label htmlFor="repeatPassword">Ponovi geslo</label>
            <input
              id="repeatPassword"
              name="repeatPassword"
              type="password"
              className="text-input"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="btn mt-3" type="submit">
            Registriraj se
          </button>

          <div className="text-center">
            <Link className="text-sm hover:underline" href="/login">
              Že imate račun? Prijavite se.
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
export default RegisterPage;
