import React, { useState } from 'react';
import { useTaxData } from './hooks/useTaxData';
import { TaxInputs, ProvinceCode } from './utils/TaxLogic';
import ControlsPanel from './components/dashboard/ControlsPanel';
import SummaryCard from './components/dashboard/SummaryCard';
import TaxChart from './components/dashboard/TaxChart';

export default function App() {
  const [province, setProvince] = useState<ProvinceCode>('ON');
  const [inputs, setInputs] = useState<TaxInputs>({
    employment: 90000,
    capitalGains: 0,
    eligibleDividends: 0,
    ineligibleDividends: 0,
    rrsp: 0,
    fhsa: 0
  });

  const updateInput = (key: keyof TaxInputs, value: number) => setInputs(prev => ({ ...prev, [key]: value }));

  const { results, percentages, progressionData } = useTaxData(inputs, province);

  return (
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 md:p-8 lg:p-12 relative">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <div className="max-w-[90rem] w-full grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        {/* Left Column: Interactive Controls (Narrowed to col-span-4) */}
        <div className="xl:col-span-4 flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-sm">
              Tax Planner
            </h1>
            <p className="text-white/50 text-lg font-medium leading-relaxed">
              Understand your exact 2025 tax obligations and take-home pay with precision.
            </p>
          </div>

          <ControlsPanel 
            inputs={inputs} 
            updateInput={updateInput} 
            province={province} 
            setProvince={setProvince} 
          />
        </div>

        {/* Right Column: Graphs & Data (Expanded to col-span-8) */}
        <div className="xl:col-span-8 flex flex-col space-y-8">
          <SummaryCard 
            inputs={inputs} 
            results={results} 
            percentages={percentages} 
          />
          <TaxChart 
            progressionData={progressionData} 
            inputs={inputs} 
            results={results} 
          />
        </div>

      </div>
    </div>
  );
}