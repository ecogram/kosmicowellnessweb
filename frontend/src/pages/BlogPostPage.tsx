import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SEO } from '../components/SEO';
import { BLOG_POSTS, type BlogGallery } from '../data/blogsData';
import { 
  Clock, Calendar, ArrowLeft, Share2, 
  Sparkles, CheckCircle2, ShoppingBag, 
  ChevronRight, ChevronLeft, HelpCircle, Languages,
  BookOpen, Images, LayoutGrid, Maximize2, X, Camera,
  Smartphone, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PLAY_STORE_URL } from '../utils/constants';

function GooglePlayBadge({ url, isHinglish }: { url?: string; isHinglish?: boolean }) {
  const targetUrl = url || PLAY_STORE_URL;
  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-950 hover:bg-black text-white border border-neutral-700/80 shadow-md hover:shadow-xl transition-all group shrink-0"
    >
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a2.03 2.03 0 0 1-.61-.926V2.74c0-.348.225-.68.609-.926zm11.238 11.24L17.5 15.71l-11.83 6.77 9.177-9.426zm0-2.108L5.67 1.52 17.5 8.29l-2.653 2.656zm1.464 1.054l3.167-1.812a1.47 1.47 0 0 1 0 2.548l-3.167-1.812-.001.076.001-.076z" fill="#00E676" />
      </svg>
      <div className="text-left">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 leading-none">
          {isHinglish ? 'Abhi Download Karein' : 'GET IT ON'}
        </div>
        <div className="text-sm font-extrabold text-white leading-tight">Google Play</div>
      </div>
    </a>
  );
}

