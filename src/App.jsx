import React, { useState, useEffect } from 'react';
import { Mail, Clock, Users, Leaf, Share2, ChevronDown, Heart, Send, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// --- Firebase 配置 ---
// 注意：这里的 __firebase_config 是环境提供的变量
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedDocs = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSubmissions(sortedDocs);
    }, (error) => console.error("Firestore error:", error));
    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), {
        ...formData,
        createdAt: serverTimestamp(),
        userId: user.uid
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setView('landing');
        setIsSubmitted(false);
        setFormData({ name: '', contact: '', occupation: '', reason: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        <button onClick={() => setView('landing')} className="absolute top-8 left-8 flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors font-light">
          <ArrowLeft size={20} /> 返回首页
        </button>
        <div className="w-full max-w-xl space-y-12 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-light tracking-widest text-[#2d3a2d]">写信进田</h2>
            <p className="text-stone-500 font-light italic">“有些相遇，值得慢一点。”</p>
          </div>
          {isSubmitted ? (
            <div className="bg-[#f0f4f0] p-12 rounded-3xl text-center space-y-4 border border-[#e0e8e0]">
              <CheckCircle2 size={48} className="text-[#4a6b4a] mx-auto" />
              <h3 className="text-xl font-medium text-[#2d3a2d]">已收到你的来信</h3>
              <p className="text-[#5a7b5a] leading-relaxed text-sm">我们会仔细阅读，并尽快通过 Email 与你取得联系。</p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 focus:border-[#4a6b4a] outline-none transition-colors" placeholder="你的称呼" />
                <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 focus:border-[#4a6b4a] outline-none transition-colors" placeholder="常用联系方式" />
              </div>
              <textarea required value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 focus:border-[#4a6b4a] outline-none transition-colors min-h-[80px]" placeholder="你目前在做什么？" />
              <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-3 focus:border-[#4a6b4a] outline-none transition-colors min-h-[120px]" placeholder="为什么想写这封信？" />
              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#2d3a2d] text-white rounded-full hover:bg-[#1a251a] transition-all flex items-center justify-center gap-2 shadow-lg tracking-[0.2em] text-sm">
                {isSubmitting ? "正在递信..." : "递交报名信"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light tracking-widest text-[#2d3a2d]">CreationSTEM.org</h1>
            </div>
            <button onClick={() => setView('landing')} className="text-stone-400 hover:text-[#2d3a2d]">返回首页</button>
          </div>
          <div className="grid gap-6">
            {submissions.map(item => (
              <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-lg text-[#2d3a2d]">{item.name}</span>
                  <span className="text-[#4a6b4a] text-sm font-mono">{item.contact}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-8 text-sm text-stone-600 leading-relaxed">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-300 block mb-2">现状</span>
                    {item.occupation}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-300 block mb-2">理由</span>
                    {item.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3d4a3d] font-sans selection:bg-[#e8ece8]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('[https://www.transparenttextures.com/patterns/paper-fibers.png](https://www.transparenttextures.com/patterns/paper-fibers.png)')]"></div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#fdfcf8]/90 backdrop-blur-md py-4 shadow-sm border-b border-stone-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Leaf size={18} className="text-[#4a6b4a]" />
            <div className="flex flex-col">
              <span className="font-medium tracking-[0.3em] text-[#2d3a2d] leading-none">一块田</span>
              <span className="text-[8px] uppercase tracking-[0.1em] text-stone-400 mt-1">Creation STEM</span>
            </div>
          </div>
          <button onClick={() => setView('apply')} className="px-6 py-2 bg-[#2d3a2d] text-[#fdfcf8] rounded-full text-[10px] tracking-widest hover:bg-[#1a251a] transition-all shadow-md uppercase">Join Us</button>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-100/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-green-100/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="space-y-8 animate-fadeIn max-w-4xl w-full">
          <h2 className="text-[#8a9a8a] tracking-[0.5em] text-[10px] uppercase font-light">Creation STEM Conservatory · 同行者聚会</h2>
          <h1 className="text-6xl md:text-8xl font-light tracking-[-0.02em] text-[#2d3a2d]">一块田</h1>
          
          <div className="h-px w-12 bg-[#cbd5cb] mx-auto my-10"></div>
          
          <div className="space-y-4 text-xl md:text-2xl text-[#5a6a5a] font-light leading-relaxed">
            <p>不急着收成，先把土壤养好。</p>
            <p>每周一次，彼此陪伴，缓慢生长。</p>
          </div>

          <div className="mt-16 max-w-lg mx-auto">
            <div className="bg-white p-2 shadow-2xl rounded-sm border border-stone-100 rotate-1">
              <img 
                src="[https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=1000](https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=1000)" 
                alt="CreationSTEM Poster" 
                className="w-full h-auto grayscale-[0.2] sepia-[0.1]"
              />
              <div className="py-4 text-[10px] tracking-[0.2em] text-stone-300 uppercase">
                creationstem.org · 2026
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 animate-bounce text-stone-200"><ChevronDown size={28} /></div>
      </section>

      <section className="py-32 px-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 text-[#5a6a5a] leading-loose">
          <div className="space-y-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-[#4a6b4a]">
                 <Heart size={16} />
                 <span className="text-[10px] tracking-widest uppercase font-bold">理念</span>
               </div>
               <p className="text-lg text-[#2d3a2d]">有些路，适合一起走。</p>
               <p className="text-sm">在快速结果、不断消耗的教育环境之外，我们想留下一块田。先把土壤养好，让该发生的自然发生。</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-[#f4f6f4] p-10 rounded-3xl border border-[#e8ece8] relative">
              <h3 className="text-[#2d3a2d] font-medium mb-6 tracking-widest text-sm uppercase">聚会安排</h3>
              <div className="space-y-2 text-stone-600">
                <p className="text-xl">2026年3月开始</p>
                <p className="text-lg">每周二 20:30 – 21:30</p>
                <p className="text-[10px] tracking-widest mt-4 text-[#8a9a8a] uppercase">Online · CreationSTEM.org</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#FDFCF8] py-32 px-8 border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-light tracking-[0.3em] text-[#2d3a2d]">如果你愿意</h3>
            <p className="text-[#8a9a8a] italic text-sm">欢迎进田坐一会儿。</p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => setView('apply')} className="group flex flex-col items-center gap-6 mx-auto">
              <div className="w-16 h-16 rounded-full border border-[#cbd5cb] flex items-center justify-center group-hover:bg-[#2d3a2d] group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                <Mail size={24} />
              </div>
              <span className="text-xs tracking-[0.3em] text-[#2d3a2d] font-medium">field@creationstem.org</span>
            </button>
          </div>
          
          <div className="pt-20 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-[0.4em] text-stone-300 uppercase">Creation STEM Conservatory</span>
              <span className="text-[8px] tracking-[0.2em] text-stone-200 mt-1">WWW.CREATIONSTEM.ORG</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <button onClick={() => setShowAdminLogin(!showAdminLogin)} className="text-stone-200 hover:text-stone-400 transition-colors">
                <Lock size={12} />
              </button>
              {showAdminLogin && (
                <div className="flex gap-2 animate-fadeIn">
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="bg-white border border-stone-200 px-3 py-1 text-[10px] rounded-full outline-none focus:border-[#4a6b4a]" placeholder="管理密码" />
                  <button onClick={checkAdmin} className="text-[10px] bg-[#2d3a2d] text-white px-3 py-1 rounded-full uppercase tracking-widest">Login</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1.5s ease-out forwards; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default App;
