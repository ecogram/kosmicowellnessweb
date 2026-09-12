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
    id: 'nutrition-facts-label',
    title: 'Certified Nutrition Facts Label',
    subtitle: 'Standard Regulatory Food Label • 100g Serving Declaration',
    badge: '0.00 Calories Certified',
    badgeColor: 'bg-amber-100 text-amber-900',
    imageSrc: '/assets/products/nutrition-facts-label.jpg',
    fallbackSrc: '/assets/reports/nutrition-facts-label.jpg',
    description: 'Standardized Nutrition Facts panel declaring 0.00 Calories, 0g Total Fat, 0g Sodium, 0g Carbohydrates, 0g Protein per 100 gm serving for dietary compliance.',
    highlights: ['100g Serving Size', '0.00 Total Calories', '0% Daily Value Fat', '0% Daily Value Sodium']
  }
];
