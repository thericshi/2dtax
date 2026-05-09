import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TaxInputs, TaxResult } from '../../utils/TaxLogic';
import { ProgressionStep } from '../../hooks/useTaxData';

interface TaxChartProps {
  progressionData: ProgressionStep[];
  inputs: TaxInputs;
  results: TaxResult;
}

type ChartMode = 'effective' | 'marginal' | 'tax';

export default function TaxChart({ progressionData, inputs, results }: TaxChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('marginal');
  const [showDiff, setShowDiff] = useState(true);

  const hasSavings = inputs.rrsp > 0 || inputs.fhsa > 0 || inputs.movingExpenses > 0 || inputs.medicalExpenses > 0 || inputs.tuition > 0 || inputs.tuitionCarryForward > 0 || inputs.donations > 0 || inputs.capitalLoss > 0;

  const activeDataKey = chartMode === 'tax' ? 'tax' : chartMode === 'effective' ? 'effectiveRate' : (showDiff ? 'marginalPaid' : 'marginalRateActual');
  const activeDiffKey = chartMode === 'tax' ? 'taxDiff' : chartMode === 'effective' ? 'effectiveRateDiff' : 'marginalSaved';

  // Beautifully formats massive numbers to support inputs up to $1 Trillion
  const formatCurrencyAxis = (val: number) => {
    if (val >= 1_000_000_000) return `$${+(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${+(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${Math.round(val)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualVal = payload[0].value;
      const diffVal = payload.length > 1 ? payload[1].value : 0;
      const totalBaseVal = actualVal + diffVal;
      const formatVal = (v: number) => chartMode === 'tax' ? `$${Math.round(v).toLocaleString()}` : `${v.toFixed(1)}%`;

      return (
        <div className="bg-[#0f172a]/95 border border-white/10 p-5 shadow-2xl rounded-2xl backdrop-blur-xl min-w-[200px]">
          <p className="font-bold text-white text-sm mb-3 border-b border-white/10 pb-2">
            Gross: ${Math.round(Number(label)).toLocaleString()}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                <p className="font-medium text-white/60 text-xs">{chartMode === 'tax' ? 'Actual Tax' : 'Actual Rate'}</p>
              </div>
              <span className="font-black text-white text-xs">{formatVal(actualVal)}</span>
            </div>

            {showDiff && hasSavings && (
              <>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <p className="font-medium text-white/60 text-xs">{chartMode === 'tax' ? 'Tax Saved' : 'Rate Avoided'}</p>
                  </div>
                  <span className="font-black text-emerald-400 text-xs">+{formatVal(diffVal)}</span>
                </div>
                <div className="flex justify-between items-center gap-4 pt-2 border-t border-white/10 mt-2">
                  <p className="font-bold text-white/40 text-xs uppercase tracking-wider">Base (No Deductions)</p>
                  <span className="font-black text-white/70 text-xs">{formatVal(totalBaseVal)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] flex-1 min-h-[380px] flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-bold tracking-widest text-white/40 uppercase">
                {chartMode === 'effective' && 'Overall Effective Rate'}
                {chartMode === 'marginal' && 'Marginal Tax Rate'}
                {chartMode === 'tax' && 'Total Tax Dollar Projection'}
              </p>
              
              {hasSavings && (
                <button 
                  onClick={() => setShowDiff(!showDiff)}
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md transition-all border ${
                    showDiff 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {showDiff ? '★ Showing Savings' : 'Highlight Savings'}
                </button>
              )}
            </div>

            <p className="text-2xl font-black tracking-tight text-white/80">
              {chartMode === 'effective' && <>Effective Rate: <span className="text-white">{results.effectiveRate.toFixed(1)}%</span></>}
              {chartMode === 'marginal' && <>Actual Marginal Rate: <span className="text-white">{results.marginalRate.toFixed(1)}%</span></>}
              {chartMode === 'tax' && <>Actual Tax Due: <span className="text-white">${Math.round(results.totalTax).toLocaleString()}</span></>}
            </p>
         </div>
         
         <div className="flex flex-wrap bg-black/40 p-1.5 rounded-xl border border-white/10">
           <button onClick={() => setChartMode('effective')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'effective' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>% Effective</button>
           <button onClick={() => setChartMode('marginal')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'marginal' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>% Marginal</button>
           <button onClick={() => setChartMode('tax')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'tax' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>$ Tax</button>
         </div>
       </div>
       
       <div className="flex-1 w-full">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
               <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5}/>
                 <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
               </linearGradient>
               <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#34d399" stopOpacity={0.8}/>
                 <stop offset="100%" stopColor="#34d399" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <XAxis 
               type="number" domain={[0, 'dataMax']} dataKey="income" 
               tickFormatter={formatCurrencyAxis} 
               stroke="#ffffff" opacity={0.2} 
               tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 11, opacity: 0.5 }}
               axisLine={false} tickLine={false} dy={10} tickCount={8}
             />
             <YAxis 
               tickFormatter={(val: number) => chartMode === 'tax' ? formatCurrencyAxis(val) : `${val}%`} 
               stroke="#ffffff" opacity={0.2} 
               tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 11, opacity: 0.5 }}
               axisLine={false} tickLine={false} dx={-5}
             />
             <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
             
             <Area type="monotoneX" dataKey={activeDataKey} stackId="1" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" activeDot={{ r: 6, fill: '#050816', stroke: '#818cf8', strokeWidth: 3 }} />
             
             {showDiff && hasSavings && (
               <Area type="monotoneX" dataKey={activeDiffKey} stackId="1" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorDiff)" activeDot={{ r: 5, fill: '#050816', stroke: '#34d399', strokeWidth: 2 }} />
             )}
           </AreaChart>
         </ResponsiveContainer>
       </div>
    </div>
  );
}