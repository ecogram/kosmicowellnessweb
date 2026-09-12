import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Eye, 
  X, 
  Sparkles, 
  Beaker,
  ArrowRight,
  Zap,
  Leaf,
  Coffee,
  Cookie,
  Wine,
  Utensils
} from 'lucide-react';
import { Lifestyle } from '../features/home/Lifestyle';
import { FinalCta } from '../features/home/FinalCta';

export function HowItWorksPage() {
  // Modal state for HD Document inspection
  const [activeModalDoc, setActiveModalDoc] = useState<{
    title: string;
    imageSrc: string;
    pdfSrc: string;
    reportNo?: string;
    labName?: string;
    description: string;
  } | null>(null);

  return (
    <div className="flex flex-col w-full bg-[#f8faf8] pt-24 pb-16 font-sans">
      
      {/* 1. Header Hero Banner */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-emerald-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/20 text-[#0a7a40] text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>100% Certified Pure Monk Fruit • Lab Verified</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-neutral-900 leading-[1.15] mb-6">
            How Kosmico Sweet Monk Works
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Experience the miracle of ancient Monk Fruit (Luo Han Guo). Replaces regular table sugar 1:1 cup-for-cup with <strong>zero calories, zero net carbs, and zero blood glucose spikes</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-neutral-700">
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-900/10">
              <ShieldCheck className="w-4 h-4 text-[#0a7a40]" />
              <span>NABL Accredited Lab Tested</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-900/10">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>0 Glycemic Index</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-900/10">
              <Leaf className="w-4 h-4 text-[#0a7a40]" />
              <span>100% Plant-Based</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Official Lab Reports & Quality Certificates Section */}
      <section className="py-12 md:py-16 bg-white border-y border-emerald-900/10">
        <Container className="max-w-6xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#0a7a40] font-extrabold tracking-widest uppercase text-xs mb-2 block">
              Official Verification &amp; Certification
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 mb-4">
              Certified Lab Reports &amp; Nutrition Facts
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Every batch of Kosmico Sweet Monk is independently tested by government-approved food testing laboratories to guarantee 100% purity and zero sugar. Click on any document to view in HD or download the official PDF.
            </p>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
            
            {/* Document Card 1: Official Test Report (COA) */}
            <div className="bg-gradient-to-b from-stone-50 to-white rounded-3xl border border-neutral-200/90 p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0a7a40] flex items-center justify-center font-bold">
                      <Beaker className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-neutral-900">Lab Test Report (COA)</h3>
                      <p className="text-xs text-neutral-500 font-medium">Qualiset Food Laboratories LLP • QFL/160726/05</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-[#0a7a40] text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shrink-0">
                    Verified
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                  Complete microbiological and nutritional value testing confirming <strong>0.00g Moisture, 0.0g Protein, 0.0g Sugars, and 0.0 Kcal Calories</strong> in Monk Fruit Liquid Sweetener.
                </p>

                {/* High Resolution Image Preview */}
                <div 
                  onClick={() => setActiveModalDoc({
                    title: 'Official Lab Test Report (Certificate of Analysis)',
                    imageSrc: '/assets/reports/lab-test-report.jpg',
                    pdfSrc: '/assets/reports/lab-test-report.pdf',
                    reportNo: 'QFL/160726/05',
                    labName: 'Qualiset Food Laboratories LLP, Rajkot',
                    description: 'Tested and verified by Qualiset Food Laboratories LLP for Green Sugar Pvt. Ltd. Sample: Monk Fruit Liquid Sweetener.'
                  })}
                  className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-white p-3 shadow-inner cursor-pointer group-hover:border-[#0a7a40]/50 transition-all mb-6 aspect-[4/5] flex items-center justify-center"
                >
                  <img 
                    src="/assets/reports/lab-test-report.jpg" 
                    alt="Official Lab Test Report - Kosmico Sweet Monk" 
                    className="w-full h-full object-contain drop-shadow transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <span className="bg-white text-neutral-900 font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-[#0a7a40]" />
                      Click to View HD
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveModalDoc({
                    title: 'Official Lab Test Report (Certificate of Analysis)',
                    imageSrc: '/assets/reports/lab-test-report.jpg',
                    pdfSrc: '/assets/reports/lab-test-report.pdf',
                    reportNo: 'QFL/160726/05',
                    labName: 'Qualiset Food Laboratories LLP, Rajkot',
                    description: 'Tested and verified by Qualiset Food Laboratories LLP for Green Sugar Pvt. Ltd. Sample: Monk Fruit Liquid Sweetener.'
                  })}
                  className="flex-1 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#0a7a40] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full HD Report</span>
                </button>
                <a
                  href="/assets/reports/lab-test-report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Kosmico-Lab-Test-Report.pdf"
                  className="py-3 px-4 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {/* Document Card 2: Official Nutrition Facts Label */}
            <div className="bg-gradient-to-b from-stone-50 to-white rounded-3xl border border-neutral-200/90 p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-neutral-900">Nutrition Facts Label</h3>
                      <p className="text-xs text-neutral-500 font-medium">Standard Dietary Declaration • 100g Serving</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shrink-0">
                    Certified
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                  Standardized nutrition panel validating <strong>0.00 Calories, 0.00g Total Fat, 0.0g Total Carbohydrates, 0.0g Sugars, and 0.0g Protein</strong> per 100 gm.
                </p>

                {/* High Resolution Image Preview */}
                <div 
                  onClick={() => setActiveModalDoc({
                    title: 'Official Nutrition Facts Label',
                    imageSrc: '/assets/reports/nutrition-facts-label.jpg',
                    pdfSrc: '/assets/reports/nutrition-facts-label.pdf',
                    reportNo: 'Standard Nutrition Label',
                    labName: 'Green Sugar Pvt. Ltd. Regulatory Compliance',
                    description: 'Certified Nutrition Facts Panel for Kosmico Sweet Monk Fruit Liquid Drops.'
                  })}
                  className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-white p-3 shadow-inner cursor-pointer group-hover:border-[#0a7a40]/50 transition-all mb-6 aspect-[4/5] flex items-center justify-center"
                >
                  <img 
                    src="/assets/reports/nutrition-facts-label.jpg" 
                    alt="Official Nutrition Facts Label - Kosmico Sweet Monk" 
                    className="w-full h-full object-contain drop-shadow transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <span className="bg-white text-neutral-900 font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-[#0a7a40]" />
                      Click to View HD
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveModalDoc({
                    title: 'Official Nutrition Facts Label',
                    imageSrc: '/assets/reports/nutrition-facts-label.jpg',
                    pdfSrc: '/assets/reports/nutrition-facts-label.pdf',
                    reportNo: 'Standard Nutrition Label',
                    labName: 'Green Sugar Pvt. Ltd. Regulatory Compliance',
                    description: 'Certified Nutrition Facts Panel for Kosmico Sweet Monk Fruit Liquid Drops.'
                  })}
                  className="flex-1 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#0a7a40] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full HD Label</span>
                </button>
                <a
                  href="/assets/reports/nutrition-facts-label.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Kosmico-Nutrition-Facts-Label.pdf"
                  className="py-3 px-4 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

          </div>

          {/* 3. Verified Nutritional Breakdown Table */}
          <div className="bg-[#f0fdf4] rounded-3xl border border-emerald-800/20 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-neutral-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0a7a40]" />
                  <span>Laboratory Test Summary (Per 100g)</span>
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Sample: Monk Fruit Liquid Sweetener (250ml) • Report: QFL/160726/05
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0a7a40] bg-white px-3 py-1.5 rounded-full border border-emerald-800/20 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#0a7a40]" />
                100% Zero-Sugar Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-800/15 text-neutral-500 text-xs uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-4">Test Parameter</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Test Method</th>
                    <th className="py-3 px-4">Lab Certified Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/10">
                  <tr className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">Calories</td>
                    <td className="py-3.5 px-4 text-neutral-600">Kcal</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-xs">By Calculation</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0a7a40]">0.0 Kcal</td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">Total Sugar &amp; Added Sugar</td>
                    <td className="py-3.5 px-4 text-neutral-600">g/100g</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-xs">QFL.SOP.TS.01</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0a7a40]">0.0 g (Zero Sugar)</td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">Total Carbohydrates</td>
                    <td className="py-3.5 px-4 text-neutral-600">g/100g</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-xs">By Calculation</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0a7a40]">0.00 g (Zero Net Carbs)</td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">Total &amp; Trans Fatty Acids</td>
                    <td className="py-3.5 px-4 text-neutral-600">g/100g</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-xs">Soxhlet Extraction</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0a7a40]">0.0 g (Zero Fat)</td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">Cholesterol &amp; Sodium</td>
                    <td className="py-3.5 px-4 text-neutral-600">mg/100g</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-xs">QFL.SOP.TC.01</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0a7a40]">0.0 mg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </Container>
      </section>

      {/* 4. How to Use Kosmico in Daily Life (Everyday Usage) */}
      <section className="py-14 md:py-20 bg-[#f8faf8]">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Image Column */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative shadow-2xl border-4 border-white">
                <img
                  src="/assets/products/lifestyle-tea.jpg"
                  alt="Kosmico Sweet Monk used in morning tea"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent flex items-end p-8">
                  <div className="text-white">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Easy 1:1 Replacement</span>
                    <h3 className="font-serif text-2xl font-bold mt-1">Stirs instantly in hot or cold beverages</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Text & Grid Column */}
            <div className="w-full lg:w-1/2">
              <span className="text-[#0a7a40] font-extrabold tracking-widest uppercase text-xs mb-3 block">
                Simple Daily Usage
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 mb-6 leading-tight">
                A 1:1 direct replacement for table sugar.
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 mb-8 leading-relaxed">
                No complex math or conversion charts needed. Just 2 to 4 drops sweeten your cup of tea, coffee, smoothie, or dessert with the exact rich sweetness of cane sugar — with zero aftertaste.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0a7a40] mb-3">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Tea &amp; Coffee</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Dissolves smoothly in morning chai or espresso without curdling milk or altering flavor.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
                    <Cookie className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Baking &amp; Desserts</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Heat stable up to 220°C. Perfect for baking cakes, kheer, halwa, and sweet treats.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 mb-3">
                    <Wine className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Cold Mocktails &amp; Shakes</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Instant liquid blending in lemonade, protein shakes, and fruit smoothies without graininess.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-neutral-200/80">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 mb-3">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-base mb-1">Breakfast Bowls</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Drizzle over oats, chia puddings, and yogurts for wholesome guilt-free sweetness.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 5. Lifestyle & Social Proof Sections */}
      <Lifestyle />

      {/* 6. Final CTA Section */}
      <FinalCta />

      {/* Full HD Document Zoom / Inspection Modal */}
      {activeModalDoc && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModalDoc(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-[#f8faf8]">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">{activeModalDoc.title}</h3>
                <p className="text-xs text-neutral-500 font-medium">{activeModalDoc.labName} • {activeModalDoc.reportNo}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeModalDoc.pdfSrc}
                  download
                  className="py-2 px-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => setActiveModalDoc(null)}
                  className="w-9 h-9 rounded-xl bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Full HD Image */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-neutral-100 flex items-center justify-center flex-1">
              <img 
                src={activeModalDoc.imageSrc} 
                alt={activeModalDoc.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg border border-neutral-300 bg-white" 
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
              <p>{activeModalDoc.description}</p>
              <Link to="/shop" onClick={() => setActiveModalDoc(null)}>
                <button className="px-5 py-2.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span>Shop Sweet Monk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
