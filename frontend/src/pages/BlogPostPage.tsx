import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SEO } from '../components/SEO';
import { BLOG_POSTS } from '../data/blogsData';
import { 
  Clock, Calendar, ArrowLeft, Share2, 
  Sparkles, CheckCircle2, ShoppingBag, 
  ChevronRight, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => {
    return BLOG_POSTS.find((p) => p.slug === slug);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

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
          title: post.title,
          text: post.excerpt,
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
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <Link to="/" className="hover:text-[#0a7a40] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to="/blog" className="hover:text-[#0a7a40] transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-800 font-semibold truncate max-w-[240px] sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#0a7a40] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all guides</span>
        </Link>

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
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            {post.excerpt}
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
              <span>Share Guide</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-md border border-border">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-96 md:h-[420px] object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-800 leading-relaxed text-base md:text-lg">
          
          {/* Intro Paragraph */}
          <p className="text-lg md:text-xl text-neutral-700 font-medium leading-relaxed bg-emerald-50/60 p-6 rounded-2xl border-l-4 border-[#0a7a40]">
            {post.content.intro}
          </p>

          {/* Article Sections */}
          {post.content.sections.map((section, idx) => (
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
            </section>
          ))}

          {/* In-Article Sweet Monk Product CTA Card */}
          <div className="my-10 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="bg-amber-400 text-neutral-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Zero Sugar Alternative
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                Experience 100% Pure Sweet Monk Drops
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md">
                Zero calories, zero glycemic index, zero aftertaste. 300+ cups of tea/coffee per bottle. Free delivery across India.
              </p>
            </div>

            <Link
              to="/shop"
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Sweet Monk</span>
            </Link>
          </div>

          {/* Post FAQs Section */}
          {post.content.faqs && post.content.faqs.length > 0 && (
            <div className="my-10 space-y-4 pt-4 border-t border-border">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-neutral-900 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#0a7a40]" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3">
                {post.content.faqs.map((faq, fIdx) => (
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
              The Bottom Line
            </h3>
            <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
              {post.content.conclusion}
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

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h3 className="text-2xl font-serif font-black text-neutral-900 mb-6">
              Recommended Wellness Reading
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
                      {rel.title}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>{rel.readingTime}</span>
                    <span className="text-[#0a7a40] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
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
