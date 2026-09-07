import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Package, Heart, Ticket, MapPin, CreditCard, RotateCcw, 
  Globe, Moon, HelpCircle, Info, LogOut, Edit3, X, Phone, MessageSquare, Mail, Building
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Settings State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.name || 'Amit Kumar');
  const [email, setEmail] = useState(user?.email || 'amitky2056@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaved(true);
    setTimeout(() => {
      setIsProfileSaved(false);
      setIsEditProfileOpen(false);
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`py-8 md:py-14 min-h-screen transition-colors ${isDarkMode ? 'bg-neutral-900 text-white' : 'bg-background text-neutral-900'}`}>
      <Container className="max-w-3xl mx-auto space-y-6">
        
        {/* User Header Info Card */}
        <div className={`p-6 rounded-3xl border shadow-xs flex items-center justify-between gap-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-800 text-amber-300 font-serif font-black text-xl flex items-center justify-center border-2 border-emerald-600 shadow-md">
              {fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif">{fullName}</h1>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="p-2.5 rounded-2xl bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-800 transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* 3 Stat Counters Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/orders"
            className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:border-emerald-500' : 'bg-surface border-border hover:border-emerald-800/30'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-800/10 text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div className="text-lg font-black font-serif">0</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Orders</div>
          </Link>

          <Link
            to="/wishlist"
            className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:border-emerald-500' : 'bg-surface border-border hover:border-emerald-800/30'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-lg font-black font-serif">0</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Wishlist</div>
          </Link>

          <div
            className={`p-4 rounded-2xl border text-center space-y-1 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="text-lg font-black font-serif">0</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Coupons</div>
          </div>
        </div>

        {/* Section 1: Account Settings matching App */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Account Settings</h2>

          <div className="space-y-1">
            <Link
              to="/orders"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">My Orders</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Track and manage your orders</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

            <Link
              to="/orders"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">Returns &amp; Refunds</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Status of your refund/replacement requests</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsEditProfileOpen(true)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">Shipping Addresses</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Manage your delivery locations</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </div>

            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsEditProfileOpen(true)}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">Payment Methods</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Saved cards and UPI</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </div>
          </div>
        </div>

        {/* Section 2: Support & Preferences matching App */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
            {language === 'HI' ? 'सहायता और प्राथमिकताएं' : 'Support & Preferences'}
          </h2>

          <div className="space-y-3">
            
            {/* Language Switcher */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">{language === 'HI' ? 'भाषा' : 'Language'}</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {language === 'HI' ? 'हिंदी' : 'English'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLanguage(l => l === 'EN' ? 'HI' : 'EN')}
                className="px-3 py-1 bg-emerald-800/10 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-800/20"
              >
                {language === 'EN' ? 'EN ➔ HI' : 'HI ➔ EN'}
              </button>
            </div>

            {/* Dark Mode Switcher */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">{language === 'HI' ? 'डार्क मोड' : 'Dark Mode'}</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Currently {isDarkMode ? 'Dark' : 'Light'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${isDarkMode ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Help Center Trigger */}
            <div
              onClick={() => setIsHelpCenterOpen(true)}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">{language === 'HI' ? 'हेल्प सेंटर' : 'Help Center'}</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>FAQs and support chat</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </div>

            {/* About Kosmico */}
            <Link
              to="/about"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">{language === 'HI' ? 'कॉस्मको के बारे में' : 'About Kosmico'}</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Our story and values</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

          </div>
        </div>

        {/* Logout Button matching App */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl border border-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'HI' ? 'लॉगआउट' : 'Logout'}</span>
        </button>

      </Container>

      {/* MODAL 1: EDIT PROFILE */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-neutral-900">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              {isProfileSaved && (
                <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center">
                  ✓ Profile updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: HELP CENTER matching App */}
      {isHelpCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">Help Center</h3>
                <p className="text-xs text-neutral-500">How can we help you today?</p>
              </div>
              <button onClick={() => setIsHelpCenterOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:+919793170555" className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 hover:border-emerald-800 transition-colors">
                <Phone className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Call Us</div>
                <div className="text-[10px] text-neutral-500">Mon-Sat 11AM - 7PM</div>
              </a>

              <Link to="/ai-consultant" onClick={() => setIsHelpCenterOpen(false)} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 hover:border-emerald-800 transition-colors">
                <MessageSquare className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Live Chat</div>
                <div className="text-[10px] text-neutral-500">Instant AI Support</div>
              </Link>

              <a href="mailto:supportkosmicowellness@gmail.com" className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 hover:border-emerald-800 transition-colors">
                <Mail className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Email Us</div>
                <div className="text-[10px] text-neutral-500">Response in 24 hours</div>
              </a>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
                <Building className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Visit Us</div>
                <div className="text-[10px] text-neutral-500">Greater Noida</div>
              </div>
            </div>

            {/* Full Details Section matching Video */}
            <div className="bg-emerald-50 border border-emerald-800/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 text-xs">Main Office Address</div>
              <p className="text-neutral-700 text-[11px] leading-relaxed">
                1305 &amp; 1307 A, 13th Floor, Tower 3, NX One Tower, Greater Noida (West), Gautam Buddha Nagar, UP, India - 201306
              </p>
              <div className="pt-2 border-t border-emerald-800/10 flex justify-between text-[11px]">
                <span className="font-bold text-neutral-800">Support Line:</span>
                <span className="text-emerald-800 font-bold">+91 97931 70555</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
