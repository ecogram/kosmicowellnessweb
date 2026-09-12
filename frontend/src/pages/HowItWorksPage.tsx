import { useState } from 'react';
import { Container } from '../components/ui/Container';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  ZoomIn, 
  X, 
  Sparkles, 
  Beaker,
  FileText,
  Zap,
  Leaf,
  Coffee,
  Cookie,
  Wine,
  Utensils
} from 'lucide-react';
import { Lifestyle } from '../features/home/Lifestyle';
import { FinalCta } from '../features/home/FinalCta';
import { CERTIFICATES, type CertificateItem } from '../data/certificates';

export function HowItWorksPage() {
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);

  return (
    <div className="flex flex-col w-full bg-[#f8faf8] pt-24 pb-16 font-sans">
      
      {/* 1. Header Hero Banner */}
      <section className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-emerald-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <Container className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/20 text-[#0a7a40] text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>100% Certified Pure Monk Fruit • Lab Verified</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-neutral-900 leading-[1.15] mb-5">
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
              Quality &amp; Lab Certifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 mb-3">
              Official Lab Test Report &amp; Nutrition Facts
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Tested and certified by Qualiset Food Laboratories LLP. Click any certificate to enlarge in high definition.
            </p>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-14">
            {CERTIFICATES.map((cert) => (
              <div 
                key={cert.id}
                className="bg-[#fafcfa] rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header Title */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0a7a40] flex items-center justify-center font-bold shrink-0">
                        {cert.id === 'lab-test-report' ? <Beaker className="w-5 h-5" /> : <FileText className="w-5 h-5 text-amber-800" />}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-neutral-900 leading-snug">{cert.title}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{cert.subtitle}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shrink-0 ${cert.badgeColor}`}>
                      {cert.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                    {cert.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cert.highlights.map((hl, i) => (
                      <span key={i} className="bg-white border border-emerald-900/10 text-neutral-800 text-[11px] font-bold px-3 py-1 rounded-lg shadow-2xs">
                        ✓ {hl}
                      </span>
                    ))}
                  </div>

                  {/* Document Frame / Preview */}
                  <div 
                    onClick={() => setActiveCert(cert)}
                    className="w-full bg-white rounded-2xl border border-neutral-300 p-3 sm:p-5 shadow-sm cursor-pointer group hover:border-[#0a7a40] hover:shadow-md transition-all relative overflow-hidden flex items-center justify-center"
                  >
                    <img 
                      src={cert.imageSrc} 
                      alt={cert.title}
                      className="w-full h-auto max-h-[520px] object-contain rounded-md transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="eager"
                      onError={(e: any) => {
                        if (e.target.src !== cert.fallbackSrc) {
                          e.target.src = cert.fallbackSrc;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <span className="bg-white text-neutral-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-[#0a7a40]" />
                        Click to Enlarge HD View
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCert(cert)}
                  className="mt-6 w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#0a7a40] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>View Full Certificate (HD)</span>
                </button>
              </div>
            ))}
          </div>

          {/* 3. Verified Nutritional Breakdown Summary Table */}
          <div className="bg-[#f0fdf4] rounded-3xl border border-emerald-800/20 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-neutral-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0a7a40]" />
                  <span>Lab Test Parameters &amp; Results (Per 100g)</span>
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Sample: Monk Fruit Liquid Sweetener (250ml) • Qualiset Food Lab Report: QFL/160726/05
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

      {/* 4. Everyday Usage Guide */}
      <section className="py-14 md:py-20 bg-[#f8faf8]">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
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

      {/* Full-Screen HD Modal Viewer */}
      {activeCert && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveCert(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-neutral-200 bg-[#f8faf8]">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-900">{activeCert.title}</h3>
                <p className="text-xs text-neutral-500 font-medium">{activeCert.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveCert(null)}
                className="w-9 h-9 rounded-xl bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full HD Certificate Image */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-neutral-100 flex items-center justify-center flex-1">
              <img 
                src={activeCert.imageSrc} 
                alt={activeCert.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg border border-neutral-300 bg-white" 
                onError={(e: any) => {
                  if (e.target.src !== activeCert.fallbackSrc) {
                    e.target.src = certFallback(activeCert);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function certFallback(cert: CertificateItem): string {
  return cert.fallbackSrc;
}
