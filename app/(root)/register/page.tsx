// Client component (state, eventi, router)
"use client"

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
        <div className="authPage">
            <section className="authSection">
                <div className="mb-6 text-2xl font-semibold text-black">
                    Register
                </div>
                <form className="authForm" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" type="text" className="authInput"/>

                    <label htmlFor="email">E-mail</label>
                    <input id="email" name="email" type="email" className="authInput" />

                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" className="authInput" />

                    <label htmlFor="repeatPassword">Repeat password</label>
                    <input id="repeatPassword" name="repeatPassword" type="password" className="authInput" />
                    
                    {/* Napaka */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button className="buttonPrimary" type="submit">
                        Register
                    </button>

                    {/* Link do login strani */}
                    <Link className="noAccountBtn" href="/login">
                        Already have an account? Login.
                    </Link>
                </form>
            </section>
        </div>
    )
}
export default RegisterPage;
