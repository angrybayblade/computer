import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { EditAuthGate } from "@/app/components/edit/EditAuthGate";
import { MetadataEditor } from "@/app/components/edit/MetadataEditor";

export default async function EditPage() {
  const authenticated = await isEditAuthenticated();
  if (!authenticated) return <EditAuthGate />;
  return <MetadataEditor />;
}
