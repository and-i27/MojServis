import Link from "next/link";

export default function WelcomePage() {
  return (
    <section className="mainContent">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold">Welcome to CarLog</h1>
        <p className="text-sm text-(--muted)">
          CarLog helps you keep a complete service history for every vehicle.
          Track inspections, costs, and documents in one clean dashboard.
        </p>
        <Link href="/login" className="buttonPrimary w-auto px-6">
          Log in to your dashboard
        </Link>
      </div>
    </section>
  );
}
