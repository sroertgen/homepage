/**
 * Derives the old Gatsby-era URL slug for a content entry from its file path.
 * `.../index.md` uses the containing folder name; a flat file uses its own
 * name without extension (numeric prefixes and underscores kept as-is, since
 * that's what the old site served them under).
 */
export function legacySlugFor(filePath: string): string {
  const noExt = filePath.replace(/\\/g, "/").replace(/\.(md|mdx)$/, "");
  const parts = noExt.split("/");
  const last = parts.pop() ?? "";
  return last === "index" ? (parts.pop() ?? last) : last;
}
