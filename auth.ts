import { writeClient } from './sanity/lib/WriteClient';
/*
  Konfiguracija NextAuth za autentikacijo uporabnikov.
  - Omogoča prijavo z:
    1. Credentials (email/username + geslo)
    2. Google OAuth
  - Povezuje uporabnike s Sanity bazo.
*/

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"


/*
  Funkcija za preverjanje/ustvarjanje Google uporabnika v Sanity.
  - Če uporabnik z danim emailom že obstaja, vrne njegov _id.
  - Če uporabnik ne obstaja, ga ustvari in vrne _id.
*/
async function ensureGoogleUser({
    name,
    email,
}: {
    name?: string | null;
    email?: string | null;
}): Promise<string | null> {
    if (!email) return null;

    // Preveri ali uporabnik že obstaja
    const existingUser = await writeClient.fetch(
        `*[_type == "user" && email == $email][0]{ _id }`,
        { email }
    );

    if (existingUser?._id) {
        return existingUser._id;
    }

    // Ustvari novega Google uporabnika
    const newUser = await writeClient.create({
        _type: "user",
        name: name ?? "Google User",
        email,
        provider: "google",
    });

    return newUser._id;
}

// Nastavitve NextAuth
export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: "credentials",

            // Credentials (email/username + password)
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {
                // Preverjanje, če so credentials pravilno podani
                if (
                    !credentials ||
                    typeof credentials.email !== "string" ||
                    typeof credentials.password !== "string"
                ) {
                    return null;
                }

                const identifier = credentials.email;

                 // Poišči uporabnika v Sanity bazi
                const user = await writeClient.fetch(
                    `*[_type == "user" && (email == $identifier || name == $identifier)][0]{
                        _id, name, email, passwordHash
                    }`,
                    { identifier }
                );

                if (!user) return null;

                // Preveri geslo
                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                // Če je vse v redu, vrni uporabnika
                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                };
            }
        }),
        // Google OAuth provider
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        })
    ],

    // Nastavitve seje
    session: {
        strategy: "jwt",    // uporablja JWT za session
    },

    // Prilagojena stran za prijavo
    pages: {
        signIn: "/login",
    },

    // Callback funkcije
    callbacks: {
         // Ob prijavi uporabnika
        async signIn({ user, account }) {
            // Če je prijava preko Google, zagotovi uporabnika v Sanity
            if (account?.provider === "google") {
                try {
                    const sanityUserId = await ensureGoogleUser({
                        name: user.name,
                        email: user.email,
                    });

                    if (sanityUserId) {
                        (user as any).sanityId = sanityUserId;      // shrani sanity ID v user object
                    }
                } catch (err) {
                    console.error("GOOGLE SIGN-IN SANITY ERROR:", err);
                    // Ne blokiraj prijave, če Sanity ni dosegljiv.
                }
            }

            return true;       // dovoli prijavo
        },

        // JWT callback za shranjevanje ID uporabnika
        jwt({ token, user }) {
            if (user) {
                token.id = (user as any).sanityId ?? user.id        // uporabi Sanity ID, če obstaja
            }
            return token
        },

        // Session callback za NextAuth sejo
        session({ session, token }) {
            session.user.id = token.id  // doda ID uporabnika v sejo
            return session
        },
    },
})
