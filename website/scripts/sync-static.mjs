import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const publicDir = path.resolve(__dirname, "../public");

const rootFiles = [
  "index.html",
  "shop.html",
  "our-story.html",
  "antigravity-birds.html",
];

const rootDirs = [
  "css",
  "js",
  "assets",
  "Logo",
  "T-Shirts On Landing Page",
  "Videos",
  "shopify/js",
  "shopify/config",
];

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, filter) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, filter);
    } else if (!filter || filter(srcPath)) {
      copyFile(srcPath, destPath);
    }
  }
}

fs.mkdirSync(publicDir, { recursive: true });

for (const file of rootFiles) {
  const src = path.join(repoRoot, file);
  if (fs.existsSync(src)) {
    copyFile(src, path.join(publicDir, file));
  }
}

const faviconSrc = path.join(repoRoot, "assets/wild-wild-glass-logo-favicon.png");
if (fs.existsSync(faviconSrc)) {
  copyFile(faviconSrc, path.join(publicDir, "favicon.png"));
}

for (const dir of rootDirs) {
  const src = path.join(repoRoot, dir);
  const dest = path.join(publicDir, dir);
  if (dir === "Videos") {
    copyDir(src, dest, (filePath) => filePath.endsWith(".mp4"));
  } else {
    copyDir(src, dest);
  }
}

console.log("Synced static site files into website/public");
