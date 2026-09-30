// Komprimiert die 835 aus WordPress migrierten Bilder in public/wp-media in
// place (gleicher Pfad, gleiche Endung -> keine Referenzen in content-*.json
// muessen angepasst werden), um die Deployment-Groesse pro Vercel-Build zu
// senken. Verkleinert nur auf eine sinnvolle Maximalbreite (Artikelbilder
// werden nie breiter als ~1200px dargestellt) und erhoeht die Kompression.
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = "public/wp-media";
const MAX_WIDTH = 1600;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
let before = 0;
let after = 0;
let processed = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
  const beforeSize = statSync(file).size;
  before += beforeSize;
  try {
    const img = sharp(file);
    const meta = await img.metadata();
    let pipeline = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 75 });
    }
    const buf = await pipeline.toBuffer();
    // Nur ueberschreiben, wenn's tatsaechlich kleiner wird (manche kleinen
    // Icons/Fotos sind schon optimal, ein Re-Encode koennte sie vergroessern).
    if (buf.length < beforeSize) {
      const fs = await import("fs/promises");
      await fs.writeFile(file, buf);
      after += buf.length;
    } else {
      after += beforeSize;
    }
    processed++;
  } catch (e) {
    console.error("FEHLER bei", file, e.message);
    after += beforeSize;
  }
}

console.log(`Verarbeitet: ${processed} Dateien`);
console.log(`Vorher: ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`Nachher: ${(after / 1024 / 1024).toFixed(1)} MB`);
console.log(`Ersparnis: ${(100 - (after / before) * 100).toFixed(1)}%`);
