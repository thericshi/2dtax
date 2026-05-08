export type ProvinceCode = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

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

// Simplified approximation of 2024 Provincial brackets, Basic Personal Amounts, and Dividend Tax Credits
const PROVINCIAL_DATA: Record<ProvinceCode, { brackets: TaxBracket[], bpa: number, eligibleDTC: number, ineligibleDTC: number, hasSurtax?: boolean }> = {
  AB: {
    brackets: [{ limit: 148269, rate: 0.10 }, { limit: 177922, rate: 0.12 }, { limit: 237230, rate: 0.13 }, { limit: 355845, rate: 0.14 }, { limit: Infinity, rate: 0.15 }],
    bpa: 21885, eligibleDTC: 0.0812, ineligibleDTC: 0.0218
  },
  BC: {
    brackets: [{ limit: 47937, rate: 0.0506 }, { limit: 95875, rate: 0.077 }, { limit: 110057, rate: 0.105 }, { limit: 133664, rate: 0.1229 }, { limit: 181232, rate: 0.147 }, { limit: 252752, rate: 0.168 }, { limit: Infinity, rate: 0.205 }],
    bpa: 12580, eligibleDTC: 0.12, ineligibleDTC: 0.0196
  },
  MB: {
    brackets: [{ limit: 47000, rate: 0.108 }, { limit: 100000, rate: 0.1275 }, { limit: Infinity, rate: 0.174 }],
    bpa: 15780, eligibleDTC: 0.08, ineligibleDTC: 0.0078
  },
  NB: {
    brackets: [{ limit: 49958, rate: 0.094 }, { limit: 99916, rate: 0.1482 }, { limit: 185064, rate: 0.1652 }, { limit: Infinity, rate: 0.195 }],
    bpa: 13044, eligibleDTC: 0.14, ineligibleDTC: 0.0275
  },
  NL: {
    brackets: [{ limit: 43198, rate: 0.087 }, { limit: 86395, rate: 0.145 }, { limit: 154244, rate: 0.158 }, { limit: 215943, rate: 0.178 }, { limit: 275870, rate: 0.198 }, { limit: 551739, rate: 0.208 }, { limit: 1103478, rate: 0.213 }, { limit: Infinity, rate: 0.218 }],
    bpa: 10818, eligibleDTC: 0.054, ineligibleDTC: 0.032
  },
  NT: {
    brackets: [{ limit: 50597, rate: 0.059 }, { limit: 101196, rate: 0.086 }, { limit: 164525, rate: 0.122 }, { limit: Infinity, rate: 0.1405 }],
    bpa: 16615, eligibleDTC: 0.1136, ineligibleDTC: 0.022
  },
  NS: {
    brackets: [{ limit: 29590, rate: 0.0879 }, { limit: 59180, rate: 0.1495 }, { limit: 93000, rate: 0.1667 }, { limit: 150000, rate: 0.175 }, { limit: Infinity, rate: 0.21 }],
    bpa: 11481, eligibleDTC: 0.0885, ineligibleDTC: 0.0299
  },
  NU: {
    brackets: [{ limit: 53268, rate: 0.04 }, { limit: 106537, rate: 0.07 }, { limit: 173205, rate: 0.09 }, { limit: Infinity, rate: 0.115 }],
    bpa: 18767, eligibleDTC: 0.0551, ineligibleDTC: 0.0261
  },
  ON: {
    brackets: [{ limit: 51446, rate: 0.0505 }, { limit: 102894, rate: 0.0915 }, { limit: 150000, rate: 0.1116 }, { limit: 220000, rate: 0.1216 }, { limit: Infinity, rate: 0.1316 }],
    bpa: 12399, hasSurtax: true, eligibleDTC: 0.10, ineligibleDTC: 0.029863
  },
  PE: {
    brackets: [{ limit: 32656, rate: 0.0965 }, { limit: 64313, rate: 0.1363 }, { limit: 105000, rate: 0.1665 }, { limit: 140000, rate: 0.1875 }, { limit: Infinity, rate: 0.1875 }],
    bpa: 13500, eligibleDTC: 0.105, ineligibleDTC: 0.0196
  },
  QC: {
    brackets: [{ limit: 51059, rate: 0.14 }, { limit: 102114, rate: 0.19 }, { limit: 125359, rate: 0.24 }, { limit: Infinity, rate: 0.2575 }],
    bpa: 18056, eligibleDTC: 0.119, ineligibleDTC: 0.0398
  },
  SK: {
    brackets: [{ limit: 52057, rate: 0.105 }, { limit: 148734, rate: 0.125 }, { limit: Infinity, rate: 0.145 }],
    bpa: 18491, eligibleDTC: 0.11, ineligibleDTC: 0.0336
  },
  YT: {
    brackets: [{ limit: 55867, rate: 0.064 }, { limit: 111733, rate: 0.09 }, { limit: 173205, rate: 0.109 }, { limit: 500000, rate: 0.1289 }, { limit: Infinity, rate: 0.15 }],
    bpa: 15705, eligibleDTC: 0.1202, ineligibleDTC: 0.023
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
  
  let fedTax = Math.max(0, fedTaxBeforeCredits - totalFedCredits);

  // Quebec receives a 16.5% Federal tax abatement
  if (provinceCode === 'QC') {
    fedTax = fedTax * (1 - 0.165);
  }

  const provData = PROVINCIAL_DATA[provinceCode];
  let provTaxBeforeCredits = calculateProgressiveTax(netIncomeForTax, provData.brackets);
  const provBpaCredit = provData.bpa * provData.brackets[0].rate;
  const provEligibleDTC = grossedUpEligible * provData.eligibleDTC;
  const provIneligibleDTC = grossedUpIneligible * provData.ineligibleDTC;

  let provTax = Math.max(0, provTaxBeforeCredits - provBpaCredit - provEligibleDTC - provIneligibleDTC);

  // Ontario Specific Health Premium and Surtaxes
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