import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateTax } from './TaxLogic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [income, setIncome] = useState(90000);
  const [province, setProvince] = useState('ON');

  // Current calculation
  const results = useMemo(() => calculateTax(income || 0, province), [income, province]);

  // Composition Percentages
  const safeIncome = income || 1; // Prevent division by zero
  const netPct = (results.takeHome / safeIncome) * 100;
  const fedPct = (results.federal / safeIncome) * 100;
  const provPct = (results.provincial / safeIncome) * 100;

  // Data for the Progression Area Chart
  const progressionData = useMemo(() => {
    const data = [];
    const maxVal = Math.max((income || 0) + 50000, 150000);
    for (let i = 10000; i <= maxVal; i += 10000) {
      const res = calculateTax(i, province);
      data.push({
        income: i,
        rate: Number(res.marginalRate.toFixed(1))
      });
    }
    return data;
  }, [income, province]);

  // Custom dark-mode tooltip for the Area chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/10 p-4 shadow-2xl rounded-2xl backdrop-blur-xl">
          <p className="font-bold text-white text-sm mb-1">${label.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
            <p className="font-medium text-white/60 text-xs">
              Effective Rate: <span className="font-black text-white">{payload[0].value}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 md:p-8 lg:p-12 relative">
      
      {/* Optional ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        {/* Left Column: Interactive Controls */}
        <div className="xl:col-span-5 flex flex-col justify-center space-y-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-sm">
              Tax Planner
            </h1>
            <p className="text-white/50 text-lg font-medium leading-relaxed">
              Understand your exact 2025 tax obligations and take-home pay with precision.
            </p>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] space-y-12">
            
            {/* Fillable Number Input */}
            <div className="space-y-6">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Employment Income</label>
              
              <div className="flex items-end text-6xl md:text-7xl font-black tracking-tighter text-white border-b border-white/10 pb-4 focus-within:border-white/40 transition-colors">
                <span className="opacity-30 mr-2 pb-1 text-5xl">$</span>
                <input
                  type="number"
                  min="0"
                  value={income === 0 ? '' : income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full bg-transparent outline-none p-0 m-0 leading-none placeholder:text-white/10"
                  placeholder="0"
                />
              </div>

              {/* Range Slider (Uses custom CSS from index.css) */}
              <div className="pt-2">
                <input
                  type="range"
                  min="30000"
                  max="300000"
                  step="1000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
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
            <div className="mb-12">
              <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Net Retained Pay</p>
              <div className="text-6xl md:text-[5rem] leading-none font-black tracking-tighter text-emerald-400 mb-4 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                ${Math.round(results.takeHome).toLocaleString()}
              </div>
              <p className="font-medium text-white/50 text-lg">
                You keep <span className="text-white font-black">{netPct.toFixed(1)}%</span> of your gross income.
              </p>
            </div>

            {/* The Composition Bar */}
            <div className="space-y-6">
              <div className="h-8 md:h-10 w-full flex rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                <motion.div 
                  layout
                  initial={false}
                  animate={{ width: `${netPct}%` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Take Home</span>
                  </div>
                  <p className="font-black text-xl text-white">${Math.round(results.takeHome).toLocaleString()}</p>
                  <p className="font-medium text-white/40 text-sm">{netPct.toFixed(1)}%</p>
                </div>

                <div className="space-y-1 md:border-l md:border-white/10 md:pl-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span className="font-bold text-white/50 text-xs uppercase tracking-wider">Federal</span>
                  </div>
                  <p className="font-black text-xl text-white">${Math.round(results.federal).toLocaleString()}</p>
                  <p className="font-medium text-white/40 text-sm">{fedPct.toFixed(1)}%</p>
                </div>

                <div className="space-y-1 md:border-l md:border-white/10 md:pl-6">
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
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] flex-1 min-h-[320px] flex flex-col">
             <div className="flex justify-between items-end mb-8">
               <div>
                  <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-2">Tax Curve</p>
                  <p className="text-2xl font-black tracking-tight text-white/80">
                    Effective Rate: <span className="text-white">{results.marginalRate.toFixed(1)}%</span>
                  </p>
               </div>
             </div>
             
             <div className="flex-1 w-full -ml-2">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={progressionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                     tickFormatter={(val) => `${val}%`} 
                     stroke="#ffffff" 
                     opacity={0.2} 
                     tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 11, opacity: 0.5 }}
                     axisLine={false}
                     tickLine={false}
                     dx={-10}
                   />
                   <Tooltip 
                     content={<CustomTooltip />} 
                     cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey="rate" 
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