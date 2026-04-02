import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getHeatmapData, getDashboard } from '../lib/api';
import { HeatmapPoint, Complaint } from '../types';
import { PageLoader } from '../components/shared/PageLoader';
import { 
  AlertTriangle, MapPin, Shield, Activity, Target, 
  ChevronRight, Zap, Radio, Globe, 
  Database, RefreshCw, Clock, Layers, Link as LinkIcon,
  Eye, TrendingUp, Filter, Search
} from 'lucide-react';

// Custom CSS for advanced map features
const mapStyles = `
  .pulsing-marker { background: transparent; border: none; }
  .pulse-core {
    width: 12px; height: 12px; border-radius: 50%; position: relative;
    box-shadow: 0 0 15px rgba(var(--pulse-color), 0.8);
    transition: all 0.3s ease;
  }
  .pulse-ring {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 100%; height: 100%; border-radius: 50%;
    animation: marker-pulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
    border: 2px solid rgba(var(--pulse-color), 0.5);
  }
  .flare-effect {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 200%; height: 200%; border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--pulse-color), 0.4) 0%, transparent 70%);
    animation: flare 1.5s ease-out infinite;
  }
  @keyframes marker-pulse {
    0% { width: 100%; height: 100%; opacity: 1; }
    100% { width: 450%; height: 450%; opacity: 0; }
  }
  @keyframes flare {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
  }
  .leaflet-container { background: #050812 !important; }
  .custom-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; }
  .leaflet-div-icon { background: none !important; border: none !important; }
`;

