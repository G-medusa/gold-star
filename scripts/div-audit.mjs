import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components"];
const EXT = new Set([".tsx", ".ts", ".jsx", ".js"]);

// исключаем не-HTML семантические файлы (OG ImageResponse и т.п.)
const EXCLUDE = [
  "app/og/route.tsx",
];

// нормализация путей под Windows/macOS/Linux
const norm = (p) => p.replaceAll("\\", "/");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function isExcluded(file) {
  const f = norm(file);
  return EXCLUDE.some((x) => f.endsWith(x));
}

function countDivs(src) {
  const matches = src.match(/<div(\s|>)/g);
  return matches ? matches.length : 0;
}

function countLines(src) {
  return src.split(/\r?\n/).length;
}

const rows = [];
for (const r of ROOTS) {
  for (const file of walk(r)) {
    if (isExcluded(file)) continue;

    const src = fs.readFileSync(file, "utf8");
    const divs = countDivs(src);
    if (divs === 0) continue;

    const lines = countLines(src);
    const density = divs / Math.max(1, lines);
    rows.push({ file: norm(file), divs, lines, density });
  }
}

// 1) топ по плотности (divs/lines)
rows.sort((a, b) => b.density - a.density || b.divs - a.divs);

console.log("Top files by <div> density (divs/lines):\n");
for (const r of rows.slice(0, 25)) {
  console.log(
    `${r.density.toFixed(3)}  divs:${String(r.divs).padStart(3)}  lines:${String(r.lines).padStart(4)}  ${r.file}`
  );
}

// 2) топ по количеству div
const byCount = [...rows].sort((a, b) => b.divs - a.divs || b.density - a.density);

console.log("\nTop files by <div> count:\n");
for (const r of byCount.slice(0, 25)) {
  console.log(
    `divs:${String(r.divs).padStart(3)}  lines:${String(r.lines).padStart(4)}  ${r.file}`
  );
}
