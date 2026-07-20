"use client";

import Image from "next/image";
import { useState } from "react";
import { Copy, LoaderCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui";

type Asset = {
  id: string;
  public_url: string;
  alt_text: string;
  original_filename: string;
  width: number;
  height: number;
  byte_size: number;
};

export function MediaManager({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(formData: FormData) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const result = (await response.json()) as { asset?: Asset; message?: string };
    if (response.ok && result.asset) {
      setAssets((current) => [result.asset as Asset, ...current]);
      setMessage("Image uploaded and normalized to WebP.");
    } else setMessage(result.message || "Upload failed.");
    setBusy(false);
  }

  async function remove(id: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = (await response.json()) as { message?: string };
    if (response.ok) {
      setAssets((current) => current.filter((asset) => asset.id !== id));
      setMessage("Image deleted.");
    } else setMessage(result.message || "Delete failed.");
    setBusy(false);
  }

  return (
    <>
      <form action={upload} className="surface-card grid gap-5 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="field"><label htmlFor="media-file">Product image</label><input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></div>
        <div className="field"><label htmlFor="media-alt">Descriptive alt text</label><input id="media-alt" name="altText" required minLength={3} maxLength={180} /></div>
        <Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload</Button>
      </form>
      {message ? <p role="status" className="mt-5 rounded-xl bg-[#effbfb] p-4 text-sm text-[#07586a]">{message}</p> : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.id} className="surface-card overflow-hidden">
            <div className="relative aspect-[4/3] bg-[#edf5f7]"><Image src={asset.public_url} alt={asset.alt_text} fill sizes="33vw" className="object-cover" /></div>
            <div className="p-5">
              <p className="line-clamp-2 text-sm font-semibold text-[#072a47]">{asset.alt_text}</p>
              <p className="mt-2 text-xs text-[#6b7e8a]">{asset.width} × {asset.height} · {Math.round(asset.byte_size / 1024)} KB</p>
              <div className="mt-5 flex justify-between gap-3">
                <button onClick={() => navigator.clipboard.writeText(asset.id)} className="inline-flex items-center gap-2 text-xs font-semibold text-[#007d91]"><Copy className="size-3.5" /> Copy ID</button>
                <button type="button" onClick={() => remove(asset.id)} disabled={busy} className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700"><Trash2 className="size-3.5" /> Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
