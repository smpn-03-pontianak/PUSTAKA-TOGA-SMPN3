const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8");

if (!c.includes("heroSmoothIn")) {
  console.log("GAGAL: Blok animasi heroSmoothIn tidak ditemukan.");
  process.exit(1);
}

c = c
  .replace(
    /\.anim-hero-col-1\s*\{[^}]*\}/,
    `.anim-hero-col-1 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
  }`
  )
  .replace(
    /\.anim-hero-col-2\s*\{[^}]*\}/,
    `.anim-hero-col-2 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;
  }`
  )
  .replace(
    /\.anim-hero-col-3\s*\{[^}]*\}/,
    `.anim-hero-col-3 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards;
  }`
  );

fs.writeFileSync("src/App.jsx", c);
console.log("SUKSES: Durasi dan jeda animasi diperlambat agar terlihat jelas oleh mata!");
