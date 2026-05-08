import React from 'react';
import SubInput from '../ui/SubInput';
import { TaxInputs, ProvinceCode } from '../../utils/TaxLogic';

interface ControlsPanelProps {
  inputs: TaxInputs;
  updateInput: (key: keyof TaxInputs, value: number) => void;
  province: ProvinceCode;
  setProvince: (prov: ProvinceCode) => void;
}

export default function ControlsPanel({ inputs, updateInput, province, setProvince }: ControlsPanelProps) {
  
  const PROVINCES: { code: ProvinceCode, name: string }[] = [
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

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] space-y-10">
      
      {/* Primary Income Input */}
      <div className="space-y-6">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Base Employment Income</label>
        
        <div className="flex items-end text-5xl md:text-6xl font-black tracking-tighter text-white border-b border-white/10 pb-4 focus-within:border-white/40 transition-colors">
          <span className="opacity-30 mr-2 pb-1 text-4xl">$</span>
          <input
            type="number"
            min="0"
            value={inputs.employment === 0 ? '' : inputs.employment}
            onChange={(e) => updateInput('employment', Number(e.target.value))}
            className="w-full bg-transparent outline-none p-0 m-0 leading-none placeholder:text-white/10"
            placeholder="0"
          />
        </div>

        {/* Range Slider */}
        <div className="pt-2">
          <input
            type="range"
            min="0"
            max="300000"
            step="1000"
            value={inputs.employment}
            onChange={(e) => updateInput('employment', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Income & Investments */}
      <div className="space-y-4">
         <label className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 flex">Investments & Income</label>
         <div className="grid grid-cols-2 gap-3">
           <SubInput label="Capital Gains" value={inputs.capitalGains} onChange={(v) => updateInput('capitalGains', v)} />
           <div className="hidden sm:block"></div>
           <SubInput label="Eligible Div" value={inputs.eligibleDividends} onChange={(v) => updateInput('eligibleDividends', v)} />
           <SubInput label="Ineligible Div" value={inputs.ineligibleDividends} onChange={(v) => updateInput('ineligibleDividends', v)} />
         </div>
      </div>

      {/* Deductions */}
      <div className="space-y-4">
         <label className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest border-b border-emerald-500/20 pb-2 flex">Deductions (Reduces Taxable Income)</label>
         <div className="grid grid-cols-2 gap-3">
           <SubInput label="RRSP" value={inputs.rrsp} onChange={(v) => updateInput('rrsp', v)} />
           <SubInput label="FHSA" value={inputs.fhsa} onChange={(v) => updateInput('fhsa', v)} />
           <SubInput label="Moving Exp." value={inputs.movingExpenses} onChange={(v) => updateInput('movingExpenses', v)} />
         </div>
      </div>

      {/* Tax Credits */}
      <div className="space-y-4">
         <label className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest border-b border-indigo-500/20 pb-2 flex">Credits (Reduces Tax Bill Directly)</label>
         <div className="grid grid-cols-2 gap-3">
           <SubInput label="Medical Exp." value={inputs.medicalExpenses} onChange={(v) => updateInput('medicalExpenses', v)} />
           <SubInput label="Tuition" value={inputs.tuition} onChange={(v) => updateInput('tuition', v)} />
           <SubInput label="Tuition (Carry Fwd)" value={inputs.tuitionCarryForward} onChange={(v) => updateInput('tuitionCarryForward', v)} />
         </div>
      </div>

      {/* Province Dropdown Selector */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Jurisdiction</label>
        <div className="relative">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value as ProvinceCode)}
            className="w-full bg-black/20 border border-white/[0.05] rounded-2xl py-4 pl-4 pr-10 text-sm font-bold text-white appearance-none outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all cursor-pointer backdrop-blur-md"
          >
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
    </div>
  );
}