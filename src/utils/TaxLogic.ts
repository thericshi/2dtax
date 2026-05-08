export type ProvinceCode = 'ON' | 'BC';

export interface TaxInputs {
  employment: number;
  capitalGains: number;
  eligibleDividends: number;
  ineligibleDividends: number;
  rrsp: number;
  fhsa: number;
}

export interface TaxResult {
  federal: number;
  provincial: number;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
  totalGrossIncome: number;
  taxableIncome: number;
  marginalRate: number;
}

interface TaxBracket {
  limit: number;
  rate: number;
}

const FEDERAL_BRACKETS: TaxBracket[] = [
  { limit: 55867, rate: 0.15 },
  { limit: 111733, rate: 0.205 },
  { limit: 173205, rate: 0.26 },
  { limit: 246752, rate: 0.29 },
  { limit: Infinity, rate: 0.33 },
];

const PROVINCIAL_DATA: Record<ProvinceCode, { brackets: TaxBracket[], bpa: number, eligibleDTC: number, ineligibleDTC: number, hasSurtax?: boolean }> = {
  BC: {
    brackets: [
      { limit: 47937, rate: 0.0506 },
      { limit: 95875, rate: 0.077 },
      { limit: 110057, rate: 0.105 },
      { limit: 133664, rate: 0.1229 },
      { limit: 181232, rate: 0.147 },
      { limit: 252752, rate: 0.168 },
      { limit: Infinity, rate: 0.205 },
    ],
    bpa: 12580,
    eligibleDTC: 0.12,
    ineligibleDTC: 0.0196
  },
  ON: {
    brackets: [
      { limit: 51446, rate: 0.0505 },
      { limit: 102894, rate: 0.0915 },
      { limit: 150000, rate: 0.1116 },
      { limit: 220000, rate: 0.1216 },
      { limit: Infinity, rate: 0.1316 },
    ],
    bpa: 12399,
    hasSurtax: true,
    eligibleDTC: 0.10,
    ineligibleDTC: 0.029863
  }
};

const calculateProgressiveTax = (taxableAmount: number, brackets: TaxBracket[]): number => {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const amountInBracket = Math.max(0, Math.min(taxableAmount - previousLimit, bracket.limit - previousLimit));
    if (amountInBracket <= 0) break;
    tax += amountInBracket * bracket.rate;
    previousLimit = bracket.limit;
  }
  return tax;
};

// Internal function missing the marginal rate
const calculateCoreTax = (inputs: TaxInputs, provinceCode: ProvinceCode): Omit<TaxResult, 'marginalRate'> => {
  const {
    employment = 0,
    capitalGains = 0,
    eligibleDividends = 0,
    ineligibleDividends = 0,
    rrsp = 0,
    fhsa = 0
  } = inputs;

  const totalGrossIncome = employment + capitalGains + eligibleDividends + ineligibleDividends;

  let cgInclusion = 0;
  if (capitalGains <= 250000) {
    cgInclusion = capitalGains * 0.5;
  } else {
    cgInclusion = (250000 * 0.5) + ((capitalGains - 250000) * (2/3));
  }

  const grossedUpEligible = eligibleDividends * 1.38;
  const grossedUpIneligible = ineligibleDividends * 1.15;
  const totalDeductions = rrsp + fhsa;

  let netIncomeForTax = employment + cgInclusion + grossedUpEligible + grossedUpIneligible - totalDeductions;
  netIncomeForTax = Math.max(0, netIncomeForTax);

  const fedTaxBeforeCredits = calculateProgressiveTax(netIncomeForTax, FEDERAL_BRACKETS);
  const fedBpa = 15705; 
  const fedBpaCredit = fedBpa * 0.15;
  const fedEligibleDTC = grossedUpEligible * 0.150198;
  const fedIneligibleDTC = grossedUpIneligible * 0.090301;
  const totalFedCredits = fedBpaCredit + fedEligibleDTC + fedIneligibleDTC;
  const fedTax = Math.max(0, fedTaxBeforeCredits - totalFedCredits);

  const provData = PROVINCIAL_DATA[provinceCode];
  let provTaxBeforeCredits = calculateProgressiveTax(netIncomeForTax, provData.brackets);
  const provBpaCredit = provData.bpa * provData.brackets[0].rate;
  const provEligibleDTC = grossedUpEligible * provData.eligibleDTC;
  const provIneligibleDTC = grossedUpIneligible * provData.ineligibleDTC;

  let provTax = Math.max(0, provTaxBeforeCredits - provBpaCredit - provEligibleDTC - provIneligibleDTC);

  if (provinceCode === 'ON') {
    let surtax = 0;
    if (provTax > 5500) surtax += (provTax - 5500) * 0.20;
    if (provTax > 7100) surtax += (provTax - 7100) * 0.36;
    provTax += surtax;
    
    if (netIncomeForTax > 20000) {
      provTax += Math.min(900, (netIncomeForTax - 20000) * 0.06);
    }
  }

  const totalTax = fedTax + provTax;
  const effectiveRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;

  return {
    federal: fedTax,
    provincial: provTax,
    totalTax: totalTax,
    takeHome: totalGrossIncome - totalTax,
    effectiveRate: isNaN(effectiveRate) ? 0 : effectiveRate,
    totalGrossIncome,
    taxableIncome: netIncomeForTax
  };
};

export const calculateTax = (inputs: TaxInputs, provinceCode: ProvinceCode): TaxResult => {
  const baseResult = calculateCoreTax(inputs, provinceCode);
  const marginalInputs = { ...inputs, employment: (inputs.employment || 0) + 100 };
  const marginalResult = calculateCoreTax(marginalInputs, provinceCode);
  const marginalRate = marginalResult.totalTax - baseResult.totalTax;

  return {
    ...baseResult,
    marginalRate: Math.max(0, marginalRate)
  };
};