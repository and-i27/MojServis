// navbar component with authentication and navigation links

import { auth, signOut, } from "@/auth";
import Link from "next/link";

const navbar = async () => {
    const session = await auth();

    return (
        <header className="header">
            <nav className="mx-auto flex w-full max-w-5xl items-center justify-between">
                <Link href={session?.user ? "/dashboard" : "/"} className="text-lg font-semibold">
                    CarLog
                </Link>

                <div className="flex items-center gap-5 text-base whitespace-nowrap">
                    <Link href="/vehicle/create" className="text-black hover:text-neutral-600 whitespace-nowrap">
                        Add vehicle
                    </Link>
                    <Link href="/todo" className="text-black hover:text-neutral-600 whitespace-nowrap">
                        To-do
                    </Link>
                    {session && session?.user ? (
                        <>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/" });
                                }}
                            >
                                <button type="submit" className="button">
                                    Log out
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login/" className="buttonPrimary whitespace-nowrap">
                            Log in
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default navbar
