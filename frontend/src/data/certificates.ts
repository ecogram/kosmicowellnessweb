export interface CertificateItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  imageSrc: string;
  fallbackSrc: string;
  description: string;
  highlights: string[];
}

export const CERTIFICATES: CertificateItem[] = [
  {
    id: 'coa-drops-report',
    title: 'Official Certificate of Analysis (COA)',
    subtitle: 'Official Quality Analysis & Composition Report',
    badge: '100% Zero-Sugar Verified',
    badgeColor: 'bg-emerald-100 text-[#0a7a40]',
    imageSrc: '/assets/reports/coa-drops-report.jpg',
    fallbackSrc: '/assets/reports/coa-drops-report.jpg',
    description: 'Official laboratory analysis verifying 0.00 Kcal Calories, 0.0g Sugar, 0.0g Carbohydrates, and zero artificial additives in Kosmico Monk Fruit Liquid Sweetener.',
    highlights: ['0.00 Kcal Calories', '0.0g Total Sugar', '0.0g Net Carbs', '0.0g Trans Fat']
  },
  {
    id: 'nutrition-facts-label',
    title: 'Certified Nutrition Facts Label',
    subtitle: 'Standard Regulatory Food Label • 100g Serving Declaration',
    badge: '0.00 Calories Certified',
    badgeColor: 'bg-amber-100 text-amber-900',
    imageSrc: '/assets/reports/label-drops-report.jpg',
    fallbackSrc: '/assets/reports/label-drops-report.jpg',
    description: 'Standardized Nutrition Facts panel declaring 0.00 Calories, 0g Total Fat, 0g Sodium, 0g Carbohydrates, 0g Protein per 100 gm serving for dietary compliance.',
    highlights: ['100g Serving Size', '0.00 Total Calories', '0% Daily Value Fat', '0% Daily Value Sodium']
  }
];
