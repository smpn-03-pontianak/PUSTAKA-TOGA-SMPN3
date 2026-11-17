const { execSync } = require("child_process");
const fs = require("fs");

// 1. Ambil bagian asli dari commit 60209963ef5212bdcd10b09de662a1b693411206
const oldContent = execSync("git show 60209963ef5212bdcd10b09de662a1b693411206:src/App.jsx").toString();
const oldHeroStart = oldContent.indexOf("const HeroPhotoSlider = () => {");
const oldAppStart = oldContent.indexOf("export default function App()");

let cleanOriginalSection = oldContent.slice(oldHeroStart, oldAppStart).trim();

// Hapus jika ada NonTeachingAutoSlider lama di dalam cleanOriginalSection
const oldNtIdx = cleanOriginalSection.indexOf("const NonTeachingAutoSlider = () => {");
if (oldNtIdx !== -1) {
  const afterNt = cleanOriginalSection.indexOf("const WelcomeSplash", oldNtIdx);
  if (afterNt !== -1) {
    cleanOriginalSection = cleanOriginalSection.slice(0, oldNtIdx).trim() + "\n\n" + cleanOriginalSection.slice(afterNt).trim();
  } else {
    cleanOriginalSection = cleanOriginalSection.slice(0, oldNtIdx).trim();
  }
}

