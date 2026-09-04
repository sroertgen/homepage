import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const failures = [];
const fail = (m) => failures.push(m);

for (const f of ["index.html", "about/index.html", "work/index.html", "publications/index.html", "rss.xml", "sitemap-index.xml", "robots.txt", "CNAME", "og-default.png", "fonts/fonts.css"]) {
  if (!existsSync(join(dist, f))) fail(`missing ${f}`);
}
const countDirs = (p) => (existsSync(join(dist, p)) ? readdirSync(join(dist, p)).filter((d) => statSync(join(dist, p, d)).isDirectory()).length : 0);
if (countDirs("posts") < 8) fail(`expected at least 8 post pages, found ${countDirs("posts")}`);
if (countDirs("projects") !== 11) fail(`expected 11 project pages, found ${countDirs("projects")}`);
if (countDirs("articles") < 4) fail(`expected at least 4 article pages, found ${countDirs("articles")}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

for (const file of walk(dist)) {
  const html = readFileSync(file, "utf8");
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) ?? [];
  if (ld.length !== 1) fail(`${file}: expected 1 JSON-LD block, found ${ld.length}`);
  else {
    try { JSON.parse(ld[0].replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")); }
    catch (e) { fail(`${file}: JSON-LD does not parse: ${e.message}`); }
  }
  for (const needle of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'rel="canonical"']) {
    if (!html.includes(needle)) fail(`${file}: missing ${needle}`);
  }
}

if (failures.length) {
  console.error("Build check failed:\n" + failures.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("Build check passed.");
