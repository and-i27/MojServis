 import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { getUserRole } from "@/lib/requireUser";

const Navbar = async () => {
     const session = await auth();
     const userRole = session?.user?.id ? await getUserRole(session.user.id) : null;

  return (
    <header className="header">
      <nav className="flex justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="logo" width={64} height={64} />
          <span className="logo-text">MojServis</span>
        </Link>

        <div className="flex items-center gap-5">
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
                <button className="btn min-w-30 bg-red-600 hover:bg-red-700">Admin Panel</button>
              </Link>
            )}
            <Link href="/profile">
              <button className="btn min-w-30">Moj Profil</button>
            </Link>
          <form
            action={async () => {
              "use server";
                await signOut({ redirectTo: "/" });
              }}>
            <button className="btn min-w-30">Odjava</button>
          </form>
          </>
           ) : ( 
          <>
            <Link href="/login">
              <button className="btn min-w-30">Prijava</button>
            </Link>
          </>
           )}
        </div>
      </nav>
    </header>
  );
};
export default Navbar;
