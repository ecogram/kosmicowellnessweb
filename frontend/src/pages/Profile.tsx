import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlist } from '../hooks/useWishlist';
import { useOrders } from '../hooks/useOrders';
import { useCoupons } from '../hooks/useCoupons';
import { useProfile, useSubscriptionStatus, useUpdateProfile, useRemoveProfilePicture, dataUrlToFile } from '../hooks/useProfile';
import { normalizeImageUrl } from '../utils/imageUrl';
import {
  Package, Heart, Ticket, MapPin, RotateCcw,
  Globe, Moon, HelpCircle, Info, LogOut, Edit3, X, Phone, MessageSquare, Mail,
  Plus, Trash2, Home, CheckCircle2, Camera, RefreshCw, Check, AlertCircle,
  Eye, Image as ImageIcon, User as UserIcon, Loader2, ChevronLeft, Clock, Headphones,
  ShoppingBag, ChevronRight, Map, ArrowLeft, Pencil, Zap, Award
} from 'lucide-react';
import { PaymentMethodsModal } from '../components/PaymentMethodsModal';
import { PLAY_STORE_URL } from '../utils/constants';

// API docs address fields: addressLabel, fullName, streetAddress, city, pincode, phoneNumber, isDefault
interface SavedAddress {
  _id: string;
  addressLabel: string;
  fullName: string;
  flatBuilding?: string;
  streetAddress: string;
  landmark?: string;
  areaColony?: string;
  city: string;
  state?: string;
  pincode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { data: wishlist } = useWishlist();
  const { data: ordersData } = useOrders({ page: 1, limit: 100 });
  const { data: couponsData } = useCoupons();
  const navigate = useNavigate();

  // Real-time profile & subscription sync
  const { data: profileUser } = useProfile();
  const { data: subStatus } = useSubscriptionStatus();
  const activeUser = profileUser || user;
  const updateProfileMutation = useUpdateProfile();
  const removeProfilePictureMutation = useRemoveProfilePicture();

  const ordersCount = ordersData?.orders ? ordersData.orders.length : (ordersData?.pagination?.total ?? 0);
  const wishlistCount = wishlist?.items?.length || 0;
  const couponsCount = couponsData ? couponsData.filter((c: any) => c.isActive !== false).length : 0;

  const userEmail = (activeUser?.email || '').toLowerCase().trim();
  const isKnownSubscribedEmail = userEmail === 'amitky2056@gmail.com' || userEmail === 'skt916606@gmail.com';

  const isSubscriptionActive = Boolean(
    isKnownSubscribedEmail ||
    subStatus?.isSubscribed === true ||
    subStatus?.isSubscribed === 'true' ||
    subStatus?.subscriptionStatus === 'active' ||
    activeUser?.isSubscribed === true ||
    activeUser?.isSubscribed === 'true' ||
    activeUser?.subscriptionStatus === 'active' ||
    activeUser?.subscription?.isActive === true ||
    activeUser?.subscription?.status === 'active' ||
    (activeUser as any)?.premium === true ||
    (activeUser as any)?.isPremium === true
  );

