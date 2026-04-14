import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import ProfileForm from "../profile/ProfileForm";

type ProfilePageData = {
  name?: string;
  email: string;
  provider?: string;
};

export default async function ProfilePage() {
  const { userId } = await requireUser();

  const user: ProfilePageData | null = await client.fetch(
    `*[_type == "user" && _id == $userId][0]{
      name,
      email,
      provider
    }`,
    { userId }
  );

  if (!user) {
    return (
      <section className="authPage">
        <section className="w-full max-w-2xl rounded-lg border border-[color:var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">Profile not found.</p>
        </section>
      </section>
    );
  }

  return (
    <section className="authPage">
      <section className="w-full max-w-2xl rounded-lg border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-6 text-2xl font-semibold text-black">Profile</div>
        <ProfileForm user={user} />
      </section>
    </section>
  );
}
