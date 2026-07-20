import type { Json } from "@/lib/database.types";
import { safeExternalUrl } from "@/lib/utils";

export type RichNode = {
  type: "doc" | "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "link";
  text?: string;
  level?: 2 | 3;
  href?: string;
  content?: RichNode[];
};

const allowedTypes = new Set<RichNode["type"]>([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "link",
]);

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, 10000)
    : undefined;
}

function sanitizeNode(value: unknown, depth = 0): RichNode | null {
  if (!value || typeof value !== "object" || depth > 8) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.type !== "string" || !allowedTypes.has(record.type as RichNode["type"])) {
    return null;
  }

  const type = record.type as RichNode["type"];
  const content = Array.isArray(record.content)
    ? record.content
        .slice(0, 100)
        .map((child) => sanitizeNode(child, depth + 1))
        .filter((child): child is RichNode => child !== null)
    : undefined;

  const node: RichNode = { type };
  const text = cleanText(record.text);
  if (text) node.text = text;
  if (type === "heading") node.level = record.level === 3 ? 3 : 2;
  if (type === "link") {
    const href = safeExternalUrl(typeof record.href === "string" ? record.href : null);
    if (!href) return null;
    node.href = href;
  }
  if (content?.length) node.content = content;
  return node;
}

export function sanitizeRichDocument(value: unknown): RichNode {
  const node = sanitizeNode(value);
  if (!node || node.type !== "doc") return { type: "doc", content: [] };
  return node;
}

export function plainTextDocument(text: string): Json {
  return {
    type: "doc",
    content: text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .slice(0, 50)
      .map((paragraph) => ({ type: "paragraph", text: paragraph.slice(0, 5000) })),
  };
}

export function documentToPlainText(value: unknown) {
  const document = sanitizeRichDocument(value);
  const parts: string[] = [];
  const visit = (node: RichNode) => {
    if (node.text) parts.push(node.text);
    node.content?.forEach(visit);
  };
  visit(document);
  return parts.join("\n\n");
}
