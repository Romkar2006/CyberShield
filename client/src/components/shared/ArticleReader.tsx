import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, User,
  FileText, Zap, Bookmark, Share2, Printer, Save,
  ChevronRight, Sparkles, Activity, AlertTriangle, Fingerprint, Lock, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Article } from '../../types';
import { getArticle } from '../../lib/api';

interface ArticleReaderProps {
  article: Article;
  onClose: () => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article: initialArticle, onClose }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [fullArticle, setFullArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        if (!initialArticle.slug) throw new Error("No slug");
        const res = await getArticle(initialArticle.slug);
        setFullArticle(res.data);
      } catch (e) {
        console.error("Failed to load full dossier:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullData();
  }, [initialArticle.slug]);

  const displayArticle = fullArticle || initialArticle;

  const isHtmlContent = useMemo(() => /<[a-z][\s\S]*>/i.test(displayArticle.content_markdown || ""), [displayArticle.content_markdown]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      setScrolled(e.target.scrollTop > 100);
      
      const sections = document.querySelectorAll('h2');
      let current = "";
      sections.forEach((section: any) => {
        const top = section.offsetTop;
        if (e.target.scrollTop >= top - 200) {
          current = section.innerText;
        }
      });
      setActiveSection(current);
    };
    const container = document.getElementById('article-scroll-container'); // Note: ID in HTML is article-scroll-container
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510511459019-5bea250ce733?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614064641913-6b714aaa2982?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517433622936-f331281ea69c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580828369019-cea98ad7413f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604145559200-e340b483c076?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573164713619-24d4be4327ea?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618044736000-449e7b231ffc?q=80&w=1200&auto=format&fit=crop"
  ];

  const getHeroImage = () => {
    if (displayArticle.image_url && displayArticle.image_url.startsWith('data:')) return displayArticle.image_url;
    if (displayArticle.image_url && displayArticle.image_url.startsWith('http')) return displayArticle.image_url;
    const entropy = (displayArticle.title?.length || 0) + (displayArticle.category?.length || 0);
    return fallbackImages[entropy % fallbackImages.length];
  };

  const heroImage = getHeroImage();
  const readTime = Math.ceil((displayArticle.content_markdown?.length || 0) / 1000) || 5;

  // Auto-heal corrupted markdown strings safely
  const healedMarkdown = useMemo(() => {
    let raw = displayArticle.content_markdown || "";
    if (isHtmlContent) return raw;
    
    // Attempt to salvage squished headers: "word.## Header" -> "word.\n\n## Header"
    raw = raw.replace(/([a-zA-Z0-9.,!?])(#{1,5} )/g, '$1\n\n$2');
    
    return raw;
  }, [displayArticle.content_markdown, isHtmlContent]);

  const headings = useMemo(() => {
    const raw = healedMarkdown;
    if (isHtmlContent) {
      const regex = /<h2[^>]*>(.*?)<\/h2>/gim;
      const htmlHeadings: string[] = [];
      let match;
      while ((match = regex.exec(raw)) !== null) {
        const cleanHeading = match[1].replace(/<[^>]+>/g, '').trim();
        if (cleanHeading) htmlHeadings.push(cleanHeading);
      }
      return htmlHeadings;
    } else {
      const lines = raw.split('\n') || [];
      return lines
        .filter(line => line.startsWith('## ') && !line.startsWith('### '))
        .map(line => line.replace('## ', '').trim()); 
    }
  }, [healedMarkdown, isHtmlContent]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col pointer-events-auto bg-[#0A0F1E]"
    >
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#00D4FF]/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-violet-600/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      {/* 1. TOP NAVIGATION (CYBERPUNK / GLASSMORPHIC) */}
      <div className="relative h-[72px] bg-[#0D1526]/80 backdrop-blur-3xl border-b border-[#00D4FF]/20 z-[160] px-6 md:px-10 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                  <Shield size={20} fill="currentColor" />
               </div>
               <span className="text-[14px] font-black text-white tracking-[0.2em] uppercase italic drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] hidden sm:block">
                 CyberShield <span className="text-[#00D4FF] not-italic">Intel</span>
               </span>
            </div>
            <div className="h-6 w-px bg-white/20 hidden md:block"></div>
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-black text-[#64748B] uppercase tracking-[0.3em]">
               <span className="text-[#00D4FF] flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full animate-pulse shadow-[0_0_8px_#00D4FF]"></span>
                 ACTIVE NODE
               </span>
               <span className="text-emerald-500 flex items-center gap-2">
                 <Lock size={12} /> SECURE
               </span>
            </nav>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center border border-transparent hover:border-red-500/30">
               <X size={20} />
            </button>
         </div>
      </div>

      {/* MAIN SCROLLABLE AREA */}
      <div id="article-scroll-container" className="flex-1 w-full overflow-y-auto custom-scrollbar relative z-10 selection:bg-[#00D4FF] selection:text-[#0A0F1E]">
         
         {/* 2. DYNAMIC HERO HEADER */}
         <div className="relative w-full min-h-[500px] flex items-center justify-center border-b border-[#00D4FF]/20">
            <div className="absolute inset-0 bg-[#0A0F1E] z-0" />
            
            {/* Background Image with Heavy Styling */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity overflow-hidden">
               <img 
                 src={heroImage} 
                 onError={(e: any) => { 
                   e.target.onerror = null; 
                   const fallbackImages = [
                     "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
                     "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
                     "https://images.unsplash.com/photo-1510511459019-5bea250ce733?q=80&w=1200&auto=format&fit=crop",
                     "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=1200&auto=format&fit=crop",
                     "https://images.unsplash.com/photo-1614064641913-6b714aaa2982?q=80&w=1200&auto=format&fit=crop"
                   ];
                   e.target.src = fallbackImages[(displayArticle.title?.length || 0) % fallbackImages.length]; 
                 }}
                 className="w-full h-full object-cover scale-105 filter blur-sm" 
                 alt="Hero Background" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" />
            </div>
            
            <div className="relative z-10 w-full max-w-[1200px] px-8 pt-12 pb-20 mt-10">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                     <span className="px-4 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.3em] rounded border border-[#00D4FF]/30 shadow-[0_0_10px_rgba(0,212,255,0.2)] flex items-center gap-2">
                        <Activity size={12} /> {displayArticle.category}
                     </span>
                     <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded">
                        REF: CS-{Math.random().toString(36).substring(7).toUpperCase()}
                     </span>
                  </div>

                  <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-10 tracking-tighter drop-shadow-2xl max-w-5xl">
                     {displayArticle.title}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8 pl-4 border-l-2 border-[#00D4FF]/50">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0D1526] border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0 text-slate-400">
                           <Fingerprint size={24} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-[#00D4FF] uppercase tracking-[0.3em] mb-1">AUTHORIZATION</p>
                           <p className="text-sm font-black text-white uppercase tracking-wider truncate max-w-[200px]">{displayArticle.author_name || 'SYSTEM NODE'}</p>
                        </div>
                     </div>
                     
                     <div className="hidden sm:block w-px h-10 bg-white/10" />
                     
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">INTEL CLASSIFICATION</p>
                        <p className="text-sm font-black text-emerald-400 uppercase tracking-wider">{readTime} MIN READ // CLEARED</p>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* 3. TWO-COLUMN LAYOUT */}
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row gap-16 relative">
            
            {/* LEFT RAIL: TOC & METADATA */}
            <aside className="lg:w-[300px] shrink-0 order-2 lg:order-1 hidden md:block">
               <div className="sticky top-24 space-y-10">
                  
                  {/* Table of Contents */}
                  <div className="p-8 rounded-[2rem] bg-[#0D1526]/50 border border-white/5 shadow-2xl backdrop-blur-sm">
                     <h5 className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <FileText size={14} /> INDEX
                     </h5>
                     <nav className="space-y-1 flex flex-col">
                        {headings.length > 0 ? headings.map((h, i) => (
                           <button 
                             key={i} 
                             className={`text-left text-[12px] font-bold tracking-wide transition-all py-3 px-4 rounded-xl relative overflow-hidden group ${activeSection === h ? 'bg-[#00D4FF]/10 text-white border border-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                           >
                              <div className="relative z-10 flex items-start gap-3">
                                <span className={`font-mono text-[10px] mt-0.5 ${activeSection === h ? 'text-[#00D4FF]' : 'text-slate-600'}`}>0{i+1}</span>
                                <span className="leading-snug">{h}</span>
                              </div>
                           </button>
                        )) : (
                           <p className="text-slate-500 text-xs italic p-4">Linear intelligence report. No indices found.</p>
                        )}
                     </nav>
                  </div>

                  {/* Share/Actions Widget */}
                  <div className="p-6 bg-gradient-to-br from-[#0D1526] to-[#0A0F1E] border border-white/10 rounded-[2rem]">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">ACTION PROTOCOLS</p>
                     <div className="space-y-3">
                        <button 
                          onClick={() => {
                            const url = window.location.origin + '/hub/' + displayArticle.slug;
                            navigator.clipboard.writeText(url);
                            alert("SECURE LINK COPIED TO CLIPBOARD: Intelligence sharing protocol initialized.");
                          }}
                          className="w-full flex items-center gap-3 py-3 px-5 rounded-xl bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] transition-all border border-[#00D4FF]/30 hover:border-[#00D4FF]/50 text-xs font-black uppercase tracking-widest group/share"
                        >
                           <Share2 size={16} className="group-hover/share:rotate-12 transition-transform" /> SECURE SHARE
                        </button>
                        <button className="w-full flex items-center justify-between py-3 px-5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest cursor-default">
                           <span className="flex items-center gap-3"><Lock size={16} /> ENCRYPTED</span>
                        </button>
                     </div>
                  </div>

               </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <article className="flex-1 max-w-[850px] order-1 lg:order-2">
               <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-sans min-h-[400px]">
                 {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-60">
                       <Loader2 size={40} className="text-[#00D4FF] animate-spin mb-6" />
                       <p className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.4em] animate-pulse">Decrypting Protocol Payload...</p>
                    </div>
                 ) : isHtmlContent ? (
                    <>
                      <style dangerouslySetInnerHTML={{ __html: `
                        .editor-content-render h1, .editor-content-render h2, .editor-content-render p, .editor-content-render div {
                           margin-bottom: 1.5rem !important;
                        }
                        .editor-content-render img {
                           max-width: 100%;
                           height: auto;
                           border-radius: 12px;
                           margin: 30px 0;
                           box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                           display: block;
                        }
                      `}} />
                      {(!displayArticle.content_markdown || displayArticle.content_markdown.trim() === '') && (
                         <div className="text-red-500 font-mono text-sm p-4 bg-red-500/10 rounded-xl">ERROR: content_markdown is physically empty. Report corrupted.</div>
                      )}
                      
                      <div className="editor-content-render" dangerouslySetInnerHTML={{ __html: displayArticle.content_markdown || "" }} />
                    </>
                 ) : (
                    <>
                      <style dangerouslySetInnerHTML={{ __html: `
                        /* Global pure-CSS drop cap for the very first paragraph of the markdown document */
                        .markdown-content-render > p:first-of-type::first-letter {
                            font-size: 3.75rem;
                            line-height: 1;
                            font-weight: 900;
                            color: #00D4FF;
                            margin-right: 0.75rem;
                            float: left;
                            margin-top: 0.25rem;
                            text-shadow: 0 0 10px rgba(0,212,255,0.4);
                        }
                      `}} />
                      <div className="markdown-content-render">
                        <ReactMarkdown
                          components={{
                             h1: () => null, // Hidden as it's in the hero
                             h2: ({node, ...props}) => (
                                <h2 className="text-white text-2xl md:text-3xl font-black mt-20 mb-8 pb-4 border-b border-white/10 uppercase tracking-tighter shadow-sm flex items-end gap-4" id={String(props.children)}>
                                   <span className="text-[#00D4FF] text-3xl opacity-30">{(headings.indexOf(String(props.children)) + 1).toString().padStart(2, '0')}</span>
                                   {props.children}
                                </h2>
                             ),
                             h3: ({node, ...props}) => (
                                <h3 className="text-[#00D4FF] text-xl font-black mt-12 mb-6 uppercase tracking-tight" id={String(props.children)}>
                                   {props.children}
                                </h3>
                             ),
                             p: ({node, ...props}) => (
                                <p className={`text-slate-300 text-[17px] leading-[1.8] mb-8`}>
                                   {props.children}
                                </p>
                             ),
                             blockquote: ({node, ...props}) => (
                                <div className="my-14 p-10 bg-[#0D1526]/80 rounded-[2rem] border-l-4 border-[#00D4FF] relative overflow-hidden shadow-2xl">
                                   <div className="absolute top-[-20px] left-2 text-[#00D4FF]/10 select-none text-9xl">"</div>
                                   <div className="relative z-10">
                                     <p className="text-xl md:text-2xl font-black text-white leading-snug tracking-tight mb-0 italic">
                                        {props.children}
                                     </p>
                                     <div className="mt-6 flex items-center gap-3">
                                        <AlertTriangle size={14} className="text-[#00D4FF]" />
                                        <span className="text-[10px] font-black text-[#00D4FF] uppercase tracking-[0.3em]">CRITICAL INTELLIGENCE</span>
                                     </div>
                                   </div>
                                </div>
                             ),
                             ul: ({node, ...props}) => <ul className="my-10 space-y-4 list-disc pl-6 text-slate-300 marker:text-[#00D4FF]" {...props} />,
                             ol: ({node, ...props}) => <ol className="my-10 space-y-4 list-decimal pl-6 text-slate-300 marker:text-[#00D4FF] marker:font-black" {...props} />,
                             li: ({node, ...props}) => (
                                <li className="text-slate-300 leading-relaxed font-medium pl-2" {...props}>
                                   {props.children}
                                </li>
                             ),
                             strong: ({node, ...props}) => <strong className="text-white font-black bg-white/5 px-1 rounded" {...props} />,
                             a: ({node, ...props}) => <a className="text-[#00D4FF] font-black underline decoration-[#00D4FF]/40 hover:decoration-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors px-1 rounded" {...props} />,
                             code: ({node, inline, ...props}: any) => 
                               inline ? (
                                 <code className="bg-[#0D1526] text-[#00D4FF] px-2 py-0.5 rounded text-sm border border-[#00D4FF]/20 font-mono" {...props} />
                               ) : (
                                 <pre className="bg-[#0D1526] p-6 rounded-2xl border border-white/5 overflow-x-auto shadow-xl my-8">
                                    <code className="text-sm font-mono text-emerald-400" {...props} />
                                 </pre>
                               )
                          }}
                        >
                           {healedMarkdown}
                        </ReactMarkdown>
                      </div>
                    </>
                 )}
               </div>

               {/* END OF REPORT FOOTER */}
               <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 mb-6 drop-shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                     <Shield size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-3">END OF REPORT</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-md">
                     This intelligence document has been classified and securely stored in the CyberShield node. Share with authorized personnel only.
                  </p>
                  
                  <div className="flex md:hidden flex-wrap items-center justify-center gap-4 mt-8 w-full px-6">
                     <button 
                       onClick={() => {
                         const url = window.location.origin + '/hub/' + displayArticle.slug;
                         navigator.clipboard.writeText(url);
                         alert("SECURE LINK COPIED: Signal broadcast initialized.");
                       }}
                       className="w-full flex items-center justify-center gap-4 py-5 px-8 rounded-2xl bg-[#00D4FF] hover:bg-white text-[#0A0F1E] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-[#00D4FF]/20 active:scale-95"
                     >
                        <Share2 size={18} /> GENERATE SECURE LINK
                     </button>
                  </div>
               </div>
            </article>

         </div>
      </div>
    </motion.div>
  );
};
