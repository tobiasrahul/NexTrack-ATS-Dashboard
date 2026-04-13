import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import type { Candidate, AlgorithmName } from '../lib/mockData';
import { BrainCircuit, Activity, ZoomIn, Trophy, Zap, ShieldCheck, Layers } from 'lucide-react';

interface AlgorithmDashboardProps {
  candidates: Candidate[];
}

const COLORS: Record<string, string> = {
  'Keyword Matching': '#B1A99C',
  'Cosine Similarity': '#C9F270',
  'S-BERT': '#B5D963',
  'GNN-SLM Hybrid': '#1A1A1A'
};

export const AlgorithmDashboard: React.FC<AlgorithmDashboardProps> = ({ candidates }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmName | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [rankingMetric, setRankingMetric] = useState<'accuracy' | 'processingSpeed' | 'contextAwareness' | 'reliability'>('accuracy');
  const deepDiveRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedAlgo && deepDiveRef.current) {
      setTimeout(() => {
        deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); 
    }
  }, [selectedAlgo]);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  // Radar/Bar Metrics are now completely dynamically bound to the current candidate's unique run length & overlap!
  const liveMetrics = activeCandidate ? activeCandidate.metrics : null;

  // Prepare data for Radar Chart
  const radarData = liveMetrics ? Object.keys(liveMetrics).map(key => {
    const algo = key as AlgorithmName;
    return {
      name: algo,
      Accuracy: liveMetrics[algo].accuracy,
      'Context Awareness': liveMetrics[algo].contextAwareness,
      Recall: liveMetrics[algo].recall,
      Speed: liveMetrics[algo].processingSpeed,
      Scalability: liveMetrics[algo].scalability
    };
  }) : [];

  const barData = liveMetrics ? Object.keys(liveMetrics).map(key => {
     const algo = key as AlgorithmName;
     return {
       name: algo,
       Accuracy: liveMetrics[algo].accuracy,
     };
  }) : [];

  const getRankedAlgos = () => {
    if (!liveMetrics) return [];
    return Object.keys(liveMetrics)
      .map(key => ({
        name: key as AlgorithmName,
        score: (liveMetrics as any)[key][rankingMetric]
      }))
      .sort((a, b) => b.score - a.score);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Radar Chart Component */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card"
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-sm font-black text-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
               Benchmarking
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="55%" data={radarData}>
                <PolarGrid stroke="#EDE5D8" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#1A1A1A', fontSize: 9, fontWeight: 800 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#D1C9BC' }} />
                <Radar name="Accuracy" dataKey="Accuracy" stroke="#C9F270" fill="#C9F270" fillOpacity={0.4} />
                <Radar name="Context" dataKey="Context Awareness" stroke="#1A1A1A" fill="#1A1A1A" fillOpacity={0.1} />
                <Radar name="Recall" dataKey="Recall" stroke="#B1A99C" fill="#B1A99C" fillOpacity={0.2} />
                <Radar name="Speed" dataKey="Speed" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} />
                <Radar name="Scalability" dataKey="Scalability" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.3} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 20 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#F7F3EE', borderColor: '#F0EBE3', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart Component */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card"
        >
          <div className="mb-8">
            <h3 className="text-sm font-black text-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              Accuracy Meta
            </h3>
            <p className="text-[10px] font-bold text-charcoal/30 mt-2 uppercase tracking-widest italic">Tap bar to explore logic</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#1A1A1A', fontSize: 9, fontWeight: 700 }} interval={0} angle={-20} textAnchor="end" dx={-5} dy={10} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#D1C9BC', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#F7F3EE'}} contentStyle={{ backgroundColor: '#F7F3EE', borderColor: '#F0EBE3', borderRadius: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                <Bar 
                  dataKey="Accuracy" 
                  radius={[12, 12, 12, 12]} 
                  onClick={(data) => setSelectedAlgo(data.name as AlgorithmName)}
                  className="cursor-pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as AlgorithmName || '']} 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* PERFORMANCE LEADERBOARD CARD */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-black text-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              Engine Ranking
            </h3>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex bg-charcoal/5 p-1 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'accuracy', label: 'Acc', icon: Activity },
              { id: 'processingSpeed', label: 'Speed', icon: Zap },
              { id: 'contextAwareness', label: 'Ctx', icon: Layers },
              { id: 'reliability', label: 'Rel', icon: ShieldCheck }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setRankingMetric(m.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap ${
                  rankingMetric === m.id 
                    ? 'bg-charcoal text-white shadow-xl scale-105' 
                    : 'text-charcoal/40 hover:bg-charcoal/10'
                }`}
              >
                <m.icon className={`w-3 h-3 ${rankingMetric === m.id ? 'text-primary' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {getRankedAlgos().map((algo, index) => (
                <motion.div
                  key={algo.name}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedAlgo(algo.name)}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[10px] font-black shrink-0 ${index === 0 ? 'text-primary' : 'text-charcoal/20'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-[10px] font-black text-charcoal uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                        {algo.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-charcoal/40 shrink-0">{algo.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-charcoal/5 rounded-full overflow-hidden p-[1px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${algo.score}%` }}
                      transition={{ duration: 1, ease: 'circOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[algo.name] }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="mt-8 pt-6 border-t border-charcoal/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-charcoal uppercase tracking-widest leading-none mb-1">Model Integrity</p>
                   <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest italic">Live simulation weights applied</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Deep-Dive Analysis Panel */}
      <AnimatePresence mode="wait">
        {selectedAlgo && candidates.length > 0 && (
          <motion.div
            key={selectedAlgo}
            ref={deepDiveRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bento-card !p-10 border-none !bg-charcoal text-white relative shadow-[0_30px_60px_rgba(26,26,26,0.2)]"
          >
            <div className="absolute top-8 right-8 flex items-center gap-4">
              <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Subject:</label>
                <select 
                  className="bg-transparent border-none text-white text-xs font-bold rounded-xl focus:ring-0 block p-1 outline-none cursor-pointer"
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id} className="text-charcoal">{c.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setSelectedAlgo(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary rotate-6">
                   <BrainCircuit className="w-7 h-7 text-charcoal" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white leading-none">
                  {selectedAlgo}
                </h2>
              </div>
              <p className="text-white/40 text-sm max-w-2xl font-medium leading-relaxed">
                {activeCandidate.deepDive[selectedAlgo].description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeCandidate.deepDive[selectedAlgo].steps.map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={idx} 
                  className="bg-white/5 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
                >
                  <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-3">{step.label}</div>
                  <div className="text-4xl font-black text-white mb-3">
                    {step.value}
                  </div>
                  <div className="text-xs text-white/40 font-medium leading-relaxed">
                    {step.detail}
                  </div>
                </motion.div>
              ))}
            </div>

            {activeCandidate.deepDive[selectedAlgo].visualization && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10"
              >
                {activeCandidate.deepDive[selectedAlgo].visualization?.type === 'keywords' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest">Keyword Overlap Mapping</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCandidate.deepDive[selectedAlgo].visualization.data.found.map((k: string) => (
                        <span key={k} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20 flex items-center gap-1.5">✓ {k}</span>
                      ))}
                      {activeCandidate.deepDive[selectedAlgo].visualization.data.missing.map((k: string) => (
                        <span key={k} className="px-3 py-1.5 rounded-full bg-white/5 text-white/30 text-xs font-bold border border-white/5 flex items-center gap-1.5">✕ {k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCandidate.deepDive[selectedAlgo].visualization?.type === 'vectors' && (
                  <div className="space-y-6 w-full">
                      <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest">Term Frequency-Inverse Document Frequency (TF-IDF)</h4>
                      
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 font-mono text-center flex flex-col items-center justify-center">
                        <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-2 font-sans font-black">Calculated Vector Equation</div>
                        <div className="text-primary tracking-widest font-bold">
                           {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).formula}
                        </div>
                        <div className="text-white mt-3 text-sm flex items-center gap-2">
                           <span className="text-white/30">≈</span> {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).dotProduct} <span className="text-white/30">/</span> ({(activeCandidate.deepDive[selectedAlgo].visualization.data as any).magnitudeDoc} × {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).magnitudeTarget})
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).terms.map((v: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="w-32 text-[11px] font-bold text-white/60 text-right uppercase tracking-wider truncate">{v.term}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${v.weight * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-white/40 rounded-full" />
                            </div>
                            <span className="w-12 text-xs font-bold text-white tracking-wider">{(v.weight).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                )}

                {activeCandidate.deepDive[selectedAlgo].visualization?.type === 'sentences' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">Semantic Transformer Pipeline</h4>
                    {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).map((pair: any, idx: number) => (
                       <div key={idx} className="p-8 rounded-[2rem] bg-[#222] border border-white/5 flex flex-col items-center gap-4 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          
                          <div className="flex w-full items-start justify-between text-center gap-4 relative z-10">
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] text-primary/60 font-black uppercase tracking-widest mb-3">Candidate Context</div>
                                <div className="text-xs text-white/90 font-medium italic">"{pair.candidateText}"</div>
                             </div>
                             
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-3">Role Requirement</div>
                                <div className="text-xs text-white/90 font-medium italic">"{pair.targetText}"</div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-center mt-2 relative z-10">
                             <div className="w-px h-6 bg-gradient-to-b from-white/20 to-white/0" />
                             <div className="text-[8px] bg-charcoal border border-white/10 px-4 py-1.5 rounded-full text-white/40 uppercase tracking-widest">Siamese BERT Encoder</div>
                             <div className="w-px h-6 bg-gradient-to-b from-white/0 to-white/20" />
                             
                             <div className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20 backdrop-blur-md">
                                {pair.poolSource}
                             </div>
                             
                             <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-primary/0" />
                             <div className="flex flex-col items-center justify-center p-3 rounded-full bg-primary text-charcoal shadow-[0_0_30px_rgba(201,242,112,0.2)] z-10 w-16 h-16 shrink-0 mt-1">
                                <span className="text-sm font-black leading-none">{Math.round(pair.similarity)}%</span>
                                <span className="text-[8px] text-charcoal/60 uppercase tracking-widest mt-1">Match</span>
                             </div>
                          </div>
                       </div>
                    ))}
                  </div>
                )}

                {activeCandidate.deepDive[selectedAlgo].visualization?.type === 'graph' && (
                  <div className="space-y-4">
                     <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">Simulated Graph Node Connectivity</h4>
                     <div className="w-full h-[350px] relative bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-inner">
                        {/* Background subtle grid */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkgIDxwYXRoIGQ9Ik0wIDBINDBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
                        
                        <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                           <defs>
                              <filter id="glow">
                                 <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                 <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                 </feMerge>
                              </filter>
                           </defs>
                           {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).nodes.slice(1).map((_: any, i: number) => {
                               const childNodes = (activeCandidate.deepDive[selectedAlgo].visualization.data as any).nodes.slice(1);
                               const count = childNodes.length;
                               // Add larger horizontal margin for better spacing
                               const margin = 120;
                               const availableWidth = 800 - (margin * 2);
                               const spacing = availableWidth / (count > 1 ? count - 1 : 1);
                               const startX = 400;
                               const startY = 40;
                               
                               const endX = count > 1 ? margin + (spacing * i) : 400;
                               // 3-Tier Stagger: top, mid, bottom - moved up significantly
                               const tier = i % 3;
                               const endY = 230 + (tier * 35); 
                               
                               const strength = (activeCandidate.deepDive[selectedAlgo].visualization?.data as any).edges[i]?.strength || 0.5;
                               const opacity = 0.05 + (strength * 0.8);
                               
                               return (
                                 <g key={i}>
                                    <motion.path 
                                       initial={{ pathLength: 0, opacity: 0 }}
                                       animate={{ pathLength: 1, opacity: opacity }}
                                       transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
                                       d={`M ${startX} ${startY} C ${startX} ${(startY+endY)/2}, ${endX} ${(startY+endY)/2}, ${endX} ${endY}`}
                                       fill="none"
                                       stroke="rgba(201,242,112,1)"
                                       strokeWidth={1.5 + strength * 2.5}
                                       strokeDasharray="4 4"
                                       filter="url(#glow)"
                                    />
                                    <motion.circle
                                       r="2"
                                       fill="#C9F270"
                                       animate={{
                                          offsetDistance: ["0%", "100%"]
                                       }}
                                       transition={{
                                          duration: 3 + Math.random() * 2,
                                          repeat: Infinity,
                                          ease: "linear",
                                          delay: i * 0.5
                                       }}
                                       style={{ offsetPath: `path("M ${startX} ${startY} C ${startX} ${(startY+endY)/2}, ${endX} ${(startY+endY)/2}, ${endX} ${endY}")` as any }}
                                    />
                                    <rect x={(startX+endX)/2 - 18} y={(startY+endY)/2 - 9} width="36" height="18" rx="9" fill="#1A1A1A" stroke="rgba(201,242,112,0.1)" strokeWidth="0.5" />
                                    <text x={(startX+endX)/2} y={(startY+endY)/2 + 3} fill="rgba(201,242,112,0.6)" fontSize="9" fontWeight="900" textAnchor="middle" style={{ fontFamily: 'monospace' }}>
                                       {Math.round(strength * 100)}%
                                    </text>
                                 </g>
                               )
                           })}
                        </svg>

                        {/* ROOT NODE */}
                        <div className="absolute top-[12%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 text-center">
                           <div className="text-[10px] text-white/20 tracking-widest uppercase font-black mb-3">Central Neural Job-Node</div>
                           <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="px-10 py-4 rounded-[2rem] bg-primary text-charcoal font-black border-[6px] border-charcoal shadow-[0_20px_50px_rgba(201,242,112,0.3)] relative overflow-hidden group"
                           >
                               <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                               {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).nodes[0].label}
                           </motion.div>
                        </div>

                        {/* CHILD NODES */}
                        {(activeCandidate.deepDive[selectedAlgo].visualization.data as any).nodes.slice(1).map((n: any, i: number) => {
                             const childNodes = (activeCandidate.deepDive[selectedAlgo].visualization.data as any).nodes.slice(1);
                             const count = childNodes.length;
                             const margin = 120;
                             const availableWidth = 800 - (margin * 2);
                             const spacing = availableWidth / (count > 1 ? count - 1 : 1);
                             const endX = count > 1 ? margin + (spacing * i) : 400;
                             
                             const leftPercent = (endX / 800) * 100;
                             const tier = i % 3;
                             const topPercent = ( (230 + (tier * 35)) / 400 ) * 100;
                             
                             return (
                               <motion.div 
                                  initial={{ opacity: 0, scale: 0.5 }} 
                                  animate={{ opacity: 1, scale: 1 }} 
                                  whileHover={{ y: -5 }}
                                  transition={{ delay: 0.8 + i * 0.1 }}
                                  key={n.id} 
                                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center z-10" 
                                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                               >
                                  <div className="group cursor-pointer flex flex-col items-center">
                                     <div className="px-5 py-2.5 rounded-full bg-charcoal border border-white/5 text-white text-[10px] font-black tracking-tight shadow-[0_15px_35px_rgba(0,0,0,0.8)] group-hover:border-primary group-hover:text-primary transition-all duration-300 whitespace-nowrap">
                                        {n.label}
                                     </div>
                                     <div className="mt-1 text-[7px] text-white/20 uppercase font-black tracking-widest group-hover:text-primary/40 transition-colors">Neural Node</div>
                                  </div>
                               </motion.div>
                             );
                        })}
                     </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="mt-12 pt-10 border-t border-white/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Calculated Reliability</span>
                <span className="text-3xl font-black text-white flex items-center gap-3">
                  {activeCandidate.deepDive[selectedAlgo].score}%
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Weighted</span>
                </span>
              </div>
              <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${activeCandidate.deepDive[selectedAlgo].score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-primary"
                />
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
      {!selectedAlgo && candidates.length > 0 && (
         <div className="flex items-center justify-center p-12 text-charcoal/40 bento-card border-dashed bg-transparent border-charcoal/20">
            <ZoomIn className="w-5 h-5 mr-3 opacity-50" /> 
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Select analysis vector to explore model logic</span>
         </div>
      )}

      {candidates.length === 0 && (
         <div className="h-64 flex flex-col items-center justify-center bento-card border-dashed bg-transparent border-charcoal/20">
            <Activity className="w-16 h-16 text-charcoal/30 mb-4" />
            <h3 className="text-xl font-black text-charcoal/60">Data Inactive</h3>
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mt-3">
               Awaiting document uploads for deep analysis
            </p>
         </div>
      )}
    </div>
  );
};
