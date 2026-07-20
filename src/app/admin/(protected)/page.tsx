import { Boxes, FolderTree, ImageIcon, MessageSquareText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-shell";
import { getAdminInquiries, getCategories, getMediaAssets, getProducts } from "@/lib/data";

export default async function AdminDashboardPage() {
  const [products, categories, inquiries, media] = await Promise.all([
    getProducts({ includeUnpublished: true, pageSize: 48 }),
    getCategories(true),
    getAdminInquiries(),
    getMediaAssets(),
  ]);
  const newInquiries = inquiries.filter((item) => item.status === "new").length;
  const cards = [
    { label: "Products", value: products.count, icon: Boxes },
    { label: "Categories", value: categories.length, icon: FolderTree },
    { label: "New enquiries", value: newInquiries, icon: MessageSquareText },
    { label: "Media assets", value: media.length, icon: ImageIcon },
  ];
  return (
    <>
      <AdminPageHeader eyebrow="Administration" title="Dashboard" description="Catalogue, content and customer enquiry overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="surface-card p-6">
            <card.icon className="size-5 text-[#007d91]" aria-hidden="true" />
            <p className="mt-8 text-3xl font-bold tracking-tight text-[#072a47]">{card.value}</p>
            <p className="mt-1 text-sm text-[#5b6e7a]">{card.label}</p>
          </article>
        ))}
      </div>
      <section className="surface-card mt-8 p-6">
        <h2 className="text-lg font-bold text-[#072a47]">Publishing safeguards</h2>
        <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#425563] md:grid-cols-2">
          <li>Draft and archived products are excluded from the public catalogue.</li>
          <li>Business facts must be verified before the public toggle is accepted.</li>
          <li>Prices remain hidden unless a paise value and “show price” are both set.</li>
          <li>Customer enquiries and private notes are protected by administrator roles.</li>
        </ul>
      </section>
    </>
  );
}
