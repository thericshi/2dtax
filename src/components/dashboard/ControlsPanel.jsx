import React from 'react';
import SubInput from '../ui/SubInput';

export default function ControlsPanel({ inputs, updateInput, province, setProvince }) {
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

      {/* Investments & Dividends Grid */}
      <div className="space-y-4">
         <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Investments & Deductions</label>
         <div className="grid grid-cols-2 gap-3">
           <SubInput label="Capital Gains" value={inputs.capitalGains} onChange={(v) => updateInput('capitalGains', v)} />
           <SubInput label="Eligible Div" value={inputs.eligibleDividends} onChange={(v) => updateInput('eligibleDividends', v)} />
           <SubInput label="Ineligible Div" value={inputs.ineligibleDividends} onChange={(v) => updateInput('ineligibleDividends', v)} />
           <SubInput label="RRSP" value={inputs.rrsp} onChange={(v) => updateInput('rrsp', v)} />
           <SubInput label="FHSA" value={inputs.fhsa} onChange={(v) => updateInput('fhsa', v)} />
         </div>
      </div>

      {/* Province Toggle */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Jurisdiction</label>
        <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/[0.05]">
          {['ON', 'BC'].map(p => (
            <button
              key={p}
              onClick={() => setProvince(p)}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                province === p
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-transparent'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {p === 'ON' ? 'Ontario' : 'British Columbia'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}