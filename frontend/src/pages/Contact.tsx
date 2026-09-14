import { Container } from '../components/ui/Container';
import { Mail, Phone, MapPin, Clock, Building, Headphones } from 'lucide-react';

export function Contact() {
  const handleCallClick = () => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = 'tel:+919793170555';
    }
  };

  const handleEmailClick = () => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = 'mailto:support@kosmicowellness.com?subject=Inquiry%20regarding%20Kosmico%20Wellness';
    }
  };

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
          {/* 1. Call Us */}
          <a
            href="https://wa.me/919793170555?text=Hello%20Kosmico%20Wellness%2C%20I%20would%20like%20to%20connect%20with%20support."
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCallClick}
            className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2 hover:border-[#0a7a40] hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 group-hover:bg-[#0a7a40] group-hover:text-white mx-auto flex items-center justify-center font-bold transition-colors">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#0a7a40] transition-colors">Call Us</h3>
            <p className="text-xs text-neutral-500">Mon-Sat 11AM - 7PM</p>
            <div className="text-xs font-bold text-emerald-800 mt-2">+91 97931 70555</div>
          </a>

          {/* 2. Email Us */}
          <a
            href="https://mail.google.com/mail/?view=cm&to=support@kosmicowellness.com&su=Inquiry%20regarding%20Kosmico%20Wellness"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleEmailClick}
            className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2 hover:border-[#0a7a40] hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 group-hover:bg-[#0a7a40] group-hover:text-white mx-auto flex items-center justify-center font-bold transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#0a7a40] transition-colors">Email Us</h3>
            <p className="text-xs text-neutral-500">Response in 24 hours</p>
            <div className="text-xs font-bold text-emerald-800 mt-2 break-all">support@kosmicowellness.com</div>
          </a>

          {/* 3. Visit Us (Clickable Google Maps link) */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=NX+One+Tower+Greater+Noida+West+201306"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface p-6 rounded-3xl border border-border shadow-xs text-center space-y-2 hover:border-[#0a7a40] hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 text-emerald-800 group-hover:bg-[#0a7a40] group-hover:text-white mx-auto flex items-center justify-center font-bold transition-colors">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#0a7a40] transition-colors">Visit Us</h3>
            <p className="text-xs text-neutral-500">Greater Noida (West)</p>
            <div className="text-xs font-bold text-emerald-800 mt-2 flex items-center justify-center gap-1">
              <span>UP, India</span>
              <span className="text-[10px] font-normal underline">(View Map)</span>
            </div>
          </a>
        </div>

        {/* Full Contact Details Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface p-8 sm:p-10 rounded-3xl border border-border shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-neutral-900 border-b border-border pb-3">Full Contact Details</h2>

            <div className="space-y-6 text-sm">

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Main Office Address</h3>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=NX+One+Tower+Greater+Noida+West+201306"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-emerald-800 text-xs sm:text-sm leading-relaxed block group"
                  >
                    423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), Gautam Buddha Nagar, UP, India - 201306
                    <span className="text-xs font-semibold text-emerald-800 group-hover:underline block mt-1">📍 Open in Google Maps ➔</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Customer Support Line</h3>
                  <a
                    href="https://wa.me/919793170555?text=Hello%20Kosmico%20Wellness%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCallClick}
                    className="text-sm font-bold text-emerald-800 hover:underline"
                  >
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
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=support@kosmicowellness.com&su=Inquiry%20regarding%20Kosmico%20Wellness"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleEmailClick}
                    className="text-sm font-bold text-emerald-800 hover:underline"
                  >
                    support@kosmicowellness.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/10 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Operating Hours</h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Mon - Sat: 11:00 AM - 7:00 PM <br />
                    Sunday: <span className="font-semibold text-rose-600">Closed</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
