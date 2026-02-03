import React, { useState } from 'react';
import { Mail, Sprout, Wind, Copy, Check, ChevronRight, Calendar, Users } from 'lucide-react';

const App = () => {
  const [copied, setCopied] = useState(false);
  const email = "field@creationstem.org";

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = email;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('无法复制地址', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-stone-800 font-serif selection:bg-emerald-100/50">
      
      {/* 极简页头 */}
      <nav className="p-8 md:p-16 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sprout className="w-5 h-5 text-emerald-700" />
          <span className="text-sm tracking-[0.3em] uppercase text-stone-400 font-sans">Creation STEM</span>
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="max-w-3xl mx-auto px-6 pb-32">
        
        {/* 第一部分：诗意宣言 */}
        <section className="mt-16 mb-32 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <h1 className="text-4xl md:text-5xl font-light leading-tight text-stone-900 tracking-tight">
            一块田 · <span className="italic">创造理工学院同行者聚会</span>
          </h1>
          
          <div className="space-y-6 text-xl text-stone-600 leading-relaxed font-light">
            <p>有些成长，需要时间；</p>
            <p>有些路，适合一起走。</p>
            <p className="pt-4">
              在快速结果、不断消耗的教育环境之外，<br />
              我们想留下一块田——<br />
              <span className="text-stone-900 border-b border-stone-200">不急着收成，先把土壤养好。</span>
            </p>
          </div>
        </section>

        {/* 第二部分：定义理念 */}
        <section className="mb-32 space-y-10">
          <div className="flex items-start space-x-4">
            <Wind className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
            <div className="space-y-4">
              <p className="text-lg text-stone-700 leading-relaxed italic">
                “这里不是培训班，也不是项目招募，<br />
                而是一群愿意认真对待‘教育、创造与生命节奏’的同行者，<br />
                每周一次，彼此陪伴，缓慢生长。”
              </p>
            </div>
          </div>

          <div className="pl-10 space-y-6">
            <div className="flex items-center space-x-3 text-stone-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm tracking-widest uppercase">2026年3月开始 · 每周二 20:30–21:30</span>
            </div>
            <div className="flex items-center space-x-3 text-stone-400">
              <Users className="w-4 h-4" />
              <span className="text-sm tracking-widest uppercase">线上聚会 · 长期进行</span>
            </div>
          </div>
        </section>

        {/* 第三部分：适合谁来 */}
        <section className="mb-32 pl-10 border-l border-stone-100 space-y-8">
          <h3 className="text-sm tracking-[0.2em] text-emerald-800 uppercase font-bold">适合谁来</h3>
          <ul className="space-y-4 text-stone-600 text-lg font-light">
            <li>• 理工科教师 / 教育实践者</li>
            <li>• 技术支持、内容创作者、系统搭建者</li>
            <li>• 关注教育长期价值、愿意共建的人</li>
          </ul>
          <p className="text-stone-400 italic">你不需要已经准备好，只需要愿意走在路上。</p>
        </section>

        {/* 第四部分：邀请行动 (CTA) */}
        <section className="bg-stone-900 text-stone-100 p-12 md:p-20 rounded-[2.5rem] text-center space-y-10 shadow-2xl relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl font-light">如果你愿意，欢迎进田坐一会儿。</h2>
            <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
              填写附件报名表，写信进田，慢慢认识。<br />
              不需要完整，真实就好。我们会在合适的时间回复你。
            </p>

            <div className="flex flex-col items-center space-y-6 pt-6">
              <div className="flex items-center space-x-4 bg-stone-800 px-6 py-4 rounded-2xl border border-stone-700 group hover:border-emerald-500/50 transition-all">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span className="font-mono text-emerald-100">{email}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-stone-700 rounded-lg transition-colors relative"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-500" />}
                  {copied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-600 px-2 py-1 rounded">已复制</span>}
                </button>
              </div>

              <a 
                href={`mailto:${email}?subject=申请进田 · 慢慢认识&body=你好，这里是一块田。`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-medium transition-all shadow-xl shadow-emerald-950/20 flex items-center group"
              >
                准备写信 <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* 结尾语 */}
        <section className="mt-32 text-center space-y-6">
           <p className="text-stone-400 text-sm italic">“ 一块田，不是为了证明自己，而是为了让该发生的，自然发生。 ”</p>
           <div className="flex justify-center space-x-6 text-[10px] tracking-[0.4em] text-stone-300 uppercase">
             <span>Creation STEM Conservatory</span>
           </div>
        </section>

      </main>

      <footer className="p-16 text-center text-[10px] tracking-widest text-stone-300">
        © 2026 一块田 · 创造理工学院发起
      </footer>

      {/* 字体注入 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;700&display=swap');
        body {
          font-family: 'Noto Serif SC', serif;
        }
      `}} />
    </div>
  );
};

export default App;
