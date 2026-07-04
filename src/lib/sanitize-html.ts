import "server-only";
import sanitizeHtml from "sanitize-html";

const ALLOWED_IFRAME_HOST_PATTERN = /^https:\/\/(www\.)?(youtube(-nocookie)?\.com)\//;

/**
 * Sanitizes blog post HTML before it's stored and again defensively before
 * it's rendered, allowlisting exactly the elements the Tiptap editor
 * (`src/components/admin/blog/rich-text-editor.tsx`) can produce: headings,
 * paragraphs, lists, blockquotes, code blocks, images, links, and YouTube
 * embed iframes. Anything else (scripts, event handlers, arbitrary iframes)
 * is stripped.
 */
export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "s",
      "u",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "iframe",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
      span: ["class"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"],
    exclusiveFilter: (frame) => {
      // Belt-and-suspenders: even if allowedIframeHostnames is bypassed by a
      // future library change, reject any iframe whose src doesn't match
      // our YouTube pattern outright.
      if (frame.tag === "iframe") {
        const src = frame.attribs.src ?? "";
        return !ALLOWED_IFRAME_HOST_PATTERN.test(src);
      }
      return false;
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}

/** Strips all HTML tags, leaving plain text — used for excerpts, reading-time estimation, and search indexing. */
export function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
