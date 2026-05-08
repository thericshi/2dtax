import { useMemo } from 'react';
import { calculateTax } from '../utils/TaxLogic';

export function useTaxData(inputs, province) {
  const results = useMemo(() => calculateTax(inputs, province), [inputs, province]);

  const percentages = useMemo(() => {
    const safeIncome = results.totalGrossIncome || 1;
    const cashTakeHome = Math.max(0, results.takeHome - inputs.rrsp - inputs.fhsa);

    return {
      fedPct: (results.federal / safeIncome) * 100,
      provPct: (results.provincial / safeIncome) * 100,
      rrspPct: (inputs.rrsp / safeIncome) * 100,
      fhsaPct: (inputs.fhsa / safeIncome) * 100,
      cashPct: (cashTakeHome / safeIncome) * 100,
      totalRetainedPct: (results.takeHome / safeIncome) * 100,
      cashTakeHome
    };
  }, [inputs, results]);

  const progressionData = useMemo(() => {
    const data = [];
    const maxVal = results.totalGrossIncome || 0;
    const taxableIncome = Math.max(0, maxVal - inputs.rrsp - inputs.fhsa);
    
    if (maxVal === 0) {
      return [{ 
        income: 0, 
        effectiveRate: 0, effectiveRateDiff: 0, 
        marginalRateActual: 0, marginalPaid: 0, marginalSaved: 0, baseMarginalRate: 0,
        tax: 0, taxDiff: 0 
      }];
    }

    const calculateStep = (incomeAmount, forceSaved = false) => {
      const ratio = incomeAmount / maxVal;
      const simInputs = {
        employment: inputs.employment * ratio,
        capitalGains: inputs.capitalGains * ratio,
        eligibleDividends: inputs.eligibleDividends * ratio,
        ineligibleDividends: inputs.ineligibleDividends * ratio,
        rrsp: inputs.rrsp * ratio,
        fhsa: inputs.fhsa * ratio
      };

      const res = calculateTax(simInputs, province);
      const resBase = calculateTax({ ...simInputs, rrsp: 0, fhsa: 0 }, province);
      const baseMarginalRate = Number(resBase.marginalRate.toFixed(1));
      
      let mPaid = 0;
      let mSaved = 0;

      if (forceSaved || incomeAmount > taxableIncome + 0.01) {
        mSaved = baseMarginalRate;
      } else {
        mPaid = baseMarginalRate;
      }

      return {
        income: incomeAmount,
        effectiveRate: Number(res.effectiveRate.toFixed(1)),
        effectiveRateDiff: Number(Math.max(0, resBase.effectiveRate - res.effectiveRate).toFixed(1)),
        marginalRateActual: Number(res.marginalRate.toFixed(1)),
        marginalPaid: mPaid,
        marginalSaved: mSaved,
        tax: res.totalTax,
        taxDiff: Math.max(0, resBase.totalTax - res.totalTax),
        baseMarginalRate
      };
    };

    const stepSet = new Set([0]);
    for (let i = 10000; i < maxVal; i += 10000) stepSet.add(i);
    stepSet.add(maxVal);
    
    if (taxableIncome >= 0 && taxableIncome < maxVal) {
       stepSet.add(taxableIncome);
    }
    
    const sortedSteps = Array.from(stepSet).sort((a, b) => a - b);
    
    for (const step of sortedSteps) {
       if (step === taxableIncome && taxableIncome < maxVal) {
           data.push(calculateStep(step, false)); 
           data.push(calculateStep(step + 0.001, true)); 
       } else {
           data.push(calculateStep(step, step > taxableIncome));
       }
    }

    return data;
  }, [inputs, province, results]);

  return { results, percentages, progressionData };
}