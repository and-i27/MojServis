// Komponenta teče na clientu (state, eventi, router)
"use client"

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
                router.push("/");
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
        <div className="authPage">
            <section className="authSection">
                <div className="mb-6 text-2xl font-semibold text-black">
                    Log in
                </div>
                {/* LOGIN S CREDENTIALS */}
                <form className="authForm"
                    onSubmit={async (e) => {
                        e.preventDefault();
                         // Preprečimo večkratni submit
                        if (authenticating) return;

                        setAuthenticating(true);

                        const formData = new FormData(e.currentTarget);
                        await handleLogin("credentials", formData);
                    }}
                >
                    <label htmlFor="identifier">Username or email</label>
                    <input data-testid="login-identifier" id="identifier" name="identifier" type="text" className="authInput"/>

                    <label htmlFor="password">Password</label>
                    <input data-testid="login-password" id="password" name="password" type="password" className="authInput"/>

                    {/* Prikaz napake */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button data-testid="submit-login" disabled={authenticating} className="buttonPrimary disabled:cursor-not-allowed disabled:opacity-75" type="submit">
                        {authenticating ? "Logging in..." : "Login"}
                    </button>
                </form>
                {/* Link do registracije */}
                <Link className="noAccountBtn" href="/register">
                    Don&apos;t have an account? Register.
                </Link>
                {/* Divider */}
                <div className="w-4/5 mx-auto relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-(--border)"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-(--muted)">Or</span>
                    </div>
                </div>
                {/* GOOGLE LOGIN */}
                <form
                    action={(formData) => handleLogin("google", formData)}
                >
                    <button className="button flex w-full items-center justify-center gap-2" type="submit">
                        <Image src="/google.png" alt="google" width={24} height={24} />
                        <span>Login with Google</span>
                    </button>
                </form>
            </section>
        </div>
    )
}
export default Login;
