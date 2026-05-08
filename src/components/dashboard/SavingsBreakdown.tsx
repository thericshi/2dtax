import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SavingsBreakdownItem } from '../../hooks/useTaxData';

interface SavingsBreakdownProps {
  data: SavingsBreakdownItem[];
  actualTax: number;
  totalSaved: number;
}

export default function SavingsBreakdown({ data, actualTax, totalSaved }: SavingsBreakdownProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // The total theoretical tax bill if NO deductions were claimed
  const baseTax = actualTax + totalSaved;
  
  // Prevent division by zero if income is 0
  const safeBaseTax = baseTax > 0 ? baseTax : 1;
  const safeTotalSaved = totalSaved > 0 ? totalSaved : 1;

  return (
     <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] flex flex-col">
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
                   {/* Single Composition Bar */}
                   <div className="h-10 md:h-12 w-full flex rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative">
                      
                      {/* Left: The Actual Tax You Still Pay (Gray) */}
                      <motion.div
                        layout initial={false}
                        animate={{ width: `${(actualTax / safeBaseTax) * 100}%` }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                        className="h-full bg-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.5)] z-10 relative"
                      />
                      
                      {/* Right: The Breakdown of Tax Avoided (Colored) */}
                      {data.map((item, idx) => (
                         <motion.div
                           key={idx}
                           layout initial={false}
                           animate={{ width: `${(item.amount / safeBaseTax) * 100}%` }}
                           transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                           className="h-full border-l border-black/20"
                           style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}80` }}
                         />
                      ))}
                   </div>

                   {/* Composition Legend */}
                   <div className="flex flex-wrap gap-x-8 gap-y-6">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.8)]" />
                           <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Remaining Tax</span>
                        </div>
                        <p className="font-black text-xl text-white">${Math.round(actualTax).toLocaleString()}</p>
                        <p className="font-medium text-white/40 text-sm">{((actualTax / safeBaseTax) * 100).toFixed(1)}%</p>
                     </div>
                     
                     {data.map((item, idx) => (
                        <div key={idx} className="space-y-1 border-l border-white/10 pl-6">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">{item.category}</span>
                           </div>
                           <p className="font-black text-xl text-white">+${Math.round(item.amount).toLocaleString()}</p>
                           <p className="font-medium text-white/40 text-sm">{((item.amount / safeBaseTax) * 100).toFixed(1)}%</p>
                        </div>
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
                              <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
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