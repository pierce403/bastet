import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);

// Only these public assets are deployed. Repository metadata, scripts, and local
// configuration must never be served as part of the website.
const assets = [
  "index.html",
  "about.html",
  "treasury.html",
  "tribute.html",
  "app.js",
  "treasury.js",
  "tribute.js",
  "style.css",
  "bastet.webp",
  "api",
  "legacy",
];

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const asset of assets) {
  await cp(new URL(asset, root), new URL(asset, output), { recursive: true });
}
console.log("Built public assets in dist/");
