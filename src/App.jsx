import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateTax } from './TaxLogic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Reusable micro-component for the new secondary inputs
const SubInput = ({ label, value, onChange, icon }) => (
  <div className="flex flex-col gap-1.5 bg-black/20 p-3.5 rounded-2xl border border-white/[0.05] focus-within:border-white/20 focus-within:bg-white/[0.02] transition-all">
    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
      {icon} {label}
    </label>
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 font-black">$</span>
      <input
        type="number"
        min="0"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent outline-none py-1 pl-6 pr-2 text-lg font-black text-white placeholder:text-white/10"
        placeholder="0"
      />
    </div>
  </div>
);

export default function App() {
  const [province, setProvince] = useState('ON');
  const [chartMode, setChartMode] = useState('effective'); // 'effective' | 'marginal' | 'tax'
  const [inputs, setInputs] = useState({
    employment: 90000,
    capitalGains: 0,
    eligibleDividends: 0,
    ineligibleDividends: 0,
    rrsp: 0,
    fhsa: 0
  });

  const updateInput = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

  // Current calculation
  const results = useMemo(() => calculateTax(inputs, province), [inputs, province]);

  // Composition Percentages
  const safeIncome = results.totalGrossIncome || 1; // Prevent division by zero
  const fedPct = (results.federal / safeIncome) * 100;
  const provPct = (results.provincial / safeIncome) * 100;
  
  // Split retained income into pure cash and registered accounts
  const rrspPct = (inputs.rrsp / safeIncome) * 100;
  const fhsaPct = (inputs.fhsa / safeIncome) * 100;
  const cashTakeHome = Math.max(0, results.takeHome - inputs.rrsp - inputs.fhsa);
  const cashPct = (cashTakeHome / safeIncome) * 100;
  
  // Total Retained for the Hero Number
  const totalRetainedPct = (results.takeHome / safeIncome) * 100;

  // Data for the Progression Area Chart (Scales exact portfolio mix up to total gross income)
  const progressionData = useMemo(() => {
    const data = [];
    const maxVal = results.totalGrossIncome || 0;
    
    // Always start the graph exactly at 0
    data.push({ income: 0, effectiveRate: 0, marginalRate: 0, tax: 0 });

    if (maxVal === 0) {
      return data;
    }

    // Step by 10,000 to keep the X-axis intervals clean, stopping just before the final income
    for (let i = 10000; i < maxVal; i += 10000) {
      const ratio = i / maxVal;
      
      // We scale your exact income mix and deductions proportionally to calculate the curve
      const simInputs = {
        employment: inputs.employment * ratio,
        capitalGains: inputs.capitalGains * ratio,
        eligibleDividends: inputs.eligibleDividends * ratio,
        ineligibleDividends: inputs.ineligibleDividends * ratio,
        rrsp: inputs.rrsp * ratio,
        fhsa: inputs.fhsa * ratio
      };

      const res = calculateTax(simInputs, province);
      
      // Calculate "Base Tax" un-affected by RRSP/FHSA deductions for the pure Tax Curve mode
      const resNoDeductions = calculateTax({ ...simInputs, rrsp: 0, fhsa: 0 }, province);

      data.push({
        income: i,
        effectiveRate: Number(res.effectiveRate.toFixed(1)),
        marginalRate: Number(res.marginalRate.toFixed(1)),
        tax: resNoDeductions.totalTax
      });
    }
    
    // Explicitly add the final user total gross income as the terminal point on the graph
    const finalResNoDed = calculateTax({ ...inputs, rrsp: 0, fhsa: 0 }, province);
    data.push({
      income: maxVal,
      effectiveRate: Number(results.effectiveRate.toFixed(1)),
      marginalRate: Number(results.marginalRate.toFixed(1)),
      tax: finalResNoDed.totalTax
    });

    return data;
  }, [inputs, province, results]);

  // Custom dark-mode tooltip for the Area chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let title = '';
      let value = '';
      if (chartMode === 'effective') {
        title = 'Effective Rate:';
        value = `${payload[0].value}%`;
      } else if (chartMode === 'marginal') {
        title = 'Marginal Rate:';
        value = `${payload[0].value}%`;
      } else {
        title = 'Base Tax:';
        value = `$${Math.round(payload[0].value).toLocaleString()}`;
      }

      return (
        <div className="bg-[#0f172a] border border-white/10 p-4 shadow-2xl rounded-2xl backdrop-blur-xl">
          <p className="font-bold text-white text-sm mb-1">Gross Income: ${label.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
            <p className="font-medium text-white/60 text-xs">
              {title} <span className="font-black text-white">{value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 md:p-8 lg:p-12 relative">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        {/* Left Column: Interactive Controls */}
        <div className="xl:col-span-5 flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-sm">
              Tax Planner
            </h1>
            <p className="text-white/50 text-lg font-medium leading-relaxed">
              Understand your exact 2025 tax obligations and take-home pay with precision.
            </p>
          </div>

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
                 <SubInput 
                    label="Capital Gains" 
                    value={inputs.capitalGains} 
                    onChange={(v) => updateInput('capitalGains', v)} 
                 />
                 <SubInput 
                    label="Eligible Div" 
                    value={inputs.eligibleDividends} 
                    onChange={(v) => updateInput('eligibleDividends', v)} 
                 />
                 <SubInput 
                    label="Ineligible Div" 
                    value={inputs.ineligibleDividends} 
                    onChange={(v) => updateInput('ineligibleDividends', v)} 
                 />
                 <SubInput 
                    label="RRSP" 
                    value={inputs.rrsp} 
                    onChange={(v) => updateInput('rrsp', v)} 
                 />
                 <SubInput 
                    label="FHSA" 
                    value={inputs.fhsa} 
                    onChange={(v) => updateInput('fhsa', v)} 
                 />
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
        </div>

        {/* Right Column: Graphs & Data */}
        <div className="xl:col-span-7 flex flex-col space-y-8">
          
          {/* Top Card: Hero Metric & Composition Bar */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08]">
            <div className="mb-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Total Net Retained</p>
                <div className="text-5xl md:text-7xl leading-none font-black tracking-tighter text-emerald-400 mb-4 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  ${Math.round(results.takeHome).toLocaleString()}
                </div>
                <p className="font-medium text-white/50 text-base md:text-lg">
                  You keep <span className="text-white font-black">{totalRetainedPct.toFixed(1)}%</span> of your <span className="text-white">${results.totalGrossIncome.toLocaleString()}</span> gross income.
                </p>
              </div>
            </div>

            {/* The Composition Bar */}
            <div className="space-y-6">
              <div className="h-8 md:h-10 w-full flex rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                
                {/* Liquid Cash Retained */}
                <motion.div 
                  layout
                  initial={false}
                  animate={{ width: `${cashPct}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 relative"
                />
                
                {/* RRSP Registered Retained */}
                {inputs.rrsp > 0 && (
                  <motion.div 
                    layout
                    initial={false}
                    animate={{ width: `${rrspPct}%` }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                    className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border"
                  />
                )}
                
                {/* FHSA Registered Retained */}
                {inputs.fhsa > 0 && (
                  <motion.div 
                    layout
                    initial={false}
                    animate={{ width: `${fhsaPct}%` }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                    className="h-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 box-border"
                  />
                )}

                <motion.div 
                  layout
                  initial={false}
                  animate={{ width: `${fedPct}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                  className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-l border-black/20"
                />
                <motion.div 
                  layout
                  initial={false}
                  animate={{ width: `${provPct}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                  className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-l border-black/20"
                />
              </div>

              {/* Composition Legend */}
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

          {/* Bottom Card: Area Chart for Tax Rate Progression */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] flex-1 min-h-[350px] flex flex-col">
             
             {/* Chart Header & Toggles */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
               <div>
                  <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-2">
                    {chartMode === 'effective' && 'Overall Effective Rate Curve'}
                    {chartMode === 'marginal' && 'Marginal Tax Rate Curve'}
                    {chartMode === 'tax' && 'Base Tax Curve (Pre-Deductions)'}
                  </p>
                  <p className="text-2xl font-black tracking-tight text-white/80">
                    {chartMode === 'effective' && <>Effective Rate: <span className="text-white">{results.effectiveRate.toFixed(1)}%</span></>}
                    {chartMode === 'marginal' && <>Marginal Rate: <span className="text-white">{results.marginalRate.toFixed(1)}%</span></>}
                    {chartMode === 'tax' && <>Total Base Tax: <span className="text-white">${Math.round(progressionData[progressionData.length - 1].tax).toLocaleString()}</span></>}
                  </p>
               </div>
               
               <div className="flex flex-wrap bg-black/40 p-1.5 rounded-xl border border-white/10">
                 <button 
                   onClick={() => setChartMode('effective')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'effective' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                 >
                   % Effective
                 </button>
                 <button 
                   onClick={() => setChartMode('marginal')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'marginal' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                 >
                   % Marginal
                 </button>
                 <button 
                   onClick={() => setChartMode('tax')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'tax' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                 >
                   $ Tax
                 </button>
               </div>
             </div>
             
             <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4}/>
                       <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis 
                     dataKey="income" 
                     tickFormatter={(val) => `$${val/1000}k`} 
                     stroke="#ffffff" 
                     opacity={0.2} 
                     tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 11, opacity: 0.5 }}
                     axisLine={false}
                     tickLine={false}
                     dy={10}
                   />
                   <YAxis 
                     tickFormatter={(val) => chartMode === 'tax' ? `$${val >= 1000 ? val/1000 + 'k' : val}` : `${val}%`} 
                     stroke="#ffffff" 
                     opacity={0.2} 
                     tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 11, opacity: 0.5 }}
                     axisLine={false}
                     tickLine={false}
                     dx={-5}
                   />
                   <Tooltip 
                     content={<CustomTooltip />} 
                     cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey={chartMode === 'tax' ? 'tax' : chartMode === 'effective' ? 'effectiveRate' : 'marginalRate'} 
                     stroke="#818cf8" 
                     strokeWidth={3}
                     fillOpacity={1} 
                     fill="url(#colorRate)" 
                     activeDot={{ r: 6, fill: '#050816', stroke: '#818cf8', strokeWidth: 3 }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}