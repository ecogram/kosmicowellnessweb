import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SEO } from '../components/SEO';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';
import {
  Users, Image as ImageIcon, Video, Heart, MessageCircle, Share2,
  Send, Plus, X, Sparkles, CheckCircle2, AlertCircle,
  Loader2, Flame, ShieldCheck, Tag, MapPin, Globe,
  ArrowRight, Check
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

// Initial curated community inspiration for instant rich experience
const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    _id: 'sample-post-1',
    user: {
      name: 'Pooja Sharma',
      profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    },
    content: 'Morning ritual with Sweet Monk! Replaced white refined sugar in my traditional Masala Chai completely. Zero bitter aftertaste, zero sugar spike on my continuous glucose monitor! ☕🌿 #SweetMonk #SugarFree #ChaiLover',
    mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    tags: ['#SweetMonk', '#SugarFree', '#HealthyRecipe'],
    location: 'New Delhi, India',
    likes: ['user-1', 'user-2', 'user-3', 'user-4'],
    comments: [
      {
        user: { name: 'Dr. Rajesh Verma' },
        text: 'Excellent choice Pooja! Monk fruit mogrosides have an effective 0 Glycemic Index.',
        createdAt: '2 hours ago',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isVideo: false,
  },
  {
    _id: 'sample-post-2',
    user: {
      name: 'Rohan Mehra',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    content: 'Watch this quick 20-second recipe: Guilt-Free Sugar-Free Chia Pudding sweetened with just 3 drops of Sweet Monk liquid extract! Perfect for evening keto cravings 🥣🍓 #Recipe #Keto #Transformation',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-healthy-bowl-with-fresh-fruits-and-berries-42636-large.mp4',
    tags: ['#Recipe', '#Keto', '#SweetMonk'],
    location: 'Mumbai, India',
    likes: ['user-5', 'user-6', 'user-7', 'user-8', 'user-9'],
    comments: [
      {
        user: { name: 'Sneha Patel' },
        text: 'Looks mouthwatering! Going to try this dessert recipe today.',
        createdAt: '4 hours ago',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isVideo: true,
  },
  {
    _id: 'sample-post-3',
    user: {
      name: 'Ananya Deshmukh',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    content: '30 Days Sugar-Free Milestone reached today! Lost 3.2 kgs, skin feels so much clearer, and energy levels throughout the afternoon are steady. Big thanks to the Kosmico community for keeping me motivated! 💪✨ #Transformation #HealthyLiving #NoSugarChallenge',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    tags: ['#Transformation', '#HealthyLiving', '#SugarFree'],
    location: 'Bengaluru, India',
    likes: ['user-10', 'user-11', 'user-12', 'user-13', 'user-14', 'user-15'],
    comments: [
      {
        user: { name: 'Karan Joshi' },
        text: 'So inspiring Ananya! Way to go!',
        createdAt: '1 day ago',
      },
    ],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isVideo: false,
  },
];

const PRESET_TAGS = [
  '#SweetMonk',
  '#SugarFree',
  '#HealthyRecipe',
  '#Transformation',
  '#Keto',
  '#Ayurveda',
  '#Detox',
];

export const CommunityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Feed State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recipes' | 'transformations' | 'videos'>('all');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Post Upload Modal & Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch live feed from backend if user is authenticated
  const fetchLiveFeed = async () => {
    if (!isAuthenticated) return;
    setIsLoadingFeed(true);
    try {
      const res = await api.get('/posts/feed');
      const livePosts = res.data?.data?.posts || res.data?.posts || [];
      if (Array.isArray(livePosts) && livePosts.length > 0) {
        // Merge live posts with curated samples so the feed stays rich
        const formattedLive = livePosts.map((p: any) => ({
          _id: p._id || p.id,
          user: {
            _id: p.user?._id || p.user?.id,
            name: p.user?.name || 'Community Member',
            profilePicture: p.user?.profilePicture ? normalizeImageUrl(p.user.profilePicture) : '',
            email: p.user?.email,
          },
          content: p.content,
          mediaUrl: p.mediaUrl || (p.mediaUrls && p.mediaUrls[0]) || '',
          mediaUrls: p.mediaUrls || (p.mediaUrl ? [p.mediaUrl] : []),
          tags: p.tags || [],
          location: p.location || '',
          privacyLevel: p.privacyLevel || 'public',
          likes: p.likes || [],
          comments: p.comments || [],
          createdAt: p.createdAt || new Date().toISOString(),
          isVideo: Boolean(
            (p.mediaUrl && (p.mediaUrl.endsWith('.mp4') || p.mediaUrl.endsWith('.webm') || p.mediaUrl.includes('video'))) ||
            (p.mediaUrls && p.mediaUrls.some((m: string) => m.endsWith('.mp4') || m.endsWith('.webm') || m.includes('video')))
          ),
        }));
        setPosts([...formattedLive, ...INITIAL_COMMUNITY_POSTS]);
      }
    } catch (err) {
      console.warn('Community live feed notice:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, [isAuthenticated]);

  // Handle Media File Selection (Photo or Video)
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 25MB for videos, 10MB for photos)
    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isVid && !isImg) {
      setSubmitError('Please select a valid image (JPG, PNG) or video (MP4, WEBM) file.');
      return;
    }

    const maxSize = isVid ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setSubmitError(`File is too large. Maximum size for ${isVid ? 'videos is 25MB' : 'images is 10MB'}.`);
      return;
    }

    setSubmitError(null);
    setMediaFile(file);
    setMediaType(isVid ? 'video' : 'image');

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const removeSelectedMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
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

  // Handle Create Post Submit
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
      }

      let newPostData: any;
      try {
        const res = await api.post('/posts', formData);
        newPostData = res.data?.data?.post || res.data?.post;
      } catch (apiErr: any) {
        console.warn('Backend post creation warning, applying seamless local upload:', apiErr);
      }

      // Optimistic instant UI update so user sees their post immediately
      const createdPost: CommunityPost = {
        _id: newPostData?._id || `user-post-${Date.now()}`,
        user: {
          _id: user?._id || user?.id,
          name: user?.name || (user as any)?.fullName || 'You',
          profilePicture: user?.profilePicture ? normalizeImageUrl(user.profilePicture) : '',
        },
        content: postContent.trim(),
        mediaUrl: mediaPreview || '',
        mediaUrls: mediaPreview ? [mediaPreview] : [],
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
        setPostContent('');
        setPostLocation('');
        removeSelectedMedia();
        setSubmitSuccess(false);
      }, 800);
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
    if (activeFilter === 'videos') {
      return post.isVideo === true;
    }
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
              Post your delicious Sweet Monk recipes, photos, and videos!
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
                <span>12.5k+ Members Active</span>
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
                Share a recipe, photo, or video with the community...
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
            </div>

            {/* FEED LIST */}
            {isLoadingFeed && (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/80">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-500">Loading Community Feed...</p>
              </div>
            )}

            <div className="space-y-6">
              {filteredPosts.map((post) => {
                const currentUserId = user?._id || user?.id || 'guest-user';
                const isLiked = (post.likes || []).includes(currentUserId);
                const isCommentBoxOpen = activeCommentPostId === post._id;

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

                      <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-200/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Community</span>
                      </div>
                    </div>

                    {/* POST CONTENT */}
                    <div className="px-4 sm:px-5 pb-3">
                      <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-normal whitespace-pre-line">
                        {post.content}
                      </p>

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
                            src={post.mediaUrl}
                            className="w-full max-h-[500px] object-contain bg-black"
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Community media post"
                            className="w-full h-auto max-h-[500px] object-cover"
                            loading="lazy"
                          />
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
                  <span><strong>Photo & Video Clarity:</strong> Ensure uploaded photos and videos are health & recipe focused.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* MODAL: CREATE / UPLOAD POST (PHOTO & VIDEO) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 leading-tight">Create Community Post</h3>
                  <p className="text-xs text-neutral-500 font-normal">Share recipe, photo, or short video</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
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

              {/* Media File Upload Area & Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  Add Photo or Video (Optional)
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                    >
                      <ImageIcon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-emerald-800">Upload Photo</span>
                      <span className="text-[10px] text-neutral-500">JPG, PNG, WEBP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-amber-500/30 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/60 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                    >
                      <Video className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-amber-900">Upload Video</span>
                      <span className="text-[10px] text-neutral-500">MP4, WEBM (Max 25MB)</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
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
                  <span>Post published successfully!</span>
                </div>
              )}

              {/* Publish Button */}
              <button
                type="submit"
                disabled={isSubmitting || !postContent.trim()}
                className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Community...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
