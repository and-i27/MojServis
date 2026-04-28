import { auth, signOut } from "@/auth";
import { getUserRole } from "@/lib/requireUser";
import Image from "next/image";
import Link from "next/link";
import MobileNav from "./MobileNav";

const Navbar = async () => {
  const session = await auth();
  const userRole = session?.user?.id
    ? await getUserRole(session.user.id)
    : null;

  return (
    <header className="header">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="logo" width={64} height={64} />
          <span className="logo-text">MojServis</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex md:flex-wrap md:justify-end">
          {session ? (
            <>
              <Link href="/vehicle/create">
                <button className="btn min-w-30">Dodaj vozilo</button>
              </Link>
              <Link href="/todo">
                <button className="btn min-w-30">Opravila</button>
              </Link>
              {userRole === "admin" && (
                <Link href="/admin">
                  <button className="btn min-w-30 bg-red-600 hover:bg-red-700">
                    Nadzorna plošča
                  </button>
                </Link>
              )}
              <Link href="/profile">
                <button className="btn min-w-30">Moj Profil</button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn min-w-30">Odjava</button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <button className="btn min-w-30">Prijava</button>
            </Link>
          )}
        </div>

        <MobileNav>
          {session ? (
            <>
              <Link href="/vehicle/create">
                <button className="btn w-full">Dodaj vozilo</button>
              </Link>
              <Link href="/todo">
                <button className="btn w-full">Opravila</button>
              </Link>
              {userRole === "admin" && (
                <Link href="/admin">
                  <button className="btn w-full bg-red-600 hover:bg-red-700">
                    Nadzorna plošča
                  </button>
                </Link>
              )}
              <Link href="/profile">
                <button className="btn w-full">Moj profil</button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
                className="w-full"
              >
                <button className="btn w-full">Odjava</button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <button className="btn w-full">Prijava</button>
            </Link>
          )}
        </MobileNav>
      </nav>
    </header>
  );
};

export default Navbar;
