import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Package, Heart, Ticket, MapPin, CreditCard, RotateCcw, 
  Globe, Moon, HelpCircle, Info, LogOut, Edit3, X, Phone, MessageSquare, Mail, Building,
  Plus, Trash2, Home, Briefcase, CheckCircle2, Smartphone
} from 'lucide-react';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'UPI' | 'BANK';
  displayName: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  isDefault: boolean;
}

const DEFAULT_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'UPI',
    displayName: 'AMIT KUMAR',
    upiId: '7068368474@ybl',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'BANK',
    displayName: 'AMIT KUMAR',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 5678',
    ifscCode: 'SBIN0001234',
    isDefault: false,
  },
];

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    fullName: 'Amit Kumar',
    phone: '+91 98765 43210',
    addressLine1: 'Flat 402, Green Valley Apartments, Sector 62',
    addressLine2: 'Near Metro Station',
    city: 'Noida',
    state: 'Uttar Pradesh',
    postalCode: '201301',
    country: 'India',
    type: 'HOME',
    isDefault: true
  },
  {
    id: 'addr-2',
    fullName: 'Amit Kumar',
    phone: '+91 97931 70555',
    addressLine1: 'Tower 3, NX One Commercial Complex',
    addressLine2: '4th Floor, Suite 423',
    city: 'Greater Noida West',
    state: 'Uttar Pradesh',
    postalCode: '201306',
    country: 'India',
    type: 'WORK',
    isDefault: false
  }
];

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Settings State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.name || 'Amit Kumar');
  const [email, setEmail] = useState(user?.email || 'amitky2056@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Address Management State
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('kosmico_saved_addresses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_ADDRESSES;
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');
  
  // Address Form State
  const [addrFormName, setAddrFormName] = useState(fullName);
  const [addrFormPhone, setAddrFormPhone] = useState(phone);
  const [addrFormLine1, setAddrFormLine1] = useState('');
  const [addrFormLine2, setAddrFormLine2] = useState('');
  const [addrFormCity, setAddrFormCity] = useState('Noida');
  const [addrFormState, setAddrFormState] = useState('Uttar Pradesh');
  const [addrFormPincode, setAddrFormPincode] = useState('201301');
  const [addrFormType, setAddrFormType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);

  // Payment Methods State (App Exact Match - UPI & Bank Account)
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(() => {
    const saved = localStorage.getItem('kosmico_saved_payment_methods');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [paymentTypeTab, setPaymentTypeTab] = useState<'BANK' | 'UPI'>('UPI');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Form fields
  const [bankAccountHolder, setBankAccountHolder] = useState(fullName);
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankSetDefault, setBankSetDefault] = useState(true);

  const [upiDisplayName, setUpiDisplayName] = useState(fullName);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiSetDefault, setUpiSetDefault] = useState(true);

  // Update name/email when user changes
  useEffect(() => {
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  // Save to localStorage when modified
  useEffect(() => {
    localStorage.setItem('kosmico_saved_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('kosmico_saved_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

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

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFormName(fullName);
    setAddrFormPhone(phone);
    setAddrFormLine1('');
    setAddrFormLine2('');
    setAddrFormCity('Noida');
    setAddrFormState('Uttar Pradesh');
    setAddrFormPincode('201301');
    setAddrFormType('HOME');
    setAddrFormIsDefault(addresses.length === 0);
    setIsAddingAddress(true);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrFormName(addr.fullName);
    setAddrFormPhone(addr.phone);
    setAddrFormLine1(addr.addressLine1);
    setAddrFormLine2(addr.addressLine2 || '');
    setAddrFormCity(addr.city);
    setAddrFormState(addr.state);
    setAddrFormPincode(addr.postalCode);
    setAddrFormType(addr.type);
    setAddrFormIsDefault(addr.isDefault);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    setAddressSuccessMsg('Address removed successfully');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    setAddressSuccessMsg('Default delivery address updated');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFormLine1 || !addrFormPincode) return;

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            fullName: addrFormName,
            phone: addrFormPhone,
            addressLine1: addrFormLine1,
            addressLine2: addrFormLine2,
            city: addrFormCity,
            state: addrFormState,
            postalCode: addrFormPincode,
            type: addrFormType,
            isDefault: addrFormIsDefault
          };
        }
        return addrFormIsDefault ? { ...a, isDefault: false } : a;
      }));
      setAddressSuccessMsg('Address updated successfully');
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        fullName: addrFormName,
        phone: addrFormPhone,
        addressLine1: addrFormLine1,
        addressLine2: addrFormLine2,
        city: addrFormCity,
        state: addrFormState,
        postalCode: addrFormPincode,
        country: 'India',
        type: addrFormType,
        isDefault: addrFormIsDefault || addresses.length === 0
      };

      setAddresses(prev => {
        const list = addrFormIsDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
        return [newAddr, ...list];
      });
      setAddressSuccessMsg('New address added successfully');
    }

    setIsAddingAddress(false);
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  // Render

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
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif">{fullName}</h1>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 text-[11px] font-black rounded-full border border-amber-500/30">
                    👑 ADMIN
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="p-2.5 rounded-2xl bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-800 transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* Admin Dashboard Quick Banner (Only for admin users) */}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="p-4 rounded-3xl bg-linear-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-2 border-amber-500/40 flex items-center justify-between hover:border-amber-500 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                👑
              </div>
              <div>
                <div className="font-extrabold text-sm text-neutral-900 flex items-center gap-2">
                  <span>Admin Dashboard</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full uppercase">Admin Control</span>
                </div>
                <div className="text-xs text-neutral-600">
                  Manage products, orders, user roles & live analytics
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs group-hover:translate-x-1 transition-transform">
              <span>Open Panel</span>
              <span>&rsaquo;</span>
            </div>
          </Link>
        )}

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

            {/* Shipping Addresses Trigger */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsAddressesOpen(true)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">Shipping Addresses</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {addresses.length} saved location{addresses.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </div>

            {/* Payment Methods Trigger */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsPaymentMethodsOpen(true)}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">Payment Methods</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {paymentMethods.length} saved method{paymentMethods.length === 1 ? '' : 's'} (UPI / Bank)
                  </div>
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
                className="px-3 py-1 bg-emerald-800/10 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-800/20 cursor-pointer"
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
                className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${isDarkMode ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'}`}
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
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-2xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer">
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
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SHIPPING ADDRESSES */}
      {isAddressesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-lg text-neutral-900">Delivery Addresses</h3>
              </div>
              <button 
                onClick={() => { setIsAddressesOpen(false); setIsAddingAddress(false); }} 
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addressSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{addressSuccessMsg}</span>
              </div>
            )}

            {/* Address List View */}
            {!isAddingAddress ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Manage where your Ayurvedic orders get delivered</span>
                  <button
                    onClick={handleOpenAddAddress}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl space-y-3">
                    <MapPin className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-sm font-semibold text-neutral-600">No saved addresses yet</p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          addr.isDefault 
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs' 
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-900">{addr.fullName}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 ${
                                addr.type === 'HOME' ? 'bg-amber-100 text-amber-800' :
                                addr.type === 'WORK' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'
                              }`}>
                                {addr.type === 'HOME' && <Home className="w-2.5 h-2.5" />}
                                {addr.type === 'WORK' && <Briefcase className="w-2.5 h-2.5" />}
                                {addr.type}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-700 leading-snug">
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                            </p>
                            <p className="text-xs text-neutral-600 font-medium">
                              {addr.city}, {addr.state} - <span className="font-bold text-neutral-800">{addr.postalCode}</span>
                            </p>
                            <p className="text-xs text-neutral-500 pt-0.5">
                              Phone: <span className="text-neutral-800 font-semibold">{addr.phone}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="p-1.5 text-neutral-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {!addr.isDefault && (
                          <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-end">
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
                            >
                              Set as Default Delivery Address
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Add/Edit Address Form */
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="font-bold text-sm text-neutral-800">
                    {editingAddressId ? 'Edit Address' : 'New Address Details'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addrFormName}
                      onChange={(e) => setAddrFormName(e.target.value)}
                      placeholder="Receiver name"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={addrFormPhone}
                      onChange={(e) => setAddrFormPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addrFormLine1}
                    onChange={(e) => setAddrFormLine1(e.target.value)}
                    placeholder="e.g. Flat 402, Green Valley Apartments, Sector 62"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Landmark / Area (Optional)</label>
                  <input
                    type="text"
                    value={addrFormLine2}
                    onChange={(e) => setAddrFormLine2(e.target.value)}
                    placeholder="e.g. Near Metro Station / Behind Mall"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={addrFormPincode}
                      onChange={(e) => setAddrFormPincode(e.target.value)}
                      placeholder="201301"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addrFormCity}
                      onChange={(e) => setAddrFormCity(e.target.value)}
                      placeholder="Noida"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={addrFormState}
                      onChange={(e) => setAddrFormState(e.target.value)}
                      placeholder="UP"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                {/* Address Type Selector */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">Address Type</label>
                  <div className="flex gap-2">
                    {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddrFormType(type)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          addrFormType === type 
                            ? 'bg-emerald-800 text-white border-emerald-800' 
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultAddr"
                    checked={addrFormIsDefault}
                    onChange={(e) => setAddrFormIsDefault(e.target.checked)}
                    className="rounded text-emerald-800 focus:ring-emerald-800 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isDefaultAddr" className="text-xs text-neutral-700 font-semibold cursor-pointer">
                    Make this my default shipping address
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT METHODS (APP EXACT MATCH) */}
      {isPaymentMethodsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  {isAddingPaymentMethod ? 'Add Payment Method' : 'Payment Methods'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsPaymentMethodsOpen(false); setIsAddingPaymentMethod(false); }} 
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {!isAddingPaymentMethod ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">Saved Methods</span>
                  <button
                    onClick={() => setIsAddingPaymentMethod(true)}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-4 bg-[#0a7a40] text-white rounded-2xl shadow-sm flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                            {pm.type === 'BANK' ? <Building className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {pm.type === 'BANK' ? 'BANK' : 'UPI'}
                          </span>
                          {pm.isDefault && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-sm tracking-wide mt-1">
                          {pm.type === 'BANK' ? `${pm.bankName || 'Bank'} - ${pm.accountNumber}` : pm.upiId}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                          <span className="text-[10px] uppercase font-bold text-emerald-200">DISPLAY NAME:</span>
                          <span className="font-bold uppercase text-white">{pm.displayName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPaymentMethods(prev => prev.filter(m => m.id !== pm.id));
                          setPaymentSuccessMsg('Payment method removed');
                          setTimeout(() => setPaymentSuccessMsg(''), 2000);
                        }}
                        className="p-2 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ADD PAYMENT METHOD FORM (BANK ACCOUNT & UPI ID TABS) */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (paymentTypeTab === 'UPI') {
                    if (!upiIdInput.trim()) return;
                    const newMethod: SavedPaymentMethod = {
                      id: `pm-${Date.now()}`,
                      type: 'UPI',
                      displayName: (upiDisplayName || fullName || 'AMIT KUMAR').toUpperCase(),
                      upiId: upiIdInput.trim(),
                      isDefault: upiSetDefault,
                    };
                    let list = paymentMethods;
                    if (upiSetDefault) list = list.map(m => ({ ...m, isDefault: false }));
                    setPaymentMethods([newMethod, ...list]);
                    setUpiIdInput('');
                  } else {
                    if (!bankAccountNumber.trim() || !bankIfscCode.trim()) return;
                    const newMethod: SavedPaymentMethod = {
                      id: `pm-${Date.now()}`,
                      type: 'BANK',
                      displayName: (bankAccountHolder || fullName || 'AMIT KUMAR').toUpperCase(),
                      bankName: bankName.trim() || 'Bank Account',
                      accountNumber: bankAccountNumber.trim(),
                      ifscCode: bankIfscCode.trim().toUpperCase(),
                      isDefault: bankSetDefault,
                    };
                    let list = paymentMethods;
                    if (bankSetDefault) list = list.map(m => ({ ...m, isDefault: false }));
                    setPaymentMethods([newMethod, ...list]);
                    setBankAccountNumber('');
                    setBankIfscCode('');
                    setBankName('');
                  }
                  setIsAddingPaymentMethod(false);
                  setPaymentSuccessMsg('New payment method added successfully');
                  setTimeout(() => setPaymentSuccessMsg(''), 2500);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-2">Select Payment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentTypeTab('BANK')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentTypeTab === 'BANK'
                          ? 'border-[#0a7a40] bg-emerald-50 text-[#0a7a40] font-bold'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Building className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">Bank Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentTypeTab('UPI')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentTypeTab === 'UPI'
                          ? 'border-[#0a7a40] bg-emerald-50 text-[#0a7a40] font-bold'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">UPI ID</span>
                    </button>
                  </div>
                </div>

                {paymentTypeTab === 'BANK' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value)}
                        placeholder="e.g. Amit Kumar"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. State Bank of India / HDFC Bank"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={bankIfscCode}
                        onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 uppercase focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-neutral-700">Set as Default Method</span>
                      <input
                        type="checkbox"
                        checked={bankSetDefault}
                        onChange={(e) => setBankSetDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0a7a40] focus:ring-[#0a7a40] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {paymentTypeTab === 'UPI' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Display Name</label>
                      <input
                        type="text"
                        required
                        value={upiDisplayName}
                        onChange={(e) => setUpiDisplayName(e.target.value)}
                        placeholder="e.g. AMIT KUMAR"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">UPI ID</label>
                      <input
                        type="text"
                        required
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="e.g. 7068368474@ybl or yourname@okaxis"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div className="flex items-start gap-1.5 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Ensure your UPI ID is correct to avoid payment failures.</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-neutral-700">Set as Default Method</span>
                      <input
                        type="checkbox"
                        checked={upiSetDefault}
                        onChange={(e) => setUpiSetDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0a7a40] focus:ring-[#0a7a40] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPaymentMethod(false)}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: HELP CENTER matching App */}
      {isHelpCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">Help Center</h3>
                <p className="text-xs text-neutral-500">How can we help you today?</p>
              </div>
              <button onClick={() => setIsHelpCenterOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer">
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