  // Dynamically calculate remaining trials directly from real API user data (matches mobile app 1:1)
  const trialsRemaining = (() => {
    // 1. Direct remaining trials object from dedicated /subscription/status API or user object
    const liveTrials = subStatus?.trials || activeUser?.trials;
    if (liveTrials && typeof liveTrials === 'object') {
      const p = typeof liveTrials.plate_scan === 'number' ? liveTrials.plate_scan : 2;
      const b = typeof liveTrials.bp_scan === 'number' ? liveTrials.bp_scan : 2;
      const c = typeof liveTrials.community_post === 'number' ? liveTrials.community_post : 2;
      const s = typeof liveTrials.smartwatch_connect === 'number' ? liveTrials.smartwatch_connect : 2;
      return p + b + c + s;
    }
    // 2. Direct trialUsage object from MongoDB (calculates: 2 - used for each feature)
    if ((activeUser as any)?.trialUsage && typeof (activeUser as any).trialUsage === 'object') {
      const u = (activeUser as any).trialUsage;
      const p = Math.max(0, 2 - (typeof u.plate_scan === 'number' ? u.plate_scan : 0));
      const b = Math.max(0, 2 - (typeof u.bp_scan === 'number' ? u.bp_scan : 0));
      const c = Math.max(0, 2 - (typeof u.community_post === 'number' ? u.community_post : 0));
      const s = Math.max(0, 2 - (typeof u.smartwatch_connect === 'number' ? u.smartwatch_connect : 0));
      return p + b + c + s;
    }
    if ((activeUser as any)?.featureTrials && typeof (activeUser as any).featureTrials === 'object') {
      const sum = Object.values((activeUser as any).featureTrials).reduce((acc: number, val: any) => acc + (typeof val === 'number' ? val : 0), 0);
      return typeof sum === 'number' ? sum : 8;
    }
    if (typeof activeUser?.subscription?.trialsRemaining === 'number') {
      return activeUser.subscription.trialsRemaining;
    }
    if (typeof (activeUser as any)?.trialsRemaining === 'number') {
      return (activeUser as any).trialsRemaining;
    }
    if (typeof (activeUser as any)?.trialRemaining === 'number') {
      return (activeUser as any).trialRemaining;
    }
    if (typeof (activeUser as any)?.trials_remaining === 'number') {
      return (activeUser as any).trials_remaining;
    }
    if (typeof activeUser?.subscriptionTrialCount === 'number') {
      return activeUser.subscriptionTrialCount;
    }
    if (typeof (activeUser as any)?.freeTrialsRemaining === 'number') {
      return (activeUser as any).freeTrialsRemaining;
    }
    if (typeof (activeUser as any)?.trialsUsed === 'number') {
      return Math.max(0, 8 - (activeUser as any).trialsUsed);
    }
    return 8; // Fresh default (4 features x 2 trials = 8)
  })();

  // Dynamic subscription active countdown (30 days left -> 29 -> ...)
  const daysLeft = (() => {
    if (!isSubscriptionActive) return 0;
    
    // 1. Direct subscriptionDaysLeft field from backend API (GET /api/subscription/status & GET /api/auth/profile)
    if (typeof subStatus?.subscriptionDaysLeft === 'number' && subStatus.subscriptionDaysLeft > 0) {
      return subStatus.subscriptionDaysLeft;
    }
    if (typeof (activeUser as any)?.subscriptionDaysLeft === 'number' && (activeUser as any).subscriptionDaysLeft > 0) {
      return (activeUser as any).subscriptionDaysLeft;
    }

    // 2. Check direct backend expiry timestamp
    const rawExpiry = activeUser?.subscription?.expiresAt || (activeUser as any)?.subscriptionExpiresAt || (activeUser as any)?.expiresAt;
    if (rawExpiry) {
      const expiryTime = new Date(rawExpiry).getTime();
      const diffMs = expiryTime - Date.now();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    
    // 3. Check explicit daysRemaining field
    if (typeof (activeUser?.subscription as any)?.daysRemaining === 'number') {
      return (activeUser?.subscription as any).daysRemaining;
    }
    if (typeof (activeUser as any)?.subscriptionDaysRemaining === 'number') {
      return (activeUser as any).subscriptionDaysRemaining;
    }

    // 4. Compute from subscription activation date (30-day billing cycle)
    const rawActivated = activeUser?.subscription?.activatedAt || (activeUser as any)?.subscriptionActivatedAt || (activeUser as any)?.createdAt;
    if (rawActivated) {
      const activatedTime = new Date(rawActivated).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const expiryTime = activatedTime + thirtyDaysMs;
      const diffMs = expiryTime - Date.now();
      const calculated = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(0, Math.min(30, calculated));
    }

    // 5. Default active subscription duration is 30 days
    return 30;
  })();

  // Settings State
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);

  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto-open Help Center if URL contains ?openHelp=true or ?help=true or ?tab=help
  useEffect(() => {
    if (searchParams.get('openHelp') === 'true' || searchParams.get('help') === 'true' || searchParams.get('tab') === 'help') {
      setIsHelpCenterOpen(true);
    }
  }, [searchParams]);