function BlogPhotoGallery({ gallery, isHinglish }: { gallery: BlogGallery; isHinglish: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const images = gallery.images || [];
  const currentImg = images[currentIndex] || images[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;

  const currentTitle = isHinglish && gallery.titleHinglish ? gallery.titleHinglish : gallery.title;
  const currentSubtitle = isHinglish && gallery.subtitleHinglish ? gallery.subtitleHinglish : gallery.subtitle;

  return (
    <div className="my-10 p-5 sm:p-7 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-6">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0a7a40] text-xs font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>{isHinglish ? 'Photo Gallery & Behind the Scenes' : 'Official Photo Gallery'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black text-neutral-900">
            {currentTitle}
          </h3>
          {currentSubtitle && (
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
              {currentSubtitle}
            </p>
          )}
        </div>

        {/* View Mode Toggle: Carousel vs Grid */}
        <div className="inline-flex items-center p-1 bg-neutral-100 rounded-2xl border border-neutral-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('carousel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'carousel'
                ? 'bg-white text-[#0a7a40] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>{isHinglish ? 'Slider' : 'Carousel'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#0a7a40] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isHinglish ? 'Sabhi Photos' : 'Grid'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0a7a40] font-black">
              {images.length}
            </span>
          </button>
        </div>
      </div>

      {/* CAROUSEL VIEW */}
      {viewMode === 'carousel' && (
        <div className="space-y-4">
          <div className="relative group rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
            <img
              src={currentImg.src}
              alt={currentImg.alt}
              className="w-full h-72 sm:h-96 md:h-[450px] object-cover transition-opacity duration-300"
            />

            {/* Tag Badge */}
            {(currentImg.tag || currentImg.tagHinglish) && (
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full bg-neutral-900/85 backdrop-blur-md text-amber-300 border border-amber-300/30 text-xs font-bold tracking-wide shadow-sm">
                  ★ {isHinglish && currentImg.tagHinglish ? currentImg.tagHinglish : currentImg.tag}
                </span>
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white hover:bg-[#0a7a40] transition-colors shadow-md cursor-pointer"
              title="View full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 cursor-pointer z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-lg transition-transform hover:scale-105 cursor-pointer z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-black/90 via-black/55 to-transparent text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                {isHinglish && currentImg.captionHinglish ? currentImg.captionHinglish : currentImg.caption}
              </div>
              <div className="text-[11px] font-bold text-amber-300 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md self-start sm:self-auto shrink-0">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative rounded-xl overflow-hidden shrink-0 w-20 h-16 sm:w-24 sm:h-18 border-2 transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'border-[#0a7a40] ring-2 ring-[#0a7a40]/30 scale-102'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  {currentIndex === idx && (
                    <div className="absolute inset-0 bg-[#0a7a40]/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsLightboxOpen(true);
              }}
              className="group relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

              {(img.tag || img.tagHinglish) && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900/85 backdrop-blur-md text-amber-300 border border-amber-300/30 text-[11px] font-bold">
                    {isHinglish && img.tagHinglish ? img.tagHinglish : img.tag}
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 inset-x-3 text-white text-xs leading-snug">
                <p className="font-semibold line-clamp-2">
                  {isHinglish && img.captionHinglish ? img.captionHinglish : img.caption}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-1 font-bold">
                  <Maximize2 className="w-3 h-3" />
                  <span>{isHinglish ? 'Bada karke dekhein' : 'Click to enlarge'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX FULLSCREEN MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-neutral-200 truncate max-w-xs sm:max-w-md">
                {currentTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <img
              src={currentImg.src}
              alt={currentImg.alt}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="max-w-2xl mx-auto text-center py-2 px-4 space-y-1">
            {(currentImg.tag || currentImg.tagHinglish) && (
              <span className="inline-block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                ★ {isHinglish && currentImg.tagHinglish ? currentImg.tagHinglish : currentImg.tag}
              </span>
            )}
            <p className="text-xs sm:text-sm text-neutral-300">
              {isHinglish && currentImg.captionHinglish ? currentImg.captionHinglish : currentImg.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Language state: 'en' for English, 'hinglish' for Hinglish
  const [language, setLanguage] = useState<'en' | 'hinglish'>(() => {
    return (localStorage.getItem('kosmico_blog_lang') as 'en' | 'hinglish') || 'en';
  });

  const post = useMemo(() => {
    return BLOG_POSTS.find((p) => p.slug === slug);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const isHinglish = language === 'hinglish';
  const currentTitle = isHinglish && post.titleHinglish ? post.titleHinglish : post.title;
  const currentExcerpt = isHinglish && post.excerptHinglish ? post.excerptHinglish : post.excerpt;
  const currentContent = isHinglish && post.contentHinglish ? post.contentHinglish : post.content;

  const handleLanguageChange = (lang: 'en' | 'hinglish') => {
    setLanguage(lang);
    localStorage.setItem('kosmico_blog_lang', lang);
    toast.success(
      lang === 'hinglish'
        ? 'Blog ab Hinglish mein switch ho gaya!'
        : 'Switched to English guide!'
    );
  };

  const relatedPosts = useMemo(() => {
    return BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);
  }, [post.id]);

  const resolvedImage = post.coverImage.startsWith('http')
    ? post.coverImage
    : `https://www.kosmicowellness.com${post.coverImage}`;

  // Structured Data (Article Schema + FAQ Schema if available)
  const articleSchema = {
    '@type': 'BlogPosting',
    '@id': `https://www.kosmicowellness.com/blog/${post.slug}#article`,
    headline: post.title,
    description: post.metaDescription,
    image: resolvedImage,
    datePublished: '2026-10-15T08:00:00+05:30',
    dateModified: '2026-10-16T10:00:00+05:30',
    mainEntityOfPage: `https://www.kosmicowellness.com/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kosmico Wellness Private Limited',
      url: 'https://www.kosmicowellness.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.kosmicowellness.com/kosmico-logo.png',
      },
    },
  };

  const pageSchemas: any[] = [articleSchema];

  if (post.content.faqs && post.content.faqs.length > 0) {
    pageSchemas.push({
      '@type': 'FAQPage',
      '@id': `https://www.kosmicowellness.com/blog/${post.slug}#faq`,
      mainEntity: post.content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTitle,
          text: currentExcerpt,
          url,
        });
      } catch (err) {
        // Share dismissed
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Article link copied to clipboard!');
    }
  };

  return (
    <article className="bg-[#fcfdfc] min-h-screen py-10 md:py-16 font-sans">
      <SEO
        title={`${post.metaTitle}`}
        description={post.metaDescription}
        keywords={post.keywords}
        canonicalUrl={`https://www.kosmicowellness.com/blog/${post.slug}`}
        ogType="article"
        ogImage={resolvedImage}
        schema={pageSchemas}
      />

      <Container className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-[#0a7a40] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to="/blog" className="hover:text-[#0a7a40] transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-800 font-semibold truncate max-w-[240px] sm:max-w-md">
            {currentTitle}
          </span>
        </nav>

        {/* Top Controls: Back Link & Language Switcher Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#0a7a40] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHinglish ? 'Sabhi blogs dekhein' : 'Back to all guides'}</span>
          </Link>

          {/* Interactive Language Toggle Button */}
          <div className="inline-flex items-center p-1 bg-neutral-100 rounded-2xl border border-border shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isHinglish
                  ? 'bg-white text-[#0a7a40] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hinglish')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isHinglish
                  ? 'bg-[#0a7a40] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>🇮🇳</span>
              <span>Hinglish</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isHinglish ? 'bg-amber-400 text-neutral-900' : 'bg-emerald-100 text-[#0a7a40]'
              }`}>
                DESI
              </span>
            </button>
          </div>
        </div>

        {/* Notice Banner showing currently active language */}
        <div className="mb-8 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-amber-50/50 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#0a7a40] shrink-0" />
            <span className="text-neutral-700">
              {isHinglish ? (
                <>
                  <strong className="text-neutral-900">Hinglish Mode On:</strong> Yeh blog aam bolchal ki bhasha mein padhein. Agar English mein padhna ho toh upar ya floating button se switch karein.
                </>
              ) : (
                <>
                  <strong className="text-neutral-900">Language Option:</strong> You can toggle between <strong>English</strong> and <strong>Hinglish</strong> anytime using the button above.
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleLanguageChange(isHinglish ? 'en' : 'hinglish')}
            className="text-[11px] font-bold text-[#0a7a40] hover:underline shrink-0 cursor-pointer hidden md:inline-block"
          >
            {isHinglish ? 'Switch to English' : 'Hinglish mein padhein'} &rarr;
          </button>
        </div>

        {/* TOP PLAY STORE QUICK CTA BAR (IN EVERY BLOG) */}
        <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#053d20] text-white shadow-md border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="p-1.5 rounded-xl bg-amber-400 text-neutral-950 font-bold shrink-0">
              <Smartphone className="w-4 h-4 text-neutral-950" />
            </span>
            <span className="font-medium text-emerald-100">
              <strong className="text-white font-bold">
                {isHinglish && post.appPromo?.topBarTextHinglish
                  ? post.appPromo.topBarTextHinglish
                  : (post.appPromo?.topBarText || (isHinglish ? 'Track your Wellness journey Kosmico app ke sath' : 'Track your Wellness journey with Kosmico App'))}
              </strong>
              <span className="hidden md:inline text-emerald-200/80 ml-1.5">— Daily Sugar Tracker & Free Recipes</span>
            </span>
          </div>
          <a
            href={post.appPromo?.url || PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-xs tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Download on Google Play</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-[#0a7a40] text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-neutral-900 leading-tight">
            {currentTitle}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            {currentExcerpt}
          </p>

          {/* Author Box & Share Button */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <div>
                <div className="text-sm font-bold text-neutral-900">{post.author.name}</div>
                <div className="text-xs text-neutral-500">{post.author.role}</div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-[#0a7a40] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Share2 className="w-4 h-4" />
              <span>{isHinglish ? 'Share Karein' : 'Share Guide'}</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-md border border-border">
          <img
            src={post.coverImage}
            alt={currentTitle}
            className="w-full h-72 sm:h-96 md:h-[420px] object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-800 leading-relaxed text-base md:text-lg">
          
          {/* Intro Paragraph */}
          <p className="text-lg md:text-xl text-neutral-700 font-medium leading-relaxed bg-emerald-50/60 p-6 rounded-2xl border-l-4 border-[#0a7a40]">
            {currentContent.intro}
          </p>

          {/* Article Sections */}
          {(() => {
            const midSectionIndex = Math.max(0, Math.floor(currentContent.sections.length / 2) - 1);
            return currentContent.sections.map((section, idx) => (
              <section key={idx} className="space-y-4 pt-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-neutral-900 leading-snug">
                  {section.heading}
                </h2>

                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-neutral-700 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Callout Highlight Box */}
                {section.callout && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm md:text-base font-semibold flex items-start gap-3 my-4">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>{section.callout}</div>
                  </div>
                )}

                {/* Bullet Points */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 my-4">
                    {section.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} className="flex items-start gap-2.5 text-sm md:text-base text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-[#0a7a40] shrink-0 mt-1" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Comparison Table (If provided) */}
                {section.table && (
                  <div className="overflow-x-auto my-6 rounded-2xl border border-border shadow-xs bg-white">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-emerald-950 text-white uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                          {section.table.headers.map((th, thIdx) => (
                            <th key={thIdx} className="p-3.5 sm:p-4">
                              {th}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#f7faf8]'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-3.5 sm:p-4 font-medium ${cIdx === 3 ? 'text-[#0a7a40] font-bold' : 'text-neutral-700'}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section Image */}
                {section.image && (
                  <figure className="my-6 rounded-3xl overflow-hidden border border-border shadow-xs bg-white">
                    <img
                      src={section.image.src}
                      alt={section.image.alt}
                      className="w-full max-h-[420px] object-cover"
                      loading="lazy"
                    />
                    {section.image.caption && (
                      <figcaption className="p-3.5 text-xs text-neutral-600 bg-neutral-50 border-t border-border font-medium text-center">
                        💡 {section.image.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Section Multiple Photos Gallery (If available) */}
                {section.gallery && (
                  <BlogPhotoGallery gallery={section.gallery} isHinglish={isHinglish} />
                )}

                {/* MIDDLE PLAY STORE CTA (IN EVERY BLOG) */}
                {(section.appCta || idx === midSectionIndex) && (
                  <div className="my-8 p-6 sm:p-7 rounded-3xl bg-linear-to-br from-emerald-950 via-emerald-900 to-[#053d20] text-white shadow-xl border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isHinglish ? (section.appCta?.badgeHinglish || 'Kosmico Mobile App') : (section.appCta?.badge || 'Official Mobile App')}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                        {isHinglish
                          ? (section.appCta?.titleHinglish || 'Apni Sugar-Free Journey Ko Track Karein Kosmico App Par! 📱')
                          : (section.appCta?.title || 'Track Your Sugar-Free Habits with Kosmico Wellness App')}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100/85 max-w-lg leading-relaxed">
                        {isHinglish
                          ? (section.appCta?.subtitleHinglish || 'Free Daily Sugar Intake Tracker, 100+ Chef-Curated Sweet Monk Recipes, aur Daily Health Reminders.')
                          : (section.appCta?.subtitle || 'Free Daily Sugar Intake Tracker, 100+ Chef-Curated Sweet Monk Recipes, and Instant Water & Health Reminders.')}
                      </p>
                    </div>
                    <GooglePlayBadge url={section.appCta?.url || PLAY_STORE_URL} isHinglish={isHinglish} />
                  </div>
                )}
              </section>
            ));
          })()}

          {/* Post-Level Photo Gallery (Founder, Team & Lab Moments) */}
          {post.gallery && (
            <BlogPhotoGallery gallery={post.gallery} isHinglish={isHinglish} />
          )}

          {/* BOTTOM PLAY STORE WELCOME OFFER BANNER (IN EVERY BLOG) */}
          <div className="my-10 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-emerald-950 via-neutral-900 to-emerald-950 text-white shadow-xl border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="bg-amber-400 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                {isHinglish ? (post.appPromo?.badgeHinglish || '🎁 App Welcome Offer') : (post.appPromo?.badge || '🎁 App Exclusive Offer')}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                {isHinglish
                  ? (post.appPromo?.titleHinglish || 'Kosmico App Download Karein Aur Paayein Special Welcome Offer! 🎁')
                  : (post.appPromo?.title || 'Download Kosmico App & Get Special Welcome Gift!')}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg leading-relaxed">
                {isHinglish
                  ? (post.appPromo?.subtitleHinglish || 'Apna daily sugar score track karein, 100+ healthy recipes paayein aur apne pehle Sweet Monk bottle order par paayein Flat ₹50 OFF / 100 Bonus Coins!')
                  : (post.appPromo?.subtitle || 'Track your daily sugar savings, access 100+ monk fruit recipes, and get Flat ₹50 OFF / 100 Bonus Coins on your first Sweet Monk order.')}
              </p>
            </div>
            <GooglePlayBadge url={post.appPromo?.url || PLAY_STORE_URL} isHinglish={isHinglish} />
          </div>

          {/* In-Article Sweet Monk Product CTA Card */}
          <div className="my-10 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="bg-amber-400 text-neutral-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {isHinglish ? 'Zero Sugar Vikalp' : 'Zero Sugar Alternative'}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                {isHinglish ? 'Kosmico 100% Pure Sweet Monk Drops Try Karein' : 'Experience 100% Pure Sweet Monk Drops'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md">
                {isHinglish 
                  ? 'Zero calories, zero glycemic index, zero aftertaste. 1 bottle se 300+ cup chai/coffee banayein. All-India Free Delivery.' 
                  : 'Zero calories, zero glycemic index, zero aftertaste. 300+ cups of tea/coffee per bottle. Free delivery across India.'}
              </p>
            </div>

            <Link
              to="/shop"
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isHinglish ? 'Sweet Monk Khareedein' : 'Buy Sweet Monk'}</span>
            </Link>
          </div>

          {/* Post FAQs Section */}
          {currentContent.faqs && currentContent.faqs.length > 0 && (
            <div className="my-10 space-y-4 pt-4 border-t border-border">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-neutral-900 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#0a7a40]" />
                <span>
                  {isHinglish ? 'Aam Taur Par Puche Jaane Wale Sawal (FAQs)' : 'Frequently Asked Questions'}
                </span>
              </h3>

              <div className="space-y-3">
                {currentContent.faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="p-5 rounded-2xl bg-white border border-border space-y-2 shadow-xs">
                    <h4 className="font-bold text-neutral-900 text-base">
                      {faq.question}
                    </h4>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusion */}
          <div className="p-6 rounded-2xl bg-white border border-border space-y-3 shadow-xs">
            <h3 className="text-lg font-serif font-black text-neutral-900">
              {isHinglish ? 'Aakhiri Baat (Summary)' : 'The Bottom Line'}
            </h3>
            <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
              {currentContent.conclusion}
            </p>
          </div>

          {/* Article Tags */}
          <div className="flex items-center gap-2 flex-wrap pt-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Floating Language Quick-Toggle for Long Reads */}
        <div className="fixed bottom-6 right-6 z-40 print:hidden">
          <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/20">
            <div className="pl-3 pr-1 text-[11px] font-bold text-neutral-300 hidden sm:flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Language:</span>
            </div>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !isHinglish
                  ? 'bg-white text-neutral-900 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hinglish')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isHinglish
                  ? 'bg-[#0a7a40] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Hinglish</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h3 className="text-2xl font-serif font-black text-neutral-900 mb-6">
              {isHinglish ? 'Aur Useful Guides Padhein' : 'Recommended Wellness Reading'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="bg-white p-5 rounded-3xl border border-border shadow-xs hover:shadow-md hover:border-[#0a7a40]/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a7a40] bg-emerald-50 px-2 py-0.5 rounded">
                      {rel.category}
                    </span>
                    <h4 className="font-serif font-black text-base text-neutral-900 group-hover:text-[#0a7a40] transition-colors leading-snug">
                      {isHinglish && rel.titleHinglish ? rel.titleHinglish : rel.title}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {isHinglish && rel.excerptHinglish ? rel.excerptHinglish : rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>{rel.readingTime}</span>
                    <span className="text-[#0a7a40] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isHinglish ? 'Padhein' : 'Read'} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </Container>
    </article>
  );
}
