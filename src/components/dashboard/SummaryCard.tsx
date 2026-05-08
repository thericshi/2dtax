import React from 'react';
import { motion } from 'framer-motion';
import { TaxInputs, TaxResult } from '../../utils/TaxLogic';
import { Percentages } from '../../hooks/useTaxData';

interface SummaryCardProps {
  inputs: TaxInputs;
  results: TaxResult;
  percentages: Percentages;
}

export default function SummaryCard({ inputs, results, percentages }: SummaryCardProps) {
  const { fedPct, provPct, rrspPct, fhsaPct, cashPct, totalRetainedPct, cashTakeHome, totalTaxSaved } = percentages;

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08]">
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
        <div className="h-8 md:h-10 w-full flex rounded-2xl overflow-hidden bg-black/40 border border-white/5">
          <motion.div layout initial={false} animate={{ width: `${cashPct}%` }} transition={{ type: "spring", bounce: 0.15, duration: 0.8 }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 relative" />
          {inputs.rrsp > 0 && <motion.div layout initial={false} animate={{ width: `${rrspPct}%` }} transition={{ type: "spring", bounce: 0.15, duration: 0.8 }} className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border" />}
          {inputs.fhsa > 0 && <motion.div layout initial={false} animate={{ width: `${fhsaPct}%` }} transition={{ type: "spring", bounce: 0.15, duration: 0.8 }} className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border" />}
          <motion.div layout initial={false} animate={{ width: `${fedPct}%` }} transition={{ type: "spring", bounce: 0.15, duration: 0.8 }} className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-l border-black/20" />
          <motion.div layout initial={false} animate={{ width: `${provPct}%` }} transition={{ type: "spring", bounce: 0.15, duration: 0.8 }} className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-l border-black/20" />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-6 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Cash Retained</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(cashTakeHome).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{cashPct.toFixed(1)}%</p>
          </div>

          {inputs.rrsp > 0 && (
            <div className="space-y-1 border-l border-white/10 pl-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full border border-dashed border-emerald-400 bg-emerald-500/20" />
                <span className="font-bold text-white/50 text-xs uppercase tracking-wider">RRSP</span>
              </div>
              <p className="font-black text-xl text-white">${Math.round(inputs.rrsp).toLocaleString()}</p>
              <p className="font-medium text-white/40 text-sm">{rrspPct.toFixed(1)}%</p>
            </div>
          )}

          {inputs.fhsa > 0 && (
            <div className="space-y-1 border-l border-white/10 pl-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full border border-dashed border-emerald-400 bg-emerald-500/20" />
                <span className="font-bold text-white/50 text-xs uppercase tracking-wider">FHSA</span>
              </div>
              <p className="font-black text-xl text-white">${Math.round(inputs.fhsa).toLocaleString()}</p>
              <p className="font-medium text-white/40 text-sm">{fhsaPct.toFixed(1)}%</p>
            </div>
          )}

          <div className="space-y-1 border-l border-white/10 pl-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Federal</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(results.federal).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{fedPct.toFixed(1)}%</p>
          </div>

          <div className="space-y-1 border-l border-white/10 pl-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Provincial</span>
            </div>
            <p className="font-black text-xl text-white">${Math.round(results.provincial).toLocaleString()}</p>
            <p className="font-medium text-white/40 text-sm">{provPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}