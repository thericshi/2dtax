import React, { useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxInputs, TaxResult } from '../../utils/TaxLogic';
import { Percentages } from '../../hooks/useTaxData';

interface SummaryCardProps {
  inputs: TaxInputs;
  results: TaxResult;
  percentages: Percentages;
}

function SummaryCard({ inputs, results, percentages }: SummaryCardProps) {
  const { fedPct, provPct, rrspPct, fhsaPct, cashPct, totalRetainedPct, cashTakeHome, totalTaxSaved } = percentages;

  const [enableStagger, setEnableStagger] = useState(true);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; title: string; desc: string }>({
    visible: false, x: 0, y: 0, title: '', desc: ''
  });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setEnableStagger(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent, title: string, desc: string, itemId: string) => {
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, title, desc });
    setHoveredItem(itemId);
  };
  
  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoveredItem(null);
  };

  const getOpacity = (itemId: string) => {
    if (!hoveredItem) return 1;
    return hoveredItem === itemId ? 1 : 0.4;
  };

  const getBarTransition = (index: number) => ({
    width: { duration: 0.5, delay: enableStagger ? index * 0.5 : 0, ease: "easeInOut" as const },
    boxShadow: { duration: 0.25, ease: "easeOut" as const },
    filter: { duration: 0.25, ease: "easeOut" as const },
    opacity: { duration: 0.25, ease: "easeOut" as const },
    default: { type: "spring" as const, stiffness: 400, damping: 20 }
  });

  const getLegendTransition = (index: number) => ({
    opacity: { duration: 0.5, delay: enableStagger ? index * 0.5 : 0, ease: "easeOut" as const },
    y: { duration: 0.5, delay: enableStagger ? index * 0.5 : 0, ease: "easeOut" as const },
    default: { duration: 0.3 }
  });

  let sequenceIdx = 0;
  const cashIdx = sequenceIdx++;
  const rrspIdx = inputs.rrsp > 0 ? sequenceIdx++ : -1;
  const fhsaIdx = inputs.fhsa > 0 ? sequenceIdx++ : -1;
  const fedIdx = sequenceIdx++;
  const provIdx = sequenceIdx++;

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] relative z-20">
      
      {createPortal(
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" as const }}
              className="fixed pointer-events-none z-[9999] bg-[#0f172a]/95 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl max-w-xs"
              style={{ left: tooltip.x, top: tooltip.y, x: '-50%', y: '-130%' }}
            >
              <div className="flex flex-col gap-1.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                   {tooltip.title.split(' ')[0]} {tooltip.title.split(' ')[1]}
                 </span>
                 <p className="text-white/80 text-xs leading-relaxed mt-1 border-t border-white/10 pt-2">
                   {tooltip.desc}
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Total Net Retained</p>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="text-5xl md:text-7xl leading-none font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              ${Math.round(results.takeHome).toLocaleString()}
            </div>
            {totalTaxSaved > 0 && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.15)] mt-2 md:mt-0">
                <span>★</span> +${Math.round(totalTaxSaved).toLocaleString()} Tax Saved
              </div>
            )}
          </div>
          <p className="font-medium text-white/50 text-base md:text-lg">
            You keep <span className="text-white font-black">{totalRetainedPct.toFixed(1)}%</span> of your <span className="text-white">${results.totalGrossIncome.toLocaleString()}</span> gross income.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-8 md:h-10 w-full flex rounded-2xl bg-black/40 border border-white/5 relative">
          <motion.div 
            layout initial={{ width: 0 }} 
            animate={{ 
               width: `${cashPct}%`, 
               opacity: getOpacity('cash'), 
               scale: hoveredItem === 'cash' ? 1.08 : 1, 
               zIndex: hoveredItem === 'cash' ? 40 : 10,
               filter: hoveredItem === 'cash' ? 'brightness(1.1)' : 'brightness(1)',
               borderRadius: hoveredItem === 'cash' ? '0.75rem' : '1rem 0px 0px 1rem',
               boxShadow: hoveredItem === 'cash' ? '0 10px 25px rgba(16,185,129,0.8)' : '0 0 15px rgba(16,185,129,0.5)'
            }} 
            transition={getBarTransition(cashIdx)} 
            className="h-full bg-emerald-500 cursor-pointer origin-center" 
            onMouseMove={(e) => handleMouseMove(e, 'Cash Retained', `$${Math.round(cashTakeHome).toLocaleString()} (${cashPct.toFixed(1)}%) of your gross income remains in your pocket as liquid cash.`, 'cash')}
            onMouseLeave={handleMouseLeave}
          />
          {inputs.rrsp > 0 && (
            <motion.div 
              layout initial={{ width: 0 }} 
              animate={{ 
                 width: `${rrspPct}%`, 
                 opacity: getOpacity('rrsp'), 
                 scale: hoveredItem === 'rrsp' ? 1.08 : 1, 
                 zIndex: hoveredItem === 'rrsp' ? 40 : 10,
                 filter: hoveredItem === 'rrsp' ? 'brightness(1.2)' : 'brightness(1)',
                 borderRadius: hoveredItem === 'rrsp' ? '0.75rem' : '0px',
                 boxShadow: hoveredItem === 'rrsp' ? '0 10px 25px rgba(16,185,129,0.5)' : 'none'
              }} 
              transition={getBarTransition(rrspIdx)} 
              className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border cursor-pointer origin-center" 
              onMouseMove={(e) => handleMouseMove(e, 'RRSP Retained', `$${Math.round(inputs.rrsp).toLocaleString()} (${rrspPct.toFixed(1)}%) is retained in your registered retirement account.`, 'rrsp')}
              onMouseLeave={handleMouseLeave}
            />
          )}
          {inputs.fhsa > 0 && (
            <motion.div 
              layout initial={{ width: 0 }} 
              animate={{ 
                 width: `${fhsaPct}%`, 
                 opacity: getOpacity('fhsa'), 
                 scale: hoveredItem === 'fhsa' ? 1.08 : 1, 
                 zIndex: hoveredItem === 'fhsa' ? 40 : 10,
                 filter: hoveredItem === 'fhsa' ? 'brightness(1.2)' : 'brightness(1)',
                 borderRadius: hoveredItem === 'fhsa' ? '0.75rem' : '0px',
                 boxShadow: hoveredItem === 'fhsa' ? '0 10px 25px rgba(16,185,129,0.5)' : 'none'
              }} 
              transition={getBarTransition(fhsaIdx)} 
              className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border cursor-pointer origin-center" 
              onMouseMove={(e) => handleMouseMove(e, 'FHSA Retained', `$${Math.round(inputs.fhsa).toLocaleString()} (${fhsaPct.toFixed(1)}%) is retained in your first home savings account.`, 'fhsa')}
              onMouseLeave={handleMouseLeave}
            />
          )}
          <motion.div 
            layout initial={{ width: 0 }} 
            animate={{ 
               width: `${fedPct}%`, 
               opacity: getOpacity('fed'), 
               scale: hoveredItem === 'fed' ? 1.08 : 1, 
               zIndex: hoveredItem === 'fed' ? 40 : 10,
               filter: hoveredItem === 'fed' ? 'brightness(1.1)' : 'brightness(1)',
               borderRadius: hoveredItem === 'fed' ? '0.75rem' : '0px',
               boxShadow: hoveredItem === 'fed' ? '0 10px 25px rgba(59,130,246,0.8)' : '0 0 15px rgba(59,130,246,0.5)'
            }} 
            transition={getBarTransition(fedIdx)} 
            className="h-full bg-blue-500 border-l border-black/20 cursor-pointer origin-center" 
            onMouseMove={(e) => handleMouseMove(e, 'Federal Tax', `$${Math.round(results.federal).toLocaleString()} (${fedPct.toFixed(1)}%) goes to the federal government.`, 'fed')}
            onMouseLeave={handleMouseLeave}
          />
          <motion.div 
            layout initial={{ width: 0 }} 
            animate={{ 
               width: `${provPct}%`, 
               opacity: getOpacity('prov'), 
               scale: hoveredItem === 'prov' ? 1.08 : 1, 
               zIndex: hoveredItem === 'prov' ? 40 : 10,
               filter: hoveredItem === 'prov' ? 'brightness(1.1)' : 'brightness(1)',
               borderRadius: hoveredItem === 'prov' ? '0.75rem' : '0px 1rem 1rem 0px',
               boxShadow: hoveredItem === 'prov' ? '0 10px 25px rgba(168,85,247,0.8)' : '0 0 15px rgba(168,85,247,0.5)'
            }} 
            transition={getBarTransition(provIdx)} 
            className="h-full bg-purple-500 border-l border-black/20 cursor-pointer origin-center" 
            onMouseMove={(e) => handleMouseMove(e, 'Provincial Tax', `$${Math.round(results.provincial).toLocaleString()} (${provPct.toFixed(1)}%) goes to your provincial government.`, 'prov')}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-6 pt-4">
          <motion.div 
             className="space-y-1 cursor-pointer transition-opacity duration-300"
             initial={{ opacity: 0, y: 15 }} animate={{ opacity: getOpacity('cash'), y: 0 }} transition={getLegendTransition(cashIdx)}
             onMouseMove={(e) => handleMouseMove(e, 'Cash Retained', `$${Math.round(cashTakeHome).toLocaleString()} (${cashPct.toFixed(1)}%) of your gross income remains in your pocket as liquid cash.`, 'cash')}
             onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Cash Retained</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(cashTakeHome).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{cashPct.toFixed(1)}%</p>
          </motion.div>

          {inputs.rrsp > 0 && (
            <motion.div 
               className="space-y-1 border-l border-white/10 pl-6 cursor-pointer transition-opacity duration-300"
               initial={{ opacity: 0, y: 15 }} animate={{ opacity: getOpacity('rrsp'), y: 0 }} transition={getLegendTransition(rrspIdx)}
               onMouseMove={(e) => handleMouseMove(e, 'RRSP Retained', `$${Math.round(inputs.rrsp).toLocaleString()} (${rrspPct.toFixed(1)}%) is retained in your registered retirement account.`, 'rrsp')}
               onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full border border-dashed border-emerald-400 bg-emerald-500/20" />
                <span className="font-bold text-white/50 text-xs uppercase tracking-wider">RRSP</span>
              </div>
              <p className="font-black text-xl text-white">${Math.round(inputs.rrsp).toLocaleString()}</p>
              <p className="font-medium text-white/40 text-sm">{rrspPct.toFixed(1)}%</p>
            </motion.div>
          )}

          {inputs.fhsa > 0 && (
            <motion.div 
               className="space-y-1 border-l border-white/10 pl-6 cursor-pointer transition-opacity duration-300"
               initial={{ opacity: 0, y: 15 }} animate={{ opacity: getOpacity('fhsa'), y: 0 }} transition={getLegendTransition(fhsaIdx)}
               onMouseMove={(e) => handleMouseMove(e, 'FHSA Retained', `$${Math.round(inputs.fhsa).toLocaleString()} (${fhsaPct.toFixed(1)}%) is retained in your first home savings account.`, 'fhsa')}
               onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full border border-dashed border-emerald-400 bg-emerald-500/20" />
                <span className="font-bold text-white/50 text-xs uppercase tracking-wider">FHSA</span>
              </div>
              <p className="font-black text-xl text-white">${Math.round(inputs.fhsa).toLocaleString()}</p>
              <p className="font-medium text-white/40 text-sm">{fhsaPct.toFixed(1)}%</p>
            </motion.div>
          )}

          <motion.div 
             className="space-y-1 border-l border-white/10 pl-6 cursor-pointer transition-opacity duration-300"
             initial={{ opacity: 0, y: 15 }} animate={{ opacity: getOpacity('fed'), y: 0 }} transition={getLegendTransition(fedIdx)}
             onMouseMove={(e) => handleMouseMove(e, 'Federal Tax', `$${Math.round(results.federal).toLocaleString()} (${fedPct.toFixed(1)}%) goes to the federal government.`, 'fed')}
             onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Federal</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(results.federal).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{fedPct.toFixed(1)}%</p>
          </motion.div>

          <motion.div 
             className="space-y-1 border-l border-white/10 pl-6 cursor-pointer transition-opacity duration-300"
             initial={{ opacity: 0, y: 15 }} animate={{ opacity: getOpacity('prov'), y: 0 }} transition={getLegendTransition(provIdx)}
             onMouseMove={(e) => handleMouseMove(e, 'Provincial Tax', `$${Math.round(results.provincial).toLocaleString()} (${provPct.toFixed(1)}%) goes to your provincial government.`, 'prov')}
             onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Provincial</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(results.provincial).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{provPct.toFixed(1)}%</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default memo(SummaryCard);