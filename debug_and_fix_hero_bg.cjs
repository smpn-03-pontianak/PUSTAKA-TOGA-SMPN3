const fs = require("fs");

// 1. Pastikan file gambar ada di public/
const publicFiles = fs.existsSync("public") ? fs.readdirSync("public") : [];
console.log("Isi folder public/:", publicFiles.join(", "));

let bgFile = publicFiles.find((f) => /background.*beranda\.(jpe?g|png|webp)$/i.test(f));
if (!bgFile) {
  console.log("STOP: File 'background-beranda.jpeg' tidak ditemukan di folder public/!");
  process.exit(1);
}

// Pastikan nama file tanpa spasi
if (bgFile.includes(" ")) {
  const cleanName = bgFile.replace(/\s+/g, "-");
  fs.copyFileSync(`public/${bgFile}`, `public/${cleanName}`);
  bgFile = cleanName;
}

// 2. Baca src/App.jsx dan tampilkan 15 baris di atas "Kenali Tanamannya" untuk memastikan pembungkus yang tepat
let c = fs.readFileSync("src/App.jsx", "utf8");

// Bersihkan sisipan layer latar belakang lama jika ada
c = c.replace(/\{\/\* Foto Latar Belakang Kotak Utama Beranda \*\/\}[\s\S]*?pointer-events-none"\s*\/>\s*/g, "");

const lines = c.split("\n");
const anchorLine = lines.findIndex((l) => l.includes("Kenali Tanamannya"));
if (anchorLine === -1) {
  console.log("STOP: Teks 'Kenali Tanamannya' tidak ditemukan.");
  process.exit(1);
}

console.log("\n--- Struktur JSX di atas 'Kenali Tanamannya' ---");
for (let i = Math.max(0, anchorLine - 22); i <= anchorLine; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
console.log("------------------------------------------------\n");

// 3. Cari pembungkus kartu utama (biasanya punya rounded-3xl atau rounded-2xl di atas anchorLine)
let cardOpenLine = -1;
for (let i = anchorLine; i >= Math.max(0, anchorLine - 35); i--) {
  if (/rounded-(2xl|3xl)/.test(lines[i]) && /<(div|section)\b/.test(lines[i])) {
    cardOpenLine = i;
    break;
  }
}

if (cardOpenLine === -1) {
  console.log("STOP: Baris pembuka kartu utama (rounded-2xl/3xl) tidak ditemukan di atas 'Kenali Tanamannya'.");
  process.exit(1);
}

// Hapus class bg-white / bg-rose / bg-[#...] pada baris pembuka kartu utama agar tidak menutupi foto
lines[cardOpenLine] = lines[cardOpenLine]
  .replace(/\bbg-(white|rose-[0-9]+|pink-[0-9]+|slate-[0-9]+)(\/[0-9]+)?\b/g, "")
  .replace(/\bbg-\[[^\]]+\](\/[0-9]+)?\b/g, "");

if (!lines[cardOpenLine].includes("relative")) {
  lines[cardOpenLine] = lines[cardOpenLine].replace('className="', 'className="relative ');
}
if (!lines[cardOpenLine].includes("overflow-hidden")) {
  lines[cardOpenLine] = lines[cardOpenLine].replace('className="', 'className="overflow-hidden ');
}

// Sisipkan layer foto menggunakan BASE_URL Vite + gradasi putih-pink lembut yang cukup transparan (72%-82%)
const overlaySnippet = [
  "          {/* Foto Latar Belakang Kotak Utama Beranda */}",
  "          <div",
  '            aria-hidden="true"',
  '            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"',
  `            style={{ backgroundImage: \`url(\${import.meta.env.BASE_URL}${bgFile})\` }}`,
  "          />",
  "          {/* Gradasi Lembut agar Foto Terlihat & Teks Tetap Tajam */}",
  "          <div",
  '            aria-hidden="true"',
  '            className="absolute inset-0 bg-gradient-to-r from-white/82 via-white/75 to-[#FFF5F7]/80 backdrop-blur-[1px] pointer-events-none"',
  "          />"
].join("\n");

lines.splice(cardOpenLine + 1, 0, overlaySnippet);

// Pastikan elemen anak di dalam kartu memiliki z-10 agar berada di atas layer foto
for (let i = cardOpenLine + 2; i <= Math.min(lines.length - 1, anchorLine + 5); i++) {
  if (/<div\s+className="/.test(lines[i]) && !lines[i].includes("z-10")) {
    lines[i] = lines[i].replace('<div className="', '<div className="relative z-10 ');
  }
}

fs.writeFileSync("src/App.jsx", lines.join("\n"));
console.log(`SUKSES: Foto '${bgFile}' dipasang di baris ${cardOpenLine + 1} menggunakan BASE_URL!`);
