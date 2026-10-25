import type { Metadata } from "next";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { EditAuthGate } from "@/app/components/edit/EditAuthGate";
import { StickerEditor } from "@/app/components/edit/StickerEditor";

export const metadata: Metadata = {
  title: "Sticker Editor",
  robots: { index: false, follow: false },
};

export default async function EditStickersPage() {
  if (!(await isEditAuthenticated())) {
    return <EditAuthGate title="Sticker Editor" />;
  }
  return <StickerEditor />;
}
