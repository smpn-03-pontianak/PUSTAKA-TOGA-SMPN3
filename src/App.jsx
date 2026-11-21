import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Leaf, Search, QrCode, ArrowLeft, Camera, Keyboard, 
  BookOpen, ChevronRight, Info, Trash2, 
  Edit3, LogOut, RefreshCw, Droplets, 
  MapPin, CheckCircle2, AlertCircle, Lock, Download,
  Smartphone, Eye, Sparkles, ArrowUpDown, Image as ImageIcon,
  ShieldCheck, Layers, Sprout
} from 'lucide-react';

// ============================================================================
// 1. INISIALISASI FIREBASE (PENYIMPANAN PERMANEN)
// ============================================================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyCaU13SSrHGjEdsNFrZ4fTuZgwDuDwnnA4", storageBucket: "pustaka-toga-smpn3.firebasestorage.app", messagingSenderId: "740819502420", appId: "1:740819502420:web:68f5fe5d259036887334c1",
      authDomain: 'pustaka-toga-smpn3.firebaseapp.com',
      projectId: 'pustaka-toga-smpn3'
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'pustaka-toga-smpn3';

// ============================================================================
// 2. DATA AWAL TANAMAN LINGKUNGAN SMP NEGERI 3 KOTA PONTIANAK
// ============================================================================
const INITIAL_PLANTS = [
  {
    id: 'PLT-001',
    code: 'SPN3-LIDAHBUAYA',
    name: 'Lidah Buaya Pontianak',
    scientificName: 'Aloe vera var. chinensis',
    category: 'Tanaman obat',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=900&q=80',
    description: 'Lidah buaya merupakan tanaman sukulen dengan daun tebal berdaging yang menyimpan cadangan air serta gel bening kaya manfaat. Tanaman ini menjadi salah satu ikon flora unggulan Kota Pontianak.',
    morphology: 'Tumbuhan herba sukulen tak berbatang jelas dengan susunan daun roset rapat berwarna hijau keabuan dan tepi bergerigi lunak.',
    parts: {
      daun: 'Tebal, berdaging, berbentuk tombak memanjang, ujung meruncing, bagian dalam berisi gel bening.',
      batang: 'Sangat pendek dan tersembunyi di balik pangkal pelepah daun yang tersusun melingkar.',
      akar: 'Akar serabut dangkal yang menyebar horizontal untuk menyerap air secara cepat.',
      bunga: 'Tumbuh pada tangkai tegak menjulang dari tengah roset, berwarna kuning hingga jingga kemerahan.',
      buah: 'Berbentuk kapsul kecil berisi biji-biji ringan setelah penyerbukan bunga.'
    },
    habitat: 'Tumbuh subur di tanah gembur berdrainase baik dengan paparan sinar matahari penuh di area apotek hidup SMP NEGERI 3 KOTA PONTIANAK.',
    benefits: 'Menyejukkan luka bakar ringan, melembapkan kulit, bahan minuman segar khas Pontianak, serta membantu menyaring polutan udara.',
    care: 'Siram secukupnya 2–3 kali seminggu saat media tanam mulai kering. Hindari genangan air agar akar tidak membusuk.',
    funFact: 'Lidah buaya Pontianak terkenal memiliki ukuran pelepah yang lebih besar dibandingkan varietas dari daerah lain karena kecocokan iklim tropis khatulistiwa!'
  },
  {
    id: 'PLT-002',
    code: 'SPN3-PUCUKMERAH',
    name: 'Pucuk Merah',
    scientificName: 'Syzygium myrtifolium',
    category: 'Tanaman hias',
    image: 'https://images.unsplash.com/photo-1598880940371-c756e015faf1?auto=format&fit=crop&w=900&q=80',
    description: 'Pucuk merah adalah tanaman perdu hias yang banyak ditanam sebagai pembatas taman sekolah karena pucuk daun mudanya berwarna merah menyala yang indah.',
    morphology: 'Perdu berkayu tegak dengan percabangan rapat, daun tunggal berhadapan, serta gradasi warna daun dari merah, jingga, hingga hijau tua.',
    parts: {
      daun: 'Tunggal, berbentuk lanset lonjong, permukaan mengilap; daun muda berwarna merah cerah lalu berubah hijau saat dewasa.',
      batang: 'Berkayu keras, bulat, bercabang banyak dari bagian bawah dengan kulit batang cokelat keabuan.',
      akar: 'Akar tunggang kuat dengan cabang akar serabut yang kokoh mencengkeram tanah.',
      bunga: 'Bunga majemuk kecil berwarna putih kekuningan dengan benang sari yang menonjol.',
      buah: 'Buah buni bulat kecil berwarna ungu kehitaman saat matang.'
    },
    habitat: 'Tumbuh optimal di halaman depan dan sepanjang jalur pedestrian taman SMP NEGERI 3 KOTA PONTIANAK dengan sinar matahari langsung.',
    benefits: 'Memperindah tata ruang sekolah, menyerap karbon dioksida, serta membantu menahan erosi tanah di tepi taman.',
    care: 'Lakukan pemangkasan pucuk secara berkala setiap 1–2 bulan untuk merangsang tumbuhnya tunas merah baru yang lebat.',
    funFact: 'Warna merah pada daun muda Pucuk Merah berasal dari pigmen antosianin yang melindungi daun muda dari paparan sinar ultraviolet berlebih!'
  },
  {
    id: 'PLT-003',
    code: 'SPN3-KETAPANG',
    name: 'Ketapang Kencana',
    scientificName: 'Terminalia mantaly',
    category: 'Tanaman pelindung',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=80',
    description: 'Ketapang kencana adalah pohon peneduh modern dengan tajuk bertingkat mendatar menyerupai payung sehingga menciptakan suasana sejuk di halaman sekolah.',
    morphology: 'Pohon berkayu tinggi dengan percabangan simetris mendatar bertingkat dan daun berukuran kecil yang rimbun.',
    parts: {
      daun: 'Berukuran kecil, bulat telur sungsang, tersusun rapat di ujung ranting dengan warna hijau segar.',
      batang: 'Tegak lurus, berkayu keras, berwarna cokelat keabuan dengan cabang tumbuh mendatar.',
      akar: 'Akar tunggang dalam dan kuat sehingga tahan terhadap tiupan angin kencang.',
      bunga: 'Bunga kecil tersusun dalam bulir pendek berwarna putih kehijauan.',
      buah: 'Buah kecil berbentuk lonjong pipih dengan sedikit sayap tipis.'
    },
    habitat: 'Area lapangan upacara dan tepi halaman parkir SMP NEGERI 3 KOTA PONTIANAK sebagai pohon peneduh utama.',
    benefits: 'Menurunkan suhu udara di sekitar halaman sekolah, memberikan keteduhan alami, dan menyerap debu udara.',
    care: 'Pohon dewasa sangat mandiri; cukup bersihkan daun gugur di sekitar pangkal batang dan beri pupuk kompos 6 bulan sekali.',
    funFact: 'Pola percabangan bertingkat pada Ketapang Kencana membentuk susunan alami yang memaksimalkan penangkapan cahaya matahari!'
  },
  {
    id: 'PLT-004',
    code: 'SPN3-JAMBUAIR',
    name: 'Jambu Air Madu Deli',
    scientificName: 'Syzygium aqueum',
    category: 'Tanaman buah',
    image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=900&q=80',
    description: 'Jambu air merupakan pohon buah tropis yang menghasilkan buah segar berair dengan rasa manis renyah dan sangat cocok tumbuh di iklim Pontianak.',
    morphology: 'Pohon buah berukuran sedang dengan tajuk rimbun, batang bercabang rendah, dan daun lebar berwarna hijau tua.',
    parts: {
      daun: 'Tunggal, berhadapan, berbentuk jorong lebar dengan tulang daun menyirip jelas.',
      batang: 'Berkayu, agak bengkok dengan kulit batang kecokelatan yang sedikit mengelupas halus.',
      akar: 'Akar tunggang dengan perakaran lateral yang luas untuk menyerap unsur hara.',
      bunga: 'Muncul berkelompok pada ranting atau ketiak daun, berwarna putih kehijauan dengan banyak benang sari.',
      buah: 'Berbentuk lonceng atau gasing, kulit mengilap berwarna hijau kemerahan, daging buah renyah dan berair.'
    },
    habitat: 'Kebun edukasi produktif SMP NEGERI 3 KOTA PONTIANAK dengan penyinaran matahari penuh dan tanah subur.',
    benefits: 'Menghasilkan buah sehat kaya vitamin C dan air, serta menjadi media belajar praktik budidaya tanaman buah bagi murid.',
    care: 'Siram teratur pada musim kemarau, berikan pupuk organik saat mulai berbunga, dan bungkus buah muda agar terhindar dari lalat buah.',
    funFact: 'Kandungan air dalam buah jambu air mencapai lebih dari 85%, menjadikannya salah satu buah paling menyegarkan di daerah tropis!'
  },
  {
    id: 'PLT-005',
    code: 'SPN3-LIDAHMERTUA',
    name: 'Lidah Mertua',
    scientificName: 'Dracaena trifasciata',
    category: 'Tanaman hias',
    image: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=900&q=80',
    description: 'Lidah mertua adalah tanaman hias tangguh berdaun tegak seperti pedang dengan corak belang hijau keperakan yang sangat mudah dirawat di pot maupun taman.',
    morphology: 'Tumbuhan herba menahun tanpa batang di atas tanah, memiliki rimpang bawah tanah dan daun kaku tegak.',
    parts: {
      daun: 'Tebal, kaku, tumbuh tegak vertikal dengan ujung meruncing dan motif garis melintang hijau tua-muda.',
      batang: 'Berupa rimpang (rhizome) yang menjalar di bawah permukaan tanah.',
      akar: 'Akar serabut berwarna putih kekuningan yang tumbuh dari rimpang.',
      bunga: 'Tumbuh pada tangkai tegak berisi bunga-bunga kecil putih kehijauan yang harum di malam hari.',
      buah: 'Buah buni bulat kecil berwarna jingga kemerahan.'
    },
    habitat: 'Teras ruang kelas, taman selasar, dan sudut hijau SMP NEGERI 3 KOTA PONTIANAK karena tahan tempat teduh maupun terang.',
    benefits: 'Mampu menyerap berbagai polutan udara dalam ruangan dan menghasilkan oksigen bahkan pada malam hari.',
    care: 'Sangat hemat air; cukup disiram 1–2 kali seminggu dan bersihkan debu pada permukaan daun dengan kain lembap.',
    funFact: 'Berbeda dari kebanyakan tumbuhan, Lidah Mertua melakukan fotosintesis CAM sehingga melepaskan oksigen pada malam hari!'
  },
  {
    id: 'PLT-006',
    code: 'SPN3-JAHEMERAH',
    name: 'Jahe Merah',
    scientificName: 'Zingiber officinale var. rubrum',
    category: 'Tanaman obat',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80',
    description: 'Jahe merah adalah tanaman rimpang berkhasiat obat dengan aroma pedas hangat yang khas dan kulit rimpang berwarna kemerahan.',
    morphology: 'Tumbuhan terna berbatang semu tegak yang tersusun dari pelepah-pelepah daun dengan rimpang bercabang di dalam tanah.',
    parts: {
      daun: 'Berbentuk pita memanjang, berseling, berwarna hijau dengan ujung meruncing.',
      batang: 'Batang semu tegak setinggi 40–70 cm yang terbentuk dari susunan pelepah daun.',
      akar: 'Akar serabut yang muncul dari bagian bawah rimpang yang gemuk dan bercabang.',
      bunga: 'Muncul langsung dari rimpang berupa tongkol bulat telur dengan kelopak kemerahan.',
      buah: 'Rimpang bawah tanah berkulit merah keunguan dengan rasa pedas kuat (bagian utama yang dimanfaatkan).'
    },
    habitat: 'Bedengan tanaman toga (tanaman obat keluarga) SMP NEGERI 3 KOTA PONTIANAK yang gembur dan kaya humus.',
    benefits: 'Menghangatkan tubuh, membantu meredakan batuk dan masuk angin, serta meningkatkan daya tahan tubuh secara alami.',
    care: 'Tanam pada tanah gembur yang tidak tergenang air, beri pupuk kompos secara berkala, dan panen setelah berumur 8–10 bulan.',
    funFact: 'Rasa pedas dan hangat pada Jahe Merah berasal dari senyawa alami bernama gingerol dan shogaol yang tinggi!'
  }
];

