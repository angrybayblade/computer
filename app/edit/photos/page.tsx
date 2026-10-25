import type { Metadata } from "next";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { EditAuthGate } from "@/app/components/edit/EditAuthGate";
import { PhotoEditor } from "@/app/components/edit/PhotoEditor";

export const metadata: Metadata = { title: "Photo Editor", robots: { index: false, follow: false } };

export default async function EditPhotosPage() {
  if (!(await isEditAuthenticated())) return <EditAuthGate title="Photo Editor" />;
  return <PhotoEditor />;
}
