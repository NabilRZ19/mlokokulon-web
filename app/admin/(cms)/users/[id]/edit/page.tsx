import { getSession } from "@/lib/session";
import { EditUserForm } from "./EditUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  return <EditUserForm params={params} actorTier={session?.tier ?? 3} />;
}