const PLANT_FACTS = [
  {
    title: 'Pabrik Oksigen Alami Sekolah',
    description: 'Satu pohon rindang di halaman sekolah dapat menghasilkan oksigen yang cukup untuk kebutuhan pernapasan dua orang setiap harinya.'
  },
  {
    title: 'Penyerap Polusi Udara',
    description: 'Tanaman seperti Lidah Mertua dan Pucuk Merah membantu menyaring debu halus serta gas karbon dioksida di lingkungan belajar.'
  },
  {
    title: 'Penyejuk Suhu Lingkungan',
    description: 'Area sekolah yang memiliki pepohonan peneduh dapat bersuhu 2°C hingga 4°C lebih sejuk dibandingkan halaman berbeton tanpa tanaman.'
  }
];

// ============================================================================
// 3. KOMPONEN GENERATOR QR CODE & UNDUH PNG OTOMATIS
// ============================================================================
const SmartPlantQRWidget = ({ code, plantName = "Tanaman", size = 140, showDownload = false }) => {
  const cleanCode = (code || "SPN3-PLANT").trim().toUpperCase();
  const plantUrl = `https://smpn-03-pontianak.github.io/PUSTAKA-TOGA-SMPN3/?plant=${encodeURIComponent(cleanCode)}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(plantUrl)}`;

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR-${cleanCode}-${plantName.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(qrImgUrl, "_blank");
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
      <div
        className="bg-white p-1.5 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={qrImgUrl}
          alt={`QR Code ${plantName} (${cleanCode})`}
          width={size}
          height={size}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>
      <span className="text-[11px] font-mono font-bold tracking-wider text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
        {cleanCode}
      </span>
      {showDownload && (
        <button
          type="button"
          onClick={handleDownloadQR}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh QR Code
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 4. KOMPONEN ILUSTRASI BOTANI MODERN (MODEL PORTRAIT)
// ============================================================================
const BotanicalIllustration = () => (
  <div className="w-full space-y-5 pt-3 pb-2">
  <style>{"@keyframes bentoReveal {\n  0% { opacity: 0; transform: translateY(18px) scale(0.985); }\n  100% { opacity: 1; transform: translateY(0) scale(1); }\n}\n.bento-heading { opacity: 0; animation: bentoReveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards; }\n.bento-box-1 { opacity: 0; animation: bentoReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; }\n.bento-box-2 { opacity: 0; animation: bentoReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards; }\n.bento-box-3 { opacity: 0; animation: bentoReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards; }\n.bento-box-4 { opacity: 0; animation: bentoReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.95s forwards; }"}</style>

  {/* Judul Terpusat Dua Warna seperti Referensi */}
  <div className="text-center max-w-2xl mx-auto px-2 space-y-1.5 bento-heading">
    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-0.5 rounded-full">
      Karya &amp; Inovasi Mahasiswa
    </span>
    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-snug">
      Hasil Produk Program MSB{" "}
      <span className="text-[#FDE68A] font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
        FKIP UNTAN di SMP NEGERI 3 KOTA PONTIANAK
      </span>
    </h2>
  </div>

  {/* Bento Grid 4 Produk */}
  <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
    {/* Produk 1 (Kiri Vertikal Tinggi): Taman Toga */}
    <div className="md:col-span-5 relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[350px] shadow-xs group bento-box-1 bg-emerald-950">
      <img
        src={`${import.meta.env.BASE_URL}taman-toga.jpeg`}
        alt="Taman Toga SMP NEGERI 3 KOTA PONTIANAK"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1 z-10">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 text-white">
          Produk 01
        </span>
        <h3 className="text-sm sm:text-base font-bold leading-snug text-white">
          Taman Toga
        </h3>
        <p className="text-xs leading-relaxed text-white/85">
          Penataan kebun edukasi Tanaman Obat Keluarga (TOGA) yang asri dan tertata di lingkungan SMP NEGERI 3 KOTA PONTIANAK.
        </p>
      </div>
    </div>

    {/* Kolom Kanan (Produk 2 Atas + Produk 3 & 4 Bawah) */}
    <div className="md:col-span-7 flex flex-col gap-3.5">
      {/* Produk 2 (Kanan Atas Lebar): Flip Book */}
      <div className="relative rounded-2xl overflow-hidden min-h-[165px] sm:min-h-[180px] shadow-xs group bento-box-2 bg-emerald-900">
        <div data-placeholder="Flip-Book" className="absolute inset-0 bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-900 flex flex-col items-center justify-center p-4 text-center pb-24">
        <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-dashed border-white/35 backdrop-blur-xs max-w-[90%]">
          <p className="text-[10px] uppercase tracking-widest text-emerald-200/80 font-semibold mb-0.5">
            File Foto
          </p>
          <p className="text-xs sm:text-sm font-mono font-bold text-white break-words">
            Flip-Book
          </p>
        </div>
      </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 text-white">
            Produk 02
          </span>
          <h3 className="text-sm sm:text-base font-bold leading-snug text-white">
            Flip Book
          </h3>
          <p className="text-xs leading-relaxed text-white/85">
            Buku digital interaktif sebagai panduan praktis mengenal jenis, klasifikasi, dan manfaat tanaman obat keluarga.
          </p>
        </div>
      </div>

      {/* Produk 3 & 4 (Kanan Bawah Berdampingan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {/* Produk 3: Eco Enzym */}
        <div className="relative rounded-2xl overflow-hidden min-h-[155px] shadow-xs group bento-box-3 bg-emerald-900">
          <img
            src={`${import.meta.env.BASE_URL}Eco-Enzym.jpeg`}
            alt="Eco Enzym SMP NEGERI 3 KOTA PONTIANAK"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 p-3.5 text-white space-y-0.5 z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 text-white">
              Produk 03
            </span>
            <h3 className="text-xs sm:text-sm font-bold leading-snug text-white">
              Eco Enzym
            </h3>
            <p className="text-[11px] leading-snug text-white/85">
              Inovasi pengolahan limbah organik menjadi cairan serbaguna ramah lingkungan.
            </p>
          </div>
        </div>

        {/* Produk 4: Website-Pustaka TOGA */}
        <div className="relative rounded-2xl overflow-hidden min-h-[155px] shadow-xs group bento-box-4 bg-emerald-900">
          <img
            src={`${import.meta.env.BASE_URL}${encodeURIComponent("Website-Pustaka TOGA SMP Negeri 3 Kota Pontianak.jpeg")}`}
            alt="Website-Pustaka TOGA SMP Negeri 3 Kota Pontianak"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 p-3.5 text-white space-y-0.5 z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 text-white">
              Produk 04
            </span>
            <h3 className="text-xs sm:text-sm font-bold leading-snug text-white">
              Website-Pustaka TOGA SMP NEGERI 3 KOTA PONTIANAK
            </h3>
            <p className="text-[11px] leading-snug text-white/85">
              Platform edukasi digital terintegrasi label QR Code tanaman.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);

// ============================================================================
// 5. APLIKASI UTAMA: PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK – SMP NEGERI 3 KOTA PONTIANAK (MODEL PORTRAIT)
// ============================================================================

const RichTextContent = ({ content, defaultAlign = "text-justify" }) => {
  if (!content) return null;
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtml) {
    return (
      <div
        className={`rich-botanical text-xs text-slate-800 leading-relaxed ${defaultAlign}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const isNumberedList = lines.length > 1 && lines.every(l => /^\d+[.)]\s+/.test(l));

  if (isNumberedList) {
    return (
      <ol className={`list-decimal pl-5 space-y-1.5 text-xs text-slate-800 leading-relaxed ${defaultAlign}`}>
        {lines.map((line, i) => (
          <li key={i} className="pl-1">
            {line.replace(/^\d+[.)]\s+/, "")}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={`space-y-1.5 text-xs text-slate-800 leading-relaxed ${defaultAlign}`}>
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};

const AdminRichEditor = ({ label, value, onChange, minHeight = "80px" }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="space-y-1">
      {label && <label className="text-[11px] font-bold text-[#1E293B] block">{label}</label>}
      <div className="rounded-xl border border-[#E3CCA8] bg-[#FCF7F0] overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-white border-b border-[#E3CCA8]/70 text-[11px]">
          <button type="button" onClick={() => execCmd("bold")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] font-extrabold text-[#1E293B] border border-[#E3CCA8]/60">B</button>
          <button type="button" onClick={() => execCmd("italic")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] italic font-semibold text-[#1E293B] border border-[#E3CCA8]/60">I</button>
          <button type="button" onClick={() => execCmd("underline")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] underline font-semibold text-[#1E293B] border border-[#E3CCA8]/60">U</button>
          <button type="button" onClick={() => execCmd("insertOrderedList")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] font-bold text-[#1E293B] border border-[#E3CCA8]/60">1. List</button>
          <button type="button" onClick={() => execCmd("justifyLeft")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] text-[#4A2532] border border-[#E3CCA8]/60">Kiri</button>
          <button type="button" onClick={() => execCmd("justifyCenter")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] text-[#4A2532] border border-[#E3CCA8]/60">Tengah</button>
          <button type="button" onClick={() => execCmd("justifyRight")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] text-[#4A2532] border border-[#E3CCA8]/60">Kanan</button>
          <button type="button" onClick={() => execCmd("justifyFull")} className="px-2 py-0.5 rounded hover:bg-[#FCF7F0] text-[#4A2532] border border-[#E3CCA8]/60">Kanan-Kiri</button>
          <select
            onChange={(e) => { if (e.target.value) execCmd("fontName", e.target.value); }}
            defaultValue=""
            className="ml-auto px-2 py-0.5 rounded bg-[#FCF7F0] border border-[#E3CCA8] text-[10px] font-bold text-[#1E293B] outline-none"
          >
            <option value="" disabled>Pilih Font</option>
            <option value="Plus Jakarta Sans, sans-serif">Sans Modern</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Monospace</option>
          </select>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          style={{ minHeight }}
          className="rich-botanical p-3 text-xs text-[#4A2532] leading-relaxed outline-none bg-[#FCF7F0]"
        />
      </div>
    </div>
  );
};

const HeroPhotoSlider = () => {
  const photos = ["1.jpeg","22.jpeg","33.jpeg","hero-toga.jpeg"];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [photos.length]);

  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + photos.length) % photos.length);
  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % photos.length);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E3CCA8]/80 shadow-sm bg-[#FCF7F0] group">
      {photos.map((photo, idx) => (
        <div
          key={photo + idx}
          className={`w-full transition-opacity duration-700 ${
            idx === currentIdx ? "relative opacity-100 z-10" : "absolute inset-0 opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={`${import.meta.env.BASE_URL}${photo}?v=1794565952752`}
            alt={`Dokumentasi Taman Toga SMPN 3 - ${idx + 1}`}
            className="w-full h-auto max-h-[520px] object-contain mx-auto block"
          />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 via-black/15 to-transparent z-20 pointer-events-none" />

      <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm text-[#1E293B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#E3CCA8]">
        Galeri Taman Toga SMP NEGERI 3 KOTA PONTIANAK
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Foto sebelumnya"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#1E293B] flex items-center justify-center shadow text-xs font-bold"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Foto berikutnya"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#1E293B] flex items-center justify-center shadow text-xs font-bold"
          >
            ›
          </button>

          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Pilih foto ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? "w-5 bg-[#E3CCA8]" : "w-1.5 bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const WelcomeSplash = ({ onFinish }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosing(true), 1600);
    const finishTimer = setTimeout(() => onFinish(), 2200);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setClosing(true);
    setTimeout(() => onFinish(), 450);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#FCF7F0] via-[#F3E4CE] to-[#E3CCA8]/60 px-6 text-center transition-all duration-700 ${
        closing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative flex flex-col items-center max-w-md animate-[fadeInUp_0.8s_ease-out]">
        {/* Lingkaran Ikon Daun Berdenyut Lembut */}
        <div className="w-24 h-24 rounded-3xl bg-white shadow-lg border border-[#E3CCA8] flex items-center justify-center p-2.5 mb-5 animate-bounce overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}logo-toga.png?v=2`}
            alt="Logo Pustaka TOGA SMPN 3"
            className="w-full h-full object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-1.5 bg-white/80 border border-[#E3CCA8] px-3.5 py-1 rounded-full text-xs font-bold text-[#1E293B] mb-3 shadow-2xs">
          🌿 Selamat Datang di
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight leading-snug mb-2">
          PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#4A2532]/80 mb-6">
          Edukasi Digital Tanaman Obat Keluarga • SMP NEGERI 3 KOTA PONTIANAK
        </p>

        {/* Bilah Progres Animasi */}
        <div className="w-48 h-1.5 bg-white/80 rounded-full overflow-hidden border border-[#E3CCA8]/60 mb-5">
          <div className="h-full bg-gradient-to-r from-[#A3620A] to-[#7C4700] rounded-full animate-[progressFill_1.7s_ease-in-out_forwards]" />
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] font-bold text-[#1E293B]/80 hover:text-[#1E293B] underline underline-offset-4 transition-colors"
        >
          Masuk Sekarang →
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const PointPhotoSlider = ({ photos, altTitle }) => {
  const [idx, setIdx] = useState(0);
  const [missingFiles, setMissingFiles] = useState({});

  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % photos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [photos]);

  const currentSrc = photos[idx];
  const isMissing = missingFiles[currentSrc];

  return (
    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#E3CCA8] bg-gradient-to-br from-[#FCF7F0] to-[#F3E4CE] shadow-sm group">
      {!isMissing ? (
        <img
          src={`${import.meta.env.BASE_URL}${currentSrc}`}
          alt={`${altTitle} - Foto ${idx + 1}`}
          onError={() => setMissingFiles((prev) => ({ ...prev, [currentSrc]: true }))}
          className="w-full h-full object-cover transition-all duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E3CCA8] flex items-center justify-center shadow-2xs">
            <Sprout className="w-5 h-5 text-[#1E293B]" />
          </div>
          <p className="text-xs font-extrabold text-[#1E293B]">
            Slide Foto Kegiatan ({idx + 1}/{photos.length})
          </p>
          <p className="text-[11px] text-[#4A2532]/75">
            Unggah file <code className="bg-white px-2 py-0.5 rounded border border-[#E3CCA8] font-bold text-[#1E293B]">{currentSrc}</code> ke folder <code>public/</code>
          </p>
        </div>
      )}

      <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
        {idx + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            aria-label="Foto sebelumnya"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-sm text-sm font-extrabold transition-transform active:scale-95"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((idx + 1) % photos.length)}
            aria-label="Foto berikutnya"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1E293B] flex items-center justify-center shadow-sm text-sm font-extrabold transition-transform active:scale-95"
          >
            ›
          </button>
          <div className="absolute bottom-2.5 inset-x-0 z-10 flex items-center justify-center gap-1.5">
            {photos.map((_, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setIdx(pIdx)}
                aria-label={`Pilih foto ${pIdx + 1}`}
                className={`h-1.5 rounded-full transition-all ${pIdx === idx ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/55 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const NonTeachingAutoSlider = () => {
  const milestones = [
    {
      num: "1",
      stage: "Tahap 01 • Koordinasi & Perizinan",
      title: "Koordinasi Awal & Pemaparan Program Kerja",
      points: [
        "Audiensi bersama Kepala Sekolah SMP NEGERI 3 KOTA PONTIANAK dan Guru Pendamping untuk memperoleh persetujuan resmi pelaksanaan program TOGA.",
        "Penyampaian rancangan kegiatan non-mengajar Mahasiswa MSB FKIP UNTAN yang selaras dengan program Sekolah Adiwiyata dan Sekolah Digital.",
        "Penyelarasan jadwal pelaksanaan serta titik lokasi pengembangan Taman TOGA di lingkungan sekolah."
      ],
      photos: ["aktivitas-1.jpeg", "aktivitas-1b.jpeg"]
    },
    {
      num: "2",
      stage: "Tahap 02 • Observasi Lingkungan Sekolah",
      title: "Observasi Awal Lingkungan Sekolah",
      points: [
        "Peninjauan langsung kondisi eksisting area taman sekolah bersama guru pendamping.",
        "Identifikasi jenis tanaman obat yang sudah tersedia serta pemetaan lahan potensial untuk penambahan koleksi baru.",
        "Pencatatan kebutuhan media tanam, peralatan berkebun, dan papan informasi tanaman."
      ],
      photos: ["aktivitas-2.jpeg", "aktivitas-2b.jpeg", "aktivitas-2c.jpeg"]
    },
    {
      num: "3",
      stage: "Tahap 03 • Pembersihan & Pengolahan Lahan",
      title: "Pembersihan & Pengolahan Lahan Taman",
      points: [
        "Gotong royong mahasiswa MSB membersihkan gulma, rumput liar, serta sampah organik di sekitar area Taman TOGA.",
        "Penggemburan tanah dan pencampuran pupuk organik agar media tanam siap ditanami bibit baru.",
        "Perapian batas petak taman supaya jalur pengamatan siswa tertata bersih dan nyaman."
      ],
      photos: ["aktivitas-3.jpeg", "aktivitas-3b.jpeg", "aktivitas-3c.jpeg"]
    },
    {
      num: "4",
      stage: "Tahap 04 • Penanaman & Penataan Koleksi",
      title: "Penanaman & Penataan Koleksi Tanaman Obat",
      points: [
        "Penanaman ragam bibit Tanaman Obat Keluarga (TOGA) pilihan berdasarkan kebutuhan cahaya dan karakter pertumbuhannya.",
        "Pengelompokan tata letak tanaman agar memudahkan proses perawatan berkala dan identifikasi spesies.",
        "Penyiraman awal serta pemantauan kesegaran bibit pascapenanaman."
      ],
      photos: ["aktivitas-4.jpeg", "aktivitas-4b.jpeg", "aktivitas-4c.jpeg"]
    },
    {
      num: "5",
      stage: "Tahap 05 • Inventarisasi Data & Pembuatan QR Code",
      title: "Inventarisasi Data Botani & Pembuatan QR Code",
      points: [
        "Pendataan nama lokal, nama ilmiah, klasifikasi taksonomi, morfologi, manfaat kesehatan, dan cara perawatan tiap spesies.",
        "Integrasi seluruh basis data ilmiah ke dalam platform katalog digital PUSTAKA TOGA SMPN 3.",
        "Pembuatan dan pengujian kode QR unik yang terhubung langsung ke halaman profil masing-masing tanaman."
      ],
      photos: ["aktivitas-5.jpeg", "aktivitas-5b.jpeg", "aktivitas-5c.jpeg"]
    },
    {
      num: "6",
      stage: "Tahap 06 • Pemasangan Papan Label QR Code",
      title: "Pemasangan Papan Label QR Code",
      points: [
        "Pencetakan papan nama tanaman tahan cuaca yang memuat nama spesies dan kode QR PUSTAKA TOGA.",
        "Pemasangan papan label di setiap titik tanaman pada area Taman TOGA SMP NEGERI 3 KOTA PONTIANAK.",
        "Uji coba pemindaian langsung di lapangan menggunakan kamera ponsel untuk memastikan kecepatan akses halaman."
      ],
      photos: ["aktivitas-6.jpeg", "aktivitas-6b.jpeg", "aktivitas-6c.jpeg"]
    },
    {
      num: "7",
      stage: "Tahap 07 • Sosialisasi Pemanfaatan PUSTAKA TOGA",
      title: "Sosialisasi Pemanfaatan PUSTAKA TOGA kepada Siswa",
      points: [
        "Pendampingan siswa dan guru memindai label QR Code secara langsung di area Taman TOGA menggunakan smartphone.",
        "Pengenalan cara membaca informasi botani dan khasiat tanaman obat sebagai media belajar kontekstual.",
        "Menumbuhkan literasi hijau serta kepedulian warga sekolah terhadap pelestarian tanaman berkhasiat."
      ],
      photos: ["aktivitas-7.jpeg", "aktivitas-7b.jpeg", "aktivitas-7c.jpeg"]
    },
    {
      num: "8",
      stage: "Tahap 08 • Dokumentasi Akhir & Penyerahan Produk",
      title: "Dokumentasi Akhir Kegiatan Non-Mengajar MSB",
      points: [
        "Serah terima produk inovasi digital PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK beserta area taman yang telah direvitalisasi kepada pihak sekolah.",
        "Evaluasi keberlanjutan pemeliharaan taman dan pemanfaatan katalog digital bersama guru pendamping.",
        "Dokumentasi bersama jajaran pimpinan sekolah, guru, dan tim mahasiswa MSB FKIP UNTAN."
      ],
      photos: ["aktivitas-8.jpeg", "aktivitas-8b.jpeg", "aktivitas-8c.jpeg"]
    }
  ];

  return (
    <div className="divide-y divide-[#E3CCA8]/70">
      {milestones.map((item, index) => {
        const isEven = index % 2 === 1;
        return (
          <div
            key={item.num}
            className="py-6 first:pt-2 last:pb-2 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center"
          >
            {/* Kolom Penjelasan Poin */}
            <div className={`lg:col-span-6 space-y-2.5 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7C4700] bg-[#FCF7F0] border border-[#E3CCA8] px-2.5 py-0.5 rounded-full">
                {item.stage}
              </span>
              <h3 className="text-base md:text-lg font-extrabold text-[#1E293B] leading-snug">
                {item.num}. {item.title}
              </h3>
              <ul className="space-y-1.5 text-xs text-[#4A2532]/90 leading-relaxed">
                {item.points.map((pt, ptIdx) => (
                  <li key={ptIdx} className="flex items-start gap-2">
                    <span className="text-[#7C4700] font-extrabold mt-0.5">–</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom Slide Foto Kegiatan */}
            <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
              <PointPhotoSlider photos={item.photos} altTitle={`${item.num}. ${item.title}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem("toga_smpn3_intro_seen");
    } catch {
      return true;
    }
  });

  const handleFinishSplash = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem("toga_smpn3_intro_seen", "1");
    } catch {}
  };
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [plants, setPlants] = useState(INITIAL_PLANTS);

  // Navigasi Halaman ('beranda' | 'koleksi' | 'aktivitas' | 'tentang' | 'scan' | 'admin')
  const [activePage, setActivePage] = useState('beranda');
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plantParam = params.get("plant");
    if (plantParam && plants.length > 0) {
      const found = plants.find(
        p => p.code?.toUpperCase() === plantParam.trim().toUpperCase() || p.id === plantParam.trim()
      );
      if (found) {
        setSelectedPlant(found);
        setActivePage("koleksi");
      }
    }
  }, [plants]);

  // Filter, Pencarian, dan Pengurutan Koleksi
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('asc');

  // Scanner QR Code
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Administrator
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("pustaka_toga_admin") === "true");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [editingPlantId, setEditingPlantId] = useState(null);

  const emptyPlantForm = {
    name: '',
    code: '',
    scientificName: '',
    category: 'Tanaman hias',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    description: '',
    morphology: '',
    daun: '',
    batang: '',
    akar: '',
    bunga: '',
    buah: '', daunImage: '', batangImage: '', akarImage: '', bungaImage: '', buahImage: '',
    habitat: '',
    benefits: '',
    care: '',
    funFact: ''
  };
  const [plantForm, setPlantForm] = useState(emptyPlantForm);

  // Notifikasi & Fakta
  const [notification, setNotification] = useState(null);
  const [factIndex, setFactIndex] = useState(0);

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ============================================================================
  // 6. KONEKSI FIREBASE AUTH & SINKRONISASI DATA TANAMAN REALTIME
  // ============================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Mode penyimpanan lokal aktif:', err.message);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const plantsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'plants');
    const unsubPlants = onSnapshot(plantsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlants(list);
      } else {
        INITIAL_PLANTS.forEach(async (item) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plants', item.id), item);
        });
      }
    }, (err) => console.warn('Sync plants:', err));

    return () => unsubPlants();
  }, [firebaseUser]);

  useEffect(() => {
    if (activePage !== 'scan' && cameraActive) {
      stopCamera();
    }
  }, [activePage]);

  // ============================================================================
  // 7. LOGIKA SCANNER QR CODE (KAMERA & MANUAL)
  // ============================================================================
  const startCamera = async () => {
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setCameraActive(false);
      setScanError('Kamera tidak dapat diakses pada perangkat atau browser ini. Silakan gunakan input kode QR manual di bawah.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!cameraActive) return;
    let intervalId;
    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      intervalId = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleOpenPlantByCode(barcodes[0].rawValue);
            }
          } catch (e) {}
        }
      }, 700);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, plants]);

  const handleOpenPlantByCode = (rawInput) => {
    const cleaned = rawInput.trim().toUpperCase();
    if (!cleaned) return;

    const found = plants.find(
      p => p.code.toUpperCase() === cleaned ||
           p.id.toUpperCase() === cleaned ||
           p.name.toUpperCase().includes(cleaned)
    );

    if (found) {
      stopCamera();
      setSelectedPlant(found);
      setActivePage('koleksi');
      setManualCode('');
      showToast('QR Code Terbaca', `Membuka informasi lengkap untuk ${found.name}.`);
    } else {
      showToast('Kode Tidak Ditemukan', `Kode "${cleaned}" tidak cocok dengan tanaman terdaftar.`, 'error');
    }
  };

  // ============================================================================
  // 8. LOGIKA DASHBOARD ADMINISTRATOR
  // ============================================================================
  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPassword.trim() === 'MSBSPANTA') {
      localStorage.setItem("pustaka_toga_admin", "true"); setIsAdmin(true);
      setShowAdminLogin(false);
      setActivePage('admin');
      setAdminPassword('');
      setAdminLoginError('');
      showToast('Login Berhasil', 'Selamat datang di Dashboard Administrator SMP NEGERI 3 KOTA PONTIANAK.');
    } else {
      setAdminLoginError('Kode akses administrator salah. Silakan periksa kembali.');
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const img = new Image(); img.onload = () => { const canvas = document.createElement("canvas"); const maxW = 800; const scale = img.width > maxW ? maxW / img.width : 1; canvas.width = img.width * scale; canvas.height = img.height * scale; canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height); const compressed = canvas.toDataURL("image/jpeg", 0.75); setPlantForm(prev => ({ ...prev, image: compressed })); showToast("Foto Siap", "Foto berhasil dikompresi dan dimuat ke pratinjau."); }; img.src = reader.result; };
    reader.readAsDataURL(file);
  };

    const handlePartImageUpload = (partKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 600;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        setPlantForm(prev => ({ ...prev, [partKey + "Image"]: compressed }));
        showToast("Foto Bagian Siap", "Foto bagian tanaman berhasil dimuat.");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlant = async (e) => {
    e.preventDefault();
    if (!plantForm.name.trim() || !plantForm.code.trim()) return;

    const id = editingPlantId || `PLT-${Date.now().toString().slice(-4)}`;
    const payload = {
      id,
      code: plantForm.code.trim().toUpperCase(),
      name: plantForm.name.trim(),
      scientificName: plantForm.scientificName.trim() || 'Spesies belum dicantumkan',
      category: plantForm.category,
      image: plantForm.image,
      description: plantForm.description,
      morphology: plantForm.morphology,
      parts: {
        daun: plantForm.daun,
        batang: plantForm.batang,
        akar: plantForm.akar,
        bunga: plantForm.bunga,
        buah: plantForm.buah
      },
      partsImages: {
        daun: plantForm.daunImage || "",
        batang: plantForm.batangImage || "",
        akar: plantForm.akarImage || "",
        bunga: plantForm.bungaImage || "",
        buah: plantForm.buahImage || ""
      },
      habitat: plantForm.habitat,
      benefits: plantForm.benefits,
      care: plantForm.care,
      funFact: plantForm.funFact
    };

    setPlants(prev => editingPlantId ? prev.map(p => p.id === id ? payload : p) : [payload, ...prev]);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, "artifacts", appId, "public", "data", "plants", id), payload);
      } catch (err) {
        console.error("Gagal simpan ke Firebase:", err);
        showToast("Gagal Simpan Cloud", err.message, "error");
        return;
      }
    }

    setEditingPlantId(null);
    setPlantForm(emptyPlantForm);
    showToast(
      editingPlantId ? 'Perubahan Disimpan' : 'Tanaman Ditambahkan',
      `${payload.name} kini tersedia di Koleksi Tanaman dan dapat dipindai melalui QR Code.`
    );
  };

  const handleStartEditPlant = (plant) => {
    setEditingPlantId(plant.id);
    setPlantForm({
      name: plant.name || '',
      code: plant.code || '',
      scientificName: plant.scientificName || '',
      category: plant.category || 'Tanaman hias',
      image: plant.image || '',
      description: plant.description || '',
      morphology: plant.morphology || '',
      daun: plant.parts?.daun || '',
      batang: plant.parts?.batang || '',
      akar: plant.parts?.akar || '',
      bunga: plant.parts?.bunga || '',
      buah: plant.parts?.buah || "",
      daunImage: plant.partsImages?.daun || "",
      batangImage: plant.partsImages?.batang || "",
      akarImage: plant.partsImages?.akar || "",
      bungaImage: plant.partsImages?.bunga || "",
      buahImage: plant.partsImages?.buah || "",
      habitat: plant.habitat || '',
      benefits: plant.benefits || '',
      care: plant.care || '',
      funFact: plant.funFact || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlant = async (id, name) => {
    if (firebaseUser) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plants', id));
    } else {
      setPlants(prev => prev.filter(p => p.id !== id));
    }
    if (selectedPlant?.id === id) setSelectedPlant(null);
    showToast('Tanaman Dihapus', `Data ${name} telah dihapus dari koleksi.`);
  };

  // ============================================================================
  // 9. FILTER & PENGURUTAN DATA KOLEKSI TANAMAN
  // ============================================================================
  const filteredAndSortedPlants = plants
    .filter(plant => {
      const matchCat = selectedCategory === 'Semua' || plant.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchQuery =
        plant.name.toLowerCase().includes(q) ||
        plant.scientificName.toLowerCase().includes(q) ||
        plant.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name, 'id')
        : b.name.localeCompare(a.name, 'id');
    });

  // ============================================================================
  // 10. RENDER ANTARMUKA PENGGUNA (MODEL PORTRAIT)
  // ============================================================================
  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
      className="min-h-screen bg-[#E7ECE4] text-[#4A2532] flex justify-center selection:bg-[#E3CCA8] selection:text-[#1E293B]"
    >
      {showSplash && <WelcomeSplash onFinish={handleFinishSplash} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes scanLine {
          0% { transform: translateY(0); }
          50% { transform: translateY(190px); }
          100% { transform: translateY(0); }
        }
        .animate-scan-line {
          animation: scanLine 2.4s ease-in-out infinite;
        }
        
        @keyframes contentRevealUp {
          0% { opacity: 0; transform: translateX(48px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes headerSlideDown {
          0% { opacity: 0; transform: translateX(32px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-header-enter {
          animation: headerSlideDown 1.05s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-page-enter > section,
        .animate-page-enter > div {
          opacity: 0;
          animation: contentRevealUp 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-page-enter > section:nth-child(1),
        .animate-page-enter > div:nth-child(1) { animation-delay: 0.12s; }
        .animate-page-enter > section:nth-child(2),
        .animate-page-enter > div:nth-child(2) { animation-delay: 0.28s; }
        .animate-page-enter > section:nth-child(3),
        .animate-page-enter > div:nth-child(3) { animation-delay: 0.44s; }
        .animate-page-enter > section:nth-child(4),
        .animate-page-enter > div:nth-child(4) { animation-delay: 0.60s; }
        .animate-page-enter > section:nth-child(5),
        .animate-page-enter > div:nth-child(5) { animation-delay: 0.76s; }
        .animate-page-enter h1,
        .animate-page-enter h2,
        .animate-page-enter h3,
        .animate-page-enter p,
        .animate-page-enter img,
        .animate-page-enter button {
          animation: contentRevealUp 1.25s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.22s;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Bingkai Utama Model Portrait */}
      <div className="w-full max-w-[480px] md:max-w-none min-h-screen bg-[#FCF7F0] shadow-2xl md:shadow-none border-x md:border-x-0 border-[#E3CCA8]/60 flex flex-col relative pb-24 md:pb-8 overflow-x-hidden">

        {/* NOTIFIKASI TOAST PORTRAIT */}
        {notification && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[440px]">
            <div className={`flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border ${
              notification.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-[#7C4700] border-[#E3CCA8] text-white'
            }`}>
              {notification.type === 'error'
                ? <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                : <CheckCircle2 className="w-5 h-5 text-[#E3CCA8] flex-shrink-0 mt-0.5" />
              }
              <div>
                <h4 className="font-bold text-xs">{notification.title}</h4>
                <p className="text-[11px] opacity-90 mt-0.5">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER PORTRAIT */}
        <header className={`sticky top-0 z-40 bg-gradient-to-r from-[#7C4700] via-[#2D6A4F] to-[#A3620A] border-b border-[#E3CCA8]/40 px-4 py-3.5 shadow-md text-white ${!showSplash ? "animate-header-enter" : "opacity-0"}`}>
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => { setActivePage('beranda'); setSelectedPlant(null); }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#E3CCA8] flex items-center justify-center p-1 shadow-sm relative flex-shrink-0 overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}logo-toga.png?v=3`}
                  alt="Logo Pustaka TOGA SMPN 3"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block leading-tight drop-shadow-xs">
                  PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK
                </span>
                <span className="text-[10px] font-bold text-[#F3E4CE] tracking-wide block">
                  MSB FKIP UNTAN 2026
                </span>
              </div>
            </div>

            
            <nav className="hidden md:flex items-center gap-1.5">
              {[
                { id: "beranda", label: "Beranda" },
                { id: "koleksi", label: "Katalog TOGA" },
                { id: "scan", label: "Pindai QR" },
                { id: "aktivitas", label: "Jelajah Seru" },
                { id: "tentang", label: "Profil" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setSelectedPlant(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activePage === item.id
                      ? "bg-white text-[#1E293B] shadow-xs shadow-xs"
                      : "text-white/90 hover:text-white hover:bg-white/15 hover:text-[#1E293B]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={() => { setActivePage('admin'); setSelectedPlant(null); }}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activePage === 'admin'
                      ? 'bg-white text-[#1E293B] shadow-xs border-[#2D6A4F]'
                      : 'bg-[#FCF7F0] text-[#1E293B] border-[#E3CCA8]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1E293B]" />
                  <span>Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  title="Login Administrator / Guru"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FCF7F0] hover:bg-[#E3CCA8]/30 text-[#1E293B] border border-[#E3CCA8]/70 text-xs font-bold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#1E293B]" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* KONTEN UTAMA PORTRAIT */}
        <main key={`${activePage}-${selectedPlant?.id || "list"}-${showSplash ? "wait" : "ready"}`} className={`flex-1 px-4 py-5 space-y-6 w-full md:max-w-6xl md:mx-auto md:px-6 ${!showSplash ? "animate-page-enter" : "opacity-0"}`}>

          {/* 1. HALAMAN BERANDA */}
          {activePage === 'beranda' && (
            <div className="space-y-6">
              <section className="overflow-hidden relative  rounded-3xl p-5 md:p-6 border border-[#E3CCA8]/70 shadow-sm space-y-5">
                {/* Latar Belakang Foto & Gradasi Kartu Utama Beranda */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: `url(${import.meta.env.BASE_URL}background-beranda.jpeg)` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-white/88 via-[#FCF7F0]/82 to-[#F3E4CE]/86 backdrop-blur-[1px] pointer-events-none"
                />
                <style>{`
  @keyframes heroSmoothIn {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.985);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .anim-hero-col-1 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
  }
  .anim-hero-col-2 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
  }
  .anim-hero-col-3 {
    opacity: 0;
    animation: heroSmoothIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards;
  }
`}</style>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Kolom 1 (Kiri): Slide Foto */}
                  <div className="anim-hero-col-1 lg:col-span-4 w-full">
                    <HeroPhotoSlider />
                  </div>

                  {/* Kolom 2 (Tengah): Paragraf Penjelasan Rata Kanan-Kiri */}
                  <div className="anim-hero-col-2 lg:col-span-4 space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-[#FCF7F0] border border-[#E3CCA8] px-3 py-1 rounded-full text-[11px] font-bold text-[#1E293B]">
                      <Sprout className="w-3.5 h-3.5 text-[#1E293B]" />
                      <span>Taman TOGA MSB FKIP UNTAN</span>
                    </div>

                    <div className="space-y-2.5">
                      <h1 className="text-xl font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-snug tracking-tight">
                        🌿 Kenali Tanamannya, Pahami Manfaatnya, Lestarikan Alamnya!
                      </h1>
                      <div className="space-y-2 text-xs text-[#4A2532]/85 leading-relaxed text-justify">
                      <div className="bg-white/75 backdrop-blur-md border border-white/90 rounded-2xl p-4 shadow-sm space-y-2.5">
                        <p className="font-bold text-slate-950 leading-relaxed">
                          Alam menyimpan begitu banyak keajaiban yang sering kali belum kita ketahui. Di balik hijaunya dedaunan dan beragam bentuk tanaman, tersimpan pengetahuan, keunikan, serta manfaat yang menarik untuk dipelajari.
                        </p>
                        <p className="font-bold text-slate-950 leading-relaxed">
                          Melalui website ini, mari bersama-sama menjelajahi kekayaan tanaman obat keluarga (TOGA), mengenal berbagai jenis tanaman, memahami manfaatnya, dan menemukan fakta unik di balik setiap tumbuhan.
                        </p>
                      </div>
                        <p className="font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
                          Yuk, mulai petualangan mengenal tanaman! Karena semakin kita mengenal alam, semakin kita memahami betapa berharganya kehidupan. 🌱
                        </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePage('koleksi')}
                        className="bg-white text-[#1E293B] font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        <span>Jelajahi Tanaman</span>
                        <span>→</span>
                      </button>
                    </div>
                      </div>
                    </div>
                  </div>

                  {/* Kolom 3 (Kanan - Mengisi Space Kosong di Sebelahnya): Panduan Penggunaan lalu Tombol Aksi */}
                  <div className="anim-hero-col-3 lg:col-span-4 w-full space-y-3.5">
                    {/* Panduan Penggunaan */}
                    <div className="bg-[#FCF7F0]/70 rounded-3xl p-4 border border-[#E3CCA8]/70 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                          Panduan Penggunaan
                        </span>
                        <h2 className="text-sm font-extrabold text-[#1E293B]">
                          Cara Menggunakan PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK
                        </h2>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E3CCA8]/60">
                          <div className="w-6 h-6 rounded-lg bg-[#7C4700] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            1
                          </div>
                          <div>
                            <h3 className="font-bold text-[11px] text-[#1E293B]">Temukan Label QR Code</h3>
                            <p className="text-[10px] text-[#4A2532]/80 mt-0.5 leading-relaxed">
                              Cari papan label QR Code yang terpasang di dekat tanaman di lingkungan SMP NEGERI 3 KOTA PONTIANAK.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E3CCA8]/60">
                          <div className="w-6 h-6 rounded-lg bg-[#A3620A] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            2
                          </div>
                          <div>
                            <h3 className="font-bold text-[11px] text-[#1E293B]">Pindai Menggunakan Smartphone</h3>
                            <p className="text-[10px] text-[#4A2532]/80 mt-0.5 leading-relaxed">
                              Tekan tombol Scan QR di menu bawah dan arahkan kamera HP ke kode QR tanaman.
                            </p>
                          </div>
                        </div>
<div className="flex items-start gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E3CCA8]/60">
                          <div className="w-6 h-6 rounded-lg bg-[#A3620A] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            3
                          </div>
                          <div>
                            <h3 className="font-bold text-[11px] text-[#1E293B]">Pelajari Informasi Tanaman</h3>
                            <p className="text-[10px] text-[#4A2532]/80 mt-0.5 leading-relaxed">
                              Baca profil lengkap tanaman mulai dari klasifikasi ilmiah, morfologi, manfaat kesehatan, hingga cara perawatannya.
                            </p>
                          </div>
                        </div>

                        
                      </div>
                    </div>

                    {/* Tombol Jelajahi Tanaman & Scan QR Code */}
                    <div className="grid grid-cols-2 gap-2.5">
                      

                      <button
                        onClick={() => setActivePage('scan')}
                        className="flex items-center justify-center gap-1.5 bg-[#FCF7F0] hover:bg-[#E3CCA8]/40 text-[#1E293B] font-bold py-3 px-2.5 rounded-2xl text-xs border-2 border-[#7C4700] transition-all"
                      >
                        <QrCode className="w-4 h-4 text-[#1E293B] flex-shrink-0" />
                        <span>Scan QR Code</span>
                      </button>
                    </div>
                  </div>
                </div>

                <BotanicalIllustration />

                
              </section>

              {/* Statistik Koleksi */}
              <section className="bg-[#7C4700] text-white rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E3CCA8]">
                      Inventaris Hijau Sekolah
                    </span>
                    <h2 className="text-lg font-extrabold">Koleksi Terdata</h2>
                  </div>
                  <button
                    onClick={() => setActivePage('koleksi')}
                    className="bg-[#A3620A] text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15">
                    <div className="text-2xl font-extrabold text-[#E3CCA8]">{plants.length}</div>
                    <div className="text-[11px] font-medium mt-0.5">Spesies Tanaman</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15">
                    <div className="text-2xl font-extrabold text-[#E3CCA8]">
                      {new Set(plants.map(p => p.category)).size}
                    </div>
                    <div className="text-[11px] font-medium mt-0.5">Kategori Utama</div>
                  </div>
                </div>
              </section>

              

              {/* Tanaman Pilihan */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                      Sorotan Flora Sekolah
                    </span>
                    <h2 className="text-lg font-extrabold text-[#1E293B]">
                      Tanaman Pilihan
                    </h2>
                  </div>
                  <button
                    onClick={() => setActivePage('koleksi')}
                    className="text-xs font-bold text-[#1E293B]"
                  >
                    Semua →
                  </button>
                </div>

                <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
                  {plants.slice(0, 4).map(plant => (
                    <div
                      key={plant.id}
                      onClick={() => { setSelectedPlant(plant); setActivePage('koleksi'); }}
                      className="w-56 flex-shrink-0 bg-white rounded-3xl overflow-hidden border border-[#E3CCA8]/70 shadow-sm cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-36 bg-[#FCF7F0]">
                          <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 left-2.5 bg-[#7C4700]/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                            {plant.category}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <h3 className="text-sm font-extrabold text-[#1E293B] line-clamp-1">{plant.name}</h3>
                          <p className="text-[11px] italic text-[#1E293B] line-clamp-1 mt-0.5">{plant.scientificName}</p>
                        </div>
                      </div>
                      <div className="px-3.5 pb-3.5">
                        <span className="text-[11px] font-bold text-[#1E293B] flex items-center gap-1">
                          Lihat Informasi <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tahukah Kamu ? */}
              <section className="bg-white rounded-3xl p-5 border border-[#E3CCA8]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 bg-[#FCF7F0] text-[#1E293B] border border-[#E3CCA8] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#1E293B]" /> Tahukah Kamu ?
                  </span>
                  <button
                    onClick={() => setFactIndex((factIndex + 1) % PLANT_FACTS.length)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E293B]"
                  >
                    <RefreshCw className="w-3 h-3" /> Ganti Fakta
                  </button>
                </div>
                <h3 className="text-base font-extrabold text-[#1E293B]">
                  {PLANT_FACTS[factIndex].title}
                </h3>
                <p className="text-xs text-[#4A2532]/85 leading-relaxed">
                  {PLANT_FACTS[factIndex].description}
                </p>
              </section>

              {/* Ajakan Menjaga Lingkungan */}
              <section className="bg-gradient-to-br from-[#A3620A] to-[#7C4700] text-white rounded-3xl p-5 space-y-3">
                <h3 className="text-base font-extrabold">Mari Jaga Lingkungan Sekolah Kita!</h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Setiap tanaman di SMP NEGERI 3 KOTA PONTIANAK berperan penting menyediakan udara bersih dan keteduhan. Rawat tanaman di sekitar kelasmu dan jangan merusak tumbuhan.
                </p>
                <button
                  onClick={() => setActivePage('aktivitas')}
                  className="bg-white text-[#1E293B] font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Lihat Aktivitas Sekolah →
                </button>
              </section>
            </div>
          )}

          {/* 2. HALAMAN KOLEKSI TANAMAN & DETAIL */}
          {activePage === 'koleksi' && (
            <div>
              {!selectedPlant ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-4 border border-[#E3CCA8]/70 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                          Direktori Botani
                        </span>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">
                          Katalog TOGA
                        </h1>
                      </div>

                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-[11px] font-bold text-[#1E293B]"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#1E293B]" />
                        <span>{sortOrder === 'asc' ? 'A–Z' : 'Z–A'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-[#1E293B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama tanaman atau nama ilmiah..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] focus:border-[#7C4700] outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {['Semua', 'Tanaman hias', 'Tanaman obat'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                            selectedCategory === cat
                              ? 'bg-[#7C4700] text-white'
                              : 'bg-[#FCF7F0] text-[#4A2532] border border-[#E3CCA8]/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredAndSortedPlants.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-[#E3CCA8]">
                      <p className="text-sm font-bold text-[#1E293B]">Tanaman tidak ditemukan.</p>
                      <p className="text-xs text-[#4A2532]/75 mt-1">Coba kata kunci atau kategori lainnya.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E3CCA8]/70 shadow-sm">
                      <div className="divide-y divide-[#E3CCA8]/70">
                        {filteredAndSortedPlants.map((plant, index) => {
                          const isEven = index % 2 === 1;
                          return (
                            <div
                              key={plant.id}
                              onClick={() => setSelectedPlant(plant)}
                              className="py-6 first:pt-2 last:pb-2 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center cursor-pointer group"
                            >
                              {/* Kolom Penjelasan Singkat Tanaman */}
                              <div className={`lg:col-span-6 space-y-2.5 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7C4700] bg-[#FCF7F0] border border-[#E3CCA8] px-2.5 py-0.5 rounded-full">
                                  {plant.category}
                                </span>
                                <div>
                                  <h3 className="text-base md:text-lg font-extrabold text-[#1E293B] group-hover:text-[#7C4700] transition-colors leading-snug">
                                    {index + 1}. {plant.name}
                                  </h3>
                                  <p className="text-xs italic text-[#4A2532]/75 mt-0.5">
                                    {plant.scientificName}
                                  </p>
                                </div>
                                <p className="text-xs text-[#4A2532]/90 leading-relaxed text-justify line-clamp-3">
                                  {String(plant.description || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim()}
                                </p>
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPlant(plant);
                                    }}
                                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#FCF7F0] group-hover:bg-[#7C4700] text-[#1E293B] group-hover:text-white font-bold text-xs border border-[#E3CCA8] group-hover:border-[#7C4700] transition-all shadow-xs"
                                  >
                                    <span>Lihat Selengkapnya</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Kolom Foto Tanaman */}
                              <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                                <div className="w-fit max-w-full mx-auto rounded-2xl overflow-hidden border border-[#E3CCA8]/70 shadow-sm">
                                  <img
                                    src={plant.image}
                                    alt={plant.name}
                                    className="block w-auto h-auto max-w-full max-h-[380px] group-hover:scale-[1.02] transition-transform duration-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="inline-flex items-center gap-1.5 bg-white text-[#1E293B] font-bold px-3.5 py-2 rounded-xl border border-[#E3CCA8] text-xs shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Katalog TOGA</span>
                  </button>

                  <div className="bg-white rounded-3xl overflow-hidden border border-[#E3CCA8]/70 shadow-sm">
                    <div className="aspect-[4/3] bg-[#FCF7F0] relative">
                      <img
                        src={selectedPlant.image}
                        alt={selectedPlant.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#7C4700]/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {selectedPlant.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h1 className="text-2xl font-extrabold text-[#1E293B]">
                          {selectedPlant.name}
                        </h1>
                        <p className="text-xs italic font-semibold text-[#1E293B] mt-0.5">
                          {selectedPlant.scientificName}
                        </p>
                      </div>

                      <div className="pt-1">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
                          Deskripsi Tanaman
                        </h2>
                        <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={selectedPlant.description} defaultAlign="text-justify" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#E3CCA8]/70 space-y-3.5">
                    <div className="flex items-center gap-2 text-[#1E293B]">
                      <Layers className="w-4 h-4 text-[#1E293B]" />
                      <h3 className="font-extrabold text-sm">Ciri Morfologi & Bagian Tumbuhan</h3>
                    </div>
                    <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={selectedPlant.morphology} defaultAlign="text-justify" /></div>

                    <div className="space-y-3 pt-1">
                      {[
                        { key: "daun", title: "🍃 Bentuk Daun" },
                        { key: "batang", title: "🪵 Batang" },
                        { key: "akar", title: "🌱 Sistem Akar" },
                        { key: "bunga", title: "🌼 Bunga" },
                        { key: "buah", title: "🍎 Buah / Rimpang" }
                      ].map(item => {
                        const textVal = selectedPlant.parts?.[item.key];
                        const imgVal = selectedPlant.partsImages?.[item.key];
                        if (!textVal && !imgVal) return null;
                        return (
                          <div key={item.key} className="bg-[#FCF7F0] p-3.5 rounded-2xl border border-[#E3CCA8]/60">
                            <div className={imgVal ? "flex items-start gap-3.5" : ""}>
                              {imgVal && (
                                <div className="w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden border border-[#E3CCA8] bg-white flex-shrink-0 shadow-xs">
                                  <img src={imgVal} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-extrabold text-[#1E293B] block mb-1">{item.title}</span>
                                <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={textVal} defaultAlign="text-justify" /></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#E3CCA8]/70 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#1E293B]" /> Habitat & Lokasi di Sekolah
                      </h3>
                      <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={selectedPlant.habitat} defaultAlign="text-justify" /></div>
                    </div>

                    <hr className="border-[#E3CCA8]/40" />

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#1E293B]" /> Manfaat Tanaman
                      </h3>
                      <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={selectedPlant.benefits} defaultAlign="text-justify" /></div>
                    </div>

                    <hr className="border-[#E3CCA8]/40" />

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#1E293B] flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-[#1E293B]" /> Cara Perawatan
                      </h3>
                      <div className="text-slate-900 [&_p]:text-slate-900 [&_li]:text-slate-900 [&_span]:text-slate-900"><RichTextContent content={selectedPlant.care} defaultAlign="text-justify" /></div>
                    </div>
                  </div>

                  <div className="bg-[#7C4700] text-white rounded-3xl p-5 space-y-1.5">
                    <h3 className="font-extrabold text-xs text-[#E3CCA8] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Tahukah Kamu ? Tanaman
                    </h3>
                    <div className="text-white [&_p]:text-white [&_li]:text-white [&_span]:text-white"><RichTextContent content={selectedPlant.funFact} defaultAlign="text-justify" /></div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#E3CCA8]/70 flex flex-col items-center text-center space-y-2">
                    <p className="text-xs font-extrabold text-[#1E293B]">QR Code Tanaman</p>
                    <SmartPlantQRWidget
                      code={selectedPlant.code}
                      plantName={selectedPlant.name}
                      size={130}
                      showDownload={true}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. HALAMAN SCAN QR CODE */}
          {activePage === 'scan' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <span className="inline-block bg-white border border-[#E3CCA8] text-[#1E293B] text-[11px] font-bold px-3 py-1 rounded-full">
                  Pemindai QR SMP NEGERI 3 KOTA PONTIANAK
                </span>
                <h1 className="text-xl font-extrabold text-[#1E293B]">
                  Scan QR Code Tanaman
                </h1>
                <p className="text-xs text-[#4A2532]/80">
                  Arahkan kamera HP ke kode QR pada label tanaman di sekolah atau pilih dari daftar QR di bawah.
                </p>
              </div>

              {/* Kotak Scanner Diperkecil & Terpusat */}
              <div className="max-w-sm mx-auto bg-white rounded-3xl p-4 border border-[#E3CCA8]/70 shadow-sm space-y-3">
                <div className="relative w-52 h-52 mx-auto rounded-2xl bg-[#7C4700] overflow-hidden flex items-center justify-center border-2 border-[#A3620A] shadow-inner">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-5 border-2 border-[#E3CCA8] rounded-xl pointer-events-none overflow-hidden">
                        <div className="w-full h-0.5 bg-[#E3CCA8] shadow-[0_0_12px_#E3CCA8] animate-scan-line" />
                      </div>
                      <span className="absolute bottom-2 bg-[#7C4700]/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        Memindai QR...
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-3 space-y-2">
                      <div className="w-11 h-11 rounded-xl bg-white/10 text-[#E3CCA8] flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-white text-xs font-bold">Kamera Siap Memindai</p>
                      <p className="text-[#E3CCA8] text-[10px] leading-snug">
                        Tekan tombol di bawah untuk mengaktifkan kamera.
                      </p>
                    </div>
                  )}
                </div>

                {scanError && (
                  <p className="text-[11px] text-slate-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    {scanError}
                  </p>
                )}

                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-2 bg-[#7C4700] hover:bg-[#A3620A] text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Aktifkan Kamera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Hentikan Kamera
                  </button>
                )}

                {/* Input Kode QR Manual */}
                <div className="pt-2 border-t border-[#E3CCA8]/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-black">
                    <Keyboard className="w-3.5 h-3.5 text-black" />
                    <h2 className="font-extrabold text-xs">Input Kode QR Manual</h2>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleOpenPlantByCode(manualCode)}
                      placeholder="Contoh: SPN3-LIDAHBUAYA"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] outline-none text-xs font-semibold"
                    />
                    <button
                      onClick={() => handleOpenPlantByCode(manualCode)}
                      className="bg-[#A3620A] hover:bg-[#7C4700] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
                    >
                      Buka
                    </button>
                  </div>
                </div>
              </div>

              {/* Katalog Semua QR Code Tanaman Terdata */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E3CCA8]/70 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E3CCA8]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] flex items-center justify-center text-[#7C4700]">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm sm:text-base text-[#1E293B]">
                        Daftar Semua QR Code Tanaman Terdata
                      </h2>
                      <p className="text-[11px] text-slate-600">
                        Total {plants.length} koleksi tanaman TOGA terdaftar • Pindai langsung atau klik buka profil
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {plants.map((p, index) => (
                    <div
                      key={p.id}
                      className="flex flex-col items-center text-center bg-[#FCF7F0]/70 hover:bg-[#FCF7F0] rounded-2xl p-4 border border-[#E3CCA8] transition-all shadow-sm hover:shadow-md space-y-2.5"
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#7C4700]">
                        <span className="bg-white px-2 py-0.5 rounded-full border border-[#E3CCA8]">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded-full border border-[#E3CCA8]">
                          {p.code}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-2xl border border-[#E3CCA8]/80 shadow-xs">
                        <SmartPlantQRWidget
                          code={p.code}
                          plantName={p.name}
                          size={120}
                          showDownload={true}
                        />
                      </div>

                      <div className="space-y-0.5 flex-1">
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#1E293B] line-clamp-1">
                          {p.name}
                        </h3>
                        {p.scientificName && (
                          <p className="text-[11px] italic text-slate-600 line-clamp-1">
                            {p.scientificName}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenPlantByCode(p.code)}
                        className="w-full bg-[#7C4700] hover:bg-[#A3620A] text-white font-bold py-2 px-3 rounded-xl text-[11px] transition-colors"
                      >
                        Buka Detail Tanaman
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. HALAMAN AKTIVITAS */}
          {activePage === 'aktivitas' && (
            <div className="space-y-5">
              <section className="relative overflow-hidden rounded-3xl p-5 md:p-8 shadow-2xl border border-white/30 space-y-6">
                <img
                  src={`${import.meta.env.BASE_URL}background aktivitas.jpeg?v=2`}
                  alt="Background Aktivitas Program TOGA SMP NEGERI 3 KOTA PONTIANAK"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header & Narasi Pengantar Halaman Aktivitas */}
              <div className="relative z-10 bg-white/15 backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-5 md:p-7 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.22)] space-y-3.5 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/45 px-3.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs">
                  <Sprout className="w-3.5 h-3.5 text-white" />
                  <span>Kegiatan Non-Mengajar MSB • FKIP UNTAN</span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white">
                  Aktivitas Program TOGA SMP NEGERI 3 KOTA PONTIANAK
                </h1>
                <div className="space-y-2.5 text-xs text-white leading-relaxed text-justify">
                  <p>
                    Halaman ini mendokumentasikan rangkaian <strong>Kegiatan Non-Mengajar</strong> yang dilaksanakan oleh mahasiswa <strong>Magang Sekolah Berdampak (MSB) Fakultas Keguruan dan Ilmu Pendidikan (FKIP) Universitas Tanjungpura</strong> selama bertugas di <strong>SMP NEGERI 3 KOTA PONTIANAK</strong>. Sebagai bagian dari program Pembelajaran Luar Kampus (PLK), kegiatan non-mengajar ini dirancang secara kolaboratif bersama Kepala Sekolah, Guru Pendamping, dan Dosen Pembimbing Lapangan untuk menjawab kebutuhan nyata di lingkungan sekolah. Fokus utamanya adalah menghadirkan inovasi produk berbasis adaptasi teknologi informasi yang mendukung keberlanjutan program unggulan sekolah mitra, khususnya <strong>Sekolah Adiwiyata, Sekolah Sehat, dan Sekolah Digital</strong>.
                  </p>
                  <p>
                    Dalam pelaksanaannya, tim mahasiswa MSB memadukan upaya pelestarian lingkungan fisik dengan pengembangan media edukasi digital yang mudah diakses oleh seluruh warga sekolah. Langkah ini diawali dengan penataan ulang dan revitalisasi area Taman Tanaman Obat Keluarga (TOGA) agar tertata rapi, sehat, dan kaya akan ragam spesies berkhasiat. Selanjutnya, setiap koleksi tanaman diinventarisasi secara ilmiah dan diintegrasikan ke dalam katalog digital <strong>PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK</strong> melalui pemasangan label <strong>QR Code</strong>, sehingga siswa maupun guru dapat menjadikan area taman sebagai ruang belajar kontekstual yang interaktif dan berkelanjutan.
                  </p>
                </div>
              </div>

              {/* 4 Tahapan Pelaksanaan Program Non-Mengajar MSB */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]">
                <div className="bg-white/68 hover:bg-white/78 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-5 rounded-2xl border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Tahap 01 • Koordinasi &amp; Perizinan
                  </span>
                  <h2 className="font-extrabold text-sm text-white">
                    Persetujuan Kepala Sekolah
                  </h2>
                  <p className="text-xs text-white leading-relaxed text-justify">
                    Mahasiswa MSB melakukan observasi awal kebutuhan sekolah, memaparkan rencana kegiatan non-mengajar, serta memperoleh persetujuan resmi dari Kepala Sekolah SMP NEGERI 3 KOTA PONTIANAK dan Dosen Pembimbing Lapangan sebelum pelaksanaan program.
                  </p>
                </div>

                <div className="bg-white/68 hover:bg-white/78 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-5 rounded-2xl border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Tahap 02 • Observasi &amp; Revitalisasi Taman
                  </span>
                  <h2 className="font-extrabold text-sm text-white">
                    Pemetaan &amp; Penataan Taman TOGA
                  </h2>
                  <p className="text-xs text-white leading-relaxed text-justify">
                    Pembersihan lahan, penataan tata letak tanaman, penggemburan media tanam, penanaman bibit baru, serta inventarisasi spesies Tanaman Obat Keluarga (TOGA) di lingkungan sekolah.
                  </p>
                </div>

                <div className="bg-white/68 hover:bg-white/78 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-5 rounded-2xl border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Tahap 03 • Inovasi &amp; Digitalisasi QR Code
                  </span>
                  <h2 className="font-extrabold text-sm text-white">
                    Pengembangan Pustaka Digital &amp; Label QR
                  </h2>
                  <p className="text-xs text-white leading-relaxed text-justify">
                    Penyusunan basis data ilmiah (morfologi, klasifikasi, manfaat, dan perawatan) ke dalam website PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK, disertai pencetakan dan pemasangan papan label QR Code di setiap titik tanaman.
                  </p>
                </div>

                <div className="bg-white/68 hover:bg-white/78 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-5 rounded-2xl border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Tahap 04 • Edukasi &amp; Pemanfaatan Produk
                  </span>
                  <h2 className="font-extrabold text-sm text-white">
                    Sosialisasi &amp; Literasi Hijau Warga Sekolah
                  </h2>
                  <p className="text-xs text-white leading-relaxed text-justify">
                    Pendampingan siswa dan guru dalam memindai label QR Code secara langsung di area taman sekolah sebagai media belajar interaktif untuk menumbuhkan kepedulian lingkungan.
                  </p>
                </div>
              </div>
              </section>

              {/* Galeri 8 Slide Foto Pengerjaan Kegiatan Non-Mengajar */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E3CCA8]/70 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                    Dokumentasi Kronologis • 8 Tahap Pengerjaan
                  </span>
                  <h2 className="text-lg font-extrabold text-[#1E293B]">
                    Galeri Kegiatan Non-Mengajar MSB
                  </h2>
                  <p className="text-xs text-[#4A2532]/80 leading-relaxed">
                    Rangkaian dokumentasi foto pelaksanaan kegiatan non-mengajar mahasiswa MSB FKIP UNTAN dari tahap persetujuan awal hingga penyelesaian program di SMP NEGERI 3 KOTA PONTIANAK.
                  </p>
                </div>

                <NonTeachingAutoSlider />
              </div>
            </div>
          )}

          {/* 5. HALAMAN TENTANG KAMI */}
          {activePage === 'tentang' && (
            <div className="space-y-5">
              {/* 1 & 2. Latar Belakang & Tujuan (Foto Latar Belakang + Efek Glass seperti Jelajah Seru) */}
              <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 border border-[#E3CCA8]/80 shadow-md space-y-5">
                {/* Foto Latar Belakang Penuh */}
                <img
                  src={`${import.meta.env.BASE_URL}taman-toga.jpeg`}
                  alt="Taman TOGA SMP NEGERI 3 KOTA PONTIANAK"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/30 pointer-events-none" />

                {/* Header Latar Belakang (Efek Glass) */}
                <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/75 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C4700]">
                      Dokumentasi &amp; Dasar Pengembangan
                    </span>
                    <h2 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                      Latar Belakang
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#FCF7F0]/90 border border-[#E3CCA8] px-3 py-1 rounded-full text-[11px] font-bold text-[#1E293B]">
                    <Sprout className="w-3.5 h-3.5 text-[#1E293B]" />
                    <span>Magang Sekolah Berdampak (MSB) • FKIP UNTAN</span>
                  </div>
                </div>

                {/* Konten Utama & Tujuan (Efek Glass Bersih seperti Jelajah Seru) */}
                <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/75 shadow-xs divide-y divide-[#E3CCA8]/70 space-y-5">
                  {/* Bagian 1: Tentang PUSTAKA TOGA */}
                  <div className="space-y-3">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7C4700] bg-[#FCF7F0]/90 border border-[#E3CCA8] px-2.5 py-0.5 rounded-full">
                        SMP NEGERI 3 KOTA PONTIANAK • Kalimantan Barat
                      </span>
                      <h1 className="text-lg md:text-xl font-extrabold text-[#1E293B] leading-snug mt-1.5">
                        Tentang PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK
                      </h1>
                    </div>

                    <div className="space-y-2.5 text-xs text-[#1E293B] leading-relaxed text-justify">
                      <p>
                        <strong>PUSTAKA TOGA SMP NEGERI 3 KOTA PONTIANAK – Discover the Green World</strong> merupakan platform katalog digital interaktif berbasis web (<em>Progressive Web App</em>) yang mengintegrasikan koleksi fisik Tanaman Obat Keluarga (TOGA) di lingkungan <strong>SMP NEGERI 3 KOTA PONTIANAK</strong> dengan teknologi pemindaian <strong>QR Code</strong>.
                      </p>
                      <p>
                        Website ini dikembangkan sebagai produk inovatif luaran kegiatan non-mengajar dalam program <strong>Magang Sekolah Berdampak (MSB)</strong> dari <strong>Fakultas Keguruan dan Ilmu Pendidikan (FKIP) Universitas Tanjungpura (UNTAN)</strong>. Program MSB merupakan bagian dari Pembelajaran Luar Kampus (PLK) Merdeka Belajar–Kampus Merdeka (MBKM) yang memberdayakan mahasiswa untuk berkolaborasi langsung bersama sekolah mitra dalam menghadirkan solusi nyata bagi pengembangan pembelajaran maupun program unggulan sekolah.
                      </p>
                    </div>
                  </div>

                  {/* Bagian 2: Tujuan Pembuatan Website (Clean Grid di dalam Glass Container) */}
                  <div className="pt-5 space-y-4">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7C4700] bg-[#FCF7F0]/90 border border-[#E3CCA8] px-2.5 py-0.5 rounded-full">
                        Latar Belakang &amp; Sasaran
                      </span>
                      <h3 className="text-base md:text-lg font-extrabold text-[#1E293B] mt-1.5">
                        Tujuan Pembuatan Website
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs md:text-sm text-[#1E293B]">
                          1. Mendukung Program Unggulan Sekolah Mitra
                        </h4>
                        <p className="text-xs text-[#1E293B]/90 leading-relaxed text-justify">
                          Menguatkan pelaksanaan program <strong>Sekolah Adiwiyata, Sekolah Sehat, dan Sekolah Digital</strong> melalui digitalisasi inventaris tanaman obat yang terdata rapi di lingkungan SMP NEGERI 3 KOTA PONTIANAK.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs md:text-sm text-[#1E293B]">
                          2. Adaptasi Teknologi QR Code dalam Edukasi
                        </h4>
                        <p className="text-xs text-[#1E293B]/90 leading-relaxed text-justify">
                          Mengatasi keterbatasan ruang pada papan nama tanaman fisik dengan menyajikan informasi lengkap mulai dari identitas ilmiah, morfologi, khasiat, hingga panduan perawatan cukup dengan memindai label QR Code.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs md:text-sm text-[#1E293B]">
                          3. Media Pembelajaran Kontekstual
                        </h4>
                        <p className="text-xs text-[#1E293B]/90 leading-relaxed text-justify">
                          Menyediakan sumber belajar botani digital yang interaktif dan mudah diakses melalui smartphone siswa maupun guru dalam kegiatan intrakurikuler dan kokurikuler.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs md:text-sm text-[#1E293B]">
                          4. Menumbuhkan Kepedulian Lingkungan
                        </h4>
                        <p className="text-xs text-[#1E293B]/90 leading-relaxed text-justify">
                          Mendorong warga sekolah untuk mengenal, merawat, dan melestarikan keanekaragaman hayati serta tanaman berkhasiat obat di lingkungan sekolah secara berkelanjutan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Tim Mahasiswa MSB FKIP UNTAN (12 Anggota) */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E3CCA8]/70 shadow-sm space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">
                    Tim Pengembang &amp; Pelaksana Program
                  </span>
                  <h2 className="text-lg font-extrabold text-[#1E293B]">
                    Mahasiswa Magang Sekolah Berdampak (MSB) FKIP UNTAN
                  </h2>
                  <p className="text-xs text-[#4A2532]/80 leading-relaxed">
                    Kelompok mahasiswa lintas program studi FKIP Universitas Tanjungpura yang bertugas di SMP NEGERI 3 KOTA PONTIANAK.
                  </p>
                </div>

                {/* Sorotan: Ketua Kelompok & Pengembang Utama Website */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E293B]">
                    Ketua Kelompok &amp; Pengembang Utama Website
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {[
                      {
                        name: "Fatur Rahman", nim: "F1221231020",
                        prodi: "Program Studi Pendidikan Kewarganegaraan (PKN)",
                        role: "Ketua Kelompok & Pengembang Utama Website",
                        photo: "Fatur Rahman.jpeg",
                        initials: "FR"
                      },
                      {
                        name: "Nurhayani", nim: "F1261231001",
                        prodi: "Program Studi Pendidikan IPS",
                        role: "Pengembang Utama Website",
                        photo: "nurhayani.jpeg",
                        initials: "NH"
                      },
                      {
                        name: "Anita", nim: "F1041231055",
                        prodi: "Program Studi Pendidikan Matematika",
                        role: "Pengembang Utama Website",
                        photo: "anita.jpeg?v=2",
                        initials: "AN"
                      }
                    ].map((member, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-b from-[#FCF7F0] to-white rounded-2xl p-4 border-2 border-[#A3620A]/50 shadow-xs flex flex-col items-center text-center space-y-2.5"
                      >
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#7C4700] bg-gradient-to-br from-[#7C4700] to-[#A3620A] flex items-center justify-center shadow-xs relative">
                          <span className="text-white font-extrabold text-base tracking-wide">
                            {member.initials}
                          </span>
                          <img
                            src={`${import.meta.env.BASE_URL}${member.photo}`}
                            alt={member.name}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className={`w-full h-full object-cover absolute inset-0 transition-transform duration-300 ${member.name === "Anita" ? "object-[center_15%]" : /nurhayani|aisyiyah|niko|roihan|egyta/i.test(member.name) ? "scale-[1.38] object-center origin-center" : ""}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="inline-block bg-[#7C4700] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                            {member.role}
                          </span>
                          <h3 className="font-extrabold text-sm text-[#4A2532] leading-snug">
                            {member.name}
                          </h3>
                        {member.nim && <p className="text-[11px] font-mono font-bold text-[#7C4700] tracking-wide">NIM. {member.nim}</p>}
                          <p className="text-[11px] font-medium text-[#1E293B]">
                            {member.prodi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daftar 9 Anggota Kelompok Lainnya */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E293B]">
                    Anggota Kelompok MSB FKIP UNTAN
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                    {[
                      {
                        name: "Aisyiyah Baroqah Qodariah", nim: "F1111231026",
                        prodi: "Program Studi Seni dan Pertunjukan",
                        photo: "aisyiyah baroqah qodariah.jpeg",
                        initials: "AB"
                      },
                      {
                        name: "Niko Demus Misel", nim: "F1042231018",
                        prodi: "Program Studi Pendidikan Matematika",
                        photo: "niko demus misel.jpeg",
                        initials: "ND"
                      },
                      {
                        name: "Meisya Nazirra Paraswati", nim: "F1101231042",
                        prodi: "Program Studi Pendidikan Jasmani & Kesehatan",
                        photo: "meisya nazirra paraswati.jpg",
                        initials: "MN"
                      },
                      {
                        name: "Roihan Alfarisi", nim: "F1012231007",
                        prodi: "Program Studi Pendidikan Bahasa Indonesia",
                        photo: "roihan alfarisi.jpeg",
                        initials: "RA"
                      },
                      {
                        name: "Fitri Febriani Firdaus", nim: "F1021231031",
                        prodi: "Program Studi Pendidikan Bahasa Inggris",
                        photo: "Fitri Febriani Firdaus.png",
                        initials: "FF"
                      },
                      {
                        name: "Nuriva Adha", nim: "F1021231046",
                        prodi: "Program Studi Pendidikan Bahasa Inggris",
                        photo: "nuriva adha.jpeg",
                        initials: "NA"
                      },
                      {
                        name: "Nabila Verbrianti", nim: "F1141231006",
                        prodi: "Program Studi Bimbingan dan Konseling",
                        photo: "nabila.jpeg",
                        initials: "NV"
                      },
                      {
                        name: "Egyta Ramadhani", nim: "F1071231056",
                        prodi: "Program Studi Pendidikan Biologi",
                        photo: "egyta ramadhani.jpg",
                        initials: "ER"
                      },
                      {
                        name: "Kartika Sari", nim: "F1051231036",
                        prodi: "Program Studi Pendidikan Fisika",
                        photo: "Kartika Sari.jpeg",
                        initials: "KS"
                      }
                    ].map((member, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FCF7F0]/70 rounded-2xl p-3.5 border border-[#E3CCA8]/70 flex flex-col items-center text-center space-y-2"
                      >
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#A3620A] bg-gradient-to-br from-[#A3620A] to-[#7C4700] flex items-center justify-center shadow-xs relative">
                          <span className="text-white font-extrabold text-lg">
                            {member.initials}
                          </span>
                          <img
                            src={`${import.meta.env.BASE_URL}${member.photo}`}
                            alt={member.name}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className={`w-full h-full object-cover absolute inset-0 transition-transform duration-300 ${/nurhayani|aisyiyah|niko|roihan|egyta/i.test(member.name) ? "scale-[1.38] object-center origin-center" : ""}`}
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-xs text-[#4A2532] leading-snug">
                            {member.name}
                          </h3>
                        {member.nim && <p className="text-[11px] font-mono font-bold text-[#7C4700] tracking-wide">NIM. {member.nim}</p>}
                          <p className="text-[10px] font-medium text-[#1E293B]/90 leading-tight">
                            {member.prodi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. DASHBOARD ADMINISTRATOR */}
          {activePage === 'admin' && isAdmin && (
            <div className="space-y-5">
              <div className="bg-[#7C4700] text-white rounded-3xl p-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E3CCA8]">
                    Panel Pengelolaan
                  </span>
                  <h1 className="text-lg font-extrabold">Dashboard Admin</h1>
                </div>
                <button
                  onClick={() => { localStorage.removeItem("pustaka_toga_admin"); setIsAdmin(false); setActivePage('beranda'); }}
                  className="inline-flex items-center gap-1.5 bg-white/15 text-white font-bold px-3.5 py-2 rounded-xl text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>

              <form onSubmit={handleSavePlant} className="bg-white rounded-3xl p-5 border border-[#E3CCA8] shadow-sm space-y-3.5">
                <h2 className="text-base font-extrabold text-[#1E293B]">
                  {editingPlantId ? `Edit Tanaman (${plantForm.name})` : '+ Tambah Tanaman Baru'}
                </h2>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Nama Lokal Tanaman *</label>
                  <input
                    required
                    type="text"
                    value={plantForm.name}
                    onChange={e => setPlantForm({ ...plantForm, name: e.target.value })}
                    placeholder="Contoh: Sirih Gading"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Kode Unik QR *</label>
                    <input
                      required
                      type="text"
                      value={plantForm.code}
                      onChange={e => setPlantForm({ ...plantForm, code: e.target.value })}
                      placeholder="SPN3-SIRIH"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Kategori</label>
                    <select
                      value={plantForm.category}
                      onChange={e => setPlantForm({ ...plantForm, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs font-semibold"
                    >
                      <option>Tanaman hias</option>
                      <option>Tanaman obat</option>
                      <option>Tanaman buah</option>
                      <option>Tanaman pelindung</option>
                      <option>Tanaman lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Nama Ilmiah *</label>
                  <input
                    required
                    type="text"
                    value={plantForm.scientificName}
                    onChange={e => setPlantForm({ ...plantForm, scientificName: e.target.value })}
                    placeholder="Epipremnum aureum"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1E293B] block">Foto Tanaman</label>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-1.5 bg-[#FCF7F0] text-[#1E293B] font-bold px-3 py-2 rounded-xl border border-[#E3CCA8] text-[11px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3.5 h-3.5 text-[#1E293B]" />
                      <span>Unggah</span>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.image}
                      onChange={e => setPlantForm({ ...plantForm, image: e.target.value })}
                      placeholder="Atau URL foto..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs"
                    />
                  </div>
                </div>

                <AdminRichEditor label="Deskripsi Tanaman" value={plantForm.description} onChange={(val) => setPlantForm(prev => ({ ...prev, description: val }))} />

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Ciri Morfologi Umum</label>
                  <AdminRichEditor label="" value={plantForm.morphology} onChange={(val) => setPlantForm(prev => ({ ...prev, morphology: val }))} minHeight="72px" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Bentuk Daun</label>
                    <AdminRichEditor label="" value={plantForm.daun} onChange={(val) => setPlantForm(prev => ({ ...prev, daun: val }))} minHeight="72px" />
                  <div className="flex items-center gap-2 mt-1.5 bg-white p-2 rounded-xl border border-[#E3CCA8]/70">
                    <label className="inline-flex items-center gap-1 bg-[#FCF7F0] text-[#1E293B] font-bold px-2.5 py-1.5 rounded-lg border border-[#E3CCA8] text-[10px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3 h-3 text-[#1E293B]" />
                      <span>Foto Daun</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePartImageUpload("daun", e)} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.daunImage || ""}
                      onChange={(e) => setPlantForm(prev => ({ ...prev, daunImage: e.target.value }))}
                      placeholder="Atau URL foto daun..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#FCF7F0] border border-[#E3CCA8]/60 text-[11px]"
                    />
                    {plantForm.daunImage && (
                      <img src={plantForm.daunImage} alt="Preview daun" className="w-9 h-11 rounded-lg object-cover border border-[#E3CCA8] flex-shrink-0" />
                    )}
                  </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Batang</label>
                    <AdminRichEditor label="" value={plantForm.batang} onChange={(val) => setPlantForm(prev => ({ ...prev, batang: val }))} minHeight="72px" />
                  <div className="flex items-center gap-2 mt-1.5 bg-white p-2 rounded-xl border border-[#E3CCA8]/70">
                    <label className="inline-flex items-center gap-1 bg-[#FCF7F0] text-[#1E293B] font-bold px-2.5 py-1.5 rounded-lg border border-[#E3CCA8] text-[10px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3 h-3 text-[#1E293B]" />
                      <span>Foto Batang</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePartImageUpload("batang", e)} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.batangImage || ""}
                      onChange={(e) => setPlantForm(prev => ({ ...prev, batangImage: e.target.value }))}
                      placeholder="Atau URL foto batang..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#FCF7F0] border border-[#E3CCA8]/60 text-[11px]"
                    />
                    {plantForm.batangImage && (
                      <img src={plantForm.batangImage} alt="Preview batang" className="w-9 h-11 rounded-lg object-cover border border-[#E3CCA8] flex-shrink-0" />
                    )}
                  </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Akar</label>
                    <AdminRichEditor label="" value={plantForm.akar} onChange={(val) => setPlantForm(prev => ({ ...prev, akar: val }))} minHeight="72px" />
                  <div className="flex items-center gap-2 mt-1.5 bg-white p-2 rounded-xl border border-[#E3CCA8]/70">
                    <label className="inline-flex items-center gap-1 bg-[#FCF7F0] text-[#1E293B] font-bold px-2.5 py-1.5 rounded-lg border border-[#E3CCA8] text-[10px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3 h-3 text-[#1E293B]" />
                      <span>Foto Akar</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePartImageUpload("akar", e)} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.akarImage || ""}
                      onChange={(e) => setPlantForm(prev => ({ ...prev, akarImage: e.target.value }))}
                      placeholder="Atau URL foto akar..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#FCF7F0] border border-[#E3CCA8]/60 text-[11px]"
                    />
                    {plantForm.akarImage && (
                      <img src={plantForm.akarImage} alt="Preview akar" className="w-9 h-11 rounded-lg object-cover border border-[#E3CCA8] flex-shrink-0" />
                    )}
                  </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#1E293B]">Bunga / Buah</label>
                    <AdminRichEditor label="" value={plantForm.bunga} onChange={(val) => setPlantForm(prev => ({ ...prev, bunga: val }))} minHeight="72px" />
                  <div className="flex items-center gap-2 mt-1.5 bg-white p-2 rounded-xl border border-[#E3CCA8]/70">
                    <label className="inline-flex items-center gap-1 bg-[#FCF7F0] text-[#1E293B] font-bold px-2.5 py-1.5 rounded-lg border border-[#E3CCA8] text-[10px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3 h-3 text-[#1E293B]" />
                      <span>Foto Bunga</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePartImageUpload("bunga", e)} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.bungaImage || ""}
                      onChange={(e) => setPlantForm(prev => ({ ...prev, bungaImage: e.target.value }))}
                      placeholder="Atau URL foto bunga..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-[#FCF7F0] border border-[#E3CCA8]/60 text-[11px]"
                    />
                    {plantForm.bungaImage && (
                      <img src={plantForm.bungaImage} alt="Preview bunga" className="w-9 h-11 rounded-lg object-cover border border-[#E3CCA8] flex-shrink-0" />
                    )}
                  </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Habitat / Lokasi di Sekolah</label>
                  <AdminRichEditor label="" value={plantForm.habitat} onChange={(val) => setPlantForm(prev => ({ ...prev, habitat: val }))} minHeight="72px" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Manfaat Tanaman</label>
                  <AdminRichEditor label="" value={plantForm.benefits} onChange={(val) => setPlantForm(prev => ({ ...prev, benefits: val }))} minHeight="72px" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Cara Perawatan</label>
                  <AdminRichEditor label="" value={plantForm.care} onChange={(val) => setPlantForm(prev => ({ ...prev, care: val }))} minHeight="72px" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1E293B]">Tahukah Kamu ?</label>
                  <AdminRichEditor label="" value={plantForm.funFact} onChange={(val) => setPlantForm(prev => ({ ...prev, funFact: val }))} minHeight="72px" />
                </div>

                {plantForm.code && (
                  <div className="bg-[#FCF7F0] p-4 rounded-2xl border border-[#E3CCA8] flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-extrabold text-[#1E293B]">QR Code Otomatis</p>
                    <SmartPlantQRWidget
                      code={plantForm.code.toUpperCase()}
                      plantName={plantForm.name || 'Tanaman'}
                      size={110}
                      showDownload={true}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-[#7C4700] text-white font-bold py-3 rounded-2xl text-xs"
                  >
                    {editingPlantId ? 'Simpan Perubahan' : 'Simpan Tanaman & QR'}
                  </button>
                  {editingPlantId && (
                    <button
                      type="button"
                      onClick={() => { setEditingPlantId(null); setPlantForm(emptyPlantForm); }}
                      className="px-4 py-3 rounded-2xl bg-[#FCF7F0] border border-[#E3CCA8] text-xs font-bold"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-2.5">
                <h2 className="text-sm font-extrabold text-[#1E293B] px-1">
                  Koleksi Tersimpan ({plants.length})
                </h2>
                {plants.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-3.5 border border-[#E3CCA8]/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-[#E3CCA8] flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xs text-[#1E293B] truncate">{p.name}</h3>
                        <p className="text-[10px] font-mono text-[#1E293B] font-bold">{p.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedPlant(p); setActivePage('koleksi'); }}
                        className="p-2 rounded-xl bg-[#FCF7F0] text-[#1E293B]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEditPlant(p)}
                        className="p-2 rounded-xl bg-amber-50 text-[#1E293B]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlant(p.id, p.name)}
                        className="p-2 rounded-xl bg-red-50 text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM NAVIGATION BAR PORTRAIT */}
        <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[480px] md:max-w-6xl bg-white/95 backdrop-blur-md border-t border-[#E3CCA8]/70 px-2 py-2 shadow-[0_-4px_20px_rgba(22,75,54,0.08)]">
          <div className="grid grid-cols-5 items-center">
            <button
              onClick={() => { setActivePage('beranda'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'beranda' ? 'text-[#1E293B] font-extrabold' : 'text-[#4A2532]/60 font-medium'
              }`}
            >
              <Sprout className={`w-5 h-5 ${activePage === 'beranda' ? 'text-[#1E293B]' : ''}`} />
              <span className="text-[10px]">Beranda</span>
            </button>

            <button
              onClick={() => { setActivePage('koleksi'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'koleksi' ? 'text-[#1E293B] font-extrabold' : 'text-[#4A2532]/60 font-medium'
              }`}
            >
              <Leaf className={`w-5 h-5 ${activePage === 'koleksi' ? 'text-[#1E293B]' : ''}`} />
              <span className="text-[10px]">Katalog TOGA</span>
            </button>

            <div className="flex flex-col items-center justify-center -mt-6">
              <button
                onClick={() => { setActivePage('scan'); setSelectedPlant(null); }}
                className="w-14 h-14 rounded-2xl bg-[#7C4700] hover:bg-[#A3620A] text-white flex items-center justify-center shadow-lg border-4 border-[#FCF7F0] transition-transform active:scale-95"
                title="Scan QR Code"
              >
                <QrCode className="w-6 h-6 text-[#E3CCA8]" />
              </button>
              <span className="text-[10px] font-extrabold text-[#1E293B] mt-1">Pindai QR</span>
            </div>

            <button
              onClick={() => { setActivePage('aktivitas'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'aktivitas' ? 'text-[#1E293B] font-extrabold' : 'text-[#4A2532]/60 font-medium'
              }`}
            >
              <BookOpen className={`w-5 h-5 ${activePage === 'aktivitas' ? 'text-[#1E293B]' : ''}`} />
              <span className="text-[10px]">Jelajah Seru</span>
            </button>

            <button
              onClick={() => { setActivePage('tentang'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'tentang' ? 'text-[#1E293B] font-extrabold' : 'text-[#4A2532]/60 font-medium'
              }`}
            >
              <Info className={`w-5 h-5 ${activePage === 'tentang' ? 'text-[#1E293B]' : ''}`} />
              <span className="text-[10px]">Profil</span>
            </button>
          </div>
        </nav>

        {/* MODAL LOGIN ADMINISTRATOR */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-[400px] w-full p-6 border border-[#E3CCA8] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1E293B]">
                  <Lock className="w-4 h-4 text-[#1E293B]" />
                  <h2 className="text-base font-extrabold">Login Administrator</h2>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-sm font-bold text-[#4A2532]/60">
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#4A2532]/80 leading-relaxed">
                Khusus guru pembina dan administrator SMP NEGERI 3 KOTA PONTIANAK.
              </p>

              {adminLoginError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
                  {adminLoginError}
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1E293B]">Kode Akses</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#FCF7F0] border border-[#E3CCA8] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7C4700] hover:bg-[#A3620A] text-white font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Masuk ke Dashboard
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
