import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import ProfileForm from "../profile/ProfileForm";
import { redirect } from "next/navigation";

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
    redirect("/login");
  }

  return (
    <section className="main">
      <h1>Profil</h1>
      <p className="text-lg">Uredite svoje osebne podatke</p>
      <section className="rounded-lg bg-secondary text-primary p-6 shadow-xl">
        <ProfileForm user={user} />
      </section>
    </section>
  );
}
