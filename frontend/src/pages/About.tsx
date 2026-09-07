import React from 'react';
import { Container } from '../components/ui/Container';
import { ShieldCheck, Award, Globe, Code, Sparkles, Building2, Layers } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="py-12 md:py-20 bg-background min-h-screen">
      <Container className="max-w-4xl mx-auto">
        
        {/* Top Header Card matching Video */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancient Wisdom, Modern Living</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight">
              KOSMICO WELLNESS PRIVATE LIMITED
            </h1>

            <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              Kosmico is a leading Indian contract manufacturer specializing in premium Ayurvedic and herbal products. Having partnered with over 100 companies, we combine deep-rooted commitment to Ayurvedic traditions with modern technology to deliver products of exceptional quality.
            </p>
          </div>
        </div>

        {/* 3 Metrics Cards matching Video */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-1 hover:border-emerald-800/30 transition-all">
            <div className="text-3xl font-black text-emerald-800 font-serif">100+</div>
            <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Partner Brands</div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-1 hover:border-emerald-800/30 transition-all">
            <div className="text-3xl font-black text-emerald-800 font-serif">500+</div>
            <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Natural Products</div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-1 hover:border-emerald-800/30 transition-all">
            <div className="text-3xl font-black text-emerald-800 font-serif">Global</div>
            <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Market Reach</div>
          </div>
        </div>

        {/* Our Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Our Mission */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-neutral-900">Our Mission</h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              To provide premium quality Ayurvedic and herbal healthcare products that promote wellness and natural healing, while maintaining the highest standards of manufacturing excellence. We believe in harnessing the power of nature to create solutions that enhance lives.
            </p>
          </div>

          {/* Our Vision */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6 text-emerald-700" />
            </div>
            <h2 className="text-xl font-serif font-bold text-neutral-900">Our Vision</h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              To become a globally recognized leader in Ayurvedic and herbal product manufacturing, empowering businesses worldwide to bring natural healthcare solutions to their customers. We envision a future where traditional medicine and modern science work hand in hand.
            </p>
          </div>

        </div>

        {/* Developed By Section matching Video */}
        <div className="bg-emerald-900/5 border border-emerald-800/20 rounded-3xl p-8 mb-12 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Code className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-serif font-bold text-lg text-neutral-900">Developed By</h3>
          </div>
          <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
            This application was crafted and engineered by <strong className="text-emerald-900 font-bold">Shubham kr Tiwari</strong> and <strong className="text-emerald-900 font-bold">Abhay Kumar</strong> (Kosmico Engineering &amp; Development Team), combining modern mobile &amp; web architecture (Flutter &amp; AI Vision) with ancient Ayurvedic wellness principles.
          </p>
        </div>

        {/* Core Strengths Grid */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-neutral-900 text-center">Core Strengths</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Advanced Facilities</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">State-of-the-art manufacturing infrastructure with modern technology.</p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Global Expertise</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">Successfully launched 100+ brands in domestic and international markets.</p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Quality Control</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">Rigorous standards and testing for all Ayurvedic product manufacturing.</p>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
};
