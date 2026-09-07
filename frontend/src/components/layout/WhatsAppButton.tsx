import { useState } from 'react';
import { X } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210'; // +91 98765 43210 — change this
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello! I came across Kosmiko Wellness and I\'m interested in learning more about your monk fruit sweetener. Can you help me? 😊'
);

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip / Chat Bubble */}
      {showTooltip && (
        <div className="relative bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 max-w-[220px] animate-fade-in-up">
          {/* Close button */}
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 text-neutral-600" />
          </button>

          {/* Avatar + Name */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              K
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 leading-tight">Kosmiko Support</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                <p className="text-[10px] text-green-600 font-medium">Online Now</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Namaste! 👋 Koi bhi sawaal ho toh WhatsApp pe poochho. Hum yahan hain!
          </p>

          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-8 w-4 h-2 overflow-hidden">
            <div className="w-3 h-3 bg-white border-r border-b border-neutral-100 rotate-45 translate-y-[-6px] mx-auto shadow-sm"></div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#25D366' }}
        onClick={() => setShowTooltip(false)}
      >
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: '#25D366' }}></span>

        {/* WhatsApp SVG icon */}
        <svg
          viewBox="0 0 32 32"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 relative z-10"
        >
          <path d="M16.002 2C8.268 2 2 8.268 2 16c0 2.484.668 4.812 1.832 6.816L2 30l7.392-1.802A13.934 13.934 0 0016.002 30C23.734 30 30 23.732 30 16S23.734 2 16.002 2zm0 25.5c-2.266 0-4.388-.608-6.218-1.668l-.444-.264-4.39 1.07 1.114-4.264-.29-.456A11.46 11.46 0 014.5 16c0-6.351 5.151-11.5 11.502-11.5S27.5 9.649 27.5 16c0 6.351-5.148 11.5-11.498 11.5zm6.29-8.612c-.344-.172-2.036-1.004-2.352-1.118-.316-.116-.546-.172-.776.172s-.89 1.118-1.09 1.348c-.202.228-.402.258-.746.086-.344-.172-1.452-.534-2.768-1.706-1.022-.91-1.712-2.034-1.912-2.378-.2-.344-.022-.53.15-.7.154-.154.344-.402.516-.602.17-.202.226-.344.34-.574.114-.228.056-.43-.028-.602-.086-.172-.776-1.872-1.064-2.562-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.602.086-.916.43-.316.344-1.206 1.178-1.206 2.874s1.234 3.334 1.406 3.562c.172.228 2.43 3.706 5.888 5.198.824.356 1.468.568 1.97.728.826.264 1.58.226 2.174.138.662-.1 2.036-.832 2.322-1.636.286-.802.286-1.49.2-1.634-.082-.144-.314-.228-.658-.4z" />
        </svg>
      </a>
    </div>
  );
}