export const CrimeHeatmap = () => {
  const [basePoints, setBasePoints] = useState<HeatmapPoint[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Advanced States
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showSatellite, setShowSatellite] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showJurisdictions, setShowJurisdictions] = useState(false);

  const center: [number, number] = [20.5937, 78.9629];

  const fetchFullData = async () => {
    try {
      setRefreshing(true);
      const [heatRes, dashRes] = await Promise.all([
        getHeatmapData(),
        getDashboard()
      ]);
      setBasePoints(heatRes.data);
      setComplaints(dashRes.data.complaints);
    } catch (err) {
      console.error('SOC Synchronizing Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFullData(); }, []);

  // ─── FILTERING LOGIC ───
  const filteredData = useMemo(() => {
    let result = [...complaints];

    // Filter by Time
    const now = new Date();
    if (timeRange === '24H') {
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.createdAt) >= dayAgo);
    } else if (timeRange === '7D') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.createdAt) >= weekAgo);
    } else if (timeRange === '30D') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.createdAt) >= monthAgo);
    }

    // Filter by Category
    if (categoryFilter !== 'ALL') {
      result = result.filter(c => c.categories?.includes(categoryFilter));
    }

    // Aggregating back to HeatmapPoints
    const cityMap: Record<string, HeatmapPoint> = {};
    result.forEach(c => {
      // Use coordinates from basePoints if possible, otherwise default (fallback for demo)
      const base = basePoints.find(p => p.city === c.city);
      if (!cityMap[c.city]) {
        cityMap[c.city] = {
          city: c.city,
          lat: base?.lat || center[0],
          lng: base?.lng || center[1],
          count: 0
        };
      }
      cityMap[c.city].count++;
    });

    return Object.values(cityMap);
  }, [complaints, basePoints, timeRange, categoryFilter]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    complaints.forEach(c => c.categories?.forEach(cat => cats.add(cat)));
    return Array.from(cats).slice(0, 8);
  }, [complaints]);

  // ─── MOCK DATA FOR ADVANCED FEATURES ───
  const linkagePaths = useMemo(() => {
    if (!showLinks || filteredData.length < 2) return [];
    // Link top cities to each other for "Organization" view
    const sorted = [...filteredData].sort((a,b) => b.count - a.count).slice(0, 4);
    return [
      [sorted[0], sorted[1]], [sorted[0], sorted[2]], [sorted[1], sorted[3]]
    ].filter(pair => pair[0] && pair[1]);
  }, [filteredData, showLinks]);

  const predictions = useMemo(() => {
    if (!showPredictions) return [];
    // Mocking some future hotspots in central/coastal areas
    return [
      { city: 'Projected Hotspot 01', lat: 21.1458, lng: 79.0882, count: 12 },
      { city: 'Projected Hotspot 02', lat: 15.2993, lng: 74.1240, count: 8 },
    ];
  }, [showPredictions]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0A0F1E]"><PageLoader /></div>;

  return (
    <div className="w-full h-screen relative flex bg-[#050812] overflow-hidden font-['Inter',sans-serif]">
      <style>{mapStyles}</style>

      {/* ─── TACTICAL HUD: TOP CONTROLS ─── */}
      <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-[#0D1526]/90 backdrop-blur-xl border border-cyan-dark/30 p-4 rounded-3xl shadow-2xl pointer-events-auto flex items-center gap-6"
          >
            <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
               <Globe size={24} className="text-cyan-dark" />
               <h1 className="text-sm font-black text-white uppercase tracking-[0.2em]">Geospatial Unit v4</h1>
            </div>
            <div className="flex items-center gap-2">
               {[
                 { id: 'sat', icon: Layers, label: 'Satellite', state: showSatellite, toggle: () => setShowSatellite(!showSatellite) },
                 { id: 'link', icon: LinkIcon, label: 'Linkage', state: showLinks, toggle: () => setShowLinks(!showLinks) },
                 { id: 'pred', icon: Eye, label: 'Forecast', state: showPredictions, toggle: () => setShowPredictions(!showPredictions) },
                 { id: 'juris', icon: Shield, label: 'Districts', state: showJurisdictions, toggle: () => setShowJurisdictions(!showJurisdictions) },
               ].map(btn => (
                 <button 
                   key={btn.id} onClick={btn.toggle}
                   className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${
                     btn.state ? 'bg-cyan-dark text-dark-bg-sidebar shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-white/5 text-[#475569] hover:bg-white/10'
                   }`}
                 >
                   <btn.icon size={10} /> {btn.label}
                 </button>
               ))}
            </div>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
             <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center animate-pulse">
                   <AlertTriangle className="text-red-500" size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Anomalies</div>
                   <div className="text-lg font-black text-white">{filteredData.filter(d => d.count > 15).length} High-Risk</div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* ─── LEFT SIDEBAR: CATEGORY INTELLIGENCE ─── */}
      <div className="absolute left-6 top-[180px] bottom-6 w-[240px] z-[1000] pointer-events-none flex flex-col gap-4">
         <motion.div 
           initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
           className="bg-[#0D1526]/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl pointer-events-auto flex-1 overflow-hidden flex flex-col"
         >
            <div className="flex items-center gap-3 mb-6">
               <Filter size={14} className="text-cyan-dark" />
               <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Vector Filters</h3>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 scrollbar-none">
              <button 
                onClick={() => setCategoryFilter('ALL')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${categoryFilter === 'ALL' ? 'bg-cyan-dark/10 border-cyan-dark/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <div className={`text-[10px] font-black uppercase tracking-tight ${categoryFilter === 'ALL' ? 'text-white' : 'text-[#475569]'}`}>All Vectors</div>
              </button>
              {allCategories.map(cat => (
                <button 
                  key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${categoryFilter === cat ? 'bg-cyan-dark/10 border-cyan-dark/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className={`text-[10px] font-black uppercase tracking-tight truncate ${categoryFilter === cat ? 'text-white' : 'text-[#475569]'}`}>{cat}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="text-[8px] font-black text-[#475569] uppercase tracking-widest mb-2">Live Heat Signature</div>
                <div className="flex gap-1">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="flex-1 h-3 rounded-sm bg-cyan-dark/10 relative overflow-hidden">
                        <motion.div animate={{ height: [0, Math.random()*100, 0] }} transition={{ duration: 1+Math.random(), repeat: Infinity }} className="absolute bottom-0 left-0 right-0 bg-cyan-dark/40" />
                     </div>
                   ))}
                </div>
            </div>
         </motion.div>
      </div>

      {/* ─── BOTTOM CONTROL: TEMPORAL SLIDER ─── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
         <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#0A0F1E]/90 backdrop-blur-2xl border border-white/10 p-3 rounded-full flex items-center gap-4 shadow-3xl pointer-events-auto ring-1 ring-white/5">
            <div className="bg-white/5 p-3 rounded-full"><Clock size={16} className="text-cyan-dark" /></div>
            <div className="flex gap-2">
               {[
                 { id: '24H', label: '24 Hours' },
                 { id: '7D', label: '7 Days' },
                 { id: '30D', label: '30 Days' },
                 { id: 'ALL', label: 'Historical' },
               ].map(range => (
                 <button 
                    key={range.id} onClick={() => setTimeRange(range.id as any)}
                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                      timeRange === range.id ? 'bg-cyan-dark text-dark-bg-sidebar' : 'text-[#475569] hover:text-white hover:bg-white/5'
                    }`}
                 >
                   {range.label}
                 </button>
               ))}
            </div>
         </motion.div>
      </div>

      {/* ─── RIGHT INTEL SIDEBAR: NODE DETAILS ─── */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div 
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            className="absolute right-6 top-6 bottom-6 w-[360px] z-[2000] bg-[#0D1526]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-4xl flex flex-col overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-cyan-dark/10 to-transparent">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-dark/20 flex items-center justify-center text-cyan-dark"><Target size={24} /></div>
                <button onClick={() => setSelectedPoint(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><ChevronRight size={16} className="text-[#64748B]" /></button>
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight font-['Outfit',sans-serif] mb-2">{selectedPoint.city}</h2>
              <div className="flex items-center gap-3">
                <span className="bg-cyan-dark/10 text-cyan-dark border border-cyan-dark/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Sector Active</span>
              </div>
            </div>
            <div className="p-8 flex-1 overflow-y-auto space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl">
                     <span className="text-[8px] text-[#475569] font-black uppercase block mb-1">Local Incidence</span>
                     <span className="text-2xl font-black text-white tabular-nums">{selectedPoint.count}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                     <span className="text-[8px] text-[#475569] font-black uppercase block mb-1">Intensity Scan</span>
                     <span className={`text-2xl font-black tabular-nums ${selectedPoint.count > 12 ? 'text-red-500' : 'text-cyan-dark'}`}>
                       {Math.round(selectedPoint.count / 20 * 100)}%
                     </span>
                  </div>
               </div>
               <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4 font-mono text-[10px]">
                  <div className="flex justify-between"><span className="text-[#475569]">NODE LATITUDE</span> <span className="text-white">{selectedPoint.lat.toFixed(4)}</span></div>
                  <div className="flex justify-between"><span className="text-[#475569]">NODE LONGITUDE</span> <span className="text-white">{selectedPoint.lng.toFixed(4)}</span></div>
                  <div className="flex justify-between"><span className="text-[#475569]">PROTOCOL STATUS</span> <span className="text-emerald-500">ENCRYPTED</span></div>
               </div>
               <div className="space-y-4 pt-4">
                  <h3 className="text-[9px] font-black text-white uppercase tracking-widest">Intelligence Linked Vectors</h3>
                  {complaints.filter(c => c.city === selectedPoint.city).slice(0, 3).map(c => (
                    <div key={c._id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-cyan-dark/30 transition-all cursor-pointer group">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-white uppercase truncate">{c.categories?.[0]}</span>
                          <Zap size={10} className="text-amber-500" />
                       </div>
                       <span className="text-[8px] text-[#475569] font-bold font-mono group-hover:text-cyan-dark">{c.ref_no}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-8"><button className="w-full bg-cyan-dark text-dark-bg-sidebar font-black py-4 rounded-xl flex justify-center items-center gap-2 transition hover:brightness-110 uppercase tracking-widest text-[10px]">Execute Node Deep-Scan</button></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAP LAYER ─── */}
      <div className="flex-1 w-full relative z-[1]">
        <MapContainer 
          center={center} zoom={5} zoomControl={false}
          style={{ height: '100%', width: '100%', background: '#050812' }}
        >
          <TileLayer
            url={showSatellite ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ZoomControl position="bottomleft" />
          
          {/* Linkage Arcs */}
          {linkagePaths.map((pair, idx) => (
             <Polyline 
               key={idx} positions={[[pair[0].lat, pair[0].lng], [pair[1].lat, pair[1].lng]]}
               pathOptions={{ color: 'rgba(0, 212, 255, 0.4)', weight: 1, dashArray: '5, 10' }}
             />
          ))}

          {/* Jurisdictions Boundaries (Mock) */}
          {showJurisdictions && filteredData.slice(0, 5).map(p => (
            <Circle 
              key={`j-${p.city}`} center={[p.lat, p.lng]} radius={150000}
              pathOptions={{ color: 'rgba(255, 255, 255, 0.05)', fillColor: 'transparent', weight: 1 }}
            />
          ))}

          {/* Real Intelligence Nodes */}
          {filteredData.map((point) => {
            const isCritical = point.count > 15;
            const color = isCritical ? '239, 68, 68' : '0, 212, 255';
            
            const icon = L.divIcon({
              className: 'pulsing-marker',
              html: `
                <div style="--pulse-color: ${color}">
                  <div class="pulse-core" style="background: rgb(${color}); width: ${12 + (point.count * 0.5)}px; height: ${12 + (point.count * 0.5)}px">
                    <div class="pulse-ring"></div>
                    ${isCritical ? '<div class="flare-effect"></div>' : ''}
                  </div>
                </div>
              `,
              iconSize: [20, 20], iconAnchor: [10, 10]
            });

            return (
              <Marker
                key={point.city} position={[point.lat, point.lng]} icon={icon}
                eventHandlers={{ click: () => setSelectedPoint(point) }}
              >
                <Tooltip offset={[0, -10]} opacity={1} className="custom-tooltip">
                  <div className="flex flex-col bg-[#0D1526]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-22xl">
                    <span className="font-black text-[10px] uppercase tracking-widest">{point.city}</span>
                    <span className="text-[10px] font-black text-cyan-dark mt-0.5">{point.count} ACTIVE UNITS</span>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

          {/* Predicted Shadow Nodes */}
          {showPredictions && predictions.map((p, i) => {
             const icon = L.divIcon({
               className: 'pulsing-marker',
               html: `<div style="--pulse-color: 139, 92, 246"><div class="pulse-core shadow-lg" style="background: rgba(139, 92, 246, 0.4)"><div class="pulse-ring" style="animation-duration: 4s"></div></div></div>`,
               iconSize: [20, 20], iconAnchor: [10, 10]
             });
             return (
               <Marker key={`p-${i}`} position={[p.lat, p.lng]} icon={icon}>
                  <Tooltip offset={[0, -10]} opacity={1} className="custom-tooltip">
                    <div className="bg-purple-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-purple-500/30">
                       <span className="font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                          <Eye size={10} /> PROJECTED HOTSPOT
                       </span>
                    </div>
                  </Tooltip>
               </Marker>
             );
          })}
        </MapContainer>
      </div>

      {/* ─── SCANLINE EFFECT ─── */}
      <div className="absolute inset-0 pointer-events-none z-[10]">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,18,0.4)_100%)]"></div>
        <motion.div animate={{ top: ['-10%', '110%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-[1px] bg-cyan-dark/20 blur-[2px]" />
      </div>

      {/* ─── HUD ELEMENT: STATUS ─── */}
      <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-4">
        <div className="bg-[#0D1526]/80 backdrop-blur-md border border-white/5 py-2 px-4 rounded-full flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Neural Feed: Active</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest">India Central Node: OK</span>
        </div>
      </div>

    </div>
  );
};
