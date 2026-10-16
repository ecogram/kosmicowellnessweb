import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SEO } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogsData';
import { Clock, Calendar, ArrowRight, Sparkles, Bot, ShoppingBag } from 'lucide-react';

const blogListSchema = {
  '@type': 'Blog',
  name: 'Kosmico Wellness Blog & Health Guides',
  description: 'Evidence-based articles on diabetes care, monk fruit sweeteners, zero-calorie living, and ketogenic nutrition.',
  url: 'https://www.kosmicowellness.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Kosmico Wellness Private Limited',
    url: 'https://www.kosmicowellness.com',
    logo: 'https://www.kosmicowellness.com/kosmico-logo.png',
  },
};

export function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Natural Sweeteners', 'Diabetes Care', 'Keto & Weight Loss'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="bg-[#f7faf8] min-h-screen py-12 md:py-16 font-sans">
      <SEO
        title="Wellness Blog & Diabetes Care Guides | Kosmico Wellness"
        description="Explore evidence-based wellness articles, clinical sweetener comparisons, and doctor-backed daily habits to manage blood glucose and HbA1c naturally."
        keywords="diabetes wellness blog, monk fruit guides, zero calorie sweetener articles, blood sugar tips, keto diet blog India"
        canonicalUrl="https://www.kosmicowellness.com/blog"
        schema={blogListSchema}
      />

      <Container className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#0a7a40] text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kosmico Health &amp; Research Editorial</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-neutral-900 tracking-tight leading-tight">
            Science-Backed Guides for a Sweeter, Healthier Life
          </h1>

          <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
            Clinical insights on monk fruit, zero-sugar living, diabetic glycemic control, and clean nutrition without compromising taste.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-2 space-y-2">
            <input
              type="text"
              placeholder="Search topics (e.g. Stevia, Blood Sugar, Keto)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-white border border-border shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7a40]/30 focus:border-[#0a7a40] transition-all"
            />
            <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs text-neutral-500">
              <span className="font-semibold text-neutral-400 text-[11px]">Popular Searches:</span>
              {['Masala Chai', 'HbA1c', 'Keto Sweetener', 'Stevia'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0a7a40] hover:bg-emerald-100 transition-colors font-medium text-[11px] cursor-pointer"
                >
                  #{term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0a7a40] text-white shadow-md shadow-emerald-900/10'
                  : 'bg-white text-neutral-700 border border-border hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Hero Banner (Shows when 'All' is selected and no search) */}
        {selectedCategory === 'All' && !searchQuery && featuredPost && (
          <div className="mb-14 bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto overflow-hidden relative">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-[#0a7a40] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  ⭐ Featured Guide
                </span>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                    <span className="bg-emerald-50 text-[#0a7a40] px-2.5 py-0.5 rounded-md font-bold">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredPost.date}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif font-black text-neutral-900 leading-snug group-hover:text-[#0a7a40] transition-colors">
                    <Link to={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-border mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-neutral-800">{featuredPost.author.name}</div>
                      <div className="text-[10px] text-neutral-500">{featuredPost.author.role}</div>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a7a40] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-[#0a7a40]/30 transition-all flex flex-col group"
            >
              {/* Cover Image */}
              <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#0a7a40] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  {post.category}
                </span>
              </Link>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {post.readingTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      {post.date}
                    </span>
                  </div>

                  <h3 className="font-serif font-black text-lg text-neutral-900 group-hover:text-[#0a7a40] transition-colors leading-snug line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-neutral-700 truncate max-w-[120px]">
                      {post.author.name}
                    </span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-[#0a7a40] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Interactive Wellness Callout Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/20">
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Personal Health Questions</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Have Specific Questions About Your Diet or Blood Sugar?
            </h3>
            <p className="text-emerald-100/80 text-sm max-w-xl">
              Chat for free with our AI Health &amp; Nutrition Consultant or explore how Sweet Monk drops can fit into your daily meal routine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/ai-consultant"
              className="px-5 py-3 rounded-2xl bg-white text-[#0a7a40] font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-all text-center shadow-md flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Talk to AI Assistant</span>
            </Link>
            <Link
              to="/shop"
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs uppercase tracking-wider transition-all text-center shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Sweet Monk</span>
            </Link>
          </div>
        </div>

      </Container>
    </div>
  );
}
