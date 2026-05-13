import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubInput from '../ui/SubInput';
import { TaxInputs, ProvinceCode } from '../../utils/TaxLogic';

interface ControlsPanelProps {
  inputs: TaxInputs;
  updateInput: (key: keyof TaxInputs, value: number) => void;
  province: ProvinceCode;
  setProvince: (prov: ProvinceCode) => void;
  onMobileEdit?: (key: keyof TaxInputs, label: string) => void;
}

function ControlsPanel({ inputs, updateInput, province, setProvince, onMobileEdit }: ControlsPanelProps) {
  const [isInvestmentsOpen, setIsInvestmentsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [isDeductionsOpen, setIsDeductionsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>, key: keyof TaxInputs, label: string) => {
    if (window.innerWidth < 1280 && onMobileEdit) {
      e.target.blur();
      onMobileEdit(key, label);
    }
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] relative">
      
      <div className="relative z-20 mb-10">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-3 mb-4">
          <span>Jurisdiction</span>
          {!province && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30 animate-pulse tracking-wider">
              REQUIRED
            </span>
          )}
        </label>
        <div className="relative group">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value as ProvinceCode)}
            className={`w-full rounded-2xl py-4 pl-5 pr-12 text-base font-bold text-white appearance-none outline-none transition-all cursor-pointer backdrop-blur-md ${
              !province 
                ? 'bg-emerald-500/10 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-4 ring-emerald-500/10' 
                : 'bg-black/20 border border-white/[0.05] focus:border-white/30 focus:ring-1 focus:ring-white/30 hover:bg-black/30'
            }`}
          >
            <option value="" disabled className="bg-slate-900 text-white/50">Please select a province...</option>
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code} className="bg-slate-900 text-white">
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-white/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {!province && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-[-1.5rem] z-10 flex flex-col items-center pt-16 sm:pt-20 rounded-b-[2rem]"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="bg-[#0f172a]/95 p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-[280px]"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-5 border border-white/10 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400/80">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 className="text-white font-black text-lg mb-2 tracking-tight">Select Jurisdiction</h3>
                <p className="text-white/50 text-xs leading-relaxed font-medium">
                  Tax brackets and credits vary significantly by province. Please select one above to begin.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`space-y-10 transition-all duration-500 ${!province ? 'opacity-20 pointer-events-none select-none grayscale-[50%]' : ''}`}>
          
          <div className="space-y-6">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Base Employment Income</label>
            
            <div className="flex items-end text-5xl md:text-6xl font-black tracking-tighter text-white border-b border-white/10 pb-4 focus-within:border-white/40 transition-colors">
              <span className="opacity-30 mr-2 pb-1 text-4xl">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={!province ? '' : (inputs.employment === 0 ? '' : inputs.employment.toLocaleString('en-US'))}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  updateInput('employment', Number(digitsOnly.slice(0, 12)));
                }}
                onFocus={(e) => handleInputFocus(e, 'employment', 'Base Employment Income')}
                className="w-full bg-transparent outline-none p-0 m-0 leading-none placeholder:text-white/10"
                placeholder="0"
                disabled={!province}
              />
            </div>

            <div className="pt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="0.01"
                value={!province ? 0 : incomeToSlider(inputs.employment)}
                onChange={(e) => updateInput('employment', sliderToIncome(Number(e.target.value)))}
                disabled={!province}
              />
              <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2 px-1">
                <span>$0</span>
                <span>$1M+</span>
              </div>
            </div>
          </div>

          <div>
            <button 
                onClick={() => setIsInvestmentsOpen(!isInvestmentsOpen)}
                disabled={!province}
                className="w-full flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 mb-2 focus:outline-none group"
            >
                <span className="group-hover:text-white/60 transition-colors">Investments & Income</span>
                <motion.div animate={{ rotate: isInvestmentsOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isInvestmentsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <SubInput disabled={!province} label="Capital Gains" value={inputs.capitalGains} onChange={(v) => updateInput('capitalGains', v)} onFocus={(e) => handleInputFocus(e, 'capitalGains', 'Capital Gains')} />
                      <SubInput disabled={!province} label="Capital Loss" value={inputs.capitalLoss} onChange={(v) => updateInput('capitalLoss', v)} onFocus={(e) => handleInputFocus(e, 'capitalLoss', 'Capital Loss')} />
                      <SubInput disabled={!province} label="Eligible Div" value={inputs.eligibleDividends} onChange={(v) => updateInput('eligibleDividends', v)} onFocus={(e) => handleInputFocus(e, 'eligibleDividends', 'Eligible Dividends')} />
                      <SubInput disabled={!province} label="Ineligible Div" value={inputs.ineligibleDividends} onChange={(v) => updateInput('ineligibleDividends', v)} onFocus={(e) => handleInputFocus(e, 'ineligibleDividends', 'Ineligible Dividends')} />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <div>
            <button 
                onClick={() => setIsDeductionsOpen(!isDeductionsOpen)}
                disabled={!province}
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
                      <SubInput disabled={!province} label="RRSP" value={inputs.rrsp} onChange={(v) => updateInput('rrsp', v)} onFocus={(e) => handleInputFocus(e, 'rrsp', 'RRSP')} />
                      <SubInput disabled={!province} label="FHSA" value={inputs.fhsa} onChange={(v) => updateInput('fhsa', v)} onFocus={(e) => handleInputFocus(e, 'fhsa', 'FHSA')} />
                      <SubInput disabled={!province} label="Moving Exp." value={inputs.movingExpenses} onChange={(v) => updateInput('movingExpenses', v)} onFocus={(e) => handleInputFocus(e, 'movingExpenses', 'Moving Expenses')} />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <div>
            <button 
                onClick={() => setIsCreditsOpen(!isCreditsOpen)}
                disabled={!province}
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
                      <SubInput disabled={!province} label="Donations" value={inputs.donations} onChange={(v) => updateInput('donations', v)} onFocus={(e) => handleInputFocus(e, 'donations', 'Donations')} />
                      <SubInput disabled={!province} label="Medical Exp." value={inputs.medicalExpenses} onChange={(v) => updateInput('medicalExpenses', v)} onFocus={(e) => handleInputFocus(e, 'medicalExpenses', 'Medical Expenses')} />
                      <SubInput disabled={!province} label="Tuition" value={inputs.tuition} onChange={(v) => updateInput('tuition', v)} onFocus={(e) => handleInputFocus(e, 'tuition', 'Tuition')} />
                      <SubInput disabled={!province} label="Tuition (Carry Fwd)" value={inputs.tuitionCarryForward} onChange={(v) => updateInput('tuitionCarryForward', v)} onFocus={(e) => handleInputFocus(e, 'tuitionCarryForward', 'Tuition Carry Fwd')} />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

export default memo(ControlsPanel);