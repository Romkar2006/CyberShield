import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, ShieldAlert, ArrowRight, Book,
  Newspaper, TrendingUp, Clock, Sparkles, Bookmark,
  FileText, Shield, Zap, X, Loader2, Save, Edit3, Users, ChevronRight, Eye, User,
  Maximize2, Minimize2, Trash2, Globe, Database, Activity, Image as ImageIcon, CheckCircle2,
  Terminal, Lock, Fingerprint, Printer, RefreshCw, Radio, ExternalLink, AlertTriangle, Plus
} from 'lucide-react';
import { getArticles, generateArticle, createArticle, updateArticle, deleteArticle, getGlobalNews } from '../lib/api';
import { Article } from '../types';
import { PageLoader } from '../components/shared/PageLoader';
import { ArticleReader } from '../components/shared/ArticleReader';
import { RichTextEditor } from '../components/shared/RichTextEditor';

// ── SOC STYLING ─────────────────────────────────────────────
const SOC_STYLE = `
  .glass-card { background: rgba(13, 21, 38, 0.7); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.05); }
  .soc-gradient-blue { background: linear-gradient(135deg, rgba(0, 212, 255, 0.06) 0%, transparent 100%); }
  .soc-gradient-red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, transparent 100%); }
  .soc-glow-cyan { text-shadow: 0 0 10px rgba(0, 212, 255, 0.4); }
`;

export const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [globalNews, setGlobalNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Intelligence');

  // AI & Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GUIDE');
  const [editorHtml, setEditorHtml] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState('Drafts');

  const tabs = ['All Intelligence', 'Legal (BNS 2024)', 'Investigation SOPs', 'Threat Bulletins', 'User Manuals'];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let categoryQuery = undefined;
      if (activeTab === 'Legal (BNS 2024)') categoryQuery = 'LEGAL';
      else if (activeTab === 'Investigation SOPs') categoryQuery = 'SOP';
      else if (activeTab === 'Threat Bulletins') categoryQuery = 'THREAT BULLETIN';
      else if (activeTab === 'User Manuals') categoryQuery = 'GUIDE';

      const res = await getArticles({ category: categoryQuery });
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error('SOC Synchronizing Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const res = await getGlobalNews();
      setGlobalNews(res.data || []);
    } catch (err) {
      console.error('Signal Error:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => { 
    fetchArticles();
    fetchNews();
  }, [activeTab]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("PURGE AUTHORIZATION: This data will be wiped from the encrypted repository.")) return;
    try {
      await deleteArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Wipe Failed:', err);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    try {
      setIsGenerating(true);
      const res = await generateArticle(topic);
      if (res.data && res.data.content) {
        setGeneratedContent(res.data.content);
        setGeneratedImage(res.data.imageUrl || null);
        const h1Match = res.data.content.match(/^# (.*)$/m);
        setTitle(h1Match ? h1Match[1] : topic);
      }
    } catch (err) {
      console.error("Neural Signal Interrupted:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || (!generatedContent && !editorHtml) || isSaving) return;
    try {
      setIsSaving(true);
      const finalContent = editorHtml || generatedContent;
      const payload = {
        title,
        category,
        content_markdown: finalContent,
        image_url: generatedImage,
        tags: [category.toLowerCase(), editingArticle ? 'updated' : 'soc-verified']
      };

      if (editingArticle) {
        await updateArticle(editingArticle._id, payload);
      } else {
        await createArticle(payload);
      }

      setIsModalOpen(false);
      setIsFullscreen(false);
      setTopic('');
      setGeneratedContent('');
      setEditorHtml('');
      fetchArticles();
    } catch (err) {
      console.error("Transmission Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (art: Article, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingArticle(art);
    setGeneratedContent(art.content_markdown || '');
    setGeneratedImage(art.image_url || null);
    setTitle(art.title);
    setCategory(art.category);
    setEditorHtml(art.content_markdown || '');
    setIsModalOpen(true);
    setActiveSidebarTab('Drafts');
  };

  const handleSyncNews = (news: any) => {
    setEditingArticle(null);
    setTopic(`Forensic Intelligence Synthesis: ${news.title}`);
    setGeneratedContent('');
    setTitle(news.title);
    setCategory('THREAT BULLETIN');
    setIsModalOpen(true);
  };

  const filteredArticles = articles.filter(art => 
    art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.content_markdown?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const officialIntel = filteredArticles.filter(art => art.tags?.includes('soc-verified') || !art.tags?.includes('citizen-insight'));
  const citizenReports = filteredArticles.filter(art => art.tags?.includes('citizen-insight'));

  return (
    <div className="w-full relative flex flex-col gap-10 font-['Inter',sans-serif]">
      <style>{SOC_STYLE}</style>

      {/* ─── COMMAND HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-20">
         <div className="flex items-center gap-6">
            <div className="w-[6px] h-12 bg-cyan-dark rounded-full shadow-[0_0_15px_rgba(0,212,255,0.5)]"></div>
            <div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">Intelligence <span className="text-cyan-dark">CMS</span></h1>
               <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] font-black text-cyan-dark uppercase tracking-[0.4em]">Node: ADMIN_PRIME_01</span>
                  <div className="h-3 w-px bg-white/10"></div>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">Global Repository Synced</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] group-focus-within:text-cyan-dark transition-colors" />
               <input 
                 type="text" placeholder="Trace Intelligence..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-[#0D1526]/80 border border-white/5 rounded-[1.2rem] py-3.5 pl-12 pr-8 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-dark/40 w-80 transition-all shadow-xl" 
               />
            </div>
            <button 
              onClick={() => { setEditingArticle(null); setIsModalOpen(true); }}
              className="bg-cyan-dark text-[#0A0F1E] h-14 px-8 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-3xl shadow-cyan-dark/20 transition-all active:scale-95"
            >
               <Plus size={18} /> Initialize Gen
            </button>
         </div>
      </div>

      {/* ─── TAB MATRIX ─── */}
      <div className="flex gap-2 p-2 bg-[#0D1526]/50 border border-white/5 rounded-[1.8rem] w-fit shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-8 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${
              activeTab === tab ? 'bg-cyan-dark text-[#0A0F1E]' : 'text-[#64748B] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── FIELD REPOSITORY GRID ─── */}
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 xl:col-span-9 space-y-20">
           
           {/* Section: Strategic Mandates */}
           <section className="space-y-10">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-dark/10 flex items-center justify-center border border-cyan-dark/30 text-cyan-dark"><Shield size={24} /></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">Official Strategic Mandates</h2>
                 </div>
              </div>
              {loading ? <div className="h-96 flex items-center justify-center"><PageLoader /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {officialIntel.map(art => (
                     <InsightCard 
                        key={art.slug} article={art} 
                        onClick={() => setSelectedArticle(art)} 
                        isAdmin 
                        onEdit={() => handleOpenEdit(art)}
                        onDelete={() => handleDelete(art._id)}
                        theme="official"
                     />
                   ))}
                </div>
              )}
           </section>

           {/* Section: Community Reports */}
           <section className="space-y-10 pb-20">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20 text-violet-400"><Users size={24} /></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif]">Citizen Forensic Stream</h2>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {citizenReports.map(art => (
                    <InsightCard 
                       key={art.slug} article={art} 
                       onClick={() => setSelectedArticle(art)} 
                       isAdmin 
                       onEdit={() => handleOpenEdit(art)}
                       onDelete={() => handleDelete(art._id)}
                       theme="citizen"
                    />
                 ))}
              </div>
           </section>
        </div>

        {/* Intelligence Side-Feed */}
        <div className="col-span-12 xl:col-span-3">
           <div className="glass-card rounded-[3rem] border border-white/5 flex flex-col h-[700px] overflow-hidden shadow-5xl">
              <div className="p-8 border-b border-white/5 bg-[#0D1526]/50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <Radio size={20} className="text-red-500 animate-pulse" />
                    <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Live Global Feed</h2>
                 </div>
                 <button onClick={fetchNews} className="text-[#475569] hover:text-cyan-dark"><RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                 {newsLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-[2rem] animate-pulse"></div>) : 
                   globalNews.map(news => (
                   <div key={news.id} className="p-6 rounded-[2rem] bg-[#010204]/90 border border-white/5 hover:border-cyan-dark/30 transition-all flex flex-col gap-4 group">
                      <div className="flex items-center justify-between">
                         <span className="text-[8px] font-black text-cyan-dark uppercase tracking-widest bg-cyan-dark/10 px-3 py-1 rounded border border-cyan-dark/20">{news.source}</span>
                         <button onClick={() => handleSyncNews(news)} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity"><Plus size={18} /></button>
                      </div>
                      <h4 className="text-[12px] font-black text-white leading-relaxed line-clamp-2">{news.title}</h4>
                      <a href={news.link} target="_blank" rel="noreferrer" className="text-[9px] font-black text-[#475569] hover:text-white uppercase tracking-widest flex items-center gap-2"><ExternalLink size={12} /> ORIGIN SOURCE</a>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* ARTICLE READER VIEW */}
      <AnimatePresence>
        {selectedArticle && <ArticleReader article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      </AnimatePresence>

      {/* NEURAL AGENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={`fixed inset-0 z-[120] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-6'}`}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && setIsModalOpen(false)} className="absolute inset-0 bg-[#02040A]/98 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} 
              className={`relative bg-[#02040A] overflow-hidden flex shadow-5xl transition-all border border-white/10 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[96%] max-w-[1600px] h-[90vh] rounded-[3rem]'}`}>
              
              <div className="w-80 bg-[#0D1526]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col p-8 shrink-0">
                 <div className="flex items-center gap-5 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-dark/10 flex items-center justify-center text-cyan-dark border border-cyan-dark/20"><Terminal size={32} /></div>
                    <div><h2 className="text-[12px] font-black text-white tracking-[0.3em] uppercase">INTEL ENGINE</h2><p className="text-[8px] text-cyan-dark font-black tracking-[0.4em] mt-1">ACTIVE</p></div>
                 </div>
                 <div className="space-y-6 flex-1">
                    <SidebarItem icon={<Edit3 size={22} />} text="Drafts" active={activeSidebarTab === 'Drafts'} onClick={() => setActiveSidebarTab('Drafts')} />
                    <SidebarItem icon={<Activity size={22} />} text="Diagnostics" active={activeSidebarTab === 'Trace Audits'} onClick={() => setActiveSidebarTab('Trace Audits')} />
                 </div>
                 <div className="space-y-4 pt-10 border-t border-white/5 mt-auto">
                    <button onClick={handleSave} disabled={isSaving || (!generatedContent && !editorHtml)} className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${(!generatedContent && !editorHtml) ? 'bg-white/5 text-[#475569] cursor-not-allowed' : 'bg-cyan-dark text-[#0A0F1E] shadow-cyan-dark/30'}`}>{isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}{isSaving ? 'UPLOADING...' : 'SAVE DOSSIER'}</button>
                    <button onClick={() => !isGenerating && setIsModalOpen(false)} className="w-full py-5 bg-white/5 text-[#475569] hover:text-red-500 font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl border border-white/5 transition-all">DISCARD</button>
                 </div>
              </div>

              <div className="flex-1 flex flex-col bg-[#02040A]">
                <div className="h-24 px-10 border-b border-white/5 flex items-center justify-between bg-[#0D1526]/40">
                   <div className="flex items-center gap-6"><button onClick={() => setIsFullscreen(!isFullscreen)} className="text-[#475569] hover:text-cyan-dark transition-colors">{isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}</button><p className="text-[11px] font-black text-[#64748B] uppercase tracking-[0.6em]">System Uplink Est. 88%</p></div>
                   <div onClick={() => !isGenerating && setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center cursor-pointer text-[#475569] hover:text-red-500 border border-white/5 rounded-2xl"><X size={24} /></div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                   {activeSidebarTab === 'Drafts' ? (
                     !generatedContent && !editingArticle ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-dark/5 blur-[150px] pointer-events-none" />
                           <div className="bg-[#0D1526]/90 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-20 shadow-5xl w-full max-w-4xl relative">
                              <h2 className="text-5xl font-black text-white italic uppercase tracking-widest mb-6">Analyze <span className="text-cyan-dark not-italic">Threat Vector</span></h2>
                              <div className="relative max-w-3xl mx-auto flex flex-col md:flex-row gap-3 bg-[#02040A] p-3 rounded-[2.5rem] border border-white/10 mt-12 shadow-inner">
                                 <div className="flex-1 flex items-center pl-8"><Sparkles className="text-cyan-dark/30 shrink-0" size={24} /><input type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && topic && !isGenerating && handleGenerate()} placeholder="Analyze SIM-Swap Vulnerabilities..." className="w-full bg-transparent py-6 px-6 text-xl font-black text-white outline-none" disabled={isGenerating} /></div>
                                 <button onClick={handleGenerate} disabled={!topic || isGenerating} className="h-20 px-12 bg-cyan-dark text-[#0A0F1E] rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center gap-4 transition-all shadow-4xl shadow-cyan-dark/30">{isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} fill="currentColor" />} EXECUTE</button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="h-full flex flex-col">
                           <div className="p-10 border-b border-white/5 flex gap-10 bg-[#0D1526]/40">
                              <div className="flex-1 space-y-3"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em] ml-4">Title Dossier</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#02040A] border border-white/5 rounded-2xl py-6 px-10 text-2xl font-black text-white focus:border-cyan-dark/40" /></div>
                              <div className="w-96 space-y-3"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.5em] ml-4">Sector Permission</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-[76px] bg-[#02040A] border border-white/5 rounded-2xl px-8 text-white font-black appearance-none"><option value="LEGAL">Legal Intelligence</option><option value="SOP">Operational SOPs</option><option value="THREAT BULLETIN">Current Threat Feed</option><option value="GUIDE">User Manual Repository</option></select></div>
                           </div>
                           <div className="flex-1 overflow-hidden"><RichTextEditor key={topic + title} initialContent={generatedContent} onChange={setEditorHtml} /></div>
                        </div>
                     )
                   ) : (
                      <div className="h-full p-16 space-y-8 overflow-y-auto custom-scrollbar">
                         <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-12">Signal <span className="text-cyan-dark">Diagnostics</span></h2>
                         <AuditRow icon={<Terminal size={20} />} event="Neural Cluster Sync" details={isGenerating ? "Gemini-Pro Node 01: ACTIVE" : "Uplink Secure"} status={isGenerating ? "BUSY" : "OK"} active={isGenerating} />
                         <AuditRow icon={<Shield size={20} />} event="Encryption Layer" details="BNS Mapping Engine v2.5" status="SECURE" color="blue" />
                         <AuditRow icon={<Database size={20} />} event="Vector Preservation" details={generatedContent ? "Dossier Frame Compiled" : "Signal Idle"} status={generatedContent ? "STORED" : "EMPTY"} color="emerald" />
                      </div>
                   )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── AUX COMPONENTS ──────────────────────────────────────────

const SidebarItem = ({ icon, text, active = false, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-6 py-6 px-10 rounded-[2rem] cursor-pointer transition flex items-center justify-between group ${active ? 'bg-cyan-dark/10 text-cyan-dark border border-cyan-dark/30 shadow-inner' : 'text-[#475569] hover:text-white hover:bg-white/[0.03]'}`}>
    <div className="flex items-center gap-6"><span className={`${active ? 'text-cyan-dark' : 'text-[#475569] group-hover:text-cyan-dark'} transition-colors`}>{icon}</span><span className="text-[13px] font-black tracking-widest italic uppercase">{text}</span></div>
    {active && <div className="w-2.5 h-2.5 rounded-full bg-cyan-dark shadow-[0_0_12px_rgba(34,211,238,1)]" />}
  </div>
);

const AuditRow = ({ icon, event, details, status, color = 'cyan', active = false }: any) => {
  const colors: any = { cyan: 'text-cyan-dark bg-cyan-dark/10 border-cyan-dark/30', violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20', emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
  return (
    <div className={`flex items-center justify-between p-10 bg-[#0D1526]/50 border border-white/5 rounded-[3rem] group hover:border-cyan-dark/30 transition-all ${active ? 'ring-2 ring-cyan-dark/20' : ''}`}>
       <div className="flex items-center gap-10 text-white">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-xl transition-transform group-hover:scale-110`}>{icon}</div>
          <div><h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-1">{event}</h4><p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">{details}</p></div>
       </div>
       <div className="text-right">
          <div className="flex items-center gap-3 justify-end mb-1">{active && <div className="w-2.5 h-2.5 bg-cyan-dark animate-pulse rounded-full" />}<p className={`font-black text-xs tracking-widest ${active ? 'text-cyan-dark' : 'text-white'}`}>{status}</p></div>
       </div>
    </div>
  );
};

const InsightCard = ({ article, onClick, isAdmin = false, onEdit, onDelete, theme = 'official' }: any) => {
  const s = { official: { color: 'text-cyan-dark', bg: 'bg-cyan-dark/10', border: 'border-cyan-dark/30', icon: Shield, grad: 'soc-gradient-blue' }, citizen: { color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-500/30', icon: Users, grad: 'soc-gradient-red' } }[theme === 'official' ? 'official' : 'citizen'];
  return (
    <motion.div layout key={article.slug} onClick={onClick} className={`glass-card rounded-[3.5rem] overflow-hidden flex flex-col group relative ${s.grad} border border-white/5 hover:border-cyan-dark/40 transition-all cursor-pointer p-10 font-sans`}>
       <div className="flex justify-between items-start mb-10"><div className={`w-16 h-16 rounded-3xl ${s.bg} border ${s.border} flex items-center justify-center ${s.color} shadow-2xl transition-transform group-hover:scale-110`}>{theme === 'official' ? <Shield size={32} /> : <Users size={32} />}</div>{isAdmin && <div className="flex gap-3"><button onClick={onEdit} className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-cyan-dark/20 text-[#475569] hover:text-cyan-dark flex items-center justify-center border border-white/5 transition-all"><Edit3 size={20} /></button><button onClick={onDelete} className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-red-500/20 text-[#475569] hover:text-red-500 flex items-center justify-center border border-white/5 transition-all"><Trash2 size={20} /></button></div>}</div>
       <div className="mb-6"><span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${s.bg} ${s.color} border ${s.border} uppercase tracking-[0.3em]`}>{article.category}</span></div>
       <h3 className="text-2xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif] leading-none mb-4 group-hover:text-cyan-dark transition-colors line-clamp-2 min-h-[4rem]">{article.title}</h3>
       <p className="text-[13px] text-[#94A3B8] leading-[1.8] line-clamp-3 mb-10 font-medium">{article.content_markdown?.substring(0, 160).replace(/[#*]/g, '')}...</p>
       <div className="pt-10 border-t border-white/5 mt-auto flex items-center justify-between"><div className="flex items-center gap-5 text-[11px] text-[#475569] font-black uppercase tracking-widest"><Eye size={16} /> {article.views || 0} READS</div><ArrowRight size={24} className="text-cyan-dark group-hover:translate-x-4 transition-transform duration-700" /></div>
    </motion.div>
  );
};
