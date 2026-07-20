import { AdminPageHeader } from "@/components/admin-shell";
import { MediaManager } from "@/components/media-manager";
import { requireAdmin } from "@/lib/auth";
import { getMediaAssets } from "@/lib/data";

export default async function AdminMediaPage() {
  await requireAdmin(["super_admin", "content_editor"]);
  const assets = await getMediaAssets();
  return (
    <>
      <AdminPageHeader eyebrow="Catalogue assets" title="Media library" description="Upload validated, metadata-stripped product images and manage their catalogue references." />
      <MediaManager initialAssets={assets} />
    </>
  );
}
