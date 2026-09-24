import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlist } from '../hooks/useWishlist';
import { useOrders } from '../hooks/useOrders';
import { useCoupons } from '../hooks/useCoupons';
import { useProfile, useUpdateProfile, useRemoveProfilePicture, dataUrlToFile } from '../hooks/useProfile';
import { useSavedPaymentMethods, useSavePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from '../hooks/usePayments';
import { useSocket } from '../hooks/useSocket';
import { normalizeImageUrl } from '../utils/imageUrl';
import {
  Package, Heart, Ticket, MapPin, CreditCard, RotateCcw,
  Globe, Moon, HelpCircle, Info, LogOut, Edit3, X, Phone, MessageSquare, Mail, Building,
  Plus, Trash2, Home, Briefcase, CheckCircle2, Camera, RefreshCw, Check, AlertCircle,
  Eye, Image as ImageIcon, User as UserIcon, Loader2, MoreHorizontal, QrCode, ShieldCheck, Pencil, ChevronLeft
} from 'lucide-react';

// API docs address fields: addressLabel, fullName, streetAddress, city, pincode, phoneNumber, isDefault
interface SavedAddress {
  _id: string;
  addressLabel: 'Home' | 'Work' | 'Other';
  fullName: string;
  streetAddress: string;
  city: string;
  pincode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface SavedPaymentMethod {
  _id?: string;
  id?: string;
  type: 'UPI';
  displayName: string;
  upiId: string;
  isDefault: boolean;
}

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { data: wishlist } = useWishlist();
  const { data: ordersData } = useOrders({ page: 1, limit: 100 });
  const { data: couponsData } = useCoupons();
  const navigate = useNavigate();

  // Real-time profile & payment method sync (polling + socket events)
  useProfile();
  const { socket } = useSocket();

  // Payment methods from API
  const { data: paymentMethodsData, refetch: refetchPaymentMethods, isLoading: isPaymentMethodsLoading } = useSavedPaymentMethods();
  const savePaymentMethodMutation = useSavePaymentMethod();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const updateProfileMutation = useUpdateProfile();
  const removeProfilePictureMutation = useRemoveProfilePicture();

  useEffect(() => {
    if (!socket) return;
    const handleRealtimeSync = () => {
      refetchPaymentMethods();
    };
    socket.on('profile:updated', handleRealtimeSync);
    socket.on('user:profile_updated', handleRealtimeSync);
    socket.on('payment_methods:updated', handleRealtimeSync);

    return () => {
      socket.off('profile:updated', handleRealtimeSync);
      socket.off('user:profile_updated', handleRealtimeSync);
      socket.off('payment_methods:updated', handleRealtimeSync);
    };
  }, [socket, refetchPaymentMethods]);

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
  const initialPic = user?.profilePicture || user?.profileImage || user?.avatar || user?.avatarUrl || user?.image || (user as any)?.photo || '';
  const [profilePicture, setProfilePicture] = useState(normalizeImageUrl(initialPic));
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Photo Selection & Preview State
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [capturedLivePhoto, setCapturedLivePhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address Management State — API fields: addressLabel, fullName, streetAddress, city, pincode, phoneNumber, isDefault
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');

  // Address Form State (API-aligned field names)
  const [addrFormName, setAddrFormName] = useState('');
  const [addrFormPhone, setAddrFormPhone] = useState('');
  const [addrFormStreet, setAddrFormStreet] = useState('');
  const [addrFormCity, setAddrFormCity] = useState('');
  const [addrFormPincode, setAddrFormPincode] = useState('');
  const [addrFormLabel, setAddrFormLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);

  // Payment Methods State — loaded from API & merged with user profile methods (UPI only)
  const paymentMethods: SavedPaymentMethod[] = useMemo(() => {
    const rawList: any[] = [];
    if (Array.isArray(paymentMethodsData)) {
      rawList.push(...paymentMethodsData);
    } else if (paymentMethodsData && typeof paymentMethodsData === 'object') {
      const pmObj: any = paymentMethodsData;
      const arr = pmObj.methods || pmObj.paymentMethods || pmObj.savedPaymentMethods;
      if (Array.isArray(arr)) rawList.push(...arr);
    }

    const userMethods = (user as any)?.savedPaymentMethods || (user as any)?.paymentMethods || (user as any)?.savedMethods;
    if (Array.isArray(userMethods)) {
      rawList.push(...userMethods);
    } else if ((user as any)?.upiId) {
      rawList.push({
        _id: (user as any).upiId,
        id: (user as any).upiId,
        type: 'UPI',
        displayName: user?.name || 'UPI Account',
        upiId: (user as any).upiId,
        isDefault: true,
      });
    }

    const seen = new Set<string>();
    const result: SavedPaymentMethod[] = [];
    for (const m of rawList) {
      if (!m) continue;
      const typeUpper = String(m.type || m.methodType || (m.upiId ? 'UPI' : '')).toUpperCase();
      const upiId = (m.upiId || m.vpa || m.upi || '').trim();
      if (typeUpper.includes('BANK')) continue;
      if (!upiId) continue;

      const displayName = m.displayName || m.title || m.name || m.accountHolder || user?.name || 'UPI Account';
      const id = String(m._id || m.id || upiId);

      const key = upiId.toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push({
          _id: id,
          id,
          type: 'UPI',
          displayName,
          upiId,
          isDefault: !!m.isDefault,
        });
      }
    }
    return result;
  }, [paymentMethodsData, user]);

  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [selectedActionMethod, setSelectedActionMethod] = useState<SavedPaymentMethod | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<SavedPaymentMethod | null>(null);

  useEffect(() => {
    if (isPaymentMethodsOpen) {
      refetchPaymentMethods();
    }
  }, [isPaymentMethodsOpen]);

  // UPI Payment form fields
  const [upiDisplayName, setUpiDisplayName] = useState(fullName);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiSetDefault, setUpiSetDefault] = useState(true);

  const handleDeletePaymentMethod = async (method: SavedPaymentMethod) => {
    try {
      const idToUse = method._id || method.id || method.upiId || '';
      await deletePaymentMethodMutation.mutateAsync(idToUse);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const remaining = ((currentUser as any).savedPaymentMethods || []).filter(
          (m: any) =>
            m._id !== idToUse &&
            m.id !== idToUse &&
            (m.upiId || '').toLowerCase() !== (method.upiId || '').toLowerCase()
        );
        useAuthStore.getState().updateUser({
          ...currentUser,
          savedPaymentMethods: remaining,
          paymentMethods: remaining,
          ...(remaining.length === 0 || ((currentUser as any).upiId || '').toLowerCase() === (method.upiId || '').toLowerCase() ? { upiId: '' } : {}),
        } as any);
      }

      setPaymentSuccessMsg('Payment method removed successfully');
      setTimeout(() => setPaymentSuccessMsg(''), 2500);
      refetchPaymentMethods();
    } catch (err) {
      console.warn('Delete payment method error:', err);
    } finally {
      setSelectedActionMethod(null);
    }
  };

  const handleSetDefaultPaymentMethod = async (method: SavedPaymentMethod) => {
    try {
      const idToUse = method._id || method.id || method.upiId || '';
      await updatePaymentMethodMutation.mutateAsync({
        methodId: idToUse,
        payload: {
          isDefault: true,
          upiId: method.upiId,
          displayName: method.displayName,
        },
      });
      setPaymentSuccessMsg('Set as default payment method');
      setTimeout(() => setPaymentSuccessMsg(''), 2500);
      refetchPaymentMethods();
    } catch (err) {
      console.warn('Set default payment method error:', err);
    } finally {
      setSelectedActionMethod(null);
    }
  };

  const handleStartEditPaymentMethod = (method: SavedPaymentMethod) => {
    setEditingPaymentMethod(method);
    setUpiDisplayName(method.displayName || fullName || user?.name || '');
    setUpiIdInput(method.upiId || '');
    setUpiSetDefault(!!method.isDefault);
    setSelectedActionMethod(null);
    setIsAddingPaymentMethod(true);
  };

  // Synchronize form state when Zustand store user changes (driven by useProfile polling)
  useEffect(() => {
    // If the edit profile modal is currently open, DO NOT overwrite the user's active typing
    if (isEditProfileOpen) return;

    const currentName = user?.name || (user as any)?.fullName;
    if (currentName) setFullName(currentName);
    if (user?.email) setEmail(user.email);
    const currentPic =
      user?.profilePicture ||
      user?.profileImage ||
      user?.avatar ||
      user?.avatarUrl ||
      user?.image ||
      (user as any)?.photo ||
      '';
    setProfilePicture(normalizeImageUrl(currentPic));
    setImageLoadError(false);
    const userPhone = user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || '';
    if (userPhone) setPhone(userPhone);
  }, [user, isEditProfileOpen]);

  // Fetch live addresses from backend (API-aligned field mapping)
  const fetchLiveAddresses = async () => {
    try {
      const { api } = await import('../services/api');
      const res = await api.get('/address');
      const list: any[] = res.data?.data?.addresses ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        const formatted: SavedAddress[] = list.map((a: any) => ({
          _id: a._id || a.id || '',
          addressLabel: (a.addressLabel as 'Home' | 'Work' | 'Other') || 'Home',
          fullName: a.fullName || '',
          streetAddress: a.streetAddress || '',
          city: a.city || '',
          pincode: a.pincode || '',
          phoneNumber: a.phoneNumber || '',
          isDefault: !!a.isDefault,
        }));
        setAddresses(formatted);
      }
    } catch (err) {
      console.warn('Address fetch notice:', err);
    }
  };

  // Fetch addresses on user change
  useEffect(() => {
    if (user) {
      fetchLiveAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

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

  // Apply Captured Live Photo — convert canvas dataURL → File → multipart/form-data
  // API docs: PUT /api/auth/profile uses multipart/form-data with profilePicture as binary File
  const handleApplyCapturedPhoto = async () => {
    if (!capturedLivePhoto) return;
    const previewDataUrl = capturedLivePhoto;
    setProfilePicture(previewDataUrl);  // show preview immediately
    setImageLoadError(false);
    stopLiveCamera();

    try {
      setIsUploadingPhoto(true);
      // Convert base64 dataURL → File (required for multipart/form-data)
      const photoFile = dataUrlToFile(previewDataUrl, 'profile-photo.jpg');
      const updatedUser = await updateProfileMutation.mutateAsync({
        name: fullName.trim() || user?.name,
        phoneNumber: phone.trim() || user?.phoneNumber,
        profilePictureFile: photoFile,
        profilePicture: previewDataUrl,
      });
      if (updatedUser) {
        const serverPic = normalizeImageUrl(
          updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar || ''
        );
        if (serverPic) setProfilePicture(serverPic);
      }
    } catch (err) {
      console.warn('Profile picture save warning:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Image File Upload — multipart/form-data (API docs requirement)
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
        setProfilePicture(compressedDataUrl);  // show preview
        setImageLoadError(false);
        setIsPhotoPickerOpen(false);
      }

      // Convert compressed image to clean JPEG file for multipart upload
      const uploadFile = compressedDataUrl
        ? dataUrlToFile(compressedDataUrl, 'profilePicture.jpg')
        : file;

      // API docs: PUT /api/auth/profile → multipart/form-data
      const updatedUser = await updateProfileMutation.mutateAsync({
        name: fullName.trim() || user?.name,
        phoneNumber: phone.trim() || user?.phoneNumber,
        profilePictureFile: uploadFile,
        profilePicture: compressedDataUrl,
      });
      if (updatedUser) {
        const serverPic = normalizeImageUrl(
          updatedUser.profilePicture || updatedUser.profileImage || updatedUser.avatar || ''
        );
        if (serverPic) setProfilePicture(serverPic);
      }
    } catch (err) {
      console.warn('Profile picture save warning:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // Remove profile picture — DELETE /api/auth/remove-profile-picture
  const handleRemovePhoto = async () => {
    setProfilePicture('');
    setImageLoadError(false);
    setIsPhotoPickerOpen(false);
    try {
      setIsUploadingPhoto(true);
      await removeProfilePictureMutation.mutateAsync();
    } catch (err) {
      console.warn('Remove picture warning:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    try {
      // API docs: PUT /api/auth/profile → multipart/form-data
      // Fields: name (String), phoneNumber (String), profilePicture (File binary)
      const updatedUser = await updateProfileMutation.mutateAsync({
        name: cleanName,
        phoneNumber: cleanPhone,
      });
      if (updatedUser?.name) setFullName(updatedUser.name);
      if (updatedUser?.phoneNumber || updatedUser?.phone) {
        setPhone(updatedUser.phoneNumber || updatedUser.phone);
      }
      setIsProfileSaved(true);
      setTimeout(() => {
        setIsProfileSaved(false);
        setIsEditProfileOpen(false);
      }, 700);
    } catch (err) {
      console.warn('Backend update profile notice:', err);
      setIsProfileSaved(true);
      setTimeout(() => {
        setIsProfileSaved(false);
        setIsEditProfileOpen(false);
      }, 700);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Address Handlers — API fields: addressLabel, fullName, streetAddress, city, pincode, phoneNumber, isDefault
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFormName(fullName);
    setAddrFormPhone(phone);
    setAddrFormStreet('');
    setAddrFormCity('');
    setAddrFormPincode('');
    setAddrFormLabel('Home');
    setAddrFormIsDefault(addresses.length === 0);
    setIsAddingAddress(true);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr._id);
    setAddrFormName(addr.fullName);
    setAddrFormPhone(addr.phoneNumber);
    setAddrFormStreet(addr.streetAddress);
    setAddrFormCity(addr.city);
    setAddrFormPincode(addr.pincode);
    setAddrFormLabel(addr.addressLabel);
    setAddrFormIsDefault(addr.isDefault);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (_id: string) => {
    setAddresses(prev => prev.filter(a => a._id !== _id));
    try {
      const { api } = await import('../services/api');
      await api.delete(`/address/${_id}`);
    } catch (err) {
      console.warn('Backend delete address notice:', err);
    }
    setAddressSuccessMsg('Address removed successfully');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSetDefaultAddress = async (_id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === _id })));
    try {
      const { api } = await import('../services/api');
      // API docs: PUT /api/address/set-default/{addressId}
      await api.put(`/address/set-default/${_id}`);
    } catch (err) {
      console.warn('Backend set default address notice:', err);
    }
    setAddressSuccessMsg('Default delivery address updated');
    setTimeout(() => setAddressSuccessMsg(''), 2500);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFormStreet || !addrFormPincode || !addrFormCity) return;

    // API docs: POST/PUT /api/address
    // Body: { addressLabel, fullName, streetAddress, city, pincode, phoneNumber, isDefault }
    const payload = {
      addressLabel: addrFormLabel,
      fullName: addrFormName,
      streetAddress: addrFormStreet,
      city: addrFormCity,
      pincode: addrFormPincode,
      phoneNumber: addrFormPhone,
    };

    try {
      const { api } = await import('../services/api');
      if (editingAddressId) {
        // Update existing — PUT /api/address/{addressId}
        await api.put(`/address/${editingAddressId}`, payload);
        setAddressSuccessMsg('Address updated successfully');
      } else {
        // Add new — POST /api/address
        await api.post('/address', payload);
        setAddressSuccessMsg('New address added successfully');
      }
      // Refetch from API (source of truth)
      await fetchLiveAddresses();
    } catch (err) {
      console.warn('Backend save address notice:', err);
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
            <div
              onClick={() => setIsPhotoPickerOpen(true)}
              className="relative group shrink-0 cursor-pointer"
              title="Profile Picture Options"
            >
              {profilePicture && !imageLoadError ? (
                <img
                  src={profilePicture}
                  alt={user?.name || fullName || 'User'}
                  onError={() => setImageLoadError(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-emerald-600 shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-800 text-amber-300 font-serif font-black text-lg sm:text-xl flex items-center justify-center border-2 border-emerald-600 shadow-md uppercase group-hover:opacity-90 transition-opacity">
                  {((user?.name || fullName || 'U').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || 'U').slice(0, 2)}
                </div>
              )}

              {/* Camera Upload Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPhotoPickerOpen(true);
                }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a7a40] hover:bg-[#086334] text-white flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Picture"
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
              setPhone(user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || phone || '');
              const editPic = profilePicture || user?.profilePicture || user?.profileImage || user?.avatar || user?.avatarUrl || user?.image || (user as any)?.photo || '';
              setProfilePicture(normalizeImageUrl(editPic));
              setIsEditProfileOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-800 transition-colors cursor-pointer"
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
              to="/returns-refunds"
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
                    {paymentMethods.length} saved method{paymentMethods.length === 1 ? '' : 's'} (UPI)
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

      {/* MODAL 1: EDIT PROFILE (MATCHING EXACT APP SCREENSHOT 2) */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2">
              <h3 className="font-bold text-lg text-neutral-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name Field with User Icon */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 block">Full Name</label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50/70 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email Address Field with Mail Icon (Read-only) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 block">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || email}
                    disabled
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-neutral-100/80 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Phone Number Field with Phone Icon */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 block">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50/70 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {isProfileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Profile updated and saved successfully!</span>
                </div>
              )}

              {/* Save Changes Solid Green Button */}
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
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
                        key={addr._id}
                        className={`p-4 rounded-2xl border transition-all ${addr.isDefault
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-900">{addr.fullName}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 ${addr.addressLabel === 'Home' ? 'bg-amber-100 text-amber-800' :
                                  addr.addressLabel === 'Work' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                {addr.addressLabel === 'Home' && <Home className="w-2.5 h-2.5" />}
                                {addr.addressLabel === 'Work' && <Briefcase className="w-2.5 h-2.5" />}
                                {addr.addressLabel}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-700 leading-snug">
                              {addr.streetAddress}
                            </p>
                            <p className="text-xs text-neutral-600 font-medium">
                              {addr.city} - <span className="font-bold text-neutral-800">{addr.pincode}</span>
                            </p>
                            <p className="text-xs text-neutral-500 pt-0.5">
                              Phone: <span className="text-neutral-800 font-semibold">{addr.phoneNumber}</span>
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
                              onClick={() => handleDeleteAddress(addr._id)}
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
                              onClick={() => handleSetDefaultAddress(addr._id)}
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

                {/* Address Label Selector — API field: addressLabel (Home | Work | Other) */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">Address Label</label>
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setAddrFormLabel(label)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${addrFormLabel === label
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                      >
                        {label === 'Home' && <Home className="w-3 h-3 inline mr-1" />}
                        {label === 'Work' && <Briefcase className="w-3 h-3 inline mr-1" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name</label>
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
                  {/* API field: streetAddress */}
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    required
                    value={addrFormStreet}
                    onChange={(e) => setAddrFormStreet(e.target.value)}
                    placeholder="e.g. Flat 402, Green Valley Apartments, Sector 62"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={addrFormCity}
                      onChange={(e) => setAddrFormCity(e.target.value)}
                      placeholder="Delhi"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={addrFormPincode}
                      onChange={(e) => setAddrFormPincode(e.target.value)}
                      placeholder="201301"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={addrFormPhone}
                    onChange={(e) => setAddrFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                {/* Set as Default Address (Toggle) */}
                <div className="flex items-center justify-between pt-2 pb-1">
                  <label className="text-sm font-semibold text-neutral-700 cursor-pointer" htmlFor="isDefaultCheckProfile">
                    Set as Default Address
                  </label>
                  <div
                    id="isDefaultCheckProfile"
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${addrFormIsDefault ? 'bg-emerald-800' : 'bg-neutral-300'}`}
                    onClick={() => setAddrFormIsDefault(!addrFormIsDefault)}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${addrFormIsDefault ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
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
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl border border-neutral-200 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header: Back arrow & Title matching App */}
            <div className="flex justify-between items-center border-b pb-3">
              <button
                type="button"
                onClick={() => {
                  if (isAddingPaymentMethod) {
                    setIsAddingPaymentMethod(false);
                    setEditingPaymentMethod(null);
                  } else {
                    setIsPaymentMethodsOpen(false);
                  }
                }}
                className="p-1 rounded-full text-neutral-700 hover:text-neutral-900 cursor-pointer -ml-1 transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                {isAddingPaymentMethod ? (editingPaymentMethod ? 'Edit Details' : 'Add Payment Method') : 'Payment Methods'}
              </h3>
              <button
                onClick={() => {
                  setIsPaymentMethodsOpen(false);
                  setIsAddingPaymentMethod(false);
                  setEditingPaymentMethod(null);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {!isAddingPaymentMethod ? (
              <div className="space-y-4">
                {/* Saved Methods Bar */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">Saved Methods</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaymentMethod(null);
                      setUpiDisplayName(fullName || user?.name || '');
                      setUpiIdInput('');
                      setUpiSetDefault(paymentMethods.length === 0);
                      setIsAddingPaymentMethod(true);
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>+ Add New</span>
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {isPaymentMethodsLoading && paymentMethods.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
                      <span className="text-xs">Loading saved payment methods...</span>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 px-4 border border-dashed border-neutral-200 rounded-2xl">
                      <p className="text-sm font-medium text-neutral-600">No saved payment methods yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPaymentMethod(null);
                          setUpiDisplayName(fullName || user?.name || '');
                          setUpiIdInput('');
                          setUpiSetDefault(true);
                          setIsAddingPaymentMethod(true);
                        }}
                        className="mt-3 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        + Add UPI ID
                      </button>
                    </div>
                  ) : (
                    paymentMethods.map((pm) => (
                      <div
                        key={pm._id || pm.id || pm.upiId}
                        className="relative overflow-hidden bg-[#007b3e] text-white rounded-[24px] p-5 shadow-md transition-all select-none"
                      >
                        {/* Background decorative circles matching user's screenshot 1 */}
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                        {/* Top Row: UPI pill badge & Three dots button */}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                              <QrCode className="w-3.5 h-3.5" />
                              <span>UPI</span>
                            </span>
                            {pm.isDefault && (
                              <span className="bg-emerald-950/40 text-emerald-200 border border-emerald-400/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          {/* Three-dot button opening action bottom sheet */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActionMethod(pm);
                            }}
                            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-all cursor-pointer shadow-xs active:scale-95"
                            title="More options"
                          >
                            <MoreHorizontal className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        {/* Middle: UPI ID */}
                        <div className="relative z-10 my-5">
                          <p className="font-bold text-lg md:text-xl tracking-wide text-white drop-shadow-xs break-all">
                            {pm.upiId}
                          </p>
                        </div>

                        {/* Bottom: Display Name */}
                        <div className="relative z-10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">
                            DISPLAY NAME
                          </span>
                          <p className="font-bold text-sm tracking-wide uppercase text-white drop-shadow-xs">
                            {pm.displayName || fullName || user?.name || 'UPI USER'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Secure Payments Notice matching screenshot 1 */}
                <div className="bg-[#eef8f2] border border-[#d6ecdf] rounded-2xl p-4 flex items-center gap-3.5 mt-4">
                  <div className="p-2 bg-[#dcf2e3] rounded-full text-[#007b3e] shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#007b3e]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Secure Payments</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Your payment details are encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ADD / EDIT UPI METHOD FORM (UPI ONLY) */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!upiIdInput.trim()) return;
                  try {
                    const cleanDisplayName = (upiDisplayName || fullName || user?.name || 'User').trim().toUpperCase();
                    const cleanUpiId = upiIdInput.trim();

                    if (editingPaymentMethod) {
                      const idToUse = editingPaymentMethod._id || editingPaymentMethod.id || editingPaymentMethod.upiId || '';
                      await updatePaymentMethodMutation.mutateAsync({
                        methodId: idToUse,
                        payload: {
                          upiId: cleanUpiId,
                          displayName: cleanDisplayName,
                          isDefault: upiSetDefault,
                        },
                      });
                      setPaymentSuccessMsg('Payment details updated successfully');
                    } else {
                      await savePaymentMethodMutation.mutateAsync({
                        type: 'UPI',
                        displayName: cleanDisplayName,
                        upiId: cleanUpiId,
                        isDefault: upiSetDefault,
                      });
                      setPaymentSuccessMsg('New UPI method added successfully');
                    }

                    setUpiIdInput('');
                    setEditingPaymentMethod(null);
                    setIsAddingPaymentMethod(false);
                    setTimeout(() => setPaymentSuccessMsg(''), 2500);
                    refetchPaymentMethods();
                  } catch (err) {
                    console.warn('Save payment method error:', err);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={upiDisplayName}
                      onChange={(e) => setUpiDisplayName(e.target.value)}
                      placeholder="e.g. AMIT KUMAR"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-700 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">UPI ID</label>
                    <input
                      type="text"
                      required
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. 8004116370@ybl or yourname@okaxis"
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
                      className="w-4 h-4 rounded text-[#007b3e] focus:ring-[#007b3e] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPaymentMethod(false);
                      setEditingPaymentMethod(null);
                    }}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savePaymentMethodMutation.isPending || updatePaymentMethodMutation.isPending}
                    className="flex-2 py-3 bg-[#007b3e] hover:bg-[#006834] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {savePaymentMethodMutation.isPending || updatePaymentMethodMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      editingPaymentMethod ? 'Update Details' : 'Save Details'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ACTION BOTTOM SHEET (EXACT SCREENSHOT 2 MATCH) */}
          {selectedActionMethod && (
            <div
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
              onClick={() => setSelectedActionMethod(null)}
            >
              <div
                className="w-full max-w-md bg-[#f7f9f7] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-neutral-200 space-y-1 animate-in slide-in-from-bottom-5 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Set as Default */}
                <button
                  type="button"
                  onClick={() => handleSetDefaultPaymentMethod(selectedActionMethod)}
                  disabled={updatePaymentMethodMutation.isPending}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white text-neutral-800 transition-colors text-left cursor-pointer group"
                >
                  <CheckCircle2 className="w-5 h-5 text-neutral-800 shrink-0 group-hover:text-emerald-800" />
                  <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-900">
                    Set as Default
                  </span>
                </button>

                {/* 2. Edit Details */}
                <button
                  type="button"
                  onClick={() => handleStartEditPaymentMethod(selectedActionMethod)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white text-neutral-800 transition-colors text-left cursor-pointer group"
                >
                  <Pencil className="w-5 h-5 text-neutral-800 shrink-0 group-hover:text-emerald-800" />
                  <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-900">
                    Edit Details
                  </span>
                </button>

                {/* 3. Remove Method */}
                <button
                  type="button"
                  onClick={() => handleDeletePaymentMethod(selectedActionMethod)}
                  disabled={deletePaymentMethodMutation.isPending}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-colors text-left cursor-pointer group"
                >
                  {deletePaymentMethodMutation.isPending ? (
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin shrink-0" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-red-500">
                    Remove Method
                  </span>
                </button>
              </div>
            </div>
          )}
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

      {/* MODAL 5: PHOTO SELECTION BOTTOM SHEET (MATCHING EXACT APP SCREENSHOT 1) */}
      {isPhotoPickerOpen && (
        <div
          onClick={() => setIsPhotoPickerOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 pt-3 pb-8 space-y-2 shadow-2xl border border-neutral-100 animate-in slide-in-from-bottom-5 duration-200"
          >
            {/* Grab Handle Bar matching screenshot */}
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-4" />

            <div className="space-y-1">
              {/* Option 1: Preview Picture */}
              <button
                type="button"
                onClick={() => {
                  setIsPhotoPickerOpen(false);
                  setIsPreviewModalOpen(true);
                }}
                className="w-full p-3 rounded-2xl hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-[#2e7d32]" />
                </div>
                <span className="font-bold text-neutral-800 text-sm">Preview Picture</span>
              </button>

              {/* Option 2: Change Picture */}
              <button
                type="button"
                onClick={() => {
                  setIsPhotoPickerOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full p-3 rounded-2xl hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-[#2e7d32]" />
                </div>
                <span className="font-bold text-neutral-800 text-sm">Change Picture</span>
              </button>

              {/* Option 3: Remove Picture */}
              <button
                type="button"
                onClick={() => {
                  handleRemovePhoto();
                }}
                className="w-full p-3 rounded-2xl hover:bg-rose-50/50 flex items-center gap-3.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#ffebee] text-[#e53935] flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-[#e53935]" />
                </div>
                <span className="font-bold text-[#e53935] text-sm">Remove Picture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PREVIEW PICTURE FULL VIEW LIGHTBOX */}
      {isPreviewModalOpen && (
        <div
          onClick={() => setIsPreviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md w-full bg-neutral-900 rounded-3xl p-4 shadow-2xl border border-neutral-700 flex flex-col items-center space-y-4"
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-neutral-800 text-white">
              <span className="text-sm font-bold truncate">{user?.name || fullName || 'Profile Picture'}</span>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full flex items-center justify-center p-2">
              {profilePicture && !imageLoadError ? (
                <img
                  src={profilePicture}
                  alt={user?.name || fullName || 'Profile Preview'}
                  onError={() => setImageLoadError(true)}
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl border border-neutral-700"
                />
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl bg-emerald-800 text-amber-300 font-serif font-black text-6xl flex items-center justify-center border border-emerald-600 shadow-2xl uppercase">
                  {((user?.name || fullName || 'U').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || 'U').slice(0, 2)}
                </div>
              )}
            </div>

            <div className="w-full pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Change Picture</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
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

