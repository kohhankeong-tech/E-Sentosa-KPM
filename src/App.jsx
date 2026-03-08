import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc 
} from 'firebase/firestore';
import { 
  Plus, X, User, Home, Save, Camera, ShieldCheck, Phone, Info, MessageCircle, Heart, Calendar as CalendarIcon
} from 'lucide-react';

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyByip5gU8owgT4rBRe38vQ2DZ2EeAg9saw",
  authDomain: "e-sentosa-kpm.firebaseapp.com",
  projectId: "e-sentosa-kpm",
  storageBucket: "e-sentosa-kpm.firebasestorage.app",
  messagingSenderId: "846258109692",
  appId: "1:846258109692:web:874886e5d12aa2fd696b79",
  measurementId: "G-5J2JEE1R5L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'e-sentosa-kpm';

const RODA_DATA = {
  "Gembira": { emoji: "😊", color: "#FFF9C4", sub: { "Aman": ["Terharu", "Terkesima", "Kagum"], "Bahagia": ["Riang", "Seronok", "Terhibur"], "Bangga": ["Yakin", "Ceria", "Puas hati"], "Gemilang": ["Jaya", "Meriah", "Senang hati"] } },
  "Cinta": { emoji: "😍", color: "#FCE4EC", sub: { "Suka": ["Berharap", "Gemilang", "Rawan"], "Mesra": ["Teruja", "Waja", "Rangsang"], "Rindu": ["Euphoria", "Sukacita", "Terpukau"], "Keinginan": ["Minat", "Jiwang", "Romantis"] } },
  "Terkejut": { emoji: "😲", color: "#E0F7FA", sub: { "Tergamam": ["Kaget", "Bingung", "Takjub"], "Keliru": ["Kalut", "Hairan", "Bungkam"], "Kagum": ["Terpesona", "Tersentak", "Gamam"] } },
  "Sedih": { emoji: "😢", color: "#E3F2FD", sub: { "Derita": ["Hiba", "Kecewa", "Malu"], "Terpinggir": ["Putus asa", "Sayu", "Pilu"], "Hampa": ["Sesal", "Bersalah", "Terasing"], "Muram": ["Duka", "Murung", "Sunyi"] } },
  "Takut": { emoji: "😨", color: "#F3E5F5", sub: { "Meradang": ["Seram", "Gemuruh", "Ragu"], "Seram": ["Jengkel", "Gerun", "Gentar"], "Gentar": ["Cuak", "Risau", "Cemas"], "Damai": ["Santan", "Lega", "Puas"] } },
  "Marah": { emoji: "😡", color: "#FFEBEE", sub: { "Terganggu": ["Iri", "Meluat", "Derita"], "Sakit hati": ["Geram", "Cemburu", "Mual"], "Geram": ["Benci", "Seteru", "Gelisah"], "Cemas": ["Kecewa", "Sakit hati", "Jijik"] } }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState('calendar');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [profile, setProfile] = useState({ name: '', className: '', avatar: null });
  const [step, setStep] = useState(1);
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');
  const [text, setText] = useState('');

  const counselorInfo = {
    name: "Kelvin Koh Han Keong",
    title: "Kaunselor Pelatih",
    campus: "IPG Kampus Tawau",
    phone: "011-73981207",
    whatsappMsg: "Hai Cikgu Kelvin, saya memerlukan khidmat bimbingan."
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    getDoc(profileDoc).then(docSnap => { if (docSnap.exists()) setProfile(docSnap.data()); });

    const entriesCol = collection(db, 'artifacts', appId, 'users', user.uid, 'entries');
    const unsubEntries = onSnapshot(entriesCol, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEntries(data.sort((a, b) => b.timestamp - a.timestamp));
    });
    return () => unsubEntries();
  }, [user]);

  const handleSaveEntry = async () => {
    if (!user) return;
    const entryData = {
      date: new Date().toDateString(),
      fullDate: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', weekday: 'long' }),
      emotions: [f1, f2, f3],
      text,
      emoji: RODA_DATA[f1].emoji,
      color: RODA_DATA[f1].color,
      studentName: profile.name || "Murid",
      timestamp: Date.now()
    };
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'entries'), entryData);
    setStep(1); setView('calendar'); setText('');
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/6${counselorInfo.phone}?text=${encodeURIComponent(counselorInfo.whatsappMsg)}`, '_blank');
  };

  return (
    <div className="bg-[#FFFDF5] min-h-screen flex justify-center pb-24 font-sans text-slate-800">
      {/* CSS Langsung untuk menjamin paparan tidak pecah lagi */}
      <style>{`
        .custom-shadow { shadow-color: rgba(255, 107, 107, 0.2); shadow-offset: {width: 0, height: 10}; shadow-opacity: 1; shadow-radius: 20; }
        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .btn-primary { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); transition: all 0.3s ease; }
        .btn-primary:active { transform: scale(0.95); }
        .card-animate { animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col shadow-2xl border-x border-orange-50">
        
        {/* HEADER */}
        <header className="p-6 glass-nav sticky top-0 z-50 flex justify-between items-center border-b border-orange-50">
          <div>
            <h1 className="text-2xl font-black text-orange-600 tracking-tight" style={{ fontFamily: 'system-ui' }}>E-Sentosa <span className="text-orange-300">✨</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diari Sejahtera Murid</p>
          </div>
          <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 overflow-hidden shadow-sm active:scale-90 transition-transform">
            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="text-orange-300" size={20} />}
          </button>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'home' && view === 'calendar' && (
            <div className="space-y-6 card-animate">
              {/* WELCOME CARD */}
              <div className="bg-gradient-to-br from-orange-400 to-red-400 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <Heart className="absolute -right-6 -top-6 text-white opacity-20 group-hover:scale-110 transition-transform duration-700" size={120} />
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-1">Hai, Kawan! 👋</h2>
                  <p className="text-sm opacity-90 mb-4">Bagaimana perasaanmu hari ini?</p>
                </div>
              </div>

              {/* CALENDAR SECTION */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-orange-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon size={16} className="text-orange-400" />
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Rekod Sejahtera</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['A', 'I', 'R', 'K', 'J', 'S', 'M'].map(l => (
                    <div key={l} className="text-[10px] font-black text-orange-200 text-center uppercase">{l}</div>
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const entry = entries.find(e => new Date(e.timestamp).getDate() === day);
                    return (
                      <button key={i} onClick={() => entry && setSelectedEntry(entry)} className="aspect-square rounded-2xl flex items-center justify-center text-sm transition-all shadow-sm border border-transparent hover:scale-105 active:scale-95" style={{ backgroundColor: entry ? entry.color : '#FFFCF8', border: entry ? 'none' : '1px solid #FFF5E6' }}>
                        {entry ? entry.emoji : <span className="text-[10px] text-orange-200 font-bold">{day}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COUNSELOR CONTACT */}
              <div className="bg-orange-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-orange-200">
                <p className="text-sm font-bold text-orange-900 mb-3 italic">"Cikgu Kelvin sedia membantu anda."</p>
                <button onClick={openWhatsApp} className="w-full bg-white text-orange-500 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors">
                  <MessageCircle size={14} /> Tanya Cikgu Kelvin
                </button>
              </div>
            </div>
          )}

          {activeTab === 'home' && view === 'form' && (
            <div className="card-animate pb-10">
               <div className="mb-6 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800">Apa khabar?</h3>
                 {step > 1 && <button onClick={() => setStep(step-1)} className="text-xs font-bold text-orange-400 underline uppercase">Kembali</button>}
              </div>

              {step < 4 ? (
                <div className="grid grid-cols-2 gap-4">
                  {step === 1 && Object.entries(RODA_DATA).map(([k, v]) => (
                    <button key={k} onClick={() => { setF1(k); setStep(2); }} className="p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-3 border-4 border-white hover:shadow-lg transition-all active:scale-95" style={{ backgroundColor: v.color }}>
                      <span className="text-4xl">{v.emoji}</span>
                      <span className="text-xs font-black uppercase text-slate-700 tracking-tight">{k}</span>
                    </button>
                  ))}
                  {step === 2 && Object.keys(RODA_DATA[f1].sub).map(s => (
                    <button key={s} onClick={() => { setF2(s); setStep(3); }} className="p-6 bg-white rounded-[2.5rem] shadow-sm font-black text-xs uppercase border-4 border-orange-50 hover:bg-orange-50 transition-all">{s}</button>
                  ))}
                  {step === 3 && RODA_DATA[f1].sub[f2].map(n => (
                    <button key={n} onClick={() => { setF3(n); setStep(4); }} className="p-5 bg-white rounded-3xl shadow-sm font-black text-[10px] uppercase border-4 border-orange-50 hover:bg-orange-100 transition-all">{n}</button>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-[3rem] shadow-2xl border-4 border-orange-50 space-y-5">
                  <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-[2rem]">
                    <div className="text-5xl drop-shadow-sm">{RODA_DATA[f1].emoji}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-orange-300">Saya Rasa</p>
                      <h4 className="font-black text-xl text-orange-900 uppercase leading-tight">{f3}</h4>
                    </div>
                  </div>
                  <textarea placeholder="Tuliskan luahan hati anda di sini..." value={text} onChange={(e) => setText(e.target.value)} className="w-full h-40 bg-orange-50/30 p-5 rounded-3xl border-none outline-none italic text-lg placeholder:text-slate-300 resize-none focus:ring-2 ring-orange-100 transition-all" />
                  <button onClick={handleSaveEntry} className="w-full py-5 btn-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-red-100">Simpan Rekod ✨</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 card-animate">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-orange-50 rounded-[3rem] border-[10px] border-white shadow-2xl flex items-center justify-center overflow-hidden">
                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User size={48} className="text-orange-200" />}
                  </div>
                  <label className="absolute bottom-1 right-1 bg-orange-500 p-3 text-white rounded-2xl cursor-pointer shadow-lg hover:bg-orange-600 transition-colors">
                    <Camera size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const reader = new FileReader();
                      reader.onloadend = () => setProfile({...profile, avatar: reader.result});
                      if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                </div>
                
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-orange-50 space-y-4">
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black uppercase text-orange-300 px-2">Nama Murid</p>
                    <input placeholder="Masukkan Nama" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full p-4 bg-orange-50/50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black uppercase text-orange-300 px-2">Kelas</p>
                    <input placeholder="Masukkan Kelas" value={profile.className} onChange={(e) => setProfile({...profile, className: e.target.value})} className="w-full p-4 bg-orange-50/50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                  <button onClick={async () => { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), profile); }} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">Simpan Profil</button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                       <Info className="text-orange-400" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-wide">Pojok Kaunselor</h4>
                       <p className="text-[10px] text-orange-400 font-bold uppercase">Khidmat Bimbingan</p>
                    </div>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl space-y-3 mb-5 border border-white/10">
                    <p className="text-xs font-bold">{counselorInfo.name}</p>
                    <p className="text-[10px] opacity-60 leading-relaxed">{counselorInfo.title}, {counselorInfo.campus}</p>
                 </div>
                 <button onClick={openWhatsApp} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
                    <Phone size={16} /> Hubungi Cikgu Kelvin
                 </button>
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-nav border border-orange-100 flex justify-around items-center py-4 rounded-[2.5rem] z-50 shadow-2xl">
          <button onClick={() => { setActiveTab('home'); setView('calendar'); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' && view === 'calendar' ? 'text-orange-500 scale-110' : 'text-slate-300'}`}>
            <Home size={22} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase">Utama</span>
          </button>
          
          <button onClick={() => { setActiveTab('home'); setView('form'); }} className="w-16 h-16 btn-primary text-white rounded-[2rem] shadow-xl shadow-orange-200 flex items-center justify-center border-4 border-white -mt-12">
            <Plus size={30} strokeWidth={4} />
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-orange-500 scale-110' : 'text-slate-300'}`}>
            <User size={22} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase">Profil</span>
          </button>
        </nav>

        {/* DETAIL MODAL */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedEntry(null)}>
            <div className="w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl space-y-6 card-animate" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedEntry.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase leading-none">{selectedEntry.emotions[2]}</h3>
                    <p className="text-[10px] font-bold text-orange-400 uppercase mt-1 tracking-widest">{selectedEntry.fullDate}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100"><X size={20} /></button>
              </div>
              <div className="bg-orange-50/30 p-6 rounded-[2rem] min-h-[120px] border border-orange-100">
                <p className="italic text-lg text-slate-600 leading-relaxed">"{selectedEntry.text || "Tiada nota ditulis..."}"</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;