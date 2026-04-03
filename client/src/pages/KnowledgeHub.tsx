import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search, BookOpen, ShieldAlert, ArrowRight, Book,
   Newspaper, TrendingUp, Clock, Sparkles, Bookmark,
   FileText, Shield, LayoutDashboard, FileArchive,
   BarChart2, Settings, LogOut, Zap, X, Loader2, Save, Edit3, Users, ChevronRight, Eye, User,
   Maximize2, Minimize2, Paperclip, MessageSquare, AlertTriangle, Archive, Trash2, Globe, Laptop, Database, Activity, Image as ImageIcon, CheckCircle2,
   Terminal, Lock, Fingerprint
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getArticles, generateArticle, createArticle, getUserProfile, getMyArticles, uploadArticleImage, deleteArticle } from '../lib/api';
import { isUserLoggedIn } from '../lib/auth';
import { useAuthModal } from '../components/layout/AuthContext';
import { Article } from '../types';
import { PageLoader } from '../components/shared/PageLoader';
import { ArticleReader } from '../components/shared/ArticleReader';
import { RichTextEditor } from '../components/shared/RichTextEditor';

export const KnowledgeHub = () => {
   const navigate = useNavigate();
   const { showAuthModal } = useAuthModal();
   const [articles, setArticles] = useState<Article[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [activeTab, setActiveTab] = useState('All Resources');
   const [userName, setUserName] = useState('Authorized Investigator');

   // AI Generation States
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
   const [topic, setTopic] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedContent, setGeneratedContent] = useState('');
   const [generatedImage, setGeneratedImage] = useState<string | null>(null);
   const [isSaving, setIsSaving] = useState(false);
   const [isUploadingCover, setIsUploadingCover] = useState(false);
   const [title, setTitle] = useState('');
   const [category, setCategory] = useState('GUIDE');
   const [editorHtml, setEditorHtml] = useState('');
   const [activeSidebarTab, setActiveSidebarTab] = useState('Drafts');
   const [myArticles, setMyArticles] = useState<Article[]>([]);
   const [page, setPage] = useState(1);
   const [totalArticles, setTotalArticles] = useState(0);
   const limit = 6;

   const tabs = ['All Resources', 'Legal (BNS 2024)', 'Investigation SOPs', 'Threat Bulletins', 'User Guides'];

   const fetchUser = async () => {
      try {
         const res = await getUserProfile();
         if (res.data && res.data.name) {
            setUserName(res.data.name);
         }
      } catch (err) {
         const cached = localStorage.getItem('cybershield_user_name');
         if (cached) setUserName(cached);
      }
   };

   const fetchArticles = async (pageNum = 1) => {
      try {
         setLoading(true);
         let categoryQuery = '';
         if (activeTab === 'Legal (BNS 2024)') categoryQuery = 'LEGAL';
         if (activeTab === 'Investigation SOPs') categoryQuery = 'SOP';
         if (activeTab === 'Threat Bulletins') categoryQuery = 'THREAT BULLETIN';
         if (activeTab === 'User Guides') categoryQuery = 'GUIDE';

         const res = await getArticles({ category: categoryQuery, page: pageNum, limit });
         setArticles(res.data.articles || []);
         setTotalArticles(res.data.total || 0);
      } catch (err) {
         console.error('Failed to fetch articles', err);
      } finally {
         setLoading(false);
      }
   };

   const fetchMyArticles = async () => {
      try {
         const res = await getMyArticles();
         setMyArticles(res.data || []);
      } catch (err) {
         console.error('Failed to fetch my articles', err);
      }
   };

   const handleDelete = async (id: string) => {
      if (!window.confirm("ARE YOU SURE? This intel dossier will be permanently erased from the network.")) return;
      try {
         await deleteArticle(id);
         fetchArticles(page);
         fetchMyArticles();
      } catch (err) {
         alert("Failed to delete article. Authorization failure.");
      }
   };

   const handleGenerate = async () => {
      if (!topic.trim() || isGenerating) return;
      try {
         setIsGenerating(true);
         setGeneratedImage(null);
         const res = await generateArticle(topic);
         if (res.data && res.data.content) {
            setGeneratedContent(res.data.content);
            if (res.data.imageUrl) {
               setGeneratedImage(res.data.imageUrl);
            }
            const lines = res.data.content.split('\n');
            const firstLine = lines.find((l: string) => l.startsWith('# '));
            if (firstLine) {
               setTitle(firstLine.replace('# ', '').trim());
            } else {
               setTitle(topic);
            }
         }
      } catch (err: any) {
         console.error("Neural Handshake Failure:", err);
         const status = err.response?.status;

         if (status === 429) {
            alert('AI Quota Exceeded (429). Please wait 60 seconds and retry.');
         } else if (status === 401) {
            alert('Investigator Session Expired (401). Please re-login to authorize generation.');
         } else if (status === 500) {
            alert('Neural Node Handshake Failed (500). The AI core is temporarily busy.');
         } else {
            alert('Intelligence Uplink Failed. Check your network or API configuration.');
         }
      } finally {
         setIsGenerating(false);
      }
   };

   const handleSave = async () => {
      if (!title || (!generatedContent && !editorHtml) || isSaving) return;
      try {
         setIsSaving(true);
         const finalContent = editorHtml || generatedContent;
         await createArticle({
            title,
            category,
            content_markdown: finalContent,
            image_url: generatedImage,
            tags: [category.toLowerCase(), 'citizen-insight']
         });

         setIsModalOpen(false);
         setIsFullscreen(false);
         setTopic('');
         setGeneratedContent('');
         setGeneratedImage(null);
         setEditorHtml('');

         fetchArticles(1);
         fetchMyArticles();
         setPage(1);
      } catch (err: any) {
         console.error("Save Error:", err);
         const msg = err.response?.data?.error || 'Failed to publish dossier.';
         alert(`🚨 PUBLICATION FAILURE: ${msg}`);
      } finally {
         setIsSaving(false);
      }
   };

   useEffect(() => {
      fetchArticles(page);
      fetchUser();
      fetchMyArticles(); // Systematic hydration on mount
   }, [activeTab, page]);

   useEffect(() => {
      if (activeSidebarTab === 'My Articles') {
         fetchMyArticles();
      }
   }, [activeSidebarTab]);

   const filteredArticles = articles.filter(art => {
      const titleMatch = art.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const contentMatch = art.content_markdown?.toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || contentMatch;
   });

   const officialIntel = filteredArticles.filter(art => !art.tags?.includes('citizen-insight'));
   const userExperiences = filteredArticles.filter(art => art.tags?.includes('citizen-insight'));

   return (
      <div className="w-full min-h-screen bg-[#0A0F1E] font-sans pt-12 pb-24 relative selection:bg-[#00D4FF] selection:text-[#0A0F1E] overflow-x-hidden">

         {/* Background Ambience */}
         <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#00D4FF]/5 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none opacity-50" />
         <div className="absolute bottom-[-100px] left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-600/5 blur-[120px] sm:blur-[180px] rounded-full pointer-events-none opacity-50" />

         {/* PAGE BODY */}
         <div className="px-4 sm:px-8 md:px-12 relative z-10">
            <div className="max-w-[1500px] mx-auto">

               {/* Header Content */}
               <div className="mb-10 sm:mb-12 relative">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                        <div className="h-[2px] w-8 bg-[#00D4FF]"></div>
                        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[#00D4FF] flex items-center gap-2">
                           <Globe size={14} /> Global Threat Intelligence
                        </p>
                     </motion.div>

                     <div className="flex items-center gap-4 text-[8px] sm:text-[9px] font-mono text-[#64748B] uppercase tracking-widest hidden sm:flex">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full animate-pulse shadow-[0_0_8px_#00D4FF]"></span>
                           SYS.LINK ESTABLISHED
                        </div>
                        <div className="h-3 w-px bg-white/10" />
                        <span>NODE: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                     </div>
                  </div>

                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 uppercase">
                     Knowledge <span className="text-[#00D4FF]">Hub</span>
                  </motion.h1>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[#94A3B8] text-sm sm:text-base md:text-lg font-medium max-w-3xl leading-relaxed">
                     Synthesizing official law enforcement directives, cyber protocol intelligence, and citizen forensic experiences into a unified repository.
                  </motion.p>

                  <div className="mt-8 sm:mt-10 flex flex-col xl:flex-row gap-6 xl:items-center justify-between relative border-t border-white/5 pt-8">

                     <div className="relative w-full max-w-[500px]">
                        <div className="relative flex items-center bg-[#0D1526] border border-white/10 focus-within:border-[#00D4FF]/40 rounded-xl px-4 py-3 sm:py-3.5 transition-all shadow-lg">
                           <Search className="text-[#64748B] focus-within:text-[#00D4FF] transition-colors" size={18} />
                           <input
                              type="text"
                              placeholder="Search intelligence..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-transparent border-none text-white text-[12px] sm:text-[13px] px-3 outline-none font-medium placeholder:text-[#475569]"
                           />
                        </div>
                     </div>

                     <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap w-full xl:w-auto pb-2 xl:pb-0">
                        {tabs.map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`relative px-4 py-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all rounded-lg shrink-0 ${activeTab === tab ? 'text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/20' : 'text-[#64748B] hover:text-white hover:bg-white/5'}`}
                           >
                              {tab}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
                  {/* Main Content Area */}
                  <div className="col-span-1 md:col-span-12 xl:col-span-8 space-y-16 sm:space-y-24 pt-4 sm:pt-8">

                     {/* Official Intel Section */}
                     <section className="space-y-8 sm:space-y-10 group">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                           <div className="flex items-center gap-4 text-white">
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center border border-[#00D4FF]/20 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                                 <BookOpen size={16} />
                              </div>
                              <h2 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                 Strategic Directives
                                 <span className="hidden sm:inline px-2 py-0.5 rounded text-[9px] bg-white/10 text-slate-400 font-black">VERIFIED</span>
                              </h2>
                           </div>
                        </div>

                        {loading ? <div className="flex justify-center h-64"><PageLoader /></div> : officialIntel.length > 0 ? (
                           <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                                 {officialIntel.map((art) => (
                                    <InsightCard key={art.slug} article={art} onClick={() => setSelectedArticle(art)} featured theme="official" />
                                 ))}
                              </div>

                              {/* Pagination */}
                              {totalArticles > limit && (
                                 <div className="flex items-center justify-center gap-4 sm:gap-6 mt-12 sm:mt-16 pb-12 overflow-x-auto sm:overflow-visible">
                                    <button
                                       onClick={() => setPage(p => Math.max(1, p - 1))}
                                       disabled={page === 1}
                                       className="px-4 sm:px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                                    >
                                       Prev
                                    </button>
                                    <div className="flex gap-2 shrink-0">
                                       {Array.from({ length: Math.min(5, Math.ceil(totalArticles / limit)) }).map((_, i) => (
                                          <button
                                             key={i}
                                             onClick={() => setPage(i + 1)}
                                             className={`w-10 h-10 rounded-lg text-xs font-black border transition-all ${page === i + 1 ? 'bg-[#00D4FF] text-[#0A0F1E] border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                                          >
                                             0{i + 1}
                                          </button>
                                       ))}
                                    </div>
                                    <button
                                       onClick={() => setPage(p => p + 1)}
                                       disabled={page >= Math.ceil(totalArticles / limit)}
                                       className="px-4 sm:px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                                    >
                                       Next
                                    </button>
                                 </div>
                              )}
                           </>
                        ) : (
                           <div className="h-64 sm:h-80 flex flex-col items-center justify-center border border-white/5 rounded-[2rem] bg-white/[0.01]">
                              <FileArchive size={40} className="text-slate-800 mb-6 opacity-20" />
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No Intelligence Matching Scans</p>
                           </div>
                        )}
                     </section>

                     {/* Citizen/Peer Insights Section */}
                     <section className="space-y-8 sm:space-y-10 group">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                           <div className="flex items-center gap-4 text-white">
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                                 <Users size={16} />
                              </div>
                              <h2 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em]">CITIZEN EXPERIENCE</h2>
                           </div>
                        </div>

                        {loading ? <div className="flex justify-center h-40"><PageLoader /></div> : userExperiences.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                              {userExperiences.map((art: any) => (
                                 <InsightCard key={art.slug} article={art} onClick={() => setSelectedArticle(art)} theme="citizen" />
                              ))}
                           </div>
                        ) : (
                           <div className="h-44 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01] text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] gap-4">
                              <Shield size={32} className="opacity-10" />
                              No Insights Logged
                           </div>
                        )}
                     </section>

                     {/* Personal Dossiers */}
                     <section className="space-y-10 group pb-16 sm:pb-32">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                           <div className="flex items-center gap-4 text-white">
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#00FFD1]/10 flex items-center justify-center border border-[#00FFD1]/20 text-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.2)]">
                                 <Database size={16} />
                              </div>
                              <h2 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em]">MY PUBLISHED INTEL</h2>
                           </div>
                        </div>

                        {myArticles.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                              {myArticles.map((art: any) => (
                                 <InsightCard
                                    key={art.slug}
                                    article={art}
                                    onClick={() => setSelectedArticle(art)}
                                    theme="citizen"
                                    onDelete={() => handleDelete(art._id)}
                                 />
                              ))}
                           </div>
                        ) : (
                           <div className="h-44 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01] text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] gap-4">
                              <FileArchive size={32} className="opacity-10" />
                              No Local Files
                           </div>
                        )}
                     </section>
                  </div>

                  {/* Sidebar Widgets */}
                  <div className="col-span-1 md:col-span-12 xl:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 h-fit pt-4 sm:pt-8">

                     <div className="relative rounded-[2rem] overflow-hidden group shadow-2xl bg-[#0D1526] border border-[#00D4FF]/20">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4FF] to-violet-500" />

                        <div className="p-6 sm:p-8">
                           <div className="flex items-center justify-between mb-8">
                              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                                 <Terminal size={24} />
                              </div>
                              <span className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ACTIVE
                              </span>
                           </div>

                           <h3 className="text-xl sm:text-2xl font-black text-white mb-3 uppercase italic">PUBLISH <span className="text-[#00D4FF] not-italic">INTEL</span></h3>
                           <p className="text-sm text-[#94A3B8] mb-8 font-medium leading-[1.6]">Utilize neural AI to transform your reports into high-fidelity dossiers instantly.</p>

                           <button onClick={() => isUserLoggedIn() ? setIsModalOpen(true) : showAuthModal()} className="w-full bg-[#00D4FF] hover:bg-white text-[#0A0F1E] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                              OPEN AI TERMINAL <Zap size={16} fill="currentColor" />
                           </button>
                        </div>

                        <div className="bg-[#0A0F1E] p-6 border-t border-white/5 font-mono text-[9px] text-[#475569] uppercase tracking-widest space-y-3">
                           <div className="flex items-center justify-between"><span>SEC:</span> <span className="text-emerald-500">ENCRYPTED</span></div>
                           <div className="flex items-center justify-between"><span>NET:</span> <span className="text-[#00D4FF]">STABLE</span></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* AI GENERATION MODAL */}
         <AnimatePresence>
            {isModalOpen && (
               <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-6'}`}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isGenerating && setIsModalOpen(false)} className="absolute inset-0 bg-[#0A0F1E]/95 backdrop-blur-3xl" />

                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                     className={`relative bg-[#0A0F1E] overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-500 border border-white/10 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[98%] sm:w-[94%] max-w-[1500px] h-[95vh] sm:h-[88vh] rounded-2xl sm:rounded-[2.5rem]'}`}>
                     {/* Sidebar Navigation */}
                     <div className="w-full md:w-64 bg-[#0D1526] backdrop-blur-3xl border-b md:border-b-0 md:border-r border-white/10 flex flex-row md:flex-col p-3 sm:p-4 md:p-6 shrink-0 relative overflow-hidden items-center md:items-stretch justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 md:mb-10 relative z-10 shrink-0">
                           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                              <Shield size={16} className="sm:size-5" fill="currentColor" />
                           </div>
                           <div className="hidden min-[350px]:block">
                              <h2 className="text-[9px] sm:text-[10px] font-black text-white tracking-widest leading-none uppercase">EDITOR HUB</h2>
                              <p className="text-[7px] text-[#00D4FF] font-black uppercase tracking-[0.3em] mt-1 italic hidden sm:block">Active Node</p>
                           </div>
                        </div>

                        {/* Mobile Navigation Pills */}
                        <div className="flex md:hidden items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                           {[
                              { id: 'Drafts', icon: <Edit3 size={14} /> },
                              { id: 'My Articles', icon: <FileText size={14} /> },
                              { id: 'Trace Audits', icon: <Activity size={14} /> }
                           ].map(tab => (
                              <button
                                 key={tab.id}
                                 onClick={() => setActiveSidebarTab(tab.id)}
                                 className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${activeSidebarTab === tab.id ? 'bg-[#00D4FF] text-[#0A0F1E] shadow-[0_0_10px_rgba(0,212,255,0.4)]' : 'text-slate-500 hover:text-white'}`}
                              >
                                 {tab.id === 'My Articles' ? <FileText size={14} /> : tab.icon}
                              </button>
                           ))}
                        </div>

                        <div className="hidden md:block md:space-y-10 flex-1 relative z-10">
                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-4 mb-4">EDITOR SUITE</p>

                              <SidebarItem
                                 icon={<Edit3 size={18} />}
                                 text="Drafts"
                                 active={activeSidebarTab === 'Drafts'}
                                 onClick={() => setActiveSidebarTab('Drafts')}
                              />
                              <SidebarItem
                                 icon={<FileText size={18} />}
                                 text="My Articles"
                                 active={activeSidebarTab === 'My Articles'}
                                 onClick={() => setActiveSidebarTab('My Articles')}
                              />
                              <SidebarItem
                                 icon={<Activity size={18} />}
                                 text="Trace Audits"
                                 active={activeSidebarTab === 'Trace Audits'}
                                 onClick={() => setActiveSidebarTab('Trace Audits')}
                              />
                           </div>
                        </div>

                        <div className="flex items-center gap-2 md:block md:space-y-4 md:mt-auto relative z-10 md:pt-10 md:border-t md:border-white/5">
                           <button
                              onClick={handleSave}
                              disabled={isSaving || !generatedContent}
                              className={`w-36 md:w-full py-2.5 md:py-4 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 sm:gap-3 active:scale-95 ${!generatedContent ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-[#00D4FF] text-[#0A0F1E] hover:bg-white shadow-[#00D4FF]/20'}`}
                           >
                              {isSaving ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle2 size={12} />}
                              {isSaving ? 'SYNC' : 'Publish'}
                           </button>
                        </div>
                     </div>

                     {/* Main Content Area */}
                     <div className="flex-1 flex flex-col min-w-0 bg-[#0A0F1E]">
                        <div className="h-14 sm:h-20 px-4 sm:px-8 flex items-center justify-between shrink-0 border-b border-white/5 relative bg-[#0D1526]/50">
                           <div className="flex items-center gap-3 sm:gap-5">
                              <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition text-slate-500 hover:text-[#00D4FF]">
                                 {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                              </button>
                              <p className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] min-[400px]:tracking-[0.5em] italic">Intelligence Node</p>
                           </div>

                           <div className="flex items-center gap-3 sm:gap-8">
                              <div className="relative hidden sm:block">
                                 <input type="file" id="cover-upload" className="hidden" accept="image/*"
                                    onClick={(e) => (e.currentTarget.value = '')}
                                    onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (!file) return;
                                       setIsUploadingCover(true);
                                       try {
                                          const reader = new FileReader();
                                          reader.onload = async (ev) => {
                                             try {
                                                const res = await uploadArticleImage(ev.target?.result as string);
                                                setGeneratedImage(res.data.imageUrl);
                                             } catch (err) {
                                                console.error("Cover upload failed", err);
                                                alert("Failed to upload cover art.");
                                             } finally {
                                                setIsUploadingCover(false);
                                             }
                                          };
                                          reader.readAsDataURL(file);
                                       } catch (err) {
                                          setIsUploadingCover(false);
                                       }
                                    }} />
                                 <label htmlFor="cover-upload" className={`cursor-pointer font-black text-[10px] uppercase tracking-[0.3em] px-6 py-4 rounded-xl border transition-all flex items-center gap-3 ${generatedImage ? 'bg-[#0A0F1E] text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/50 pr-4' : 'bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border-[#00D4FF]/20'}`}>
                                    {isUploadingCover ? (
                                       <Loader2 size={16} className="animate-spin" />
                                    ) : generatedImage ? (
                                       <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-emerald-500/30 relative">
                                          <img src={generatedImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
                                       </div>
                                    ) : (
                                       <ImageIcon size={16} />
                                    )}
                                    <span className="mt-0.5">{isUploadingCover ? 'PROCESSING...' : generatedImage ? 'COVER ACTIVE' : 'ADD COVER'}</span>
                                 </label>
                              </div>

                              <button onClick={handleSave} disabled={isSaving || !generatedContent} className="bg-[#00D4FF] hover:bg-white text-[#0A0F1E] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] px-4 sm:px-10 py-2.5 sm:py-4 rounded-lg sm:rounded-xl shadow-2xl shadow-[#00D4FF]/20 transition-all active:scale-95 flex items-center gap-2 sm:gap-3">
                                 {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
                                 <span className="mt-0.5">{isSaving ? 'Saving' : 'Publish'}</span>
                              </button>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-600 hover:text-white cursor-pointer transition border border-white/5 rounded-lg sm:rounded-xl hover:bg-red-500/10" onClick={() => !isGenerating && setIsModalOpen(false)}>
                                 <X size={18} />
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 relative overflow-hidden flex flex-col">
                           <div className="flex-1 overflow-y-auto custom-scrollbar">
                              {activeSidebarTab === 'Drafts' ? (
                                 !generatedContent ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto relative w-full">
                                       {/* Atmospheric Underglow */}
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00D4FF]/5 blur-[120px] rounded-full pointer-events-none" />

                                       {/* Main Assistant Terminal Card */}
                                       <div className="relative w-full bg-gradient-to-b from-[#0D1526]/90 to-[#0A0F1E] backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                                          {/* Terminal Header */}
                                          <div className="flex items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-white/5 relative">
                                             <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-[#00D4FF]/50 to-transparent" />

                                             <div className="flex items-center gap-3 sm:gap-5">
                                                <div className="relative">
                                                   <div className="absolute inset-0 bg-[#00D4FF]/20 blur-md rounded-xl sm:rounded-2xl" />
                                                   <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-[#0A0F1E] rounded-xl sm:rounded-2xl border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                                                      <Terminal size={20} className="sm:size-6" />
                                                   </div>
                                                </div>
                                                <div>
                                                   <h3 className="text-white font-black text-lg sm:text-2xl tracking-tight leading-none uppercase italic">SUBMIT <span className="text-[#00D4FF] not-italic">INTEL</span></h3>
                                                   <p className="text-[#64748B] text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-1">Neural AI Generation Node</p>
                                                </div>
                                             </div>
                                             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Uplink Online</span>
                                             </div>
                                          </div>

                                          {/* Terminal Body */}
                                          <div className="mb-8 sm:mb-10 text-center">
                                             <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-widest mb-3 sm:mb-4 italic uppercase leading-tight">
                                                Describe your <br className="sm:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-violet-400">Intelligence</span>
                                             </h2>
                                             <p className="text-slate-400 max-w-lg mx-auto text-[11px] sm:text-sm font-medium leading-[1.6] sm:leading-[1.8]">
                                                Briefly describe your case, a specific threat, or a legal protocol. Our neural AI chatbot will autonomously synthesize a 1200-word professional dossier for the Global Hub.
                                             </p>
                                          </div>

                                          {/* Input Console */}
                                          <div className="relative group max-w-2xl mx-auto">
                                             <div className={`absolute -inset-1 bg-gradient-to-r from-[#00D4FF]/30 to-violet-500/30 rounded-2xl blur opacity-25 transition duration-700 ${isGenerating ? 'opacity-50 animate-pulse' : 'group-focus-within:opacity-100'} pointer-events-none`} />
                                             <div className="relative bg-[#050810] border border-white/10 group-focus-within:border-[#00D4FF]/50 rounded-2xl p-2 transition-all shadow-inner flex flex-col md:flex-row gap-2">
                                                <div className="flex-1 flex items-center pl-5">
                                                   <Sparkles className="text-[#00D4FF]/50 shrink-0" size={20} />
                                                   <input
                                                      type="text"
                                                      value={topic}
                                                      onChange={e => setTopic(e.target.value)}
                                                      placeholder="Describe your article topic or case details here..."
                                                      className="w-full bg-transparent py-4 px-5 text-base font-bold text-white placeholder-slate-600 outline-none"
                                                      disabled={isGenerating}
                                                      onKeyDown={(e) => {
                                                         if (e.key === 'Enter' && topic && !isGenerating) handleGenerate();
                                                      }}
                                                   />
                                                </div>
                                                <button
                                                   onClick={handleGenerate}
                                                   disabled={!topic || isGenerating}
                                                   className="shrink-0 h-14 px-8 bg-[#00D4FF] hover:bg-white text-[#0A0F1E] font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                   {isGenerating ? (
                                                      <>
                                                         <Loader2 className="animate-spin" size={16} />
                                                         PROCESSING
                                                      </>
                                                   ) : (
                                                      <>
                                                         <Zap size={16} fill="currentColor" />
                                                         INITIALIZE
                                                      </>
                                                   )}
                                                </button>
                                             </div>
                                          </div>

                                          {/* Suggestions Area */}
                                          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2 justify-center">
                                             {['Digital Extortion Modus', 'Phishing Links Analysis', 'BNS Sect 318 Breakdown', 'Identity Theft Protocol'].map(suggestion => (
                                                <button
                                                   key={suggestion}
                                                   onClick={() => setTopic(suggestion)}
                                                   disabled={isGenerating}
                                                   className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-[10px] font-bold tracking-widest hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all disabled:opacity-50"
                                                >
                                                   {suggestion}
                                                </button>
                                             ))}
                                          </div>

                                       </div>
                                    </div>
                                 ) : (
                                    <RichTextEditor key={topic + title} initialContent={generatedContent} generatedImage={generatedImage} onChange={(html) => setEditorHtml(html)} userName={userName} />
                                 )
                              ) : activeSidebarTab === 'My Articles' ? (
                                 <div className="h-full p-12 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-12">
                                       <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Intelligence <span className="text-[#00D4FF]">Vault</span></h2>
                                       <div className="flex gap-4">
                                          <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                             {myArticles.length} ARTICLES LOGGED
                                          </div>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                       {myArticles.map((art) => (
                                          <InsightCard
                                             key={art.slug}
                                             article={art}
                                             onClick={() => setSelectedArticle(art)}
                                             theme="citizen"
                                             onDelete={() => handleDelete(art._id)}
                                          />
                                       ))}
                                       {myArticles.length === 0 && (
                                          <div className="col-span-full h-80 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[3rem]">
                                             <FileArchive size={48} className="text-slate-800 mb-4" />
                                             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No Articles Published by You</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ) : (
                                 <div className="h-full p-12 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-12">
                                       <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Trace <span className="text-[#00D4FF]">Audits</span></h2>
                                       <div className="flex gap-4">
                                          <div className="px-6 py-3 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                             {isGenerating && <Loader2 size={12} className="animate-spin" />}
                                             SYSTEM HEALTH: {isGenerating ? 'ANALYZING' : 'OPTIMAL'}
                                          </div>
                                       </div>
                                    </div>

                                    <div className="space-y-6">
                                       <AuditRow
                                          icon={<Zap size={16} />}
                                          event="Neural Handshake Initiated"
                                          details={isGenerating ? "Gemini 2.5 Active Node" : "Waiting for signal"}
                                          time="Real-time"
                                          status={isGenerating ? "ACTIVE" : "CONNECTED"}
                                          active={isGenerating}
                                       />
                                       <AuditRow
                                          icon={<ImageIcon size={16} />}
                                          event="Visual Projection Node"
                                          details="Bypassed for maximum efficiency"
                                          time="-"
                                          status="DISABLED"
                                          color="violet"
                                          active={false}
                                       />
                                       <AuditRow
                                          icon={<FileText size={16} />}
                                          event="Article Vector Mapping"
                                          details={generatedContent ? `Title: ${title}` : isGenerating ? "Assembling intelligence matrix..." : "Awaiting draft"}
                                          time={generatedContent ? "Just Now" : "-"}
                                          status={generatedContent ? "SYNCED" : isGenerating ? "SEQUENCING" : "IDLE"}
                                          color="emerald"
                                          active={isGenerating && !generatedContent}
                                       />
                                       <AuditRow
                                          icon={<Shield size={16} />}
                                          event="Security Layer Verified"
                                          details="BNS 2024 compliance checker active"
                                          time="Continuous"
                                          status="SECURE"
                                          color="blue"
                                       />
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {selectedArticle && (
               <ArticleReader article={selectedArticle} onClose={() => setSelectedArticle(null)} />
            )}
         </AnimatePresence>
      </div>
   );
};

const SidebarItem = ({ icon, text, active = false, onClick }: any) => (
   <div
      onClick={onClick}
      className={`flex items-center gap-5 py-4 px-7 rounded-2xl cursor-pointer transition flex items-center justify-between group relative overflow-hidden ${active ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20' : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.02]'}`}
   >
      <div className="flex items-center gap-5">
         <span className={`${active ? 'text-[#00D4FF]' : 'text-slate-700 group-hover:text-[#00D4FF]'} transition-colors`}>{icon}</span>
         <span className="text-[11px] font-black tracking-[0.2em] italic uppercase">{text}</span>
      </div>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />}
   </div>
);

const AuditRow = ({ icon, event, details, time, status, color = 'cyan', active = false }: any) => {
   const colors: any = {
      cyan: 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/20 shadow-[#00D4FF]/5',
      violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20 shadow-violet-400/5',
      emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/5',
      blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-400/5',
   };

   return (
      <div className={`flex items-center justify-between p-6 bg-[#0D1526]/50 border border-white/5 rounded-2xl group hover:border-[#00D4FF]/20 transition-all ${active ? 'ring-1 ring-[#00D4FF]/20 shadow-2xl shadow-[#00D4FF]/5' : ''}`}>
         <div className="flex items-center gap-6">
            <div className="relative">
               {active && (
                  <motion.div
                     animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className={`absolute inset-0 rounded-xl blur-lg ${colors[color].split(' ')[1]}`}
                  />
               )}
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.cyan} border shadow-lg relative z-10 transition-transform group-hover:scale-110`}>
                  {icon}
               </div>
            </div>
            <div>
               <h4 className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-1">{event}</h4>
               <p className="text-slate-500 text-[10px] font-medium uppercase tracking-[0.2em]">{details}</p>
            </div>
         </div>
         <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
               {active && <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_8px_#00D4FF]" />}
               <p className={`font-black text-[10px] tracking-widest ${active ? 'text-[#00D4FF]' : 'text-white'}`}>{status}</p>
            </div>
            <p className="text-slate-700 text-[9px] font-black uppercase tracking-widest">{time}</p>
         </div>
      </div>
   );
};

const InsightCard = ({ article, onClick, featured = false, theme = 'official', onDelete }: any) => {
   const fallbackImages = [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510511459019-5bea250ce733?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614064641913-6b714aaa2982?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517433622936-f331281ea69c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580828369019-cea98ad7413f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604145559200-e340b483c076?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573164713619-24d4be4327ea?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618044736000-449e7b231ffc?q=80&w=800&auto=format&fit=crop"
   ];

   const getArticleImage = (article: any) => {
      // Return explicit image if it is a valid resolved URL
      if (article.image_url && article.image_url.startsWith('data:')) return article.image_url;
      if (article.image_url && article.image_url.startsWith('http')) return article.image_url;

      // Deterministic ultra-fast local visual fallback using entropy
      const entropy = (article.title?.length || 0) + (article.category?.length || 0);
      return fallbackImages[entropy % fallbackImages.length];
   };

   const accentColor = theme === 'official' ? '#00D4FF' : '#10b981';

   return (
      <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }} onClick={onClick} className="group cursor-pointer relative h-full flex">
         <div className={`absolute -inset-0.5 bg-gradient-to-br transition-all duration-700 blur-md opacity-0 group-hover:opacity-100 rounded-[2.5rem] z-0`} style={{ backgroundImage: `linear-gradient(to bottom right, ${accentColor}80, transparent)` }} />
         <div className={`relative z-10 w-full bg-[#0A0F1E] border border-white/10 group-hover:border-[${accentColor}]/50 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_40px_${accentColor}30] ${featured ? 'h-[460px]' : 'h-[390px]'}`}>

            <div className={`relative overflow-hidden shrink-0 ${featured ? 'h-52' : 'h-40'}`}>
               <img
                  src={getArticleImage(article)}
                  onError={(e: any) => {
                     e.target.onerror = null;
                     e.target.src = fallbackImages[(article.title?.length || 0) % fallbackImages.length];
                  }}
                  className="w-full h-full object-cover transition duration-1000 group-hover:scale-110 group-hover:rotate-1"
               />
               {/* Multi-layered gradient for depth */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

               <div className="absolute top-5 left-5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-black/60 border border-white/20 text-white backdrop-blur-xl shadow-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></span>
                  {article.category}
               </div>
            </div>

            <div className="p-7 flex flex-col flex-1 relative">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent"></div>

               <span className="text-[10px] items-center gap-2 font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex">
                  <Clock size={12} />
                  {new Date(article.published_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
               </span>

               <h3 className="text-xl font-black text-white leading-snug mb-3 line-clamp-2 transition-colors duration-300" style={{ textShadow: `0 2px 10px rgba(0,0,0,0.5)` }}>
                  <span className="bg-clip-text bg-gradient-to-r from-white to-white group-hover:to-slate-400 transition-all duration-300">
                     {article.title}
                  </span>
               </h3>

               <p className="text-slate-400 text-[12px] font-medium leading-[1.8] line-clamp-2 mb-6">
                  {article.content_markdown?.replace(/[#*]/g, '').substring(0, 150)}...
               </p>

               <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                  <div className="flex items-center gap-3">
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center border backdrop-blur-md shadow-lg`} style={{ backgroundColor: `${accentColor}1A`, borderColor: `${accentColor}40`, color: accentColor }}>
                        <Fingerprint size={16} />
                     </div>
                     <div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Authorized By</p>
                        <p className="text-[11px] text-white font-bold tracking-wider truncate max-w-[120px]">
                           {article.author_name || (theme === 'official' ? 'SYSTEM CORE' : 'CITIZEN')}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     {onDelete && (
                        <div
                           onClick={(e) => { e.stopPropagation(); onDelete(); }}
                           className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 z-20 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                        >
                           <Trash2 size={16} />
                        </div>
                     )}
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5 ${theme === 'official' ? 'group-hover:bg-[#00D4FF] group-hover:border-[#00D4FF]' : 'group-hover:bg-[#10b981] group-hover:border-[#10b981]'} group-hover:text-black text-white hover:scale-110 transition-all duration-300 shadow-xl`}>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
};
