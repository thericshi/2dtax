import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubInput from '../ui/SubInput';
import { TaxInputs, ProvinceCode } from '../../utils/TaxLogic';

interface ControlsPanelProps {
  inputs: TaxInputs;
  updateInput: (key: keyof TaxInputs, value: number) => void;
  province: ProvinceCode;
  setProvince: (prov: ProvinceCode) => void;
}

function ControlsPanel({ inputs, updateInput, province, setProvince }: ControlsPanelProps) {
  const [isDeductionsOpen, setIsDeductionsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isCreditsOpen, setIsCreditsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  
  const PROVINCES: { code: string, name: string }[] = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland & Labrador' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
  ];

  const sliderToIncome = (val: number) => {
    const raw = Math.pow(val, 3);
    if (raw <= 50000) return Math.round(raw / 500) * 500;
    if (raw <= 250000) return Math.round(raw / 1000) * 1000;
    return Math.round(raw / 5000) * 5000;
  };

  const incomeToSlider = (income: number) => {
    return Math.min(100, Math.cbrt(Math.max(0, income)));
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] space-y-10">
      
      <div className="space-y-6">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Base Employment Income</label>
        
        <div className="flex items-end text-5xl md:text-6xl font-black tracking-tighter text-white border-b border-white/10 pb-4 focus-within:border-white/40 transition-colors">
          <span className="opacity-30 mr-2 pb-1 text-4xl">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputs.employment === 0 ? '' : inputs.employment.toLocaleString('en-US')}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '');
              updateInput('employment', Number(digitsOnly.slice(0, 12)));
            }}
            className="w-full bg-transparent outline-none p-0 m-0 leading-none placeholder:text-white/10"
            placeholder="0"
          />
        </div>

        <div className="pt-2">
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={incomeToSlider(inputs.employment)}
            onChange={(e) => updateInput('employment', sliderToIncome(Number(e.target.value)))}
          />
          <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2 px-1">
             <span>$0</span>
             <span>$1M+</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Jurisdiction</label>
        <div className="relative">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value as ProvinceCode)}
            className="w-full bg-black/20 border border-white/[0.05] rounded-2xl py-4 pl-4 pr-10 text-sm font-bold text-white appearance-none outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all cursor-pointer backdrop-blur-md"
          >
            <option value="" disabled className="bg-slate-900 text-white/50">Select a Province...</option>
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code} className="bg-slate-900 text-white">
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4">
         <label className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 flex">Investments & Income</label>
         <div className="grid grid-cols-2 gap-3 pt-1">
           <SubInput label="Capital Gains" value={inputs.capitalGains} onChange={(v) => updateInput('capitalGains', v)} />
           <SubInput label="Capital Loss" value={inputs.capitalLoss} onChange={(v) => updateInput('capitalLoss', v)} />
           <SubInput label="Eligible Div" value={inputs.eligibleDividends} onChange={(v) => updateInput('eligibleDividends', v)} />
           <SubInput label="Ineligible Div" value={inputs.ineligibleDividends} onChange={(v) => updateInput('ineligibleDividends', v)} />
         </div>
      </div>

      <div>
         <button 
            onClick={() => setIsDeductionsOpen(!isDeductionsOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-400/80 uppercase tracking-widest border-b border-emerald-500/20 pb-2 mb-2 focus:outline-none group"
         >
            <span className="group-hover:text-emerald-300 transition-colors">Deductions (Reduces Taxable Income)</span>
            <motion.div animate={{ rotate: isDeductionsOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.div>
         </button>
         <AnimatePresence initial={false}>
            {isDeductionsOpen && (
              <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <SubInput label="RRSP" value={inputs.rrsp} onChange={(v) => updateInput('rrsp', v)} />
                  <SubInput label="FHSA" value={inputs.fhsa} onChange={(v) => updateInput('fhsa', v)} />
                  <SubInput label="Moving Exp." value={inputs.movingExpenses} onChange={(v) => updateInput('movingExpenses', v)} />
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <div>
         <button 
            onClick={() => setIsCreditsOpen(!isCreditsOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-indigo-400/80 uppercase tracking-widest border-b border-indigo-500/20 pb-2 mb-2 focus:outline-none group"
         >
            <span className="group-hover:text-indigo-300 transition-colors">Credits (Reduces Tax Bill Directly)</span>
            <motion.div animate={{ rotate: isCreditsOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.div>
         </button>
         <AnimatePresence initial={false}>
            {isCreditsOpen && (
              <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <SubInput label="Donations" value={inputs.donations} onChange={(v) => updateInput('donations', v)} />
                  <SubInput label="Medical Exp." value={inputs.medicalExpenses} onChange={(v) => updateInput('medicalExpenses', v)} />
                  <SubInput label="Tuition" value={inputs.tuition} onChange={(v) => updateInput('tuition', v)} />
                  <SubInput label="Tuition (Carry Fwd)" value={inputs.tuitionCarryForward} onChange={(v) => updateInput('tuitionCarryForward', v)} />
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}

export default memo(ControlsPanel);