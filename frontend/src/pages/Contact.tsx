import { Container } from '../components/ui/Container';
import { Mail, Phone, MapPin, Clock, Building, Headphones } from 'lucide-react';

export function Contact() {
  return (
    <div className="py-16 md:py-24 bg-background">
      <Container className="max-w-5xl mx-auto space-y-12">
        
        {/* Page Title Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-serif font-extrabold text-neutral-900">Contact Us</h1>
          <p className="text-neutral-600 text-base max-w-2xl mx-auto leading-relaxed">
            Have questions about Kosmico Wellness, our Ayurvedic products, or your orders? How can we help you today?
          </p>
        </div>

        {/* Quick Contact Grid Cards matching App Video */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <a
            href="tel:+919793170555"
            className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2 hover:border-emerald-800 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Call Us</h3>
            <p className="text-xs text-neutral-500">Mon-Sat 11AM - 7PM</p>
            <div className="text-xs font-bold text-emerald-800 mt-2">+91 97931 70555</div>
          </a>

          <a
            href="mailto:supportkosmicowellness@gmail.com"
            className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2 hover:border-emerald-800 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Email Us</h3>
            <p className="text-xs text-neutral-500">Response in 24 hours</p>
            <div className="text-xs font-bold text-emerald-800 mt-2 truncate">supportkosmico...</div>
          </a>

          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Visit Us</h3>
            <p className="text-xs text-neutral-500">Greater Noida (West)</p>
            <div className="text-xs font-bold text-emerald-800 mt-2">UP, India</div>
          </div>
        </div>

        {/* Full Contact Details & Contact Form Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Detailed Info Card matching Video */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-xs space-y-6">
            <h2 className="text-xl font-serif font-bold text-neutral-900 border-b border-border pb-3">Full Contact Details</h2>

            <div className="space-y-5 text-sm">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Main Office Address</h3>
                  <p className="text-neutral-600 text-xs leading-relaxed">
                    1305 &amp; 1307 A, 13th Floor, Tower 3, NX One Tower, Greater Noida (West), Gautam Buddha Nagar, UP, India - 201306
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Customer Support Line</h3>
                  <a href="tel:+919793170555" className="text-xs font-bold text-emerald-800 hover:underline">
                    +91 97931 70555
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Official Email Support</h3>
                  <a href="mailto:supportkosmicowellness@gmail.com" className="text-xs font-bold text-emerald-800 hover:underline">
                    supportkosmicowellness@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Operating Hours</h3>
                  <p className="text-xs text-neutral-600">
                    Mon - Sat: 11:00 AM - 7:00 PM <br />
                    Sunday: <span className="font-semibold text-rose-600">Closed</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Message Form */}
          <form 
            className="bg-surface p-8 rounded-3xl border border-border shadow-xs space-y-4" 
            onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent to Kosmico Support.'); }}
          >
            <h2 className="text-xl font-serif font-bold text-neutral-900 border-b border-border pb-3">Send Us a Message</h2>

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <input type="text" id="name" required placeholder="Enter your name" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:ring-2 focus:ring-emerald-800" />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
              <input type="email" id="email" required placeholder="Enter your email" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:ring-2 focus:ring-emerald-800" />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-neutral-700 mb-1">Message</label>
              <textarea id="message" required rows={4} placeholder="How can we help you?" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:ring-2 focus:ring-emerald-800"></textarea>
            </div>

            <button type="submit" className="w-full bg-emerald-800 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-emerald-900 shadow-md transition-all">
              Send Message
            </button>
          </form>

        </div>

      </Container>
    </div>
  );
}
