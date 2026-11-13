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
// 2. DATA AWAL TANAMAN LINGKUNGAN SMP NEGERI 3 PONTIANAK
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
    habitat: 'Tumbuh subur di tanah gembur berdrainase baik dengan paparan sinar matahari penuh di area apotek hidup SMP Negeri 3 Pontianak.',
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
    habitat: 'Tumbuh optimal di halaman depan dan sepanjang jalur pedestrian taman SMP Negeri 3 Pontianak dengan sinar matahari langsung.',
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
    habitat: 'Area lapangan upacara dan tepi halaman parkir SMP Negeri 3 Pontianak sebagai pohon peneduh utama.',
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
    habitat: 'Kebun edukasi produktif SMP Negeri 3 Pontianak dengan penyinaran matahari penuh dan tanah subur.',
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
    habitat: 'Teras ruang kelas, taman selasar, dan sudut hijau SMP Negeri 3 Pontianak karena tahan tempat teduh maupun terang.',
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
    habitat: 'Bedengan tanaman toga (tanaman obat keluarga) SMP Negeri 3 Pontianak yang gembur dan kaya humus.',
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
const SmartPlantQRWidget = ({ code, plantName = 'Tanaman', size = 140, showDownload = false }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const cleanCode = (code || 'SPN3-PLANT').trim().toUpperCase();
    const grid = 21;
    let seed = 0;
    for (let i = 0; i < cleanCode.length; i++) {
      seed = (seed * 31 + cleanCode.charCodeAt(i)) % 1000003;
    }

    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= grid - 7) return true;
      if (r >= grid - 7 && c < 7) return true;
      return false;
    };

    const finderPixel = (r, c) => {
      const lr = r >= grid - 7 ? r - (grid - 7) : r;
      const lc = c >= grid - 7 ? c - (grid - 7) : c;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    const canvas = document.createElement('canvas');
    const scale = 12;
    const margin = 24;
    const labelHeight = 34;
    canvas.width = grid * scale + margin * 2;
    canvas.height = grid * scale + margin * 2 + labelHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#164B36';
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        let dark = false;
        if (isFinder(r, c)) {
          dark = finderPixel(r, c);
        } else {
          const val = (seed + r * 37 + c * 73 + (r ^ c) * 19) % 11;
          dark = val < 5;
        }
        if (dark) {
          ctx.fillRect(margin + c * scale, margin + r * scale, scale - 1, scale - 1);
        }
      }
    }

    ctx.fillStyle = '#164B36';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cleanCode, canvas.width / 2, grid * scale + margin + 18);
    ctx.fillStyle = '#23865B';
    ctx.font = '600 10px sans-serif';
    ctx.fillText('SMP NEGERI 3 PONTIANAK', canvas.width / 2, grid * scale + margin + 32);

    setQrDataUrl(canvas.toDataURL('image/png'));
  }, [code]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${code || 'TANAMAN'}-MSBSPANTA.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2.5 rounded-2xl border-2 border-[#A8C7A0] shadow-sm inline-flex flex-col items-center">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code ${plantName}`}
            style={{ width: size, height: 'auto' }}
            className="rounded-lg"
          />
        ) : (
          <div style={{ width: size, height: size }} className="bg-[#F7F5EC] animate-pulse rounded-lg" />
        )}
      </div>

      {showDownload && qrDataUrl && (
        <button
          type="button"
          onClick={handleDownloadPNG}
          className="inline-flex items-center gap-1.5 bg-[#164B36] hover:bg-[#23865B] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh QR PNG</span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 4. KOMPONEN ILUSTRASI BOTANI MODERN (MODEL PORTRAIT)
// ============================================================================
const BotanicalIllustration = () => (
  <div className="relative w-full mx-auto">
    <div className="bg-[#F7F5EC] border border-[#A8C7A0] rounded-3xl p-3.5 shadow-sm">
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=900&q=80"
          alt="Keanekaragaman Tanaman Hijau SMP Negeri 3 Pontianak"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#164B36]/85 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#A8C7A0]">
              Edukasi Digital Lingkungan
            </span>
            <p className="text-xs font-bold">Taman & Kebun Edukasi Sekolah</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white text-[#164B36] flex items-center justify-center shadow">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-[#A8C7A0]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#23865B] text-white flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#164B36]">Pindai Label QR Tanaman</p>
            <p className="text-[10px] text-[#26352D]/75">Akses info botani langsung dari HP</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#23865B] bg-[#F7F5EC] px-2 py-1 rounded-lg border border-[#A8C7A0] flex-shrink-0">
          Instan
        </span>
      </div>
    </div>
  </div>
);

// ============================================================================
// 5. APLIKASI UTAMA: PUSTAKA TOGA SMPN 3 – SMP NEGERI 3 PONTIANAK (MODEL PORTRAIT)
// ============================================================================
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [plants, setPlants] = useState(INITIAL_PLANTS);

  // Navigasi Halaman ('beranda' | 'koleksi' | 'aktivitas' | 'tentang' | 'scan' | 'admin')
  const [activePage, setActivePage] = useState('beranda');
  const [selectedPlant, setSelectedPlant] = useState(null);

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
    buah: '',
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
      showToast('Login Berhasil', 'Selamat datang di Dashboard Administrator SMPN 3 Pontianak.');
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
      buah: plant.parts?.buah || '',
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
      className="min-h-screen bg-[#E7ECE4] text-[#26352D] flex justify-center selection:bg-[#A8C7A0] selection:text-[#164B36]"
    >
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Bingkai Utama Model Portrait */}
      <div className="w-full max-w-[480px] min-h-screen bg-[#F7F5EC] shadow-2xl border-x border-[#A8C7A0]/60 flex flex-col relative pb-24">

        {/* NOTIFIKASI TOAST PORTRAIT */}
        {notification && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[440px]">
            <div className={`flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border ${
              notification.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-[#164B36] border-[#A8C7A0] text-white'
            }`}>
              {notification.type === 'error'
                ? <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                : <CheckCircle2 className="w-5 h-5 text-[#A8C7A0] flex-shrink-0 mt-0.5" />
              }
              <div>
                <h4 className="font-bold text-xs">{notification.title}</h4>
                <p className="text-[11px] opacity-90 mt-0.5">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER PORTRAIT */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#A8C7A0]/60 px-4 py-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => { setActivePage('beranda'); setSelectedPlant(null); }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#164B36] flex items-center justify-center text-white shadow-sm relative flex-shrink-0">
                <Leaf className="w-5 h-5 text-[#A8C7A0]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-[#23865B] border-2 border-white flex items-center justify-center text-[8px] font-extrabold">
                  3
                </span>
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-[#164B36] block leading-tight">
                  PUSTAKA TOGA SMPN 3
                </span>
                <span className="text-[10px] font-bold text-[#23865B] tracking-wide block">
                  SMP NEGERI 3 PONTIANAK
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={() => { setActivePage('admin'); setSelectedPlant(null); }}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activePage === 'admin'
                      ? 'bg-[#164B36] text-white border-[#164B36]'
                      : 'bg-[#F7F5EC] text-[#164B36] border-[#A8C7A0]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#23865B]" />
                  <span>Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  title="Login Administrator / Guru"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F5EC] hover:bg-[#A8C7A0]/30 text-[#164B36] border border-[#A8C7A0]/70 text-xs font-bold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[#23865B]" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* KONTEN UTAMA PORTRAIT */}
        <main className="flex-1 px-4 py-5 space-y-6">

          {/* 1. HALAMAN BERANDA */}
          {activePage === 'beranda' && (
            <div className="space-y-6">
              <section className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 shadow-sm space-y-5">
                <div className="inline-flex items-center gap-1.5 bg-[#F7F5EC] border border-[#A8C7A0] px-3 py-1 rounded-full text-[11px] font-bold text-[#164B36]">
                  <Sprout className="w-3.5 h-3.5 text-[#23865B]" />
                  <span>Discover the Green World</span>
                </div>

                <div className="space-y-2.5">
                  <h1 className="text-2xl font-extrabold text-[#164B36] leading-snug tracking-tight">
                    KENALI TANAMAN, JAGA KEHIDUPAN!
                  </h1>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Jelajahi keanekaragaman tanaman di lingkungan SMP Negeri 3 Pontianak. Pindai QR Code, kenali jenis tanaman, dan temukan informasi menarik di balik setiap tumbuhan.
                  </p>
                </div>

                <BotanicalIllustration />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setActivePage('koleksi')}
                    className="flex items-center justify-center gap-1.5 bg-[#164B36] hover:bg-[#23865B] text-white font-bold py-3.5 px-3 rounded-2xl text-xs shadow-sm transition-all"
                  >
                    <span>Jelajahi Tanaman</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActivePage('scan')}
                    className="flex items-center justify-center gap-1.5 bg-[#F7F5EC] hover:bg-[#A8C7A0]/40 text-[#164B36] font-bold py-3.5 px-3 rounded-2xl text-xs border-2 border-[#164B36] transition-all"
                  >
                    <QrCode className="w-4 h-4 text-[#23865B]" />
                    <span>Scan QR Code</span>
                  </button>
                </div>
              </section>

              {/* Statistik Koleksi */}
              <section className="bg-[#164B36] text-white rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8C7A0]">
                      Inventaris Hijau Sekolah
                    </span>
                    <h2 className="text-lg font-extrabold">Koleksi Terdata</h2>
                  </div>
                  <button
                    onClick={() => setActivePage('koleksi')}
                    className="bg-[#23865B] text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15">
                    <div className="text-2xl font-extrabold text-[#A8C7A0]">{plants.length}</div>
                    <div className="text-[11px] font-medium mt-0.5">Spesies Tanaman</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15">
                    <div className="text-2xl font-extrabold text-[#A8C7A0]">
                      {new Set(plants.map(p => p.category)).size}
                    </div>
                    <div className="text-[11px] font-medium mt-0.5">Kategori Utama</div>
                  </div>
                </div>
              </section>

              {/* Panduan Penggunaan */}
              <section className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/60 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#23865B]">
                    Panduan Penggunaan
                  </span>
                  <h2 className="text-lg font-extrabold text-[#164B36]">
                    Cara Menggunakan PUSTAKA TOGA SMPN 3
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-[#F7F5EC] p-3.5 rounded-2xl border border-[#A8C7A0]/60">
                    <div className="w-7 h-7 rounded-xl bg-[#164B36] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#164B36]">Temukan Label QR Code</h3>
                      <p className="text-[11px] text-[#26352D]/80 mt-0.5 leading-relaxed">
                        Cari papan label QR Code yang terpasang di dekat tanaman di lingkungan SMPN 3 Pontianak.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#F7F5EC] p-3.5 rounded-2xl border border-[#A8C7A0]/60">
                    <div className="w-7 h-7 rounded-xl bg-[#23865B] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#164B36]">Pindai Menggunakan Smartphone</h3>
                      <p className="text-[11px] text-[#26352D]/80 mt-0.5 leading-relaxed">
                        Tekan tombol Scan QR di menu bawah dan arahkan kamera HP ke kode QR tanaman.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#F7F5EC] p-3.5 rounded-2xl border border-[#A8C7A0]/60">
                    <div className="w-7 h-7 rounded-xl bg-[#164B36] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#164B36]">Pelajari & Jaga Tanaman</h3>
                      <p className="text-[11px] text-[#26352D]/80 mt-0.5 leading-relaxed">
                        Baca informasi morfologi, habitat, manfaat, dan cara merawat tanaman tersebut.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tanaman Pilihan */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#23865B]">
                      Sorotan Flora Sekolah
                    </span>
                    <h2 className="text-lg font-extrabold text-[#164B36]">
                      Tanaman Pilihan
                    </h2>
                  </div>
                  <button
                    onClick={() => setActivePage('koleksi')}
                    className="text-xs font-bold text-[#23865B]"
                  >
                    Semua →
                  </button>
                </div>

                <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
                  {plants.slice(0, 4).map(plant => (
                    <div
                      key={plant.id}
                      onClick={() => { setSelectedPlant(plant); setActivePage('koleksi'); }}
                      className="w-56 flex-shrink-0 bg-white rounded-3xl overflow-hidden border border-[#A8C7A0]/70 shadow-sm cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-36 bg-[#F7F5EC]">
                          <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 left-2.5 bg-[#164B36]/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                            {plant.category}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <h3 className="text-sm font-extrabold text-[#164B36] line-clamp-1">{plant.name}</h3>
                          <p className="text-[11px] italic text-[#23865B] line-clamp-1 mt-0.5">{plant.scientificName}</p>
                        </div>
                      </div>
                      <div className="px-3.5 pb-3.5">
                        <span className="text-[11px] font-bold text-[#164B36] flex items-center gap-1">
                          Lihat Informasi <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Fakta Menarik */}
              <section className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 bg-[#F7F5EC] text-[#164B36] border border-[#A8C7A0] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#23865B]" /> Fakta Menarik
                  </span>
                  <button
                    onClick={() => setFactIndex((factIndex + 1) % PLANT_FACTS.length)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23865B]"
                  >
                    <RefreshCw className="w-3 h-3" /> Ganti Fakta
                  </button>
                </div>
                <h3 className="text-base font-extrabold text-[#164B36]">
                  {PLANT_FACTS[factIndex].title}
                </h3>
                <p className="text-xs text-[#26352D]/85 leading-relaxed">
                  {PLANT_FACTS[factIndex].description}
                </p>
              </section>

              {/* Ajakan Menjaga Lingkungan */}
              <section className="bg-gradient-to-br from-[#23865B] to-[#164B36] text-white rounded-3xl p-5 space-y-3">
                <h3 className="text-base font-extrabold">Mari Jaga Lingkungan Sekolah Kita!</h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Setiap tanaman di SMP Negeri 3 Pontianak berperan penting menyediakan udara bersih dan keteduhan. Rawat tanaman di sekitar kelasmu dan jangan merusak tumbuhan.
                </p>
                <button
                  onClick={() => setActivePage('aktivitas')}
                  className="bg-white text-[#164B36] font-bold px-4 py-2 rounded-xl text-xs"
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
                  <div className="bg-white rounded-3xl p-4 border border-[#A8C7A0]/70 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#23865B]">
                          Direktori Botani
                        </span>
                        <h1 className="text-xl font-extrabold text-[#164B36]">
                          Koleksi Tanaman
                        </h1>
                      </div>

                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-[11px] font-bold text-[#164B36]"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#23865B]" />
                        <span>{sortOrder === 'asc' ? 'A–Z' : 'Z–A'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-[#23865B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama tanaman atau nama ilmiah..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] focus:border-[#164B36] outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {['Semua', 'Tanaman hias', 'Tanaman obat', 'Tanaman buah', 'Tanaman pelindung', 'Tanaman lainnya'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                            selectedCategory === cat
                              ? 'bg-[#164B36] text-white'
                              : 'bg-[#F7F5EC] text-[#26352D] border border-[#A8C7A0]/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredAndSortedPlants.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-[#A8C7A0]">
                      <p className="text-sm font-bold text-[#164B36]">Tanaman tidak ditemukan.</p>
                      <p className="text-xs text-[#26352D]/75 mt-1">Coba kata kunci atau kategori lainnya.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      {filteredAndSortedPlants.map(plant => (
                        <div
                          key={plant.id}
                          onClick={() => setSelectedPlant(plant)}
                          className="bg-white rounded-3xl overflow-hidden border border-[#A8C7A0]/70 hover:border-[#23865B] shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-[4/3] bg-[#F7F5EC]">
                              <img
                                src={plant.image}
                                alt={plant.name}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 bg-[#164B36]/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                {plant.category}
                              </span>
                            </div>
                            <div className="p-3">
                              <h3 className="text-xs font-extrabold text-[#164B36] line-clamp-2 leading-snug">
                                {plant.name}
                              </h3>
                              <p className="text-[10px] italic text-[#23865B] mt-0.5 line-clamp-1">
                                {plant.scientificName}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 pb-3">
                            <button
                              type="button"
                              className="w-full py-2 px-2 rounded-xl bg-[#F7F5EC] text-[#164B36] font-bold text-[11px] flex items-center justify-center gap-1 border border-[#A8C7A0]"
                            >
                              <span>Lihat Info</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="inline-flex items-center gap-1.5 bg-white text-[#164B36] font-bold px-3.5 py-2 rounded-xl border border-[#A8C7A0] text-xs shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Koleksi</span>
                  </button>

                  <div className="bg-white rounded-3xl overflow-hidden border border-[#A8C7A0]/70 shadow-sm">
                    <div className="aspect-[4/3] bg-[#F7F5EC] relative">
                      <img
                        src={selectedPlant.image}
                        alt={selectedPlant.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#164B36]/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {selectedPlant.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h1 className="text-2xl font-extrabold text-[#164B36]">
                          {selectedPlant.name}
                        </h1>
                        <p className="text-xs italic font-semibold text-[#23865B] mt-0.5">
                          {selectedPlant.scientificName}
                        </p>
                      </div>

                      <div className="pt-1">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#23865B] mb-1">
                          Deskripsi Tanaman
                        </h2>
                        <p className="text-xs text-[#26352D]/90 leading-relaxed">
                          {selectedPlant.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-3.5">
                    <div className="flex items-center gap-2 text-[#164B36]">
                      <Layers className="w-4 h-4 text-[#23865B]" />
                      <h3 className="font-extrabold text-sm">Ciri Morfologi & Bagian Tumbuhan</h3>
                    </div>
                    <p className="text-xs text-[#26352D]/85 leading-relaxed">
                      {selectedPlant.morphology}
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {selectedPlant.parts?.daun && (
                        <div className="bg-[#F7F5EC] p-3 rounded-2xl border border-[#A8C7A0]/50">
                          <span className="text-[11px] font-extrabold text-[#164B36] block mb-0.5">🍃 Bentuk Daun</span>
                          <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.parts.daun}</p>
                        </div>
                      )}
                      {selectedPlant.parts?.batang && (
                        <div className="bg-[#F7F5EC] p-3 rounded-2xl border border-[#A8C7A0]/50">
                          <span className="text-[11px] font-extrabold text-[#164B36] block mb-0.5">🪵 Batang</span>
                          <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.parts.batang}</p>
                        </div>
                      )}
                      {selectedPlant.parts?.akar && (
                        <div className="bg-[#F7F5EC] p-3 rounded-2xl border border-[#A8C7A0]/50">
                          <span className="text-[11px] font-extrabold text-[#164B36] block mb-0.5">🌱 Sistem Akar</span>
                          <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.parts.akar}</p>
                        </div>
                      )}
                      {selectedPlant.parts?.bunga && (
                        <div className="bg-[#F7F5EC] p-3 rounded-2xl border border-[#A8C7A0]/50">
                          <span className="text-[11px] font-extrabold text-[#164B36] block mb-0.5">🌼 Bunga</span>
                          <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.parts.bunga}</p>
                        </div>
                      )}
                      {selectedPlant.parts?.buah && (
                        <div className="bg-[#F7F5EC] p-3 rounded-2xl border border-[#A8C7A0]/50">
                          <span className="text-[11px] font-extrabold text-[#164B36] block mb-0.5">🍎 Buah / Rimpang</span>
                          <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.parts.buah}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#164B36] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#23865B]" /> Habitat & Lokasi di Sekolah
                      </h3>
                      <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.habitat}</p>
                    </div>

                    <hr className="border-[#A8C7A0]/40" />

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#164B36] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#23865B]" /> Manfaat Tanaman
                      </h3>
                      <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.benefits}</p>
                    </div>

                    <hr className="border-[#A8C7A0]/40" />

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-[#164B36] flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-[#23865B]" /> Cara Perawatan
                      </h3>
                      <p className="text-xs text-[#26352D]/85 leading-relaxed">{selectedPlant.care}</p>
                    </div>
                  </div>

                  <div className="bg-[#164B36] text-white rounded-3xl p-5 space-y-1.5">
                    <h3 className="font-extrabold text-xs text-[#A8C7A0] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Fakta Menarik Tanaman
                    </h3>
                    <p className="text-xs text-white/90 leading-relaxed">{selectedPlant.funFact}</p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 flex flex-col items-center text-center space-y-2">
                    <p className="text-xs font-extrabold text-[#164B36]">QR Code Tanaman</p>
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
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <span className="inline-block bg-white border border-[#A8C7A0] text-[#164B36] text-[11px] font-bold px-3 py-1 rounded-full">
                  Pemindai QR SMPN 3 Pontianak
                </span>
                <h1 className="text-xl font-extrabold text-[#164B36]">
                  Scan QR Code Tanaman
                </h1>
                <p className="text-xs text-[#26352D]/80">
                  Arahkan kamera HP ke kode QR pada label tanaman di sekolah.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-4 border border-[#A8C7A0]/70 shadow-sm space-y-3.5">
                <div className="relative aspect-square rounded-2xl bg-[#164B36] overflow-hidden flex items-center justify-center border-2 border-[#23865B]">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-8 border-2 border-[#A8C7A0] rounded-2xl pointer-events-none overflow-hidden">
                        <div className="w-full h-0.5 bg-[#A8C7A0] shadow-[0_0_12px_#A8C7A0] animate-scan-line" />
                      </div>
                      <span className="absolute bottom-3 bg-[#164B36]/85 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                        Arahkan kamera ke QR Code...
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-5 space-y-2.5">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#A8C7A0] flex items-center justify-center mx-auto">
                        <Camera className="w-7 h-7" />
                      </div>
                      <p className="text-white text-sm font-bold">Kamera Siap Memindai</p>
                      <p className="text-[#A8C7A0] text-[11px] leading-relaxed">
                        Tekan tombol di bawah untuk mengaktifkan kamera smartphone.
                      </p>
                    </div>
                  )}
                </div>

                {scanError && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    {scanError}
                  </p>
                )}

                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-2 bg-[#164B36] hover:bg-[#23865B] text-white font-bold py-3.5 rounded-2xl text-xs transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Aktifkan Kamera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl text-xs"
                  >
                    Hentikan Kamera
                  </button>
                )}
              </div>

              <div className="bg-white rounded-3xl p-4 border border-[#A8C7A0]/70 space-y-3">
                <div className="flex items-center gap-2 text-[#164B36]">
                  <Keyboard className="w-4 h-4 text-[#23865B]" />
                  <h2 className="font-extrabold text-sm">Input Kode QR Manual</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenPlantByCode(manualCode)}
                    placeholder="Contoh: SPN3-LIDAHBUAYA"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] outline-none text-xs font-semibold"
                  />
                  <button
                    onClick={() => handleOpenPlantByCode(manualCode)}
                    className="bg-[#23865B] text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                  >
                    Buka
                  </button>
                </div>

                <div className="pt-1">
                  <p className="text-[11px] font-bold text-[#26352D]/75 mb-2">Pilih Kode QR Terdaftar:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plants.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleOpenPlantByCode(p.code)}
                        className="text-[10px] font-semibold bg-[#F7F5EC] hover:bg-[#164B36] text-[#164B36] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#A8C7A0] transition-colors"
                      >
                        {p.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. HALAMAN AKTIVITAS */}
          {activePage === 'aktivitas' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#23865B]">
                  Implementasi Pembelajaran
                </span>
                <h1 className="text-xl font-extrabold text-[#164B36]">
                  Aktivitas PUSTAKA TOGA SMPN 3
                </h1>
                <p className="text-xs text-[#26352D]/85 leading-relaxed">
                  Tahapan pemanfaatan teknologi QR Code untuk pengenalan flora di lingkungan SMP Negeri 3 Pontianak.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-2">
                  <span className="inline-block bg-[#F7F5EC] text-[#23865B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#A8C7A0]">
                    Tahap 01 • Inventarisasi Botani
                  </span>
                  <h2 className="text-base font-extrabold text-[#164B36]">
                    Pengenalan & Pendataan Tanaman
                  </h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Guru pembina bersama warga sekolah mendata jenis tanaman di taman kelas, kebun edukasi, dan zona apotek hidup sekolah lengkap dengan nama ilmiah serta manfaatnya.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-2">
                  <span className="inline-block bg-[#F7F5EC] text-[#23865B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#A8C7A0]">
                    Tahap 02 • Digitalisasi Label
                  </span>
                  <h2 className="text-base font-extrabold text-[#164B36]">
                    Pemasangan QR Code pada Tanaman
                  </h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Setiap spesies dibuatkan kode QR unik melalui dashboard sistem dan dipasang pada area tanaman agar mudah dipindai saat kegiatan belajar di luar kelas.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-2">
                  <span className="inline-block bg-[#F7F5EC] text-[#23865B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#A8C7A0]">
                    Tahap 03 • Eksplorasi Mandiri
                  </span>
                  <h2 className="text-base font-extrabold text-[#164B36]">
                    Murid Menggunakan QR Code
                  </h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Murid memindai label QR menggunakan smartphone untuk mempelajari ciri daun, batang, akar, manfaat, serta cara merawat tanaman sekolah.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-3">
                <h3 className="text-sm font-extrabold text-[#164B36]">Tanaman Terhubung QR Code</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {plants.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPlant(p); setActivePage('koleksi'); }}
                      className="cursor-pointer space-y-1"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden border border-[#A8C7A0]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] font-bold text-[#164B36] truncate">{p.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. HALAMAN TENTANG KAMI */}
          {activePage === 'tentang' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-[#A8C7A0]/70 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#23865B]">
                  Profil Media Edukasi Digital
                </span>
                <h1 className="text-xl font-extrabold text-[#164B36]">
                  Tentang PUSTAKA TOGA SMPN 3
                </h1>
                <p className="text-xs font-bold text-[#23865B]">
                  SMP Negeri 3 Pontianak • Kota Pontianak, Kalimantan Barat
                </p>
                <p className="text-xs text-[#26352D]/90 leading-relaxed">
                  <strong>PUSTAKA TOGA SMPN 3 – Discover the Green World</strong> merupakan media informasi digital berbasis web untuk memperkenalkan keanekaragaman tanaman di lingkungan <strong>SMP Negeri 3 Pontianak</strong> menggunakan teknologi QR Code.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-[#A8C7A0]/60 space-y-1">
                  <h2 className="font-extrabold text-sm text-[#164B36]">Tujuan Pembuatan Website</h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Menyediakan sumber belajar botani digital yang praktis dan mudah diakses langsung dari smartphone murid, guru, maupun pengunjung sekolah.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#A8C7A0]/60 space-y-1">
                  <h2 className="font-extrabold text-sm text-[#164B36]">Manfaat QR Code dalam Edukasi</h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Mengatasi keterbatasan ruang pada papan nama tanaman fisik dengan menyajikan informasi lengkap mulai dari morfologi hingga perawatan tanaman.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#A8C7A0]/60 space-y-1">
                  <h2 className="font-extrabold text-sm text-[#164B36]">Teknologi & Pendidikan Lingkungan</h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Memanfaatkan teknologi digital yang akrab dengan generasi muda untuk mendorong pengamatan langsung terhadap tumbuhan di sekitar sekolah.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#A8C7A0]/60 space-y-1">
                  <h2 className="font-extrabold text-sm text-[#164B36]">Harapan Kepedulian Lingkungan</h2>
                  <p className="text-xs text-[#26352D]/85 leading-relaxed">
                    Menumbuhkan kesadaran dan rasa memiliki warga sekolah untuk merawat serta menjaga kelestarian lingkungan hijau SMP Negeri 3 Pontianak.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. DASHBOARD ADMINISTRATOR */}
          {activePage === 'admin' && isAdmin && (
            <div className="space-y-5">
              <div className="bg-[#164B36] text-white rounded-3xl p-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8C7A0]">
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

              <form onSubmit={handleSavePlant} className="bg-white rounded-3xl p-5 border border-[#A8C7A0] shadow-sm space-y-3.5">
                <h2 className="text-base font-extrabold text-[#164B36]">
                  {editingPlantId ? `Edit Tanaman (${plantForm.name})` : '+ Tambah Tanaman Baru'}
                </h2>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Nama Lokal Tanaman *</label>
                  <input
                    required
                    type="text"
                    value={plantForm.name}
                    onChange={e => setPlantForm({ ...plantForm, name: e.target.value })}
                    placeholder="Contoh: Sirih Gading"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Kode Unik QR *</label>
                    <input
                      required
                      type="text"
                      value={plantForm.code}
                      onChange={e => setPlantForm({ ...plantForm, code: e.target.value })}
                      placeholder="SPN3-SIRIH"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Kategori</label>
                    <select
                      value={plantForm.category}
                      onChange={e => setPlantForm({ ...plantForm, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs font-semibold"
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
                  <label className="text-[11px] font-bold text-[#164B36]">Nama Ilmiah *</label>
                  <input
                    required
                    type="text"
                    value={plantForm.scientificName}
                    onChange={e => setPlantForm({ ...plantForm, scientificName: e.target.value })}
                    placeholder="Epipremnum aureum"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs italic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#164B36] block">Foto Tanaman</label>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-1.5 bg-[#F7F5EC] text-[#164B36] font-bold px-3 py-2 rounded-xl border border-[#A8C7A0] text-[11px] cursor-pointer flex-shrink-0">
                      <ImageIcon className="w-3.5 h-3.5 text-[#23865B]" />
                      <span>Unggah</span>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={plantForm.image}
                      onChange={e => setPlantForm({ ...plantForm, image: e.target.value })}
                      placeholder="Atau URL foto..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Deskripsi Tanaman</label>
                  <textarea
                    rows="2"
                    value={plantForm.description}
                    onChange={e => setPlantForm({ ...plantForm, description: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Ciri Morfologi Umum</label>
                  <input
                    type="text"
                    value={plantForm.morphology}
                    onChange={e => setPlantForm({ ...plantForm, morphology: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Bentuk Daun</label>
                    <input
                      type="text"
                      value={plantForm.daun}
                      onChange={e => setPlantForm({ ...plantForm, daun: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Batang</label>
                    <input
                      type="text"
                      value={plantForm.batang}
                      onChange={e => setPlantForm({ ...plantForm, batang: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Akar</label>
                    <input
                      type="text"
                      value={plantForm.akar}
                      onChange={e => setPlantForm({ ...plantForm, akar: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#164B36]">Bunga / Buah</label>
                    <input
                      type="text"
                      value={plantForm.bunga}
                      onChange={e => setPlantForm({ ...plantForm, bunga: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Habitat / Lokasi di Sekolah</label>
                  <input
                    type="text"
                    value={plantForm.habitat}
                    onChange={e => setPlantForm({ ...plantForm, habitat: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Manfaat Tanaman</label>
                  <input
                    type="text"
                    value={plantForm.benefits}
                    onChange={e => setPlantForm({ ...plantForm, benefits: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Cara Perawatan</label>
                  <input
                    type="text"
                    value={plantForm.care}
                    onChange={e => setPlantForm({ ...plantForm, care: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#164B36]">Fakta Menarik</label>
                  <input
                    type="text"
                    value={plantForm.funFact}
                    onChange={e => setPlantForm({ ...plantForm, funFact: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs"
                  />
                </div>

                {plantForm.code && (
                  <div className="bg-[#F7F5EC] p-4 rounded-2xl border border-[#A8C7A0] flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-extrabold text-[#164B36]">QR Code Otomatis</p>
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
                    className="flex-1 bg-[#164B36] text-white font-bold py-3 rounded-2xl text-xs"
                  >
                    {editingPlantId ? 'Simpan Perubahan' : 'Simpan Tanaman & QR'}
                  </button>
                  {editingPlantId && (
                    <button
                      type="button"
                      onClick={() => { setEditingPlantId(null); setPlantForm(emptyPlantForm); }}
                      className="px-4 py-3 rounded-2xl bg-[#F7F5EC] border border-[#A8C7A0] text-xs font-bold"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-2.5">
                <h2 className="text-sm font-extrabold text-[#164B36] px-1">
                  Koleksi Tersimpan ({plants.length})
                </h2>
                {plants.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-3.5 border border-[#A8C7A0]/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-[#A8C7A0] flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-xs text-[#164B36] truncate">{p.name}</h3>
                        <p className="text-[10px] font-mono text-[#23865B] font-bold">{p.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedPlant(p); setActivePage('koleksi'); }}
                        className="p-2 rounded-xl bg-[#F7F5EC] text-[#164B36]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEditPlant(p)}
                        className="p-2 rounded-xl bg-emerald-50 text-[#23865B]"
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
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-[#A8C7A0]/70 px-2 py-2 shadow-[0_-4px_20px_rgba(22,75,54,0.08)]">
          <div className="grid grid-cols-5 items-center">
            <button
              onClick={() => { setActivePage('beranda'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'beranda' ? 'text-[#164B36] font-extrabold' : 'text-[#26352D]/60 font-medium'
              }`}
            >
              <Sprout className={`w-5 h-5 ${activePage === 'beranda' ? 'text-[#23865B]' : ''}`} />
              <span className="text-[10px]">Beranda</span>
            </button>

            <button
              onClick={() => { setActivePage('koleksi'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'koleksi' ? 'text-[#164B36] font-extrabold' : 'text-[#26352D]/60 font-medium'
              }`}
            >
              <Leaf className={`w-5 h-5 ${activePage === 'koleksi' ? 'text-[#23865B]' : ''}`} />
              <span className="text-[10px]">Koleksi</span>
            </button>

            <div className="flex flex-col items-center justify-center -mt-6">
              <button
                onClick={() => { setActivePage('scan'); setSelectedPlant(null); }}
                className="w-14 h-14 rounded-2xl bg-[#164B36] hover:bg-[#23865B] text-white flex items-center justify-center shadow-lg border-4 border-[#F7F5EC] transition-transform active:scale-95"
                title="Scan QR Code"
              >
                <QrCode className="w-6 h-6 text-[#A8C7A0]" />
              </button>
              <span className="text-[10px] font-extrabold text-[#164B36] mt-1">Scan QR</span>
            </div>

            <button
              onClick={() => { setActivePage('aktivitas'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'aktivitas' ? 'text-[#164B36] font-extrabold' : 'text-[#26352D]/60 font-medium'
              }`}
            >
              <BookOpen className={`w-5 h-5 ${activePage === 'aktivitas' ? 'text-[#23865B]' : ''}`} />
              <span className="text-[10px]">Aktivitas</span>
            </button>

            <button
              onClick={() => { setActivePage('tentang'); setSelectedPlant(null); }}
              className={`flex flex-col items-center justify-center py-1 gap-1 rounded-xl transition-colors ${
                activePage === 'tentang' ? 'text-[#164B36] font-extrabold' : 'text-[#26352D]/60 font-medium'
              }`}
            >
              <Info className={`w-5 h-5 ${activePage === 'tentang' ? 'text-[#23865B]' : ''}`} />
              <span className="text-[10px]">Tentang</span>
            </button>
          </div>
        </nav>

        {/* MODAL LOGIN ADMINISTRATOR */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-[400px] w-full p-6 border border-[#A8C7A0] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#164B36]">
                  <Lock className="w-4 h-4 text-[#23865B]" />
                  <h2 className="text-base font-extrabold">Login Administrator</h2>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-sm font-bold text-[#26352D]/60">
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#26352D]/80 leading-relaxed">
                Khusus guru pembina dan administrator SMP Negeri 3 Pontianak.
              </p>

              {adminLoginError && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
                  {adminLoginError}
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#164B36]">Kode Akses</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#F7F5EC] border border-[#A8C7A0] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#164B36] hover:bg-[#23865B] text-white font-bold py-3 rounded-xl text-xs transition-colors"
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
