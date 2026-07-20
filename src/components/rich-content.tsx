import type { ReactNode } from "react";
import { sanitizeRichDocument, type RichNode } from "@/lib/content";

function renderNode(node: RichNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  const content = node.text || children;
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{content}</p>;
    case "heading":
      return node.level === 3 ? <h3 key={key}>{content}</h3> : <h2 key={key}>{content}</h2>;
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{content}</li>;
    case "link":
      return (
        <a key={key} href={node.href} rel="noopener noreferrer">
          {content}
        </a>
      );
    default:
      return <div key={key}>{children}</div>;
  }
}

export function RichContent({ value }: { value: unknown }) {
  const document = sanitizeRichDocument(value);
  return <div className="rich-content">{document.content?.map(renderNode)}</div>;
}
