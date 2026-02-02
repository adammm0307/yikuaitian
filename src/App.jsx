import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, Clock, Users, Leaf, Share2, ChevronDown, Heart, Send, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// --- 容错处理：确保在 Vercel 也能运行 ---
let db, auth, appId;
try {
  const configStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
  const firebaseConfig = configStr ? JSON.parse(configStr) : {
    apiKey: "temp", authDomain: "temp", projectId: "temp", storageBucket: "temp", messagingSenderId: "temp", appId: "temp"
  };
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'yikuaitian-app';
} catch (e) {
  console.log("Firebase 模式：运行中");
}

const App = () => {
  const [view, setView] = useState('landing');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', contact: '', occupation: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!auth) return;
    onAuthStateChanged(auth, setUser);
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {}
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), {
        ...formData, createdAt: serverTimestamp(), userId: user.uid
      });
      setIsSubmitted(true);
      setTimeout(() => { setView('landing'); setIsSubmitted(false); setFormData({name:'',contact:'',occupation:'',reason:''}); }, 3000);
    } catch (err) {} finally { setIsSubmitting(false); }
  };

  const checkAdmin = () => {
    if (adminPassword === 'field2026') {
      setIsAdmin(true);
      setShowAdminLogin(false);
    }
  };

  if (view === 'apply') {
    return (
      <div className="min-h-screen bg-[#FDFCF8] text-[#3d4a3d] p-6 flex flex-col items-center justify-center">
        <button onClick={() => setView('landing')} className="absolute top-8 left-8 text-stone-400 hover:text-stone-800 flex items-center gap-2">
          <ArrowLeft size={20} /> 返回
        </button>
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-light tracking-widest text-[#2d3a2d]">写信进田</h2>
            <p className="text-stone-500 font-light italic">“有些相遇，值得慢一点。”</p>
          </div>
          {isSubmitted ? (
            <div className="bg-[#f0f4f0] p-12 rounded-3xl text-center space-y-4">
              <CheckCircle2 size={48} className="text-[#4a6b4a] mx-auto" />
              <h3 className="text-xl font-medium text-[#2d3a2d]">已收到你的来信</h3>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-6">
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 outline-none focus:border-[#4a6b4a]" placeholder="称呼" />
              <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 outline-none focus:border-[#4a6b4a]" placeholder="邮箱/微信" />
              <textarea required value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 outline-none min-h-[100px]" placeholder="目前在做什么？" />
              <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 outline-none min-h-[100px]" placeholder="为什么想来？" />
              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#2d3a2d] text-white rounded-full">
                {isSubmitting ? "正在递交..." : "确认递交"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 text-[#3d4a3d]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light">管理后台</h1>
            <button onClick={() => setView('landing')} className="text-stone-400">退出</button>
          </div>
          <div className="space-y-4">
            {submissions.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-stone-100">
                <div className="flex justify-between font-medium"><span>{item.name}</span><span className="text-stone-400">{item.contact}</span></div>
                <p className="mt-4 text-sm text-stone-600">现状：{item.occupation}</p>
                <p className="mt-2 text-sm text-stone-600">理由：{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3d4a3d] font-sans">
      <nav className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'bg-white/90 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-[#4a6b4a]" />
            <span className="font-medium tracking-widest text-[#2d3a2d]">一块田</span>
          </div>
          <button onClick={() => setView('apply')} className="px-6 py-2 bg-[#2d3a2d] text-white rounded-full text-xs uppercase tracking-widest">Join Us</button>
        </div>
      </nav>

      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-stone-400 tracking-[0.4em] text-[10px] uppercase">Creation STEM Conservatory</h2>
          <h1 className="text-6xl md:text-8xl font-light text-[#2d3a2d]">一块田</h1>
          <div className="h-px w-12 bg-stone-300 mx-auto my-6"></div>
          <p className="text-xl text-stone-500 font-light">不急着收成，先把土壤养好。</p>
          <div className="mt-12 max-w-sm mx-auto shadow-2xl rotate-1 bg-white p-2 border border-stone-100">
             <img src="[https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=800](https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=800)" className="w-full grayscale-[0.2]" alt="Poster" />
             <p className="py-3 text-[10px] text-stone-300 tracking-[0.3em]">CREATIONSTEM.ORG</p>
          <./poster.png>
        </div>
      </section>

      <section className="py-24 px-8 max-w-4xl mx-auto border-t border-stone-100 text-center space-y-12">
        <p className="text-lg text-stone-500 leading-relaxed">有些成长，需要时间；有些路，适合一起走。</p>
        <button onClick={() => setView('apply')} className="px-12 py-4 border border-[#2d3a2d] rounded-full text-[#2d3a2d] hover:bg-[#2d3a2d] hover:text-white transition-all tracking-widest">写信进田，慢慢认识</button>
      </section>

      <footer className="py-20 bg-stone-50 border-t border-stone-100 text-center space-y-4">
        <p className="text-[10px] text-stone-300 tracking-[0.4em] uppercase">Creation STEM Conservatory</p>
        <div className="flex flex-col items-center gap-2">
           <button onClick={() => setShowAdminLogin(!showAdminLogin)} className="text-stone-200 hover:text-stone-400 transition-colors"><Lock size={12} /></button>
           {showAdminLogin && (
             <div className="flex gap-2">
               <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="bg-white border px-3 py-1 text-xs rounded-full outline-none focus:border-[#4a6b4a]" placeholder="管理密码" />
               <button onClick={checkAdmin} className="bg-stone-800 text-white px-3 py-1 rounded-full text-xs">进入</button>
             </div>
           )}
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

export default App;
