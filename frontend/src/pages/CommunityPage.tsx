import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SEO } from '../components/SEO';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';
import {
  Users, Image as ImageIcon, Heart, MessageCircle, Share2,
  Send, Plus, X, Sparkles, CheckCircle2, AlertCircle,
  Loader2, Flame, ShieldCheck, Tag, MapPin, Globe,
  ArrowRight, Check, MoreVertical, Edit3, Trash2, Maximize2,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface Comment {
  _id?: string;
  user: {
    _id?: string;
    name: string;
    profilePicture?: string;
  };
  text: string;
  createdAt?: string;
}

interface CommunityPost {
  _id: string;
  user: {
    _id?: string;
    name: string;
    profilePicture?: string;
    email?: string;
  };
  content: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  tags?: string[];
  location?: string;
  privacyLevel?: string;
  likes?: string[];
  comments?: Comment[];
  createdAt: string;
  isVideo?: boolean;
}

const PRESET_TAGS = [
  '#SweetMonk',
  '#SugarFree',
  '#HealthyRecipe',
  '#Transformation',
  '#Keto',
  '#Ayurveda',
  '#Detox',
];

const SWEET_MONK_TEMPLATES = [
  {
    id: 'chai-tea',
    title: 'Post 1: Chai & Coffee Lovers',
    subtitle: '1 Drop = 1 Teaspoon Sugar',
    image: '/assets/community/sweetmonk_chai_creative.jpg',
    tags: ['#SweetMonk', '#SugarFree', '#ChaiLovers', '#HealthyRoutine'],
    content: `☕ Chai me cheeni chhod di thi par maza chala gaya? Ab compromise bilkul nahi! 🌿\n\nSubah ki garam chai ho ya evening black coffee—ab meethas ka lutf uthaiye bina kisi guilt ya sugar spike ke!\n\nPresenting Kosmico Sweet Monk Drops – 100% Natural Monk Fruit Sweetener!\n\n✨ Kyun hai Sweet Monk sabse alag?\n• 💧 1 Drop = 1 Chammach Cheeni ki meethas\n• 🌿 100% Plant Based & Natural Monk Fruit\n• 🔥 ZERO Calories & ZERO Added Sugar\n• 🚫 No Bitter Aftertaste (No stevia bitterness!)\n• 🩺 Diabetic Friendly & Keto Approved\n\nApni har cup ko banaiye naturally sweet aur healthy!\n👉 Order at: kosmicowellness.com 🌿`,
  },
  {
    id: 'diabetic-dessert',
    title: 'Post 2: Diabetic Friendly Sweets',
    subtitle: 'Zero Glycemic Index, 0 Sugar Spikes',
    image: '/assets/community/sweetmonk_diabetic_dessert.jpg',
    tags: ['#DiabetesFriendly', '#SugarFreeIndia', '#SweetMonk', '#HealthyFamily'],
    content: `🩺 Ghar me kisi ko diabetes hai aur meetha chhoot gaya hai? Unke chehre par wapas muskaan laiye! 💚\n\nBlood sugar spike ki tension ko bolo bye-bye. Kosmico Sweet Monk drops se banaiye 100% diabetic-safe kheer, halwa, nimbu paani aur detox tea!\n\n🌿 Kyun hai Sweet Monk har ghar ke liye must-have?\n• 🎯 Zero Glycemic Index: Blood sugar level bilkul spike nahi hota\n• 🍃 100% Pure Monk Fruit Extract: Koi artificial sweetener nahi\n• 💧 Easy Dropper Bottle: Bas 1-2 drops aur shandaar meethas\n• 👨‍👩‍👧‍👦 Family & Elder Friendly: Sabhi age groups ke liye safe\n\nHealthy raho, khulkar meetha khao bina darr ke! ✨\n👉 Order at: kosmicowellness.com`,
  },
  {
    id: 'fitness-smoothie',
    title: 'Post 3: Fitness & Weight Loss',
    subtitle: '0 Calories, Guilt-Free Smoothies',
    image: '/assets/community/sweetmonk_fitness_smoothie.jpg',
    tags: ['#KetoIndia', '#WeightLossJourney', '#SweetMonk', '#FitnessMotivation'],
    content: `🥗 Weight Loss Journey par ho ya Sweet Cravings satati hain? Swad wahi, Calories ZERO! 🏋️‍♂️💪\n\nCalorie-deficit diet me sweet cravings sabse bada obstacle banti hain. Apne morning smoothies, oats bowl aur healthy desserts me lijiye natural meethas Sweet Monk ke saath!\n\n🌿 100% Natural Monk Fruit Extract:\n• 0️⃣ 0 Calories, 0 Carbs, 0 Fat\n• ⚡ Keto & Intermittent Fasting Friendly\n• 🥞 Oats, smoothies, yogurt ya bakery desserts me instant mix\n• 💧 Sirf 1-2 drops aur cravings satisfy bina fat gain ke!\n\nFitness me sweet sacrifices mat karo, smart switch karo! 🥑\n👉 Order at: kosmicowellness.com`,
  },
];

export const CommunityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Feed State (Clean empty feed — only user uploaded posts will appear)
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recipes' | 'transformations'>('all');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Post Upload & Edit Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  const [postContent, setPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#SweetMonk']);
  const [postLocation, setPostLocation] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Interactive comments & share state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const toggleExpandPost = (postId: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Fullscreen Image Lightbox Viewer State
  const [selectedViewerMedia, setSelectedViewerMedia] = useState<{
    url: string;
    author?: string;
    content?: string;
  } | null>(null);

  // Close Lightbox on Esc key and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedViewerMedia(null);
      }
    };
    if (selectedViewerMedia) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedViewerMedia]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open Edit Modal with existing post data
  const handleOpenEditPost = (post: CommunityPost) => {
    setEditingPost(post);
    setPostContent(post.content);
    setSelectedTags(post.tags && post.tags.length > 0 ? post.tags : ['#SweetMonk']);
    setPostLocation(post.location || '');
    setMediaPreview(post.mediaUrl || null);
    setMediaType(post.isVideo ? 'video' : post.mediaUrl ? 'image' : null);
    setMediaFile(null);
    setSubmitError(null);
    setActiveMenuPostId(null);
    setIsCreateModalOpen(true);
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    setActiveMenuPostId(null);
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    setPosts((prev) => prev.filter((p) => p._id !== postId));

    if (isAuthenticated) {
      try {
        await api.delete(`/posts/${postId}`);
      } catch (err) {
        console.warn('Backend delete post notice:', err);
      }
    }
  };

  // Helper to detect video format
  const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('/video/');
  };

  // Fetch live feed from backend if user is authenticated
  const fetchLiveFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await api.get('/posts/feed');
      const livePosts = res.data?.data?.posts || res.data?.posts || [];
      if (Array.isArray(livePosts)) {
        const formattedLive = livePosts.map((p: any) => {
          const rawMedia =
            (Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0 && p.mediaUrls[0]) ||
            p.mediaUrl ||
            '';
          const cleanMedia = normalizeImageUrl(rawMedia);
          const cleanMediaUrls = (p.mediaUrls && Array.isArray(p.mediaUrls) ? p.mediaUrls : [p.mediaUrl])
            .filter(Boolean)
            .map((m: string) => normalizeImageUrl(m));

          return {
            _id: p._id || p.id,
            user: {
              _id: p.user?._id || p.user?.id,
              name: p.user?.name || 'Community Member',
              profilePicture: p.user?.profilePicture ? normalizeImageUrl(p.user.profilePicture) : '',
              email: p.user?.email,
            },
            content: p.content,
            mediaUrl: cleanMedia,
            mediaUrls: cleanMediaUrls,
            tags: p.tags || [],
            location: p.location || '',
            privacyLevel: p.privacyLevel || 'public',
            likes: p.likes || [],
            comments: p.comments || [],
            createdAt: p.createdAt || new Date().toISOString(),
            isVideo: isVideoUrl(cleanMedia),
          };
        });
        setPosts(formattedLive);
      }
    } catch (err) {
      console.warn('Community live feed notice:', err);
      setPosts([]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, [isAuthenticated]);

  // Handle Media File Selection (Photos only)
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');

    if (!isImg) {
      setSubmitError('Please select a valid image file (JPG, PNG, WEBP). Video uploads are disabled.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setSubmitError('Image file is too large. Maximum size is 10MB.');
      return;
    }

    setSubmitError(null);
    setMediaFile(file);
    setMediaType('image');

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const removeSelectedMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle Preset Tag
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle Create or Edit Post Submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/community');
      return;
    }

    if (!postContent.trim()) {
      setSubmitError('Please write some content for your post.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // EDIT EXISTING POST MODE
    if (editingPost) {
      try {
        const formData = new FormData();
        formData.append('content', postContent.trim());
        formData.append('privacyLevel', 'public');
        if (postLocation.trim()) {
          formData.append('location', postLocation.trim());
        }
        selectedTags.forEach((t) => formData.append('tags', t));

        if (mediaFile) {
          formData.append('media', mediaFile);
        } else if (mediaPreview) {
          formData.append('mediaUrl', mediaPreview);
        }

        try {
          await api.put(`/posts/${editingPost._id}`, formData);
        } catch (apiErr: any) {
          console.warn('Backend edit post warning:', apiErr);
        }

        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p._id !== editingPost._id) return p;
            return {
              ...p,
              content: postContent.trim(),
              location: postLocation.trim(),
              tags: selectedTags,
              mediaUrl: mediaPreview || '',
              mediaUrls: mediaPreview ? [mediaPreview] : [],
              isVideo: mediaType === 'video',
            };
          })
        );

        setSubmitSuccess(true);

        setTimeout(() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
          setPostContent('');
          setPostLocation('');
          removeSelectedMedia();
          setSubmitSuccess(false);
        }, 700);
      } catch (err: any) {
        setSubmitError(err?.message || 'Failed to update post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // CREATE NEW POST MODE
    try {
      const formData = new FormData();
      formData.append('content', postContent.trim());
      formData.append('privacyLevel', 'public');
      if (postLocation.trim()) {
        formData.append('location', postLocation.trim());
      }
      selectedTags.forEach((t) => formData.append('tags', t));

      if (mediaFile) {
        formData.append('media', mediaFile);
      } else if (mediaPreview) {
        formData.append('mediaUrl', mediaPreview);
      }

      let newPostData: any;
      try {
        const res = await api.post('/posts', formData);
        newPostData = res.data?.data?.post || res.data?.post;
      } catch (apiErr: any) {
        console.warn('Backend post creation warning, applying seamless local upload:', apiErr);
      }

      const resolvedServerMedia =
        newPostData?.mediaUrl ||
        (Array.isArray(newPostData?.mediaUrls) && newPostData.mediaUrls[0]) ||
        '';

      const finalMediaUrl = resolvedServerMedia
        ? normalizeImageUrl(resolvedServerMedia)
        : (mediaPreview || '');

      // Optimistic instant UI update so user sees their post immediately
      const createdPost: CommunityPost = {
        _id: newPostData?._id || `user-post-${Date.now()}`,
        user: {
          _id: user?._id || user?.id,
          name: user?.name || (user as any)?.fullName || 'You',
          profilePicture: user?.profilePicture ? normalizeImageUrl(user.profilePicture) : '',
        },
        content: postContent.trim(),
        mediaUrl: finalMediaUrl,
        mediaUrls: finalMediaUrl ? [finalMediaUrl] : [],
        tags: selectedTags,
        location: postLocation.trim(),
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        isVideo: mediaType === 'video',
      };

      setPosts([createdPost, ...posts]);
      setSubmitSuccess(true);

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setEditingPost(null);
        setPostContent('');
        setPostLocation('');
        removeSelectedMedia();
        setSubmitSuccess(false);
      }, 700);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Post Like
  const handleToggleLike = async (postId: string) => {
    const currentUserId = user?._id || user?.id || 'guest-user';
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id !== postId) return p;
        const currentLikes = p.likes || [];
        const isLiked = currentLikes.includes(currentUserId);
        const nextLikes = isLiked
          ? currentLikes.filter((id) => id !== currentUserId)
          : [...currentLikes, currentUserId];
        return { ...p, likes: nextLikes };
      })
    );

    if (isAuthenticated) {
      try {
        await api.post(`/posts/${postId}/like`);
      } catch (err) {
        console.warn('Like toggle sync notice:', err);
      }
    }
  };

  // Handle Add Comment
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const authorName = user?.name || (user as any)?.fullName || 'Guest Member';

    const newComment: Comment = {
      _id: `comment-${Date.now()}`,
      user: {
        name: authorName,
        profilePicture: user?.profilePicture ? normalizeImageUrl(user.profilePicture) : '',
      },
      text: commentText.trim(),
      createdAt: 'Just now',
    };

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id !== postId) return p;
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
        };
      })
    );

    setCommentText('');

    if (isAuthenticated) {
      try {
        await api.post(`/posts/${postId}/comments`, { text: newComment.text });
      } catch (err) {
        console.warn('Comment sync notice:', err);
      }
    }
  };

  // Handle Share Post
  const handleSharePost = async (post: CommunityPost) => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kosmico Wellness Community',
          text: post.content.slice(0, 100),
          url: shareUrl,
        });
        return;
      } catch (e) { }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedPostId(post._id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Filtered Posts
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'recipes') {
      return (
        post.tags?.some((t) => t.toLowerCase().includes('recipe') || t.toLowerCase().includes('chai')) ||
        post.content.toLowerCase().includes('recipe')
      );
    }
    if (activeFilter === 'transformations') {
      return (
        post.tags?.some((t) => t.toLowerCase().includes('transformation') || t.toLowerCase().includes('challenge')) ||
        post.content.toLowerCase().includes('transformation') ||
        post.content.toLowerCase().includes('lost')
      );
    }
    /* Video filter disabled:
    if ((activeFilter as any) === 'videos') {
      return post.isVideo === true;
    }
    */
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-20 pt-6">
      <SEO
        title="Community Hub — Kosmico Wellness"
        description="Join India's leading health & wellness community. Share sugar-free recipes, video tutorials, and healthy transformation stories with Sweet Monk."
      />

      <Container>
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-emerald-900 to-[#053d20] text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40 mb-8">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Kosmico Wellness Community</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Share Your <span className="text-amber-400">Sugar-Free Journey</span> & Recipes
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
              Connect with thousands of health enthusiasts, diabetic-conscious families, and home chefs.
              Post your delicious Sweet Monk recipes, photos, and stories!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/community');
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload New Post 📸</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-emerald-200/80 bg-emerald-900/50 px-4 py-2.5 rounded-2xl border border-emerald-800/60">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{posts.length} {posts.length === 1 ? 'Post' : 'Posts'} Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN COMMUNITY LAYOUT (GRID: FEED + SIDEBAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FEED COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* QUICK POST TRIGGER BAR */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-neutral-200/80 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm overflow-hidden shrink-0 ring-2 ring-emerald-500/20">
                {user?.profilePicture ? (
                  <img
                    src={normalizeImageUrl(user.profilePicture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || '✨'
                )}
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/community');
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="flex-1 text-left px-4 py-3 bg-neutral-100/80 hover:bg-neutral-100 text-neutral-500 text-sm rounded-xl transition-colors cursor-pointer"
              >
                Share a recipe or photo with the community...
              </button>

              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/community');
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className="p-2.5 hover:bg-emerald-50 text-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Upload Photo"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Photo</span>
                </button>
                {/* Video upload option commented out:
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/community');
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className="p-2.5 hover:bg-amber-50 text-amber-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Upload Video"
                >
                  <Video className="w-4 h-4 text-amber-600" />
                  <span>Video</span>
                </button>
                */}
              </div>
            </div>

            {/* FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setActiveFilter('recipes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'recipes'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>Healthy Recipes 🥗</span>
              </button>
              <button
                onClick={() => setActiveFilter('transformations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'transformations'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>Transformations 💪</span>
              </button>
              {/* Video Clips filter commented out:
              <button
                onClick={() => setActiveFilter('videos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'videos'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-amber-500" />
                <span>Video Clips 🎥</span>
              </button>
              */}
            </div>

            {/* FEED LIST */}
            {isLoadingFeed && (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/80">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-500">Loading Community Feed...</p>
              </div>
            )}

            {/* EMPTY STATE (WHEN NO POSTS UPLOADED YET) */}
            {!isLoadingFeed && filteredPosts.length === 0 && (
              <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-neutral-200/80 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                  <Users className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-neutral-900">
                    No community posts yet
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
                    Be the first to share your healthy sugar-free recipe, photo, or short video with the Kosmico community!
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/community');
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload First Post 📸</span>
                </button>
              </div>
            )}

            <div className="space-y-6">
              {filteredPosts.map((post) => {
                const currentUserId = user?._id || user?.id || '';
                const isLiked = (post.likes || []).includes(currentUserId);
                const isCommentBoxOpen = activeCommentPostId === post._id;
                const isMyPost = Boolean(
                  (currentUserId && post.user?._id && (currentUserId === post.user._id || currentUserId === (post.user as any)?.id)) ||
                  (user?.name && post.user?.name === user.name)
                );

                return (
                  <article
                    key={post._id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* POST HEADER */}
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-sm overflow-hidden shrink-0">
                          {post.user?.profilePicture ? (
                            <img
                              src={normalizeImageUrl(post.user.profilePicture)}
                              alt={post.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            post.user?.name?.slice(0, 2).toUpperCase() || 'KM'
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900">{post.user.name}</span>
                            <span className="inline-block w-1 h-1 rounded-full bg-neutral-300"></span>
                            <span className="text-xs text-neutral-400 font-normal">
                              {post.createdAt.includes('T')
                                ? new Date(post.createdAt).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : post.createdAt}
                            </span>
                          </div>
                          {post.location && (
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>{post.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-200/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Verified Community</span>
                        </div>

                        {/* Owner Options: Edit & Delete (3-Dots Menu) */}
                        {isMyPost && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuPostId(activeMenuPostId === post._id ? null : post._id)}
                              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                              title="Post options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuPostId === post._id && (
                              <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => handleOpenEditPost(post)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Edit Post</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Post</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* POST CONTENT */}
                    <div className="px-4 sm:px-5 pb-3">
                      {(() => {
                        const isExpanded = !!expandedPosts[post._id];
                        const linesCount = post.content.split('\n').length;
                        const isLongContent = post.content.trim().length > 150 || linesCount > 3;

                        return (
                          <>
                            <p
                              onClick={() => {
                                if (!isExpanded && isLongContent) toggleExpandPost(post._id);
                              }}
                              className={`text-sm sm:text-base text-neutral-800 leading-relaxed font-normal whitespace-pre-line transition-all ${
                                !isExpanded && isLongContent
                                  ? 'line-clamp-3 cursor-pointer hover:text-neutral-900'
                                  : ''
                              }`}
                            >
                              {post.content}
                            </p>

                            {isLongContent && (
                              <button
                                type="button"
                                onClick={() => toggleExpandPost(post._id)}
                                className="mt-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show less</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <span>... Read more</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        );
                      })()}

                      {/* TAGS */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* POST MEDIA (IMAGE OR VIDEO) */}
                    {post.mediaUrl && (
                      <div className="relative bg-neutral-900 border-y border-neutral-100 overflow-hidden max-h-[500px] flex items-center justify-center">
                        {post.isVideo ? (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            src={normalizeImageUrl(post.mediaUrl)}
                            className="w-full max-h-[500px] object-contain bg-black"
                          />
                        ) : (
                          <div className="relative w-full group cursor-zoom-in flex items-center justify-center">
                            <img
                              src={normalizeImageUrl(post.mediaUrl)}
                              alt="Community media post"
                              className="w-full h-auto max-h-[500px] object-cover group-hover:brightness-95 transition-all"
                              loading="lazy"
                              onClick={() =>
                                setSelectedViewerMedia({
                                  url: normalizeImageUrl(post.mediaUrl),
                                  author: post.user?.name,
                                  content: post.content,
                                })
                              }
                              onError={(e) => {
                                const container = e.currentTarget.parentElement?.parentElement;
                                if (container) container.style.display = 'none';
                              }}
                            />
                            <div
                              onClick={() =>
                                setSelectedViewerMedia({
                                  url: normalizeImageUrl(post.mediaUrl),
                                  author: post.user?.name,
                                  content: post.content,
                                })
                              }
                              className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">View Full</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* POST ACTION BUTTONS */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-t border-neutral-100">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleToggleLike(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isLiked
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'hover:bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition-transform ${
                              isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-neutral-500'
                            }`}
                          />
                          <span>{post.likes?.length || 0}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() =>
                            setActiveCommentPostId(isCommentBoxOpen ? null : post._id)
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-neutral-500" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={() => handleSharePost(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                        title="Share post"
                      >
                        {copiedPostId === post._id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 text-neutral-500" />
                            <span className="hidden sm:inline">Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {isCommentBoxOpen && (
                      <div className="bg-neutral-50/70 p-4 sm:p-5 border-t border-neutral-100 space-y-4 animate-in fade-in duration-150">
                        {/* Existing comments list */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map((comment, cIdx) => (
                              <div key={cIdx} className="flex items-start gap-2.5 text-xs">
                                <div className="w-7 h-7 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  {comment.user.name?.slice(0, 1).toUpperCase() || 'M'}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-2xl border border-neutral-200/70 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1">
                                    <span className="font-bold text-neutral-900">{comment.user.name}</span>
                                    {comment.createdAt && (
                                      <span className="text-[10px] text-neutral-400 font-medium">
                                        {comment.createdAt}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-neutral-700 leading-relaxed font-normal">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 text-center py-2 font-medium">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write an encouraging comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post._id);
                              }
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700 transition-all"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={!commentText.trim()}
                            className="p-2.5 bg-[#0a7a40] hover:bg-[#086333] text-white rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR COLUMN (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* CALL TO ACTION CARD */}
            <div className="bg-linear-to-br from-emerald-900 to-[#07532a] text-white rounded-3xl p-6 shadow-md border border-emerald-700/50 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Sweet Monk Movement</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white leading-snug">
                Why Thousands are Switching to Sweet Monk?
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                Pure Luo Han Guo extract with 0 calories, 0 sugar spikes, and zero bitter aftertaste.
                Perfect for cooking, baking, coffee, and daily tea.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <span>Shop Sweet Monk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* TRENDING COMMUNITY TAGS */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-700" />
                <span>Trending Community Tags</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_TAGS.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (activeFilter === 'recipes') setActiveFilter('all');
                      else setActiveFilter('recipes');
                    }}
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 text-xs font-semibold rounded-xl border border-neutral-200 transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* COMMUNITY GUIDELINES */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Community Guidelines</span>
              </h4>
              <ul className="text-xs text-neutral-600 space-y-2.5 font-normal leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Be Respectful:</strong> Encourage and support fellow members on their health journey.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Share Real Recipes:</strong> Post clear measurements and ingredients when sharing recipes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Photo Clarity:</strong> Ensure uploaded photos are health & recipe focused.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* MODAL: CREATE / UPLOAD POST (PHOTO ONLY) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  {editingPost ? <Edit3 className="w-5 h-5 text-emerald-700" /> : <Users className="w-5 h-5 text-emerald-700" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 leading-tight">
                    {editingPost ? 'Edit Community Post' : 'Create Community Post'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-normal">
                    {editingPost ? 'Update your recipe, content, or photo' : 'Share recipe or photo'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingPost(null);
                  setPostContent('');
                  setPostLocation('');
                  removeSelectedMedia();
                  setSubmitError(null);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* User Identity Preview */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={normalizeImageUrl(user.profilePicture)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.slice(0, 2).toUpperCase() || 'KM'
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-900">{user?.name || 'Community Member'}</div>
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Public Post</span>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  rows={4}
                  required
                  placeholder="What healthy recipe or wellness milestone are you celebrating today with Sweet Monk?"
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  className="w-full p-4 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all placeholder:text-neutral-400 resize-none"
                />
              </div>

              {/* Media File Upload Area & Preview (Photo Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  Add Photo (Optional)
                </label>

                {mediaPreview ? (
                  <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 group max-h-64 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video
                        controls
                        src={mediaPreview}
                        className="w-full max-h-64 object-contain"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Upload preview"
                        className="w-full max-h-64 object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={removeSelectedMedia}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer transition-all shadow-md"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                    >
                      <ImageIcon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-emerald-800">Upload Photo from Computer</span>
                      <span className="text-[10px] text-neutral-500">JPG, PNG, WEBP (Max 10MB)</span>
                    </button>

                    {/* Official Sweet Monk Creatives 1-Click Pick */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-[11px] font-bold text-neutral-700 mb-2 flex items-center justify-between">
                        <span>✨ Or Choose Official Sweet Monk Creative:</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">1-Click Auto Fill</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {SWEET_MONK_TEMPLATES.map((tmpl) => (
                          <div
                            key={tmpl.id}
                            onClick={() => {
                              setMediaPreview(tmpl.image);
                              setMediaType('image');
                              setMediaFile(null);
                              if (!postContent.trim()) {
                                setPostContent(tmpl.content);
                              }
                              setSelectedTags((prev) => Array.from(new Set([...prev, ...tmpl.tags])));
                            }}
                            className="group relative p-2 border border-neutral-200 hover:border-emerald-500 rounded-xl bg-white hover:bg-emerald-50/30 cursor-pointer transition-all flex flex-col gap-1.5 shadow-2xs hover:shadow-sm"
                          >
                            <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-100">
                              <img
                                src={tmpl.image}
                                alt={tmpl.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-900 line-clamp-1">{tmpl.title}</p>
                              <p className="text-[10px] text-neutral-500 line-clamp-1">{tmpl.subtitle}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 rounded-md py-1 px-1.5 text-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                              Use This Post
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden File Input (Images Only) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
              </div>

              {/* Tag Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  Select Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag, idx) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0a7a40] text-white shadow-2xs'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 block">Location (Optional)</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Alerts */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{editingPost ? 'Post updated successfully!' : 'Post published successfully!'}</span>
                </div>
              )}

              {/* Publish / Save Button */}
              <button
                type="submit"
                disabled={isSubmitting || !postContent.trim()}
                className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{editingPost ? 'Saving Changes...' : 'Publishing to Community...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{editingPost ? 'Save Changes' : 'Publish Post'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* FULLSCREEN IMAGE LIGHTBOX VIEWER */}
      {selectedViewerMedia && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedViewerMedia(null)}
        >
          {/* Top Bar with Author Info and Close button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 text-white px-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">
                {selectedViewerMedia.author || 'Community Member'}
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-neutral-500"></span>
              <span className="text-xs text-neutral-400 font-normal">Full Photo View</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedViewerMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Open original image in new tab"
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize2 className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSelectedViewerMedia(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image Container */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedViewerMedia.url}
              alt="Community post full preview"
              className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl select-none animate-in zoom-in-95 duration-200"
            />
          </div>

          {/* Caption Overlay */}
          {selectedViewerMedia.content && (
            <div
              className="w-full max-w-3xl pt-3 px-3 text-center pb-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto line-clamp-2 font-normal leading-relaxed">
                {selectedViewerMedia.content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
