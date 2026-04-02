import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Search, Plus, Minus, Navigation, MoreVertical, AtSign, 
  Ban, Flag, Download, Gavel, FileText, ChevronRight,
  Shield, Network, Zap, User, AlertCircle, Radio, 
  Database, Activity, Globe, Eye, Maximize2, Cpu,
  Terminal, Share2, Layers, Crosshair, Monitor, X
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboard } from '../lib/api';
import { FraudPattern } from '../types';
import { PageLoader } from '../components/shared/PageLoader';

// Types for graph nodes
interface GraphNode {
  id: string;
  name: string;
  group: 'suspect' | 'victim' | 'bank' | 'fir' | 'upi' | 'phone' | 'core' | 'ip_address';
  val: number;
  label: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

const customStyles = `
  .glass-panel {
    background: rgba(13, 21, 38, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .matrix-bg {
    background-image: linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
`;

export const FraudNetwork = () => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracing, setTracing] = useState(false);
  const [traceLog, setTraceLog] = useState<string[]>([]);
  const [activePattern, setActivePattern] = useState<FraudPattern | null>(null);

  // 1. DATA INITIALIZATION
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const res = await getDashboard();
        if (res.data.patterns && res.data.patterns.length > 0) {
          const pat = res.data.patterns[0];
          setActivePattern(pat);
          
          const nodes: GraphNode[] = [
            { id: 'core', name: pat.entity_value, group: 'core', val: 30, label: `PRIMARY TARGET (${pat.entity_type?.toUpperCase()})` }
          ];
          const links: GraphLink[] = [];
          
          // Connect active cases
          pat.complaints?.forEach((comp_id, i) => {
             nodes.push({ id: `comp_${i}`, name: comp_id, group: 'fir', val: 14, label: 'Linked Case File' });
             links.push({ source: 'core', target: `comp_${i}` });
          });
          
          // Mocking some IP nodes if none exist for demo
          const extraNodes: GraphNode[] = [
            { id: 'ip_1', name: '192.168.1.42', group: 'ip_address', val: 16, label: 'Originating IP' },
            { id: 'ip_2', name: '45.12.89.2', group: 'ip_address', val: 18, label: 'Proxy Node (Critical)' },
            { id: 'gw_1', name: 'Global Swift Gateway', group: 'bank', val: 18, label: 'Financial Hub' }
          ];
          extraNodes.forEach(n => {
            nodes.push(n);
            links.push({ source: 'core', target: n.id });
          });

          setGraphData({ nodes, links });
          setSelectedNode(nodes[0]);
        }
      } catch (err) {
        console.error('SOC Intelligence Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    setTimeout(() => fgRef.current?.zoomToFit(400, 50), 1000);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const runTrace = () => {
    setTracing(true);
    setTraceLog(['[SYSTEM] TRACE INITIALIZED...', '[NET] SCANNING IP PACKETS...', '[DETECT] MULTIPLE HOPS IDENTIFIED...', '[OK] ORIGIN LOCATED: 45.12.89.2']);
    setTimeout(() => {
      setTracing(false);
      setTraceLog([]);
    }, 4000);
  };

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isMobile = window.innerWidth < 640;
    const r = isMobile ? node.val * 0.8 : node.val;
    const isSelected = selectedNode?.id === node.id;
    const isIP = node.group === 'ip_address';
    const color = isSelected ? '#00D4FF' : (node.group === 'core' ? '#EF4444' : isIP ? '#C084FC' : '#64748B');

    // Hexagonal Path
    const drawHex = (x: number, y: number, radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };

    if (isSelected || node.group === 'core' || isIP) {
      ctx.shadowBlur = 15 / globalScale;
      ctx.shadowColor = color;
    }

    if (node.group === 'core' || (isIP && node.val > 17)) {
      const pulseSize = r + (Math.sin(Date.now() / 300) * 4);
      drawHex(node.x, node.y, pulseSize + 2);
      ctx.strokeStyle = node.group === 'core' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(192, 132, 252, 0.2)';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    drawHex(node.x, node.y, r);
    ctx.fillStyle = '#0D1526';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = (isSelected ? 3 : 1.5) / globalScale;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const fontSize = (isMobile ? 14 : 11) / globalScale;
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#00D4FF' : '#94A3B8';
    ctx.fillText(node.name.toUpperCase(), node.x, node.y + r + (14 / globalScale));
    
    ctx.font = `bold ${fontSize * 0.6}px 'Outfit', sans-serif`;
    ctx.fillStyle = isSelected ? '#00D4FF' : '#475569';
    ctx.fillText(node.group.toUpperCase(), node.x, node.y - r - (10 / globalScale));
  }, [selectedNode]);

  if (loading) return <PageLoader />;

  return (
    <div className="w-full min-h-[calc(100vh-140px)] relative flex flex-col lg:flex-row bg-[#02040A] rounded-2xl lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-3xl font-['Inter',sans-serif]">
      <style>{customStyles}</style>

      {/* ─── HUD: COMMAND BAR ─── */}
      <div className="absolute top-4 lg:top-8 left-4 lg:left-8 z-[50] pointer-events-none flex flex-col gap-4 lg:gap-6 w-full pr-8 lg:pr-0">
        <motion.div 
          initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="bg-[#0D1526]/90 backdrop-blur-3xl border-l-[4px] lg:border-l-[6px] border-cyan-dark border border-white/10 p-4 lg:p-6 rounded-r-2xl lg:rounded-r-[2rem] shadow-4xl pointer-events-auto w-fit min-w-[200px] lg:min-w-[320px]"
        >
          <div className="flex items-center gap-3 lg:gap-5">
             <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl bg-cyan-dark/10 flex items-center justify-center relative overflow-hidden ring-1 ring-cyan-dark/20 group">
                <Network size={20} className="lg:hidden text-cyan-dark animate-pulse" />
                <Network size={28} className="hidden lg:block text-cyan-dark animate-pulse group-hover:scale-110 transition-transform" />
             </div>
             <div>
                <h1 className="text-sm lg:text-xl font-black text-white uppercase tracking-wider font-['Outfit',sans-serif]">Neural Matrix</h1>
                <p className="text-[8px] lg:text-[10px] text-cyan-dark font-black tracking-widest uppercase mt-0.5 animate-pulse">IP System Active</p>
             </div>
          </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={runTrace}
          className="h-14 lg:h-20 w-fit lg:w-80 bg-gradient-to-r from-cyan-dark to-indigo-600 text-dark-bg-sidebar px-6 lg:px-0 rounded-2xl lg:rounded-[2rem] font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] flex flex-row lg:flex-col items-center justify-center gap-2 lg:gap-1 shadow-2xl shadow-cyan-dark/20 pointer-events-auto transition-all"
        >
           <Zap size={16} className={tracing ? 'animate-bounce' : ''} />
           {tracing ? 'Tracing...' : 'Regional Trace'}
        </motion.button>
      </div>

      {/* ─── GRAPH MAIN STAGE ─── */}
      <div className="flex-1 relative z-[1] min-h-[400px] lg:min-h-0" ref={containerRef}>
        <div className="absolute inset-0 matrix-bg opacity-[0.1] pointer-events-none"></div>
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkColor={() => 'rgba(0, 212, 255, 0.08)'}
          linkWidth={2}
          linkDirectionalParticles={4}
          backgroundColor="transparent"
          onNodeClick={(node: any) => setSelectedNode(node)}
          cooldownTicks={120}
        />

        {/* ─── HUD: TRACE TERMINAL ─── */}
        <AnimatePresence>
          {tracing && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-4 lg:bottom-12 left-4 lg:left-8 w-[calc(100%-32px)] lg:w-[360px] glass-panel rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 font-mono text-[9px] lg:text-[10px] text-[#94A3B8] shadow-4xl pointer-events-none"
            >
               <div className="flex items-center gap-2 mb-3 lg:mb-4 text-cyan-dark border-b border-white/5 pb-2 lg:pb-3">
                  <Terminal size={14} /> <span className="font-black uppercase tracking-widest text-[8px] lg:text-[10px]">Digital Footprint Trace</span>
               </div>
               <div className="space-y-2 max-h-[100px] lg:max-h-40 overflow-y-auto">
                  {traceLog.map((log, i) => (
                    <div key={i} className="flex gap-2"><span className="text-cyan-dark/40 font-black">[{i}]</span> {log}</div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── SIDEBAR: ENTITY INTELLIGENCE ─── */}
      <div className={`w-full lg:w-[450px] relative z-[50] flex flex-col glass-panel shadow-5xl border-t lg:border-t-0 lg:border-l border-white/10 ${selectedNode ? 'h-[400px] lg:h-auto' : 'h-24 lg:h-auto'}`}>
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div 
              key={selectedNode.id} 
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 50, opacity: 0 }}
              className="flex flex-col h-full overflow-y-auto"
            >
               <div className={`p-6 lg:p-10 border-b border-white/5 relative ${selectedNode.group === 'ip_address' ? 'bg-purple-500/10' : 'bg-cyan-dark/5'}`}>
                  <button onClick={() => setSelectedNode(null)} className="lg:hidden absolute top-4 right-4 p-2 text-white/40"><X size={20} /></button>
                  <div className="flex justify-between items-start mb-6 lg:mb-10 relative z-10">
                     <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-[#0F172A] border flex items-center justify-center shadow-2xl transition-all ${
                       selectedNode.group === 'ip_address' ? 'border-purple-500/40 text-purple-400' : 'border-cyan-dark/40 text-cyan-dark'
                     }`}>
                        {selectedNode.group === 'ip_address' ? <Monitor size={24} className="lg:hidden animate-pulse" /> : <Crosshair size={24} className="lg:hidden" />}
                        {selectedNode.group === 'ip_address' ? <Monitor size={40} className="hidden lg:block animate-pulse" /> : <Crosshair size={40} className="hidden lg:block" />}
                     </div>
                     <div className="bg-white/5 text-[#94A3B8] border border-white/10 px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Verified Node</div>
                  </div>
                  <h2 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif] mb-2 leading-tight">{selectedNode.name}</h2>
                  <p className="text-[9px] lg:text-[10px] text-cyan-dark font-black uppercase tracking-[0.2em]">Target: {selectedNode.group}</p>
               </div>

               <div className="p-6 lg:p-10 space-y-6 lg:space-y-10 flex-1">
                  <div className="grid grid-cols-2 gap-4 lg:gap-5">
                     {[
                       { l: 'Network Link', v: 'Active', i: Network, c: 'text-emerald-500' },
                       { l: 'Risk Level', v: selectedNode.group === 'core' ? 'Critical' : 'Escalating', i: AlertCircle, c: 'text-red-500' },
                       { l: 'Origin Port', v: 'HTTPS_443', i: Activity },
                       { l: 'Integrity', v: 'High', i: Shield, c: 'text-emerald-500' }
                     ].map(stat => (
                       <div key={stat.l} className="bg-white/[0.03] border border-white/5 rounded-2xl lg:rounded-3xl p-4 lg:p-5 hover:bg-white/[0.05] transition-all">
                          <stat.i size={16} className={`mb-2 lg:mb-3 ${stat.c || 'text-[#475569]'}`} />
                          <div className="text-[7px] lg:text-[8px] text-[#475569] font-black uppercase tracking-[0.25em] mb-1">{stat.l}</div>
                          <div className={`text-sm lg:text-xl font-black ${stat.c || 'text-white'}`}>{stat.v}</div>
                       </div>
                     ))}
                  </div>

                  {selectedNode.group === 'ip_address' && (
                    <div className="bg-purple-900/10 border border-purple-500/20 p-5 lg:p-6 rounded-2xl lg:rounded-3xl space-y-3 lg:space-y-4">
                       <h4 className="text-[9px] lg:text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                          <Eye size={12} /> IP Checkpoint Active
                       </h4>
                       <p className="text-[8px] lg:text-[10px] text-[#94A3B8] leading-relaxed">This node has been flagged across SOC infrastructure. ISP protocols engaged.</p>
                    </div>
                  )}
               </div>

               <div className="p-6 lg:p-10 border-t border-white/5 bg-[#0D1526]/30 mt-auto">
                  <button className="w-full h-12 lg:h-14 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl lg:rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-red-600/20 uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">
                     <Ban size={18} /> Asset Freeze
                  </button>
               </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-10 lg:p-16 text-center space-y-4 lg:space-y-8 opacity-40">
               <div className="w-16 h-16 lg:w-32 lg:h-32 rounded-[1.5rem] lg:rounded-[3.5rem] bg-white/5 flex items-center justify-center text-[#475569] animate-pulse">
                  <Cpu size={32} className="lg:hidden" /><Cpu size={64} className="hidden lg:block" />
               </div>
               <h3 className="text-sm lg:text-xl font-black text-white uppercase tracking-tight">Select Node to Map Network</h3>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

