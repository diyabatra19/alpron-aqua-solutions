import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp, { type OutputInfo } from "sharp";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSameOriginRequest } from "@/lib/security";

const allowedInputTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(request: Request) {
  if (!(await isSameOriginRequest(request))) {
    return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  }
  const admin = await requireAdmin(["super_admin", "content_editor"]);
  const formData = await request.formData();
  const file = formData.get("file");
  const altResult = z.string().trim().min(3).max(180).safeParse(formData.get("altText"));
  if (!(file instanceof File) || !altResult.success) {
    return NextResponse.json({ message: "Choose an image and add useful alt text." }, { status: 422 });
  }
  if (file.size < 1 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ message: "Images must be 5 MB or smaller." }, { status: 422 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(input);
  if (!detected || !allowedInputTypes.has(detected.mime)) {
    return NextResponse.json({ message: "The file content is not an allowed image type." }, { status: 422 });
  }

  let output: Buffer;
  let metadata: OutputInfo;
  try {
    const result = await sharp(input, { failOn: "warning" })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });
    output = result.data;
    metadata = result.info;
  } catch {
    return NextResponse.json({ message: "The image could not be safely decoded." }, { status: 422 });
  }

  const storagePath = `products/${new Date().getUTCFullYear()}/${randomUUID()}.webp`;
  const service = createServiceRoleClient();
  const { error: uploadError } = await service.storage
    .from("product-media")
    .upload(storagePath, output, { contentType: "image/webp", upsert: false });
  if (uploadError) {
    return NextResponse.json({ message: "The image could not be stored." }, { status: 500 });
  }
  const { data: publicUrl } = service.storage.from("product-media").getPublicUrl(storagePath);
  const { data, error } = await service
    .from("media_assets")
    .insert({
      storage_path: storagePath,
      public_url: publicUrl.publicUrl,
      original_filename: file.name.slice(0, 255),
      mime_type: "image/webp",
      byte_size: output.byteLength,
      width: metadata.width,
      height: metadata.height,
      alt_text: altResult.data,
      uploaded_by: admin.userId,
    })
    .select("*")
    .single();
  if (error) {
    await service.storage.from("product-media").remove([storagePath]);
    return NextResponse.json({ message: "Image metadata could not be recorded." }, { status: 500 });
  }
  return NextResponse.json({ asset: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isSameOriginRequest(request))) {
    return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  }
  await requireAdmin(["super_admin", "content_editor"]);
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = z.uuid().safeParse(body?.id);
  if (!id.success) return NextResponse.json({ message: "Invalid media identifier." }, { status: 422 });
  const service = createServiceRoleClient();
  const { count } = await service
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("media_asset_id", id.data);
  if (count) {
    return NextResponse.json({ message: "Remove this image from products before deleting it." }, { status: 409 });
  }
  const { data: asset } = await service.from("media_assets").select("storage_path").eq("id", id.data).maybeSingle();
  if (!asset) return NextResponse.json({ message: "Media asset was not found." }, { status: 404 });
  const { error } = await service.from("media_assets").delete().eq("id", id.data);
  if (error) return NextResponse.json({ message: "The media record could not be deleted." }, { status: 500 });
  await service.storage.from("product-media").remove([asset.storage_path]);
  return NextResponse.json({ deleted: true });
}
