import React from 'react';
import { motion } from 'framer-motion';
import type { Candidate } from '../lib/mockData';
import { UserCircle, Briefcase, Award } from 'lucide-react';

interface LeaderboardProps {
  candidates: Candidate[];
}

const CircularProgress = ({ value, size = 60 }: { value: number, size?: number }) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="stroke-[#EDE5D8]"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="stroke-primary"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-sm font-black text-charcoal">{value}</span>
      </div>
    </div>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ candidates }) => {
  const sorted = [...candidates].sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
  });

  if (candidates.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bento-card border-dashed bg-transparent border-charcoal/10">
        <UserCircle className="w-16 h-16 text-charcoal/10 mb-4" />
        <h3 className="text-xl font-black text-charcoal/20">Waiting for Data</h3>
        <p className="text-[10px] font-bold text-charcoal/10 uppercase tracking-[0.2em] mt-3">
          Upload resumes to begin analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sorted.map((candidate, idx) => (
        <motion.div
          key={candidate.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bento-card group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          {idx === 0 && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          )}
          
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-sand-50 text-xl font-black text-charcoal/20 border border-sand-100">
            {idx + 1}
          </div>

          <div className="flex-shrink-0">
            <CircularProgress value={candidate.finalScore} size={80} />
            <div className="text-[9px] text-center mt-2 text-charcoal/30 uppercase tracking-[0.2em] font-black">Score</div>
          </div>

          <div className="flex-grow w-full">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-6">
              <div>
                <h3 className="text-2xl font-black text-charcoal flex items-center gap-3">
                  {candidate.name}
                  {idx === 0 && <Award className="w-6 h-6 text-primary drop-shadow-[0_4px_10px_rgba(201,242,112,0.5)]" />}
                </h3>
                <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest flex items-center gap-2 mt-2">
                  <Briefcase className="w-4 h-4" /> {candidate.fileName}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end max-w-md">
                {candidate.topSkills.map(skill => (
                  <span key={skill} className="text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-sand-50 text-charcoal border border-sand-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-5 bg-sand-50 rounded-[1.5rem] border border-sand-100 text-sm text-charcoal/60 leading-relaxed font-medium transition-colors group-hover:bg-card group-hover:border-primary/30">
              <span className="font-black text-charcoal text-[10px] uppercase tracking-[0.2em] block mb-2 flex items-center gap-2 opacity-30">
                 <UserCircle className="w-3.5 h-3.5" /> AI Rationale
              </span>
              {candidate.explanation}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
