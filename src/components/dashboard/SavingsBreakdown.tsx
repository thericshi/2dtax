import React, { useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SavingsBreakdownItem } from '../../hooks/useTaxData';

interface SavingsBreakdownProps {
  data: SavingsBreakdownItem[];
  actualTax: number;
  totalSaved: number;
}

const SAVINGS_DESCRIPTIONS: Record<string, string> = {
  'RRSP': 'deductions reduce income taxed at your top marginal bracket.',
  'FHSA': 'contributions are fully tax-deductible, reducing your top-bracket taxable income.',
  'Moving Exp.': 'eligible moving expenses directly reduce your net taxable income.',
  'Medical Exp.': 'medical expenses provide a non-refundable credit to reduce your final tax bill.',
  'Tuition': 'tuition amounts provide a non-refundable tax credit, applied at the lowest bracket rate.',
  'Donations': 'charitable donations provide a non-refundable credit, often calculated at the highest tax rates.',
  'Capital Loss': 'capital losses directly offset your capital gains before the inclusion rate is applied.'
};

function SavingsBreakdown({ data, actualTax, totalSaved }: SavingsBreakdownProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
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

  const baseTax = actualTax + totalSaved;
  const safeBaseTax = baseTax > 0 ? baseTax : 1;
  const safeTotalSaved = totalSaved > 0 ? totalSaved : 1;

  const getOpacity = (itemId: string) => {
    if (!hoveredItem) return 1;
    return hoveredItem === itemId ? 1 : 0.4;
  };

  // Fixed TS Types with `as const`, and added smooth tweens for colors/shadows
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

  return (
     <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] flex flex-col relative z-20">
        
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
                     {tooltip.title.split('(')[0]}
                   </span>
                   {tooltip.title.includes('Saved') && (
                     <span className="text-xl font-black text-white">
                        {tooltip.title.split('(')[1].replace(')', '')}
                     </span>
                   )}
                   <p className="text-white/60 text-xs leading-relaxed mt-1 border-t border-white/10 pt-2">
                     {tooltip.desc}
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
           <div>
             <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Tax Savings Composition</p>
             <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                ${Math.round(totalSaved).toLocaleString()} <span className="text-white/80 font-bold text-xl">Total Saved</span>
             </p>
           </div>
           <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
             <button onClick={() => setViewMode('chart')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'chart' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Composition Bar</button>
             <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Data Table</button>
           </div>
        </div>

        <div className="flex-1 w-full">
           {viewMode === 'chart' ? (
               <div className="space-y-8">
                   <div className="h-10 md:h-12 w-full flex rounded-2xl bg-black/40 border border-white/5 relative">
                      <motion.div
                        layout
                        initial={{ width: 0 }}
                        animate={{ 
                           width: `${(actualTax / safeBaseTax) * 100}%`,
                           opacity: getOpacity('remaining'),
                           filter: hoveredItem === 'remaining' ? 'brightness(1.2)' : 'brightness(1)',
                           scale: hoveredItem === 'remaining' ? 1.08 : 1,
                           zIndex: hoveredItem === 'remaining' ? 40 : 10,
                           borderRadius: hoveredItem === 'remaining' ? '0.75rem' : (data.length === 0 ? '1rem' : '1rem 0px 0px 1rem'),
                           boxShadow: hoveredItem === 'remaining' ? '0 10px 25px rgba(100,116,139,0.8)' : '0 0 15px rgba(100,116,139,0.5)'
                        }}
                        transition={getBarTransition(0)}
                        className="h-full bg-slate-500 cursor-pointer origin-center"
                        onMouseMove={(e) => handleMouseMove(e, 'Remaining Tax', 'This is your final tax bill after all deductions and credits have been applied.', 'remaining')}
                        onMouseLeave={handleMouseLeave}
                      />
                      {data.map((item, idx) => (
                         <motion.div
                           key={idx}
                           layout
                           initial={{ width: 0 }}
                           animate={{ 
                              width: `${(item.amount / safeBaseTax) * 100}%`,
                              opacity: getOpacity(item.category),
                              filter: hoveredItem === item.category ? 'brightness(1.2)' : 'brightness(1)',
                              scale: hoveredItem === item.category ? 1.08 : 1,
                              zIndex: hoveredItem === item.category ? 40 : 10,
                              borderRadius: hoveredItem === item.category 
                                 ? '0.75rem' 
                                 : (idx === data.length - 1 ? '0px 1rem 1rem 0px' : '0px'),
                              boxShadow: hoveredItem === item.category ? `0 10px 25px ${item.color}` : `0 0 15px ${item.color}80`
                           }}
                           transition={getBarTransition(idx + 1)}
                           className="h-full border-l border-black/20 cursor-pointer origin-center"
                           style={{ backgroundColor: item.color }}
                           onMouseMove={(e) => handleMouseMove(e, `${item.category} (Saved $${Math.round(item.amount).toLocaleString()})`, `Because ${SAVINGS_DESCRIPTIONS[item.category] || 'it optimizes your tax obligations.'}`, item.category)}
                           onMouseLeave={handleMouseLeave}
                         />
                      ))}
                   </div>

                   <div className="flex flex-wrap gap-x-8 gap-y-6">
                     <motion.div 
                        className="space-y-1 cursor-pointer transition-opacity duration-300"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: getOpacity('remaining'), y: 0 }}
                        transition={getLegendTransition(0)}
                        onMouseMove={(e) => handleMouseMove(e, 'Remaining Tax', 'This is your final tax bill after all deductions and credits have been applied.', 'remaining')}
                        onMouseLeave={handleMouseLeave}
                     >
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.8)]" />
                           <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Remaining Tax</span>
                        </div>
                        <p className="font-black text-xl text-white">${Math.round(actualTax).toLocaleString()}</p>
                        <p className="font-medium text-white/40 text-sm">{((actualTax / safeBaseTax) * 100).toFixed(1)}%</p>
                     </motion.div>
                     
                     {data.map((item, idx) => (
                        <motion.div 
                           key={idx} 
                           className="space-y-1 border-l border-white/10 pl-6 cursor-pointer transition-opacity duration-300"
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: getOpacity(item.category), y: 0 }}
                           transition={getLegendTransition(idx + 1)}
                           onMouseMove={(e) => handleMouseMove(e, `${item.category} (Saved $${Math.round(item.amount).toLocaleString()})`, `Because ${SAVINGS_DESCRIPTIONS[item.category] || 'it optimizes your tax obligations.'}`, item.category)}
                           onMouseLeave={handleMouseLeave}
                        >
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">{item.category}</span>
                           </div>
                           <p className="font-black text-xl text-white">+${Math.round(item.amount).toLocaleString()}</p>
                           <p className="font-medium text-white/40 text-sm">{((item.amount / safeBaseTax) * 100).toFixed(1)}%</p>
                        </motion.div>
                     ))}
                   </div>
               </div>
           ) : (
               <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md mt-2">
                  <table className="w-full text-left text-sm text-white/80 whitespace-nowrap">
                     <thead className="bg-white/[0.03] border-b border-white/10 text-xs uppercase font-bold text-white/50 tracking-wider">
                        <tr>
                           <th className="px-6 py-4">Deduction / Credit</th>
                           <th className="px-6 py-4 text-right">Tax Dollars Saved</th>
                           <th className="px-6 py-4 text-right">Proportion of Saved</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data.length > 0 ? (
                           data.map((item, idx) => (
                              <tr 
                                key={idx} 
                                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                                style={{ opacity: getOpacity(item.category) }}
                                onMouseMove={(e) => handleMouseMove(e, `${item.category} (Saved $${Math.round(item.amount).toLocaleString()})`, `Because ${SAVINGS_DESCRIPTIONS[item.category] || 'it optimizes your tax obligations.'}`, item.category)}
                                onMouseLeave={handleMouseLeave}
                              >
                                 <td className="px-6 py-4 font-bold flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-white">{item.category}</span>
                                 </td>
                                 <td className="px-6 py-4 text-right font-black text-emerald-400 text-base">
                                    +${Math.round(item.amount).toLocaleString()}
                                 </td>
                                 <td className="px-6 py-4 text-right font-semibold text-white/60">
                                    {((item.amount / safeTotalSaved) * 100).toFixed(1)}%
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-white/40 italic">
                                 No deductions or credits currently active.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
           )}
        </div>
     </div>
  );
}

export default memo(SavingsBreakdown);