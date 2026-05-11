import React, { useState, useCallback, useDeferredValue } from 'react';
import { useTaxData } from './hooks/useTaxData';
import { TaxInputs, ProvinceCode } from './utils/TaxLogic';
import ControlsPanel from './components/dashboard/ControlsPanel';
import SummaryCard from './components/dashboard/SummaryCard';
import TaxChart from './components/dashboard/TaxChart';
import SavingsBreakdown from './components/dashboard/SavingsBreakdown';

export default function App() {
  const [province, setProvince] = useState<ProvinceCode>('ON');
  const [inputs, setInputs] = useState<TaxInputs>({
    employment: 90000,
    capitalGains: 0,
    capitalLoss: 0,
    eligibleDividends: 0,
    ineligibleDividends: 0,
    rrsp: 0,
    fhsa: 0,
    movingExpenses: 0,
    medicalExpenses: 0,
    tuition: 0,
    tuitionCarryForward: 0,
    donations: 0
  });

  const updateInput = useCallback((key: keyof TaxInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const deferredInputs = useDeferredValue(inputs);
  const deferredProvince = useDeferredValue(province);

  const { results, percentages, progressionData, savingsBreakdown } = useTaxData(deferredInputs, deferredProvince);

  return (
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 md:p-8 lg:p-12 relative transform-gpu">
      
      {/* PERFORMANCE FIX: 
        Replaced filter: blur() with CSS radial gradients.
        This provides the exact same ambient glow without destroying the GPU compositor. 
      */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,transparent_60%)]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)]"></div>
      </div>

      <div className="max-w-[90rem] w-full grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        <div className="xl:col-span-4 flex flex-col space-y-8">
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

        <div className="xl:col-span-8 flex flex-col space-y-8">
          <SummaryCard 
            inputs={deferredInputs} 
            results={results} 
            percentages={percentages} 
          />
          <SavingsBreakdown 
            data={savingsBreakdown}
            actualTax={results.totalTax}
            totalSaved={percentages.totalTaxSaved}
          />
          <TaxChart 
            progressionData={progressionData} 
            inputs={deferredInputs} 
            results={results} 
          />
        </div>

      </div>
    </div>
  );
}