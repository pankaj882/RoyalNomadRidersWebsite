interface BlogContentProps {
  html: string;
}

/**
 * Content is sanitized server-side at write time (`sanitizeBlogContent` in
 * `src/lib/sanitize-html.ts`, called from the create/update Server Actions)
 * before ever reaching the database, so this render step is a display
 * concern only — not the security boundary.
 */
export function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="prose prose-invert prose-nomad max-w-none prose-headings:font-display prose-img:rounded-lg prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
