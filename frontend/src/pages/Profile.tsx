import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlist } from '../hooks/useWishlist';
import { useOrders } from '../hooks/useOrders';
import { useCoupons } from '../hooks/useCoupons';
import { api } from '../services/api';
import { 
  Package, Heart, Ticket, MapPin, CreditCard, RotateCcw, 
  Globe, Moon, HelpCircle, Info, LogOut, Edit3, X, Phone, MessageSquare, Mail, Building,
  Plus, Trash2, Home, Briefcase, CheckCircle2, Smartphone, Camera, Upload, RefreshCw, Check, AlertCircle
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
    phone: '+91 97931 70555',
    addressLine1: 'Tower 3, NX One Commercial Complex, Suite 423',
    addressLine2: 'Techzone 4, Greater Noida West',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    postalCode: '201306',
    country: 'India',
    type: 'HOME',
    isDefault: true
  }
];

export const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { data: wishlist } = useWishlist();
  const { data: ordersData } = useOrders({ page: 1, limit: 100 });
  const { data: couponsData } = useCoupons();
  const navigate = useNavigate();

  const ordersCount = ordersData?.orders ? ordersData.orders.length : (ordersData?.pagination?.total ?? 0);
  const wishlistCount = wishlist?.items?.length || 0;
  const couponsCount = couponsData ? couponsData.filter((c: any) => c.isActive !== false).length : 0;

  // Settings State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.name || (user as any)?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || (user as any)?.profileImage || (user as any)?.avatar || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Photo Selection & Live Camera State
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [capturedLivePhoto, setCapturedLivePhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editModalFileInputRef = useRef<HTMLInputElement>(null);

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

  // Synchronize state when store user changes
  useEffect(() => {
    const currentName = user?.name || (user as any)?.fullName;
    if (currentName) setFullName(currentName);
    if (user?.email) setEmail(user.email);
    const currentPic = user?.profilePicture || (user as any)?.profileImage || (user as any)?.avatar;
    if (currentPic !== undefined) {
      setProfilePicture(currentPic || '');
      setImageLoadError(false);
    }
    const userPhone = user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || '';
    if (userPhone) setPhone(userPhone);
  }, [user]);

  // Fetch fresh user profile from API on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const fetchedUser = res.data?.data?.user || res.data?.data;
        if (fetchedUser) {
          const freshName = fetchedUser.name || fetchedUser.fullName;
          if (freshName) setFullName(freshName);
          if (fetchedUser.email) setEmail(fetchedUser.email);
          const freshPic = fetchedUser.profilePicture || fetchedUser.profileImage || fetchedUser.avatar;
          if (freshPic !== undefined) {
            setProfilePicture(freshPic || '');
            setImageLoadError(false);
          }
          const p = fetchedUser.phoneNumber || fetchedUser.phone || fetchedUser.mobile || '';
          if (p) setPhone(p);
          updateUser(fetchedUser);
        }
      } catch (err) {
        console.warn('Backend user profile fetch notice:', err);
      }
    };

    fetchUserProfile();
  }, [updateUser]);

  // Fetch live addresses from backend
  const fetchLiveAddresses = async () => {
    try {
      const res = await api.get('/address');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list) && list.length > 0) {
        const formatted: SavedAddress[] = list.map((a: any) => ({
          id: a._id || a.id,
          fullName: a.fullName || fullName,
          phone: a.phoneNumber || a.phone || phone,
          addressLine1: a.streetAddress || a.addressLine1 || '',
          addressLine2: a.addressLine2 || '',
          city: a.city || 'Noida',
          state: a.state || 'Uttar Pradesh',
          postalCode: a.pincode || a.postalCode || '201301',
          country: a.country || 'India',
          type: (a.addressLabel?.toUpperCase() === 'WORK' ? 'WORK' : a.addressLabel?.toUpperCase() === 'OTHER' ? 'OTHER' : 'HOME') as 'HOME' | 'WORK' | 'OTHER',
          isDefault: !!a.isDefault
        }));
        setAddresses(formatted);
      }
    } catch (err) {
      console.warn('Backend address fetch notice:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveAddresses();
    }
  }, [user]);

  // Save to localStorage when modified
  useEffect(() => {
    localStorage.setItem('kosmico_saved_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('kosmico_saved_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Image compressor utility to resize & compress image files
  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Start Live Camera feed
  const startLiveCamera = async (facing: 'user' | 'environment' = 'user') => {
    setCameraError(null);
    setCapturedLivePhoto(null);
    setCameraFacing(facing);
    setIsPhotoPickerOpen(false);
    setIsCameraModalOpen(true);

    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by your browser or connection is not secure (HTTPS / Localhost required).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play notice:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'Could not access camera device.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser address bar/settings to take a live photo.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.message) {
        msg = err.message;
      }
      setCameraError(msg);
    }
  };

  // Toggle Front / Back Camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    startLiveCamera(nextFacing);
  };

  // Stop Camera & Close Modal
  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraModalOpen(false);
    setCapturedLivePhoto(null);
    setCameraError(null);
  };

  // Bind video srcObject when modal is active
  useEffect(() => {
    if (isCameraModalOpen && videoRef.current && cameraStream && !capturedLivePhoto) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video play notice:', e));
    }
  }, [isCameraModalOpen, cameraStream, capturedLivePhoto]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  // Snap Snapshot from Live Video
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);
    
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop to make square avatar
    const sx = (width - size) / 2;
    const sy = (height - size) / 2;

    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedLivePhoto(dataUrl);
  };

  // Apply Captured Live Photo
  const handleApplyCapturedPhoto = async () => {
    if (!capturedLivePhoto) return;
    const photo = capturedLivePhoto;
    setProfilePicture(photo);
    setImageLoadError(false);
    stopLiveCamera();

    try {
      setIsUploadingPhoto(true);
      const res = await api.put('/auth/profile', {
        name: fullName.trim() || user?.name,
        phoneNumber: phone.trim() || user?.phoneNumber,
        profilePicture: photo,
      });
      const updatedUser = res.data?.data?.user || res.data?.data || { profilePicture: photo };
      updateUser(updatedUser);
      const serverPic = updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar;
      if (serverPic) setProfilePicture(serverPic);
    } catch (err) {
      console.warn('Profile picture save warning:', err);
      updateUser({ profilePicture: photo });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Image File Upload Handlers (Gallery / File Explorer)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await compressImage(file);
      if (compressedDataUrl) {
        setProfilePicture(compressedDataUrl);
        setImageLoadError(false);
        setIsPhotoPickerOpen(false);

        // Send via FormData for 100% native mobile app compatibility
        const formData = new FormData();
        formData.append('name', fullName.trim() || user?.name || '');
        formData.append('phoneNumber', phone.trim() || user?.phoneNumber || '');
        formData.append('profilePicture', file);

        try {
          const res = await api.put('/auth/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const updatedUser = res.data?.data?.user || res.data?.data;
          if (updatedUser) {
            updateUser(updatedUser);
            const serverPic = updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar;
            if (serverPic) setProfilePicture(serverPic);
          }
        } catch (formErr) {
          // Fallback to JSON payload if multipart proxy error
          const res = await api.put('/auth/profile', {
            name: fullName.trim() || user?.name,
            phoneNumber: phone.trim() || user?.phoneNumber,
            profilePicture: compressedDataUrl,
          });
          const updatedUser = res.data?.data?.user || res.data?.data || { profilePicture: compressedDataUrl };
          updateUser(updatedUser);
          const serverPic = updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar;
          if (serverPic) setProfilePicture(serverPic);
        }
      }
    } catch (err) {
      console.warn('Profile picture save warning:', err);
    } finally {
      setIsUploadingPhoto(false);
      // Reset input value so same file can be re-selected if needed
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setProfilePicture('');
    setImageLoadError(false);
    setIsPhotoPickerOpen(false);
    try {
      setIsUploadingPhoto(true);
      const res = await api.delete('/auth/remove-profile-picture');
      const updatedUser = res.data?.data?.user || res.data?.data || { profilePicture: '' };
      updateUser(updatedUser);
    } catch (err) {
      console.warn('Remove picture warning:', err);
      updateUser({ profilePicture: '' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    try {
      const payload: any = {
        name: cleanName,
        fullName: cleanName,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
      };
      if (profilePicture && profilePicture.trim().length > 0) {
        payload.profilePicture = profilePicture.trim();
        payload.profileImage = profilePicture.trim();
        payload.avatar = profilePicture.trim();
      }

      const res = await api.put('/auth/profile', payload);
      const updatedUser = res.data?.data?.user || res.data?.data;
      if (updatedUser) {
        if (updatedUser.name) setFullName(updatedUser.name);
        const p = updatedUser.phoneNumber || updatedUser.phone || cleanPhone;
        if (p) setPhone(p);
        const pic = updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar || profilePicture;
        if (pic) setProfilePicture(pic);
        updateUser(updatedUser);
      } else {
        updateUser({
          name: cleanName,
          fullName: cleanName,
          phoneNumber: cleanPhone,
          phone: cleanPhone,
        });
      }
    } catch (err) {
      console.warn('Backend update profile notice:', err);
      updateUser({
        name: cleanName,
        fullName: cleanName,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
      });
    }

    setIsProfileSaved(true);
    setTimeout(() => {
      setIsProfileSaved(false);
      setIsEditProfileOpen(false);
    }, 1000);
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

  const handleDeleteAddress = async (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    try {
      if (!id.startsWith('addr-')) {
        await api.delete(`/address/${id}`);
      }
    } catch (err) {
      console.warn('Backend delete address notice:', err);
    }
    setAddressSuccessMsg('Address removed successfully');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSetDefaultAddress = async (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    try {
      if (!id.startsWith('addr-')) {
        await api.put(`/address/set-default/${id}`);
      }
    } catch (err) {
      console.warn('Backend set default address notice:', err);
    }
    setAddressSuccessMsg('Default delivery address updated');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFormLine1 || !addrFormPincode) return;

    const payload = {
      addressLabel: addrFormType === 'HOME' ? 'Home' : addrFormType === 'WORK' ? 'Work' : 'Other',
      fullName: addrFormName,
      streetAddress: addrFormLine1 + (addrFormLine2 ? ', ' + addrFormLine2 : ''),
      city: addrFormCity,
      state: addrFormState,
      pincode: addrFormPincode,
      phoneNumber: addrFormPhone,
      isDefault: addrFormIsDefault
    };

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

      try {
        if (!editingAddressId.startsWith('addr-')) {
          await api.put(`/address/${editingAddressId}`, payload);
        } else {
          const res = await api.post('/address', payload);
          if (res.data?.data?._id) {
            setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, id: res.data.data._id } : a));
          }
        }
      } catch (err) {
        console.warn('Backend update address notice:', err);
      }
      setAddressSuccessMsg('Address updated successfully');
    } else {
      const tempId = `addr-${Date.now()}`;
      const newAddr: SavedAddress = {
        id: tempId,
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

      try {
        const res = await api.post('/address', payload);
        if (res.data?.data?._id) {
          setAddresses(prev => prev.map(a => a.id === tempId ? { ...a, id: res.data.data._id } : a));
        }
      } catch (err) {
        console.warn('Backend add address notice:', err);
      }
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
        <div className={`p-4 sm:p-6 rounded-3xl border shadow-xs flex items-center justify-between gap-3 sm:gap-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative group shrink-0">
              {profilePicture && !imageLoadError ? (
                <img
                  src={profilePicture}
                  alt={user?.name || fullName || 'User'}
                  onError={() => setImageLoadError(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-emerald-600 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-800 text-amber-300 font-serif font-black text-lg sm:text-xl flex items-center justify-center border-2 border-emerald-600 shadow-md uppercase">
                  {((user?.name || fullName || 'U').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || 'U').slice(0, 2)}
                </div>
              )}

              {/* Camera Upload Badge */}
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a7a40] hover:bg-[#086334] text-white flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Picture (Camera / Upload)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-serif truncate">{user?.name || fullName || 'User'}</h1>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 text-[10px] sm:text-[11px] font-black rounded-full border border-amber-500/30 shrink-0">
                    👑 ADMIN
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{user?.email || email}</p>
              {(user?.phoneNumber || phone) && (
                <p className={`text-[11px] font-medium mt-0.5 truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  📞 {user?.phoneNumber || phone}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setFullName(user?.name || (user as any)?.fullName || fullName || '');
              setEmail(user?.email || email || '');
              setPhone(user?.phoneNumber || (user as any)?.phone || phone || '');
              setProfilePicture(profilePicture || user?.profilePicture || (user as any)?.profileImage || (user as any)?.avatar || '');
              setIsEditProfileOpen(true);
            }}
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
            <div className="text-lg font-black font-sans">{ordersCount}</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Orders</div>
          </Link>

          <Link
            to="/wishlist"
            className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:border-emerald-500' : 'bg-surface border-border hover:border-emerald-800/30'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-lg font-black font-sans">{wishlistCount}</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Wishlist</div>
          </Link>

          <Link
            to="/coupons"
            className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${isDarkMode ? 'bg-neutral-800 border-neutral-700 hover:border-emerald-500' : 'bg-surface border-border hover:border-emerald-800/30'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="text-lg font-black font-sans">{couponsCount}</div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Coupons</div>
          </Link>
        </div>

        {/* Section 1: Account Settings matching App */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Account Settings</h2>

          <div className="space-y-1">
            <Link
              to="/coupons"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-sm font-bold">My Coupons &amp; Offers</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {couponsCount > 0 ? `${couponsCount} active promo voucher${couponsCount === 1 ? '' : 's'} available` : 'No active coupons available right now'}
                  </div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

            <Link
              to="/wishlist"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-600" />
                <div>
                  <div className="text-sm font-bold">My Wishlist</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {wishlistCount ? `${wishlistCount} saved item(s)` : 'View and manage saved products'}
                  </div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

            <Link
              to="/orders"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-800" />
                <div>
                  <div className="text-sm font-bold">My Orders</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {ordersCount > 0 ? `${ordersCount} order${ordersCount === 1 ? '' : 's'} placed • Track status` : 'Track and manage your orders'}
                  </div>
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
                  <div className="text-sm font-bold">{language === 'HI' ? 'कॉस्मिको के बारे में' : 'About Kosmico'}</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Our philosophy and mission</div>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">&rsaquo;</span>
            </Link>

          </div>
        </div>

        {/* Section 3: App Version & Logout */}
        <div className="space-y-4 pt-2">
          <div className="text-center">
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
              Kosmico Wellness • Web &amp; App v1.0.4
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-3xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'HI' ? 'लॉग आउट' : 'Log Out'}</span>
          </button>
        </div>

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
              {/* Profile Photo Uploader Section */}
              <div className="flex flex-col items-center justify-center pb-4 border-b border-neutral-100 space-y-3">
                <div className="relative">
                  {profilePicture && !imageLoadError ? (
                    <img
                      src={profilePicture}
                      alt="Profile Preview"
                      onError={() => setImageLoadError(true)}
                      className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-800 text-amber-300 font-serif font-black text-2xl flex items-center justify-center border-2 border-emerald-600 shadow-md uppercase">
                      {((fullName || user?.name || 'U').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || 'U').slice(0, 2)}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPhotoPickerOpen(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0a7a40] text-white shadow-md border-2 border-white hover:bg-[#086334] cursor-pointer transition-transform hover:scale-110"
                    title="Upload / Change Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={editModalFileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveCamera('user')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Live Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editModalFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-emerald-800/10"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {isUploadingPhoto && (
                  <p className="text-[11px] text-emerald-700 font-semibold animate-pulse">Saving photo...</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(val)) {
                      setFullName(val);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || email}
                  disabled
                  readOnly
                  className="w-full px-4 py-2.5 border border-neutral-200 bg-neutral-100 rounded-xl text-sm text-neutral-500 cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Registered email address cannot be changed</p>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g. 9793170555)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
                />
              </div>

              {isProfileSaved && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Profile updated and saved successfully!</span>
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

              <a href="mailto:support@kosmicowellness.com" className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 hover:border-emerald-800 transition-colors">
                <Mail className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Email Us</div>
                <div className="text-[10px] text-neutral-500">Response in 24 hours</div>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=NX+One+Tower+Greater+Noida+West+201306"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 hover:border-emerald-800 transition-colors block cursor-pointer"
              >
                <Building className="w-5 h-5 text-emerald-800 mx-auto" />
                <div className="font-bold text-xs text-neutral-900">Visit Us</div>
                <div className="text-[10px] text-neutral-500">Greater Noida</div>
              </a>
            </div>

            {/* Full Details Section matching Video */}
            <div className="bg-emerald-50 border border-emerald-800/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 text-xs">Main Office Address</div>
              <p className="text-neutral-700 text-[11px] leading-relaxed">
                423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), Gautam Buddha Nagar, UP, India - 201306
              </p>
              <div className="pt-2 border-t border-emerald-800/10 flex justify-between text-[11px]">
                <span className="font-bold text-neutral-800">Support Line:</span>
                <span className="text-emerald-800 font-bold">+91 97931 70555</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PHOTO SELECTION ACTION SHEET */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">Profile Picture</h3>
                <p className="text-xs text-neutral-500">Choose how you want to update your picture</p>
              </div>
              <button 
                onClick={() => setIsPhotoPickerOpen(false)} 
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Live Camera */}
              <button
                type="button"
                onClick={() => startLiveCamera('user')}
                className="w-full p-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-between transition-all shadow-md cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold">Take Live Photo</div>
                    <div className="text-[11px] text-emerald-100 font-normal">Open webcam / phone camera</div>
                  </div>
                </div>
                <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
              </button>

              {/* Option 2: Upload from Device */}
              <button
                type="button"
                onClick={() => {
                  setIsPhotoPickerOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-neutral-900 font-bold text-sm flex items-center justify-between transition-colors border border-stone-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800/10 flex items-center justify-center text-emerald-800">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-neutral-900">Upload from Device</div>
                    <div className="text-[11px] text-neutral-500 font-normal">Choose JPG, PNG, or WEBP</div>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
              </button>

              {/* Option 3: Remove Current Photo */}
              {profilePicture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-between transition-colors border border-rose-200/80 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-extrabold">Remove Current Photo</div>
                      <div className="text-[11px] text-rose-400 font-normal">Reset to initials avatar</div>
                    </div>
                  </div>
                  <span className="text-rose-400 group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsPhotoPickerOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: LIVE CAMERA CAPTURE */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/10 text-emerald-800 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900">
                    {capturedLivePhoto ? 'Preview Photo' : 'Take Live Photo'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {capturedLivePhoto ? 'Looking good? Click save to update profile' : 'Align your face inside the frame'}
                  </p>
                </div>
              </div>
              <button 
                onClick={stopLiveCamera} 
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title="Close Camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Error Display */}
            {cameraError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-rose-800">Camera Access Error</h4>
                  <p className="text-xs text-rose-600 mt-1">{cameraError}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => startLiveCamera(cameraFacing)}
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Upload File Instead
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Viewport Frame */}
                <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-neutral-900 shadow-inner border-2 border-emerald-800/30 flex items-center justify-center">
                  {capturedLivePhoto ? (
                    <img
                      src={capturedLivePhoto}
                      alt="Captured Live Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                      {/* Avatar Alignment Target Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
                      </div>
                    </>
                  )}

                  {/* Camera Flip Switch on Live Feed */}
                  {!capturedLivePhoto && (
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all shadow-md cursor-pointer active:scale-95"
                      title="Switch Front / Back Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Shutter / Action Controls */}
                {!capturedLivePhoto ? (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSnapPhoto}
                      className="w-16 h-16 rounded-full bg-linear-to-tr from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 text-white flex items-center justify-center shadow-lg border-4 border-white cursor-pointer active:scale-90 transition-transform"
                      title="Click to Snap Photo"
                    >
                      <Camera className="w-7 h-7" />
                    </button>
                    <span className="text-xs font-semibold text-neutral-600">Tap to capture picture</span>
                  </div>
                ) : (
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCapturedLivePhoto(null)}
                      className="flex-1 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyCapturedPhoto}
                      disabled={isUploadingPhoto}
                      className="flex-1 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isUploadingPhoto ? 'Saving...' : 'Use This Photo'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

