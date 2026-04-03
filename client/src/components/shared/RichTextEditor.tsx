import React, { useRef, useEffect, useState } from 'react';
import {
   Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
   List, ListOrdered, Sparkles, Image as ImageIcon, Link2, User, Clock, FileText, CheckCircle2, Zap, Shield, Undo2, Redo2
} from 'lucide-react';

interface RichTextEditorProps {
   initialContent: string;
   onChange: (htmlContent: string) => void;
   className?: string;
   userName?: string;
   generatedImage?: string | null;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
   initialContent,
   onChange,
   className = "",
   userName = "Authorized Investigator",
   generatedImage = null
}) => {
   const editorRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [lastInitialContent, setLastInitialContent] = useState("");

   useEffect(() => {
      if (editorRef.current && initialContent !== lastInitialContent) {
         const content = String(initialContent || "");
         const basicHtml = content
            .replace(/^# (.*$)/gim, '<h1 style="font-size: 2.25rem; font-weight: 900; color: white; margin-bottom: 2rem; line-height: 1.3; letter-spacing: -0.01em; text-transform: uppercase; border-bottom: 2px solid rgba(0,212,255,0.2); padding-bottom: 0.5rem; width: 100%;">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.3rem; font-weight: 800; color: #00D4FF; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.01em; text-transform: uppercase;">$1</h2>')
            .replace(/\*\*(.*)\*\*/gim, '<strong style="color: white; font-weight: 800;">$1</strong>')
            .replace(/\*(.*)\*/gim, '<em style="color: #94A3B8;">$1</em>')
            .replace(/^\* (.*$)/gim, '<div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem; color: #CBD5E1; font-size: 1rem;"><span style="color: #00D4FF; font-weight: 900;">•</span><span>$1</span></div>')
            .replace(/\n{2,}/gim, '</div><div style="margin-bottom: 1.5rem;">')
            .replace(/\n/gim, '<br />');

         editorRef.current.innerHTML = basicHtml;
         setLastInitialContent(initialContent);
      }
   }, [initialContent, lastInitialContent]);

   const exec = (command: string, value: string | undefined = undefined) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      try {
         document.execCommand(command, false, value);
         handleInput();
      } catch (e) {
         console.warn("Editor command failed", e);
      }
   };

   const handleInput = () => {
      if (editorRef.current) {
         onChange(editorRef.current.innerHTML);
      }
   };

   return (
      <div className={`flex flex-col h-full bg-[#050810] overflow-hidden ${className} relative`}>
         <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
               const reader = new FileReader();
               reader.onload = (ev) => exec('insertImage', ev.target?.result as string);
               reader.readAsDataURL(file);
            }
         }} accept="image/*" className="hidden" />

         {/* INSTITUTIONAL TOP BAR */}
         <div className="h-14 px-6 bg-[#0D1526] border-b border-white/5 flex items-center justify-between shrink-0 relative z-[60]">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20"><Shield size={16} fill="currentColor" /></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Guardian Intelligence Dossier — {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-xl">
               <ToolIcon onClick={() => exec('undo')} icon={<Undo2 size={15} />} title="Undo" />
               <ToolIcon onClick={() => exec('redo')} icon={<Redo2 size={15} />} title="Redo" />
               <div className="w-px h-4 bg-white/10 mx-1" />
               <ToolIcon onClick={() => exec('bold')} icon={<Bold size={15} />} title="Bold" />
               <ToolIcon onClick={() => exec('italic')} icon={<Italic size={15} />} title="Italic" />
               <ToolIcon onClick={() => exec('underline')} icon={<Underline size={15} />} title="Underline" />

               <div className="w-px h-4 bg-white/10 mx-1" />
               <div className="flex items-center gap-1.5 px-2">
                  {['#FFFFFF', '#00D4FF', '#FF0055', '#4ADE80', '#FACC15'].map(color => (
                     <button
                        key={color}
                        onClick={() => exec('foreColor', color)}
                        className="w-4 h-4 rounded-full border border-white/10 transition-transform hover:scale-125"
                        style={{ backgroundColor: color }}
                     />
                  ))}
               </div>

               <div className="w-px h-4 bg-white/10 mx-1" />
               <ToolIcon onClick={() => exec('justifyLeft')} icon={<AlignLeft size={15} />} title="Left" />
               <ToolIcon onClick={() => exec('justifyCenter')} icon={<AlignCenter size={15} />} title="Center" />
               <ToolIcon onClick={() => exec('insertUnorderedList')} icon={<List size={15} />} title="List" />
               <div className="w-px h-4 bg-white/10 mx-1" />
               <ToolIcon onClick={() => fileInputRef.current?.click()} icon={<ImageIcon size={15} />} title="Image" />
            </div>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0D1526] bg-slate-800" />)}
               </div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">+2 EDITORS</span>
            </div>
         </div>

         {/* DOC CANVAS SURFACE */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050810] pt-12 pb-32 flex justify-center px-4 relative">
            {/* Subtle grid/pattern overlay for the 'Desk' feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00D4FF 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

            <div className="w-full max-w-[850px] bg-[#0A0F1E] border border-white/5 shadow-[0_60px_100px_-30px_rgba(0,0,0,1)] flex flex-col h-fit transition-all relative z-10 p-20 pt-24 font-ops">

               {/* SEAMLESS HEADER - CONTENT FLOW */}
               <div className="mb-20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20">
                        <User size={18} />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white tracking-tight">{userName}</h4>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Verified Intelligence Contributor</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-slate-300 tracking-tight italic opacity-60 tracking-[0.1em]">{new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               {/* LARGE DYNAMIC TEXT AREA */}
               <div className="flex-1 flex flex-col relative py-10">
                  <style dangerouslySetInnerHTML={{
                     __html: `
                .editor-content h1, .editor-content h2, .editor-content p, .editor-content div {
                   margin-bottom: 1.5rem !important;
                }
                .editor-content img {
                   max-width: 100%;
                   height: auto;
                   border-radius: 12px;
                   margin: 30px 0;
                   cursor: move;
                   transition: transform 0.2s;
                   box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                   display: block;
                }
                .editor-content img:hover {
                   transform: scale(1.01);
                   outline: 2px solid #00D4FF;
                }
              `}} />
                  <div
                     ref={editorRef}
                     contentEditable
                     onInput={handleInput}
                     spellCheck={false}
                     className="editor-content flex-1 focus:outline-none text-slate-100 font-medium text-lg md:text-xl leading-[2] min-h-[1000px] selection:bg-[#00D4FF] selection:text-[#0A0F1E] outline-none"
                  />

                  {/* DOC FOOTER - INSTITUTIONAL */}
                  <div className="mt-32 pt-10 border-t border-white/[0.03] flex items-center justify-between text-slate-600 opacity-50">
                     <div className="flex items-center gap-12">
                        <div className="flex flex-col gap-1">
                           <span className="text-[7px] font-black uppercase tracking-widest">ARCHIVE_REF</span>
                           <span className="text-[10px] font-bold text-slate-500">IND-FORENSICS-2024-X{Math.random().toString().slice(2, 6)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[7px] font-black uppercase tracking-widest">SYSTEM_HASH</span>
                           <span className="text-[9px] font-mono lowercase">0x{Math.random().toString(16).slice(2, 10)}...</span>
                        </div>
                     </div>
                     <div className="text-[9px] font-black uppercase tracking-[0.5em]">Sheet 01 // Collective node</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const ToolIcon = ({ onClick, icon, title }: any) => (
   <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/20 transition-all active:scale-90"
   >
      {icon}
   </button>
);
