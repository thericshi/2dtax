import React, { useState, useCallback, useDeferredValue, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaxData } from './hooks/useTaxData';
import { TaxInputs, ProvinceCode } from './utils/TaxLogic';
import ControlsPanel from './components/dashboard/ControlsPanel';
import SummaryCard from './components/dashboard/SummaryCard';
import TaxChart from './components/dashboard/TaxChart';
import SavingsBreakdown from './components/dashboard/SavingsBreakdown';

export default function App() {
  const [province, setProvince] = useState<ProvinceCode>('');
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isSummaryInView, setIsSummaryInView] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // State for the new Mobile Edit Overlay
  const [activeEdit, setActiveEdit] = useState<{key: keyof TaxInputs, label: string} | null>(null);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputs, setInputs] = useState<TaxInputs>({
    employment: 90000,
    capitalGains: 0,
    capitalLoss: 0,
    eligibleDividends: 0,
    ineligibleDividends: 0,
    rrsp: 0,
    fhsa: 0,
    movingExpenses: 0,
    medicalExpenses: 0,
    tuition: 0,
    tuitionCarryForward: 0,
    donations: 0
  });

  const updateInput = useCallback((key: keyof TaxInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const deferredInputs = useDeferredValue(inputs);
  const deferredProvince = useDeferredValue(province);

  const { results, percentages, progressionData, savingsBreakdown } = useTaxData(deferredInputs, deferredProvince);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('summary-section');
      if (el) {
        setIsSummaryInView(el.getBoundingClientRect().top < window.innerHeight * 0.4);
      }

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const handleJump = () => {
    if (isSummaryInView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('summary-section');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isScrolling && inputs.employment > 0 && province !== '' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={handleJump}
            className="xl:hidden fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.4)] text-white focus:outline-none transition-transform active:scale-95"
          >
            {isSummaryInView ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* MOBILE EDIT OVERLAY */}
      <AnimatePresence>
        {activeEdit && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[99999] bg-[#0f172a]/90 backdrop-blur-2xl flex flex-col xl:hidden"
          >
             {/* Translucent floating top part */}
             <div className="bg-white/[0.03] border-b border-white/10 p-6 pt-12 shadow-2xl relative z-20 backdrop-blur-3xl">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{activeEdit.label}</span>
                   <button onClick={() => setActiveEdit(null)} className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-5 py-2 rounded-full active:scale-95 transition-transform">Done</button>
                </div>
                <div className="flex items-end text-6xl font-black tracking-tighter text-white">
                   <span className="opacity-30 mr-2 pb-1 text-4xl">$</span>
                   <input
                     autoFocus
                     type="text"
                     inputMode="numeric"
                     value={inputs[activeEdit.key] === 0 ? '' : inputs[activeEdit.key].toLocaleString('en-US')}
                     onChange={(e) => {
                       const digitsOnly = e.target.value.replace(/\D/g, '');
                       updateInput(activeEdit.key, Number(digitsOnly.slice(0, 12)));
                     }}
                     className="w-full bg-transparent outline-none p-0 m-0 leading-none placeholder:text-white/10"
                     placeholder="0"
                   />
                </div>
                <div className="mt-6 flex items-center justify-between text-sm bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
                   <span className="text-white/50 font-medium">Net Take Home:</span>
                   <span className="text-emerald-400 font-black text-lg">${Math.round(results.takeHome).toLocaleString()}</span>
                </div>
             </div>

             {/* Bottom/bg shows the charts */}
             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 opacity-60">
                <TaxChart progressionData={progressionData} inputs={deferredInputs} results={results} />
                <SummaryCard inputs={deferredInputs} results={results} percentages={percentages} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full font-sans flex items-start justify-center p-4 md:p-8 lg:p-12 relative transform-gpu overflow-x-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,transparent_60%)]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)]"></div>
        </div>

        <div className="max-w-[90rem] w-full mx-auto flex flex-col xl:flex-row relative z-10 xl:gap-10">

          <motion.div layout className="xl:hidden sticky top-4 z-40 w-full bg-[#0f172a]/80 backdrop-blur-2xl rounded-[1.5rem] p-4 shadow-2xl border border-white/10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsControlsOpen(!isControlsOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isControlsOpen ? (
                     <>
                       <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                       <line x1="9" y1="3" x2="9" y2="21"></line>
                     </>
                  ) : (
                     <>
                       <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                       <line x1="9" y1="3" x2="9" y2="21"></line>
                       <line x1="15" y1="9" x2="15" y2="15"></line>
                     </>
                  )}
                </svg>
              </button>
              <span className="font-black text-white text-lg tracking-tight">Tax Planner</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Take Home</p>
              <p className="text-base font-black text-emerald-400 leading-none">${Math.round(results.takeHome).toLocaleString()}</p>
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {isControlsOpen && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, width: 0, height: 0 }}
                animate={{ opacity: 1, width: "100%", height: "auto" }}
                exit={{ opacity: 0, width: 0, height: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="xl:max-w-[420px] w-full shrink-0 overflow-hidden"
              >
                <div className="w-full xl:w-[420px] flex flex-col space-y-8 pb-8 xl:pb-0">
                  <div className="hidden xl:block">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-sm">
                      Tax Planner
                    </h1>
                    <p className="text-white/50 text-lg font-medium leading-relaxed">
                      Understand your exact 2025 tax obligations and take-home pay with precision.
                    </p>
                  </div>

                  <ControlsPanel 
                    inputs={inputs} 
                    updateInput={updateInput} 
                    province={province} 
                    setProvince={setProvince} 
                    onMobileEdit={(key, label) => setActiveEdit({ key, label })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="flex-1 w-full min-w-0 flex flex-col space-y-6 xl:space-y-8">
            
            <motion.div layout className="hidden xl:flex w-full bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsControlsOpen(!isControlsOpen)}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 group"
                  title={isControlsOpen ? "Hide Controls" : "Show Controls"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                </button>

                <AnimatePresence>
                  {!isControlsOpen && (
                    <motion.h2
                      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -20, filter: "blur(4px)", position: "absolute" }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-black text-white tracking-tight drop-shadow-sm whitespace-nowrap"
                    >
                      Tax Planner
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-0.5">Net Take Home</p>
                <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)] leading-none">
                  ${Math.round(results.takeHome).toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div layout id="summary-section">
              <SummaryCard 
                inputs={deferredInputs} 
                results={results} 
                percentages={percentages} 
              />
            </motion.div>

            <motion.div layout>
              <SavingsBreakdown 
                data={savingsBreakdown}
                actualTax={results.totalTax}
                totalSaved={percentages.totalTaxSaved}
              />
            </motion.div>

            <motion.div layout className="flex-1 flex flex-col">
              <TaxChart 
                progressionData={progressionData} 
                inputs={deferredInputs} 
                results={results} 
              />
            </motion.div>

          </motion.div>

        </div>
      </div>
    </>
  );
}