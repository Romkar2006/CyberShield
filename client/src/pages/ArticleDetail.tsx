import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Eye, Share2, ShieldAlert, Book, BookOpen, Newspaper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getArticle } from '../lib/api';
import { Article } from '../types';
import { PageLoader } from '../components/shared/PageLoader';

export const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await getArticle(slug);
        setArticle(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Article not found');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'THREAT BULLETIN': return <ShieldAlert className="text-amber-500" size={16} />;
      case 'LEGAL': return <Book className="text-[#00D4FF]" size={16} />;
      case 'SOP': return <BookOpen className="text-purple-400" size={16} />;
      default: return <Newspaper className="text-emerald-400" size={16} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0F1E] flex justify-center py-24"><PageLoader /></div>;
  if (error || !article) return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center pt-32 px-6">
      <div className="text-red-500 font-bold mb-4">Error loading document</div>
      <p className="text-[#94A3B8] mb-8">{error}</p>
      <Link to="/hub" className="text-[#00D4FF] hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Return to Hub
      </Link>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0A0F1E] font-['Inter',sans-serif] text-white">
      {/* Article Header */}
      <div className="relative border-b border-white/[0.06] bg-[#0D1526]">
        {/* Abstract cyber background pattern behind header */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top right, #00D4FF 0%, transparent 40%)' }}></div>
        
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 relative z-10">
          <Link to="/hub" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#00D4FF] text-sm font-semibold transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-[#0A0F1E] border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#E2E8F0]">
              {getCategoryIcon(article.category)}
              {article.category}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <Clock size={14} /> 
              {article.published_at ? new Date(article.published_at).toLocaleDateString('en-GB') : 'Unknown'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <Eye size={14} /> {article.views || 0} views
            </div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-8"
          >
            {article.title}
          </motion.h1>

          <div className="flex flex-wrap gap-2">
            {article.tags?.map(tag => (
              <span key={tag} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-xs font-medium text-[#94A3B8]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-12">
        
        {/* Document Body */}
        <div className="flex-1 min-w-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-cyan max-w-none
              [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-6 [&>h1]:mt-10 [&>h1]:tracking-tight
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-5 [&>h2]:mt-10 [&>h2]:tracking-tight [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-2
              [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-4 [&>h3]:mt-8
              [&>p]:text-[#E2E8F0] [&>p]:leading-loose [&>p]:mb-6 [&>p]:text-[15px]
              [&>ul]:my-6 [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-[#E2E8F0] [&>ul>li]:list-disc
              [&>ol]:my-6 [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:text-[#E2E8F0] [&>ol>li]:list-decimal
              [&>blockquote]:border-l-4 [&>blockquote]:border-[#00D4FF] [&>blockquote]:bg-[#00D4FF]/5 [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-8 [&>blockquote]:italic [&>blockquote]:text-[#94A3B8]
              [&>pre]:bg-[#0D1526] [&>pre]:border [&>pre]:border-white/10 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-8
              [&>code]:text-[#00D4FF] [&>code]:bg-[#00D4FF]/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
              [&_a]:text-[#00D4FF] [&_a]:underline [&_a]:hover:text-cyan-300
            "
          >
            <ReactMarkdown>
              {article.content_markdown || '*No content provided.*'}
            </ReactMarkdown>
          </motion.div>
        </div>

        {/* Right Sidebar / Actions */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="bg-[#0D1526] border border-white/[0.06] p-5 rounded-xl sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4">Document Actions</h3>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group mb-2 border border-transparent hover:border-white/10">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#94A3B8] group-hover:text-white transition-colors">
                <Share2 size={16} /> Share Link
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#00D4FF]/10 transition-colors group border border-transparent hover:border-[#00D4FF]/30">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#94A3B8] group-hover:text-[#00D4FF] transition-colors">
                <BookOpen size={16} /> Save to Toolkit
              </div>
            </button>
            
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-2">Notice</div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                This document is part of the CyberShield active repository. SOPs are subject to change based on new court rulings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