// 2. Satu definisi bersih NonTeachingAutoSlider (tanpa persentase)
const singleNonTeachingSlider = `const NonTeachingAutoSlider = () => {
  const slides = [
    {
      src: "aktivitas-1-1.jpg",
      stage: "Tahap 01 • Persetujuan Kepala Sekolah",
      title: "Koordinasi Awal & Pemaparan Program Kerja",
      caption: "Audiensi bersama Kepala Sekolah SMP Negeri 3 Pontianak dan Guru Pendamping untuk memperoleh persetujuan pelaksanaan program TOGA."
    },
    {
      src: "aktivitas-1-2.jpg",
      stage: "Tahap 01 • Persetujuan Kepala Sekolah",
      title: "Observasi Awal Lingkungan Sekolah",
      caption: "Peninjauan area taman sekolah bersama guru pendamping untuk memetakan potensi pengembangan Taman TOGA."
    },
    {
      src: "aktivitas-2-1.jpg",
      stage: "Tahap 02 • Pemetaan & Penataan Taman TOGA",
      title: "Pembersihan & Pengolahan Lahan Taman",
      caption: "Gotong royong mahasiswa MSB membersihkan area taman dan menggemburkan media tanam."
    },
    {
      src: "aktivitas-2-2.jpg",
      stage: "Tahap 02 • Pemetaan & Penataan Taman TOGA",
      title: "Penanaman & Penataan Koleksi Tanaman Obat",
      caption: "Penanaman bibit Tanaman Obat Keluarga (TOGA) serta penataan tata letak tanaman di lingkungan sekolah."
    },
    {
      src: "aktivitas-3-1.jpg",
      stage: "Tahap 03 • Pengembangan Pustaka Digital & Label QR",
      title: "Inventarisasi Data Botani & Pembuatan QR Code",
      caption: "Penyusunan data ilmiah, morfologi, manfaat, dan perawatan tanaman ke dalam website PUSTAKA TOGA SMPN 3."
    },
    {
      src: "aktivitas-3-2.jpg",
      stage: "Tahap 03 • Pengembangan Pustaka Digital & Label QR",
      title: "Pemasangan Papan Label QR Code",
      caption: "Pemasangan papan nama tanaman berbasis QR Code di area Taman TOGA SMP Negeri 3 Pontianak."
    },
    {
      src: "aktivitas-4-1.jpg",
      stage: "Tahap 04 • Sosialisasi & Literasi Hijau",
      title: "Sosialisasi Pemanfaatan PUSTAKA TOGA kepada Siswa",
      caption: "Pendampingan siswa memindai label QR Code menggunakan smartphone untuk mempelajari tanaman obat di sekolah."
    },
    {
      src: "aktivitas-4-2.jpg",
      stage: "Tahap 04 • Penyelesaian & Penyerahan Produk",
      title: "Dokumentasi Akhir Kegiatan Non-Mengajar MSB",
      caption: "Penyelesaian seluruh rangkaian kegiatan non-mengajar mahasiswa MSB FKIP UNTAN bersama warga SMP Negeri 3 Pontianak."
    }
  ];

  const [idx, setIdx] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState({});

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentItem = slides[idx];
  const isFailed = failedPhotos[currentItem.src];

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/10] rounded-2xl overflow-hidden border border-[#FFC0CB] bg-gradient-to-br from-[#FFF5F7] to-[#FFE4EC] shadow-xs group">
        {!isFailed ? (
          <img
            src={\`\${import.meta.env.BASE_URL}\${currentItem.src}\`}
            alt={currentItem.title}
            onError={() => setFailedPhotos((prev) => ({ ...prev, [currentItem.src]: true }))}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Sprout className="w-9 h-9 text-[#E76F95]" />
            <span className="inline-block bg-white border border-[#FFC0CB] text-[#B83B66] text-[10px] font-bold px-3 py-0.5 rounded-full">
              {currentItem.stage}
            </span>
            <p className="text-sm font-extrabold text-[#B83B66]">
              {currentItem.title}
            </p>
            <p className="text-[11px] text-[#4A2532]/75 max-w-md">
              Slot foto <strong>{currentItem.src}</strong> — unggah file foto ke folder <code>public/</code> untuk menampilkan dokumentasi kegiatan ini.
            </p>
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs text-[#B83B66] border border-[#FFC0CB] text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
          {currentItem.stage}
        </div>

        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {idx + 1} / {slides.length}
        </div>

        <button
          type="button"
          onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
          aria-label="Slide sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#B83B66] flex items-center justify-center shadow-sm text-sm font-extrabold"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setIdx((idx + 1) % slides.length)}
          aria-label="Slide berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#B83B66] flex items-center justify-center shadow-sm text-sm font-extrabold"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-8 pb-3 px-4 space-y-1">
          <h3 className="text-xs md:text-sm font-extrabold text-white leading-snug">
            {currentItem.title}
          </h3>
          <p className="text-[11px] text-white/90 leading-snug line-clamp-2">
            {currentItem.caption}
cat << 'EOF' > fix_single_slider.cjs
const { execSync } = require("child_process");
const fs = require("fs");

// 1. Ambil bagian asli dari commit 60209963ef5212bdcd10b09de662a1b693411206
const oldContent = execSync("git show 60209963ef5212bdcd10b09de662a1b693411206:src/App.jsx").toString();
const oldHeroStart = oldContent.indexOf("const HeroPhotoSlider = () => {");
const oldAppStart = oldContent.indexOf("export default function App()");

let cleanOriginalSection = oldContent.slice(oldHeroStart, oldAppStart).trim();

// Hapus jika ada NonTeachingAutoSlider lama di dalam cleanOriginalSection
const oldNtIdx = cleanOriginalSection.indexOf("const NonTeachingAutoSlider = () => {");
if (oldNtIdx !== -1) {
  const afterNt = cleanOriginalSection.indexOf("const WelcomeSplash", oldNtIdx);
  if (afterNt !== -1) {
    cleanOriginalSection = cleanOriginalSection.slice(0, oldNtIdx).trim() + "\n\n" + cleanOriginalSection.slice(afterNt).trim();
  } else {
    cleanOriginalSection = cleanOriginalSection.slice(0, oldNtIdx).trim();
  }
}

// 2. Satu definisi bersih NonTeachingAutoSlider (tanpa persentase)
const singleNonTeachingSlider = `const NonTeachingAutoSlider = () => {
  const slides = [
    {
      src: "aktivitas-1-1.jpg",
      stage: "Tahap 01 • Persetujuan Kepala Sekolah",
      title: "Koordinasi Awal & Pemaparan Program Kerja",
      caption: "Audiensi bersama Kepala Sekolah SMP Negeri 3 Pontianak dan Guru Pendamping untuk memperoleh persetujuan pelaksanaan program TOGA."
    },
    {
      src: "aktivitas-1-2.jpg",
      stage: "Tahap 01 • Persetujuan Kepala Sekolah",
      title: "Observasi Awal Lingkungan Sekolah",
      caption: "Peninjauan area taman sekolah bersama guru pendamping untuk memetakan potensi pengembangan Taman TOGA."
    },
    {
      src: "aktivitas-2-1.jpg",
      stage: "Tahap 02 • Pemetaan & Penataan Taman TOGA",
      title: "Pembersihan & Pengolahan Lahan Taman",
      caption: "Gotong royong mahasiswa MSB membersihkan area taman dan menggemburkan media tanam."
    },
    {
      src: "aktivitas-2-2.jpg",
      stage: "Tahap 02 • Pemetaan & Penataan Taman TOGA",
      title: "Penanaman & Penataan Koleksi Tanaman Obat",
      caption: "Penanaman bibit Tanaman Obat Keluarga (TOGA) serta penataan tata letak tanaman di lingkungan sekolah."
    },
    {
      src: "aktivitas-3-1.jpg",
      stage: "Tahap 03 • Pengembangan Pustaka Digital & Label QR",
      title: "Inventarisasi Data Botani & Pembuatan QR Code",
      caption: "Penyusunan data ilmiah, morfologi, manfaat, dan perawatan tanaman ke dalam website PUSTAKA TOGA SMPN 3."
    },
    {
      src: "aktivitas-3-2.jpg",
      stage: "Tahap 03 • Pengembangan Pustaka Digital & Label QR",
      title: "Pemasangan Papan Label QR Code",
      caption: "Pemasangan papan nama tanaman berbasis QR Code di area Taman TOGA SMP Negeri 3 Pontianak."
    },
    {
      src: "aktivitas-4-1.jpg",
      stage: "Tahap 04 • Sosialisasi & Literasi Hijau",
      title: "Sosialisasi Pemanfaatan PUSTAKA TOGA kepada Siswa",
      caption: "Pendampingan siswa memindai label QR Code menggunakan smartphone untuk mempelajari tanaman obat di sekolah."
    },
    {
      src: "aktivitas-4-2.jpg",
      stage: "Tahap 04 • Penyelesaian & Penyerahan Produk",
      title: "Dokumentasi Akhir Kegiatan Non-Mengajar MSB",
      caption: "Penyelesaian seluruh rangkaian kegiatan non-mengajar mahasiswa MSB FKIP UNTAN bersama warga SMP Negeri 3 Pontianak."
    }
  ];

  const [idx, setIdx] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState({});

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentItem = slides[idx];
  const isFailed = failedPhotos[currentItem.src];

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/10] rounded-2xl overflow-hidden border border-[#FFC0CB] bg-gradient-to-br from-[#FFF5F7] to-[#FFE4EC] shadow-xs group">
        {!isFailed ? (
          <img
            src={\`\${import.meta.env.BASE_URL}\${currentItem.src}\`}
            alt={currentItem.title}
            onError={() => setFailedPhotos((prev) => ({ ...prev, [currentItem.src]: true }))}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Sprout className="w-9 h-9 text-[#E76F95]" />
            <span className="inline-block bg-white border border-[#FFC0CB] text-[#B83B66] text-[10px] font-bold px-3 py-0.5 rounded-full">
              {currentItem.stage}
            </span>
            <p className="text-sm font-extrabold text-[#B83B66]">
              {currentItem.title}
            </p>
            <p className="text-[11px] text-[#4A2532]/75 max-w-md">
              Slot foto <strong>{currentItem.src}</strong> — unggah file foto ke folder <code>public/</code> untuk menampilkan dokumentasi kegiatan ini.
            </p>
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs text-[#B83B66] border border-[#FFC0CB] text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
          {currentItem.stage}
        </div>

        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {idx + 1} / {slides.length}
        </div>

        <button
          type="button"
          onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
          aria-label="Slide sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#B83B66] flex items-center justify-center shadow-sm text-sm font-extrabold"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setIdx((idx + 1) % slides.length)}
          aria-label="Slide berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#B83B66] flex items-center justify-center shadow-sm text-sm font-extrabold"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-8 pb-3 px-4 space-y-1">
          <h3 className="text-xs md:text-sm font-extrabold text-white leading-snug">
            {currentItem.title}
          </h3>
          <p className="text-[11px] text-white/90 leading-snug line-clamp-2">
            {currentItem.caption}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {slides.map((s, sIdx) => (
          <button
            key={sIdx}
            type="button"
            onClick={() => setIdx(sIdx)}
            className={\`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border \${
              sIdx === idx
                ? "bg-[#B83B66] text-white border-[#B83B66]"
                : "bg-[#FFF5F7] text-[#B83B66] border-[#FFC0CB] hover:bg-[#FFC0CB]/40"
            }\`}
          >
            {sIdx + 1}. {s.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
    </div>
  );
};`;

// 3. Pasang ke src/App.jsx
let curContent = fs.readFileSync("src/App.jsx", "utf8");
const curHeroStart = curContent.indexOf("const HeroPhotoSlider = () => {");
const curAppStart = curContent.indexOf("export default function App()");

curContent =
  curContent.slice(0, curHeroStart) +
  cleanOriginalSection +
  "\n\n" +
  singleNonTeachingSlider +
  "\n\n" +
  curContent.slice(curAppStart);

fs.writeFileSync("src/App.jsx", curContent);
console.log("SUKSES: NonTeachingAutoSlider kini hanya ada satu!");
