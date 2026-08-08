import { getSession } from "@/lib/session";
import { TambahUserForm } from "./TambahUserForm";

export default async function TambahUserPage() {
  const session = await getSession();

  return <TambahUserForm actorTier={session?.tier ?? 3} />;
}