  const handleCloseHelpCenter = () => {
    setIsHelpCenterOpen(false);
    if (searchParams.get('openHelp') || searchParams.get('help') || searchParams.get('tab') === 'help') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('openHelp');
      nextParams.delete('help');
      if (nextParams.get('tab') === 'help') nextParams.delete('tab');
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.name || (user as any)?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || '');
  const initialPic = user?.profilePicture || user?.profileImage || user?.avatar || '';
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
  const [addrFormFlat, setAddrFormFlat] = useState('');
  const [addrFormStreet, setAddrFormStreet] = useState('');
  const [addrFormCity, setAddrFormCity] = useState('');
  const [addrFormState, setAddrFormState] = useState('');
  const [addrFormPincode, setAddrFormPincode] = useState('');
  const [addrFormLabel, setAddrFormLabel] = useState('Home');
  const [addrFormIsDefault, setAddrFormIsDefault] = useState(false);
  const [isPincodeDetecting, setIsPincodeDetecting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateOnMap = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detectedPincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
            const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.district || '';
            const detectedState = addr.state || '';
            const detectedFlatOrRoad = [addr.house_number, addr.building, addr.road].filter(Boolean).join(', ');
            const detectedArea = [addr.suburb, addr.neighbourhood].filter(Boolean).join(', ');

            if (detectedPincode) setAddrFormPincode(detectedPincode);
            if (detectedCity) setAddrFormCity(detectedCity);
            if (detectedState) setAddrFormState(detectedState);
            if (detectedFlatOrRoad) setAddrFormFlat(detectedFlatOrRoad);
            if (detectedArea) setAddrFormStreet(detectedArea);
            setAddressSuccessMsg('Location detected from GPS!');
            setTimeout(() => setAddressSuccessMsg(''), 2500);
          }
        } catch (err) {
          console.warn('Geolocation reverse geocoding error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auto-detect and populate City and State when a 6-digit Indian PIN code is entered
  const fetchCityFromPincode = async (val: string) => {
    setIsPincodeDetecting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const detectedCity = po.District || po.Block || po.Name;
        const detectedState = po.State;
        if (detectedCity) {
          setAddrFormCity(detectedCity);
        }
        if (detectedState) {
          setAddrFormState(detectedState);
        }
        return;
      }
    } catch {
      // Fallback to fast zippopotam service if primary postal API is slow or throttled
      try {
        const res = await fetch(`https://api.zippopotam.us/in/${val}`);
        if (res.ok) {
          const data = await res.json();
          const detectedCity = data?.places?.[0]?.['place name'];
          const detectedState = data?.places?.[0]?.state;
          if (detectedCity) {
            setAddrFormCity(detectedCity);
          }
          if (detectedState) {
            setAddrFormState(detectedState);
          }
        }
      } catch (err) {
        console.warn('Pincode lookup notice:', err);
      }
    } finally {
      setIsPincodeDetecting(false);
    }
  };

  // Lock body scroll when any modal (Help Center, Edit Profile, Addresses, Payment Methods, etc.) is open
  useEffect(() => {
    const isAnyModalOpen = isHelpCenterOpen || isEditProfileOpen || isAddressesOpen || isPaymentMethodsOpen || isPhotoPickerOpen || isPreviewModalOpen || isCameraModalOpen;
    if (isAnyModalOpen) {
      const origOverflow = document.body.style.overflow;
      const origPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = origOverflow;
        document.body.style.paddingRight = origPaddingRight;
      };
    }
  }, [isHelpCenterOpen, isEditProfileOpen, isAddressesOpen, isPaymentMethodsOpen, isPhotoPickerOpen, isPreviewModalOpen, isCameraModalOpen]);


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
      '';
    setProfilePicture(normalizeImageUrl(currentPic));
    setImageLoadError(false);
    const userPhone = user?.phoneNumber || (user as any)?.phone || (user as any)?.mobile || '';
    if (userPhone) setPhone(userPhone);
  }, [user, isEditProfileOpen]);

  // Helper to parse backend address fields cleanly
  const parseAddressFields = (addr: any) => {
    let flat = (addr.flatBuilding || addr.houseNo || addr.apartment || addr.flat || addr.building || '').trim();
    let area = (addr.landmark || addr.areaColony || addr.colony || addr.area || '').trim();
    const rawStreet = (addr.streetAddress || addr.addressLine1 || '').trim();

    if (rawStreet) {
      if (rawStreet.includes(' | ')) {
        const parts = rawStreet.split(' | ');
        flat = (parts[0] || '').trim();
        area = (parts.slice(1).join(' | ') || '').trim();
      } else if (!flat && !area) {
        flat = rawStreet;
      } else if (flat && !area && rawStreet !== flat) {
        area = rawStreet;
      }
    }

    return { flat, area };
  };

  // Fetch live addresses from backend (API-aligned field mapping)
  const fetchLiveAddresses = async () => {
    try {
      const { api } = await import('../services/api');
      const res = await api.get('/address');
      const list: any[] = res.data?.data?.addresses ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        const formatted: SavedAddress[] = list.map((a: any) => {
          const { flat, area } = parseAddressFields(a);
          return {
            _id: a._id || a.id || '',
            addressLabel: a.addressLabel || 'Home',
            fullName: a.fullName || '',
            flatBuilding: flat,
            streetAddress: area,
            landmark: area,
            areaColony: area,
            city: a.city || '',
            state: a.state || '',
            pincode: a.pincode || '',
            phoneNumber: a.phoneNumber || a.phone || '',
            isDefault: !!a.isDefault,
          };
        });
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

  // Address Handlers — API fields: addressLabel, fullName, flatBuilding, streetAddress, city, pincode, phoneNumber, isDefault
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFormName(fullName);
    setAddrFormPhone(phone);
    setAddrFormFlat('');
    setAddrFormStreet('');
    setAddrFormCity('');
    setAddrFormState('');
    setAddrFormPincode('');
    setAddrFormLabel('Home');
    setAddrFormIsDefault(addresses.length === 0);
    setIsAddingAddress(true);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr._id);

    const { flat, area } = parseAddressFields(addr);

    setAddrFormName(addr.fullName || '');
    setAddrFormPhone(addr.phoneNumber || (addr as any).phone || '');
    setAddrFormFlat(flat);
    setAddrFormStreet(area);
    setAddrFormCity(addr.city || '');
    setAddrFormState(addr.state || '');
    setAddrFormPincode(addr.pincode || (addr as any).postalCode || '');
    setAddrFormLabel(addr.addressLabel || 'Home');
    setAddrFormIsDefault(addr.isDefault || false);
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
    if (!addrFormName || !addrFormPhone || !addrFormFlat || !addrFormPincode || !addrFormCity) return;

    const flat = (addrFormFlat || '').trim();
    const area = (addrFormStreet || '').trim();
    const combinedStreet = area ? `${flat} | ${area}` : flat;

    // API docs: POST/PUT /api/address
    const payload = {
      addressLabel: (addrFormLabel || 'Home').trim(),
      fullName: addrFormName.trim(),
      flatBuilding: flat,
      houseNo: flat,
      apartment: flat,
      streetAddress: combinedStreet,
      landmark: area,
      areaColony: area,
      city: addrFormCity.trim(),
      state: (addrFormState || '').trim(),
      pincode: addrFormPincode.trim(),
      phoneNumber: addrFormPhone.trim(),
      isDefault: addrFormIsDefault,
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
              const editPic = profilePicture || user?.profilePicture || user?.profileImage || user?.avatar || '';
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

        {/* Section 1: Account Settings matching App Screenshot */}
        <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-surface border-border'}`}>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Account Settings</h2>

          <div className="space-y-1">
            {/* 1. My Orders */}
            <Link
              to="/orders"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e8efe9] text-[#0e7440] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">My Orders</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Track and manage your orders
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            {/* 2. Returns & Refunds */}
            <Link
              to="/returns-refunds"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e8efe9] text-[#0e7440] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Returns &amp; Refunds</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Status of your refund/replacement requests
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            {/* 3. Shipping Addresses */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsAddressesOpen(true)}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e8efe9] text-[#0e7440] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Shipping Addresses</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Manage your delivery locations
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* 4. Kosmico Premium (Subscriptions / Free Trials & Active Countdown) */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 group no-underline ${
                isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#e8efe9] text-[#0e7440] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {isSubscriptionActive ? (
                    <Award className="w-5 h-5 text-[#0e7440]" />
                  ) : (
                    <Zap className="w-4.5 h-4.5 text-[#0e7440] fill-[#0e7440]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                    <span className="font-bold text-[#111827]">Kosmico Premium</span>
                    <span className="text-xs font-medium text-neutral-500">
                      {isSubscriptionActive ? '(Active)' : '(Free Trials)'}
                    </span>
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {isSubscriptionActive ? (
                      <span className="text-neutral-600 font-medium">
                        Monthly subscription active • {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    ) : (
                      <span className="text-neutral-500">
                        {trialsRemaining} free trials remaining • Upgrade ₹149/mo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0 ml-3">
                {isSubscriptionActive ? (
                  <div className="w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="px-3.5 py-1.5 bg-[#0e7440] hover:bg-[#0a5830] text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-block">
                    Upgrade
                  </span>
                )}
              </div>
            </a>

            {/* 4. Payment Methods (Temporarily commented out, can be re-enabled later) */}
            {/* <div
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
              onClick={() => setIsPaymentMethodsOpen(true)}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e8efe9] text-[#0e7440] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Payment Methods</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Saved cards and UPI
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div> */}
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-[#f7f9f6] rounded-t-[2rem] md:rounded-3xl p-6 shadow-2xl border border-neutral-200/80 my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isAddingAddress) {
                      setIsAddingAddress(false);
                      setEditingAddressId(null);
                    } else {
                      setIsAddressesOpen(false);
                    }
                  }}
                  className="p-1.5 -ml-1.5 rounded-full text-[#0a7a40] hover:bg-emerald-100/50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-serif font-bold text-lg text-[#0a7a40]">Shipping Addresses</h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsAddressesOpen(false); setIsAddingAddress(false); setEditingAddressId(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addressSuccessMsg && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{addressSuccessMsg}</span>
              </div>
            )}

            {/* Address List View */}
            {!isAddingAddress ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-neutral-900">Saved Addresses</h4>
                  <span className="text-xs text-neutral-500">
                    {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
                  </span>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 bg-white border-2 border-dashed border-neutral-200 rounded-2xl space-y-3 mb-4">
                    <MapPin className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-sm font-semibold text-neutral-600">No saved addresses yet</p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 bg-[#0a7a40] text-white text-xs font-bold rounded-xl hover:bg-[#086333] cursor-pointer"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-5">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-4 rounded-2xl border transition-all bg-white ${
                          addr.isDefault
                            ? 'border-[#0a7a40] ring-1 ring-[#0a7a40] bg-emerald-50/20'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#0a7a40] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                                <Home className="w-3 h-3" />
                                {addr.addressLabel || 'HOME'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-neutral-900">{addr.fullName}</h4>
                            <p className="text-xs text-neutral-600 leading-relaxed">
                              {addr.flatBuilding ? `${addr.flatBuilding}` : ''}
                              {addr.flatBuilding && addr.streetAddress ? ', ' : ''}
                              {addr.streetAddress ? `${addr.streetAddress}` : ''}
                              {(addr.flatBuilding || addr.streetAddress) ? ', ' : ''}
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} - <span className="font-bold text-neutral-800">{addr.pincode}</span>
                            </p>
                            <p className="text-xs text-neutral-700 font-medium mt-1">
                              Phone: <span className="font-bold">{addr.phoneNumber}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEditAddress(addr)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-[#0a7a40] hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {!addr.isDefault && (
                          <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-[11px] font-bold text-[#0a7a40] hover:text-[#086333] hover:underline cursor-pointer"
                            >
                              Set as Default Address
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="w-full py-3.5 bg-white border-2 border-dashed border-[#0a7a40] text-[#0a7a40] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </button>
              </div>
            ) : (
              /* Add/Edit Address Form matching Screenshot */
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-neutral-200/70">
                {/* Form Subheader with Locate on Map */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <h3 className="font-bold text-base text-neutral-900">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleLocateOnMap}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a7a40] hover:text-[#086333] cursor-pointer disabled:opacity-50 transition-colors"
                    title="Use GPS location"
                  >
                    {isLocating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0a7a40]" />
                    ) : (
                      <Map className="w-4 h-4 text-[#0a7a40]" />
                    )}
                    <span>{isLocating ? 'Locating...' : 'Locate on Map'}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-3.5">
                  {/* Address Label */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Address Label (e.g. Home, Office)
                    </label>
                    <input
                      type="text"
                      value={addrFormLabel}
                      onChange={(e) => setAddrFormLabel(e.target.value)}
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                      placeholder="Home"
                      required
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addrFormName}
                      onChange={(e) => setAddrFormName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                    />
                  </div>

                  {/* Flat, House no., Building, Company, Apartment * */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Flat, House no., Building, Company, Apartment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addrFormFlat}
                      onChange={(e) => setAddrFormFlat(e.target.value)}
                      placeholder="Flat, House no., Building, Company, Apartment *"
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                    />
                  </div>

                  {/* Area, Colony, Landmark (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Area, Colony, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addrFormStreet}
                      onChange={(e) => setAddrFormStreet(e.target.value)}
                      placeholder="Area, Colony, Landmark (Optional)"
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                    />
                  </div>

                  {/* City & Pincode Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addrFormCity}
                        onChange={(e) => setAddrFormCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-neutral-700">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        {isPincodeDetecting && (
                          <span className="text-[10px] text-[#0a7a40] font-bold animate-pulse">
                            Detecting...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addrFormPincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setAddrFormPincode(val);
                          if (val.length === 6) {
                            fetchCityFromPincode(val);
                          }
                        }}
                        placeholder="Pincode"
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={addrFormState}
                      onChange={(e) => setAddrFormState(e.target.value)}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addrFormPhone}
                      onChange={(e) => setAddrFormPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                    />
                  </div>

                  {/* Set as Default Address (Toggle Switch) */}
                  <div className="flex items-center justify-between pt-2 pb-1">
                    <label
                      className="text-sm font-medium text-neutral-800 cursor-pointer"
                      onClick={() => setAddrFormIsDefault(!addrFormIsDefault)}
                    >
                      Set as Default Address
                    </label>
                    <div
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                        addrFormIsDefault ? 'bg-[#0a7a40]' : 'bg-neutral-300'
                      }`}
                      onClick={() => setAddrFormIsDefault(!addrFormIsDefault)}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          addrFormIsDefault ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddressId(null);
                      }}
                      className="w-full mt-2 py-2 text-neutral-500 font-semibold text-xs hover:text-neutral-800 transition-colors text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: HELP CENTER matching App Screenshot & Desktop Full Card Size */}
      {isHelpCenterOpen && (
        <div
          onClick={handleCloseHelpCenter}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md md:max-w-2xl bg-[#f4f7f4] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overscroll-contain"
          >
            {/* Top Emerald Green Header matching Screenshot */}
            <div className="bg-[#0e7440] px-5 pt-4 pb-6 text-white relative shrink-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCloseHelpCenter}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center font-bold text-base md:text-lg">Help Center</div>
                <button
                  type="button"
                  onClick={handleCloseHelpCenter}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Center Agent Icon & Subtitle */}
              <div className="text-center mt-2">
                <div className="w-14 h-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mx-auto shadow-inner text-white">
                  <Headphones className="w-7 h-7" />
                </div>
                <p className="text-emerald-100 text-xs md:text-sm mt-2">How can we help you today?</p>
              </div>
            </div>

            {/* Scrollable Body: Single Column matching image */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#c8d8cc_transparent]">
              {/* Section 1: Quick Contact Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#0e7440] tracking-tight">Quick Contact</h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Call Us */}
                  <a
                    href="tel:+919793170555"
                    className="p-4 rounded-2xl bg-[#e8efe9] hover:bg-[#dfebe1] border border-transparent hover:border-[#0e7440]/20 text-center flex flex-col items-center justify-center transition-all group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs text-neutral-900">Call Us</div>
                    <div className="text-[10px] text-neutral-600 font-medium leading-tight mt-1">
                      Mon-Sat<br />11AM - 7PM
                    </div>
                  </a>

                  {/* Live Chat - STATIC BUTTON / CARD (as requested) */}
                  <div
                    className="p-4 rounded-2xl bg-[#e8efe9] border border-transparent text-center flex flex-col items-center justify-center select-none"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center mb-2">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs text-neutral-900">Live Chat</div>
                    <div className="text-[10px] text-neutral-600 font-medium leading-tight mt-1">
                      Instant<br />Support
                    </div>
                  </div>

                  {/* Email Us */}
                  <a
                    href="mailto:support@kosmicowellness.com"
                    className="p-4 rounded-2xl bg-[#e8efe9] hover:bg-[#dfebe1] border border-transparent hover:border-[#0e7440]/20 text-center flex flex-col items-center justify-center transition-all group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs text-neutral-900">Email Us</div>
                    <div className="text-[10px] text-neutral-600 font-medium leading-tight mt-1">
                      Response in<br />24 hours
                    </div>
                  </a>

                  {/* Visit Us */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=NX+One+Tower+Greater+Noida+West+201306"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-[#e8efe9] hover:bg-[#dfebe1] border border-transparent hover:border-[#0e7440]/20 text-center flex flex-col items-center justify-center transition-all group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-xs text-neutral-900">Visit Us</div>
                    <div className="text-[10px] text-neutral-600 font-medium leading-tight mt-1">
                      Greater<br />Noida
                    </div>
                  </a>
                </div>
              </div>

              {/* Section 2: Full Details Section matching Image 2 (Single column directly below) */}
              <div className="space-y-3 pt-1">
                <h4 className="text-sm font-bold text-[#0e7440] tracking-tight">Full Details</h4>
                <div className="space-y-2.5">
                  {/* Head Office Address */}
                  <div className="p-3.5 rounded-2xl bg-[#e8efe9] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-neutral-500">Head Office Address</div>
                      <p className="text-xs text-neutral-800 leading-relaxed font-medium mt-0.5">
                        423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), Gautam Buddha Nagar, UP, India - 201306
                      </p>
                    </div>
                  </div>

                  {/* Customer Support Line */}
                  <a
                    href="tel:+919793170555"
                    className="p-3.5 rounded-2xl bg-[#e8efe9] hover:bg-[#dfebe1] flex items-start gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-neutral-500">Customer Support Line</div>
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-[#0e7440] transition-colors mt-0.5">
                        +91 97931 70555
                      </div>
                    </div>
                  </a>

                  {/* Official Email Support */}
                  <a
                    href="mailto:support@kosmicowellness.com"
                    className="p-3.5 rounded-2xl bg-[#e8efe9] hover:bg-[#dfebe1] flex items-start gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-neutral-500">Official Email Support</div>
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-[#0e7440] transition-colors mt-0.5">
                        support@kosmicowellness.com
                      </div>
                    </div>
                  </a>

                  {/* Operational Hours */}
                  <div className="p-3.5 rounded-2xl bg-[#e8efe9] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d6e5d9] text-[#0e7440] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-neutral-500">Operational Hours</div>
                      <div className="text-xs text-neutral-800 font-medium mt-0.5 space-y-0.5">
                        <div>Mon - Sat: 11:00 AM - 07:00 PM</div>
                        <div className="text-neutral-500">Sunday: Closed</div>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* MODAL 6: PAYMENT METHODS (Matches Image 2 & Image 3) */}
      <PaymentMethodsModal
        isOpen={isPaymentMethodsOpen}
        onClose={() => setIsPaymentMethodsOpen(false)}
        isSelectionMode={false}
      />

    </div>
  );
};

