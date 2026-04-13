import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Navigation, BarChart3, Users, User, ArrowRight, Settings2 } from 'lucide-react';
import { UploadArea } from './components/UploadArea';
import { Leaderboard } from './components/Leaderboard';
import { AlgorithmDashboard } from './components/AlgorithmDashboard';
import { processCandidate } from './lib/resumeParser';
import type { Candidate } from './lib/mockData';
import { cn } from './lib/utils';

type AppMode = 'individual' | 'company';
type Tab = 'dashboard' | 'algorithms';

function App() {
  const [mode, setMode] = useState<AppMode>('company');
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxFiles = mode === 'individual' ? 1 : 20;

  const handleUpload = async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      const newCandidates = await Promise.all(
        files.map(f => processCandidate(f, jobRole))
      );
      
      if (mode === 'individual') {
         setCandidates(newCandidates);
      } else {
         setCandidates(prev => {
            const combined = [...prev, ...newCandidates];
            return combined.slice(0, 20);
         });
      }
    } catch (err) {
      console.error("Failed to parse documents:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative p-4 lg:p-12 flex justify-center selection:bg-primary/30">
      {/* Organic Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl w-full">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-charcoal flex items-center justify-center shadow-xl rotate-3">
              <Bot className="w-9 h-9 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-charcoal tracking-tight">NexTrack</h1>
              <p className="text-xs font-bold text-charcoal/40 uppercase tracking-[0.2em] mt-1">Intelligence ATS</p>
            </div>
          </div>
          
          {/* Mode Toggle - Pill Style */}
          <div className="bg-sand-100 flex items-center p-1.5 rounded-full border border-card shadow-sm">
            <button 
              onClick={() => { setMode('company'); setCandidates([]); }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500",
                mode === 'company' ? "pill-active" : "text-charcoal/40 hover:text-charcoal"
              )}
            >
              <Users className="w-4 h-4" /> B2B / Enterprise
            </button>
            <button 
              onClick={() => { setMode('individual'); setCandidates([]); }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500",
                mode === 'individual' ? "pill-active" : "text-charcoal/40 hover:text-charcoal"
              )}
            >
              <User className="w-4 h-4" /> Individual
            </button>
          </div>
        </header>

        {/* Global Controls - Bento Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {mode === 'company' && (
            <div className="bento-card">
              <label className="text-xs font-extrabold uppercase tracking-widest text-[#1A1A1A]/30 mb-4 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" /> Evaluating Entity
              </label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-sand-50 border-none text-[#1A1A1A] text-xl rounded-3xl focus:ring-4 focus:ring-primary/20 block px-6 py-5 outline-none transition-all placeholder:text-[#1A1A1A]/20 font-bold"
                placeholder="e.g. Google"
              />
            </div>
          )}

          <div className={cn("bento-card", mode === 'individual' && "md:col-span-2")}>
            <label className="text-xs font-extrabold uppercase tracking-widest text-[#1A1A1A]/30 mb-4 flex items-center gap-2">
               Target Job Role
            </label>
            <input 
              type="text" 
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full bg-sand-50 border-none text-[#1A1A1A] text-xl rounded-3xl focus:ring-4 focus:ring-primary/20 block px-6 py-5 outline-none transition-all placeholder:text-[#1A1A1A]/20 font-bold"
              placeholder="e.g. Frontend Engineer"
            />
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-12 flex flex-col gap-10">
            <nav className="flex gap-2 p-2 bg-sand-100 rounded-full border border-card w-fit">
               <button 
                 onClick={() => setActiveTab('dashboard')}
                 className={cn(
                   "flex items-center gap-2 px-7 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-500",
                   activeTab === 'dashboard' ? "pill-active" : "text-charcoal/40 hover:text-charcoal"
                 )}
               >
                 <Navigation className="w-4 h-4" /> {mode === 'company' ? 'Pipeline' : 'Application'}
               </button>
               <button 
                 onClick={() => setActiveTab('algorithms')}
                 className={cn(
                   "flex items-center gap-2 px-7 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-500",
                   activeTab === 'algorithms' ? "pill-active" : "text-charcoal/40 hover:text-charcoal"
                 )}
               >
                 <BarChart3 className="w-4 h-4" /> Algorithms
               </button>
            </nav>

            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
            >
               {activeTab === 'dashboard' ? (
                 <div className="space-y-8">
                    <div className="bento-card bg-primary shadow-[0_20px_50px_rgba(201,242,112,0.3)] border-none">
                      <h2 className="text-2xl font-black text-charcoal mb-6 flex items-center gap-3">
                        <ArrowRight className="w-6 h-6" /> Upload Documents
                      </h2>
                      <UploadArea onUpload={handleUpload} maxFiles={maxFiles} />
                    </div>
                    <div>
                       {isProcessing ? (
                         <div className="h-48 flex items-center justify-center space-x-2 animate-pulse">
                           <div className="w-4 h-4 rounded-full bg-primary/50"></div>
                           <div className="w-4 h-4 rounded-full bg-primary/70"></div>
                           <div className="w-4 h-4 rounded-full bg-primary"></div>
                         </div>
                       ) : (
                         <Leaderboard candidates={candidates} />
                       )}
                    </div>
                 </div>
               ) : (
                 <AlgorithmDashboard candidates={candidates} />
               )}
            </motion.div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default App;
