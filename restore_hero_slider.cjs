const { execSync } = require("child_process");
const fs = require("fs");

// Cari commit terakhir sebelum HeroPhotoSlider diubah
const logOutput = execSync('git log -n 10 --format="%H"').toString().trim().split("\n");
let originalHeroBlock = null;

for (const hash of logOutput) {
  try {
    const oldContent = execSync(`git show ${hash}:src/App.jsx`).toString();
    const start = oldContent.indexOf("const HeroPhotoSlider = () => {");
    const end = oldContent.indexOf("};", oldContent.indexOf("return (", start)) + 2;
    if (start !== -1 && end > start) {
      const candidate = oldContent.slice(start, end);
      // Pastikan ini versi asli (bukan yang baru dibuat)
      if (!candidate.includes("currentIdx") && !candidate.includes("backdrop-blur-xs")) {
        originalHeroBlock = candidate;
        console.log("Versi asli HeroPhotoSlider ditemukan pada commit:", hash);
        break;
      }
    }
  } catch (e) {}
}

if (!originalHeroBlock) {
  console.log("Versi lama tidak ditemukan di 10 commit terakhir.");
  process.exit(1);
}

let currentContent = fs.readFileSync("src/App.jsx", "utf8");
const curStart = currentContent.indexOf("const HeroPhotoSlider = () => {");
const curEnd = currentContent.indexOf("};", currentContent.indexOf("return (", curStart)) + 2;

if (curStart !== -1 && curEnd > curStart) {
  currentContent = currentContent.slice(0, curStart) + originalHeroBlock + currentContent.slice(curEnd);
  fs.writeFileSync("src/App.jsx", currentContent);
  console.log("SUKSES: Tampilan foto di halaman Beranda (HeroPhotoSlider) berhasil dikembalikan persis seperti semula!");
} else {
  console.log("Blok HeroPhotoSlider saat ini tidak ditemukan.");
}
