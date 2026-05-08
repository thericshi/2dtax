// TaxLogic.js
const FEDERAL_BRACKETS = [
  { limit: 55867, rate: 0.15 },
  { limit: 111733, rate: 0.205 },
  { limit: 173205, rate: 0.26 },
  { limit: 246752, rate: 0.29 },
  { limit: Infinity, rate: 0.33 },
];

const PROVINCIAL_DATA = {
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
  }
};

const calculateProgressiveTax = (income, brackets, bpa) => {
  let taxableIncome = Math.max(0, income - bpa);
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const amountInBracket = Math.min(taxableIncome, bracket.limit - previousLimit);
    if (amountInBracket <= 0) break;
    tax += amountInBracket * bracket.rate;
    taxableIncome -= amountInBracket;
    previousLimit = bracket.limit;
  }
  return tax;
};

export const calculateTax = (income, provinceCode) => {
  const fedTax = calculateProgressiveTax(income, FEDERAL_BRACKETS, 15705); // Fed BPA 2025/26
  const provData = PROVINCIAL_DATA[provinceCode];
  let provTax = calculateProgressiveTax(income, provData.brackets, provData.bpa);

  // Ontario Surtax Calculation
  if (provinceCode === 'ON') {
    let surtax = 0;
    if (provTax > 5500) surtax += (provTax - 5500) * 0.20;
    if (provTax > 7100) surtax += (provTax - 7100) * 0.36;
    provTax += surtax;
    
    // Ontario Health Premium (Approximate steps)
    if (income > 20000) provTax += Math.min(900, (income - 20000) * 0.06);
  }

  const totalTax = fedTax + provTax;
  return {
    federal: fedTax,
    provincial: provTax,
    takeHome: income - totalTax,
    totalTax,
    marginalRate: (totalTax / income) * 100
  };
};