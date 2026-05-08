import { useMemo } from 'react';
import { calculateTax, TaxInputs, ProvinceCode, TaxResult } from '../utils/TaxLogic';

export interface Percentages {
  fedPct: number;
  provPct: number;
  rrspPct: number;
  fhsaPct: number;
  cashPct: number;
  totalRetainedPct: number;
  cashTakeHome: number;
  totalTaxSaved: number;
}

export interface ProgressionStep {
  income: number;
  effectiveRate: number;
  effectiveRateDiff: number;
  marginalRateActual: number;
  marginalPaid: number;
  marginalSaved: number;
  tax: number;
  taxDiff: number;
  baseMarginalRate: number;
}

export function useTaxData(inputs: TaxInputs, province: ProvinceCode) {
  const results: TaxResult = useMemo(() => calculateTax(inputs, province), [inputs, province]);

  const percentages: Percentages = useMemo(() => {
    const safeIncome = results.totalGrossIncome || 1;
    // Base simulation without ANY registered accounts, deductions, or credits
    const baseTaxRes = calculateTax({ 
        ...inputs, 
        rrsp: 0, fhsa: 0, movingExpenses: 0, medicalExpenses: 0, tuition: 0, tuitionCarryForward: 0 
    }, province);
    const totalTaxSaved = Math.max(0, baseTaxRes.totalTax - results.totalTax);
    
    // Liquid cash is total gross minus total tax minus registered account contributions
    const cashTakeHome = Math.max(0, results.takeHome - inputs.rrsp - inputs.fhsa);

    return {
      fedPct: (results.federal / safeIncome) * 100,
      provPct: (results.provincial / safeIncome) * 100,
      rrspPct: (inputs.rrsp / safeIncome) * 100,
      fhsaPct: (inputs.fhsa / safeIncome) * 100,
      cashPct: (cashTakeHome / safeIncome) * 100,
      totalRetainedPct: (results.takeHome / safeIncome) * 100,
      cashTakeHome,
      totalTaxSaved
    };
  }, [inputs, results, province]);

  const progressionData: ProgressionStep[] = useMemo(() => {
    const data: ProgressionStep[] = [];
    const maxVal = results.totalGrossIncome || 0;
    const totalDeduct = inputs.rrsp + inputs.fhsa + inputs.movingExpenses;
    const taxableIncome = Math.max(0, maxVal - totalDeduct);
    
    if (maxVal === 0) {
      return [{ 
        income: 0, effectiveRate: 0, effectiveRateDiff: 0, marginalRateActual: 0, 
        marginalPaid: 0, marginalSaved: 0, tax: 0, taxDiff: 0, baseMarginalRate: 0 
      }];
    }

    const calculateStep = (incomeAmount: number, forceSaved: boolean = false): ProgressionStep => {
      const ratio = incomeAmount / maxVal;
      const simInputs: TaxInputs = {
        employment: inputs.employment * ratio,
        capitalGains: inputs.capitalGains * ratio,
        eligibleDividends: inputs.eligibleDividends * ratio,
        ineligibleDividends: inputs.ineligibleDividends * ratio,
        rrsp: inputs.rrsp * ratio,
        fhsa: inputs.fhsa * ratio,
        movingExpenses: inputs.movingExpenses * ratio,
        medicalExpenses: inputs.medicalExpenses * ratio,
        tuition: inputs.tuition * ratio,
        tuitionCarryForward: inputs.tuitionCarryForward * ratio
      };

      const res = calculateTax(simInputs, province);
      const resBase = calculateTax({ 
          ...simInputs, rrsp: 0, fhsa: 0, movingExpenses: 0, medicalExpenses: 0, tuition: 0, tuitionCarryForward: 0 
      }, province);
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

    const stepSet = new Set<number>([0]);
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