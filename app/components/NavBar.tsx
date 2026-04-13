 import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
     const session = await auth();

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
              <button className="btn min-w-30">Add vehicle</button>
            </Link>
            <Link href="/todo">
              <button className="btn min-w-30">To-do</button>
            </Link>
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
