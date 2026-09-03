/** Astro glob-loader generateId: folder name for index.md, otherwise file name without numeric prefix. */
export function generateContentId({ entry }: { entry: string }): string {
  const noExt = entry.replace(/\.(md|mdx)$/, "");
  const base = noExt.endsWith("/index") ? noExt.slice(0, -"/index".length) : noExt;
  return base
    .replace(/^\d+_/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}
