import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.kosmicowellness.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const ROOT_DIST_DIR = path.resolve(__dirname, '../../dist');

// Base static page routes with targeted SEO metadata
const STATIC_PAGES = [
  {
    path: '/how-it-works',
    title: 'How It Works — Sweet Monk 100% Natural Drops | Kosmico Wellness',
    description: 'Learn how Kosmico Sweet Monk drops provide natural 0-calorie, zero-glycemic sweetness from 100% pure Monk Fruit (Luo Han Guo) extract.',
    keywords: 'how sweet monk works, monk fruit extract drops, zero calorie sweetener india, diabetic sweet drops, mogroside v extraction',
  },
  {
    path: '/blog',
    title: 'Wellness Blog & Diabetes Care Guides | Kosmico Wellness',
    description: 'Explore evidence-based wellness articles, clinical sweetener comparisons, and doctor-backed daily habits to manage blood glucose and HbA1c naturally.',
    keywords: 'diabetes wellness blog, monk fruit guides, zero calorie sweetener articles, blood sugar tips, keto diet blog India',
  },
  {
    path: '/shop',
    title: 'Shop Sweet Monk Drops — 100% Natural Sweetener | Kosmico Wellness',
    description: 'Buy Kosmico Sweet Monk drops online. Zero calories, zero sugar, zero glycemic spike. Best natural monk fruit sweetener in India.',
    keywords: 'buy sweet monk online, sweet monk drops price, monk fruit sweetener india, best sugar substitute',
  },
  {
    path: '/benefits',
    title: 'Health Benefits of Sweet Monk Fruit Drops | Kosmico Wellness',
    description: 'Discover the clinical benefits of Sweet Monk: zero calories, diabetic friendly, tooth safe, anti-inflammatory mogroside antioxidants.',
    keywords: 'sweet monk benefits, monk fruit health benefits, zero calorie benefits, diabetes safe sugar substitute',
  },
  {
    path: '/ingredients',
    title: 'Pure Natural Ingredients — Sweet Monk | Kosmico Wellness',
    description: '100% Pure Monk Fruit Extract (Luo Han Guo) with purified water. Zero sucralose, zero aspartame, zero chemical additives.',
    keywords: 'sweet monk ingredients, luo han guo extract, mogroside v, natural sweetener ingredients',
  },
  {
    path: '/care',
    title: 'Kosmico Care & Customer Wellness | Kosmico Wellness',
    description: 'Kosmico Care dedicated customer wellness portal. Order support, diabetic consultation, and wellness advice.',
    keywords: 'kosmico care, customer support, diabetes support india',
  },
  {
    path: '/ai-consultant',
    title: 'AI Wellness Consultant | Kosmico Wellness',
    description: 'Personalized AI sugar-free living and diabetic nutrition consultant by Kosmico Wellness.',
    keywords: 'ai health consultant, sugar free diet plan, diabetic diet consultant',
  },
  {
    path: '/community',
    title: 'Community Hub — Kosmico Wellness',
    description: 'Join India\'s leading health & wellness community. Share sugar-free recipes, transformation stories, and tips with Sweet Monk.',
    keywords: 'kosmico community, sugar free recipes india, sweet monk reviews, diabetes community india',
  },
  {
    path: '/about',
    title: 'About Us — Kosmico Wellness Private Limited',
    description: 'Learn about Kosmico Wellness mission to eliminate harmful dietary sugar from Indian households through pure botanical wellness.',
    keywords: 'about kosmico wellness, sweet monk company, natural wellness india',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions (FAQ) | Sweet Monk Drops',
    description: 'Everything you need to know about Sweet Monk drops: dosage, shelf life, diabetes safety, cooking stability, and taste profile.',
    keywords: 'sweet monk faq, monk fruit questions, how to use sweet monk drops',
  },
  {
    path: '/contact',
    title: 'Contact Us | Kosmico Wellness Support',
    description: 'Have questions about Sweet Monk drops or your order? Get in touch with our customer wellness team.',
    keywords: 'contact kosmico, customer care sweet monk, kosmico wellness address',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Kosmico Wellness',
    description: 'Privacy Policy for Kosmico Wellness Private Limited.',
    keywords: 'privacy policy kosmico wellness',
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Kosmico Wellness',
    description: 'Terms and conditions of use for Kosmico Wellness online store and services.',
    keywords: 'terms of service kosmico wellness',
  },
  {
    path: '/refunds',
    title: 'Refund & Cancellation Policy | Kosmico Wellness',
    description: 'Refund, return and cancellation terms for Kosmico Wellness purchases.',
    keywords: 'refund policy kosmico wellness, cancellation policy',
  },
];

// Helper to extract blog posts from typescript data files safely via regex
function extractBlogsFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const blogs = [];
  const postBlocks = content.split(/\{\s*id:\s*['"]/);

  for (let i = 1; i < postBlocks.length; i++) {
    const block = postBlocks[i];
    const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
    if (!slugMatch) continue;

    const slug = slugMatch[1];
    const metaTitleMatch = block.match(/metaTitle:\s*['"]([^'"]+)['"]/);
    const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
    const metaDescMatch = block.match(/metaDescription:\s*['"]([^'"]+)['"]/);
    const excerptMatch = block.match(/excerpt:\s*['"]([^'"]+)['"]/);
    const keywordsMatch = block.match(/keywords:\s*['"]([^'"]+)['"]/);
    const coverImageMatch = block.match(/coverImage:\s*['"]([^'"]+)['"]/);

    const title = metaTitleMatch ? metaTitleMatch[1] : (titleMatch ? titleMatch[1] : 'Kosmico Wellness Blog');
    const description = metaDescMatch ? metaDescMatch[1] : (excerptMatch ? excerptMatch[1] : 'Evidence-based wellness guides from Kosmico Wellness.');
    const keywords = keywordsMatch ? keywordsMatch[1] : 'sweet monk, monk fruit drops, diabetes care';
    const image = coverImageMatch ? coverImageMatch[1] : '/assets/blogs/blog-sweetmonk-chai.jpg';

    blogs.push({
      path: `/blog/${slug}`,
      title,
      description,
      keywords,
      image,
    });
  }

  return blogs;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateStaticPages() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`[SEO-Prerender] index.html not found at ${indexHtmlPath}. Run vite build first.`);
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Load all blogs from the 4 blog data files
  const dataDir = path.resolve(__dirname, '../src/data');
  const allBlogs = [
    ...extractBlogsFromFile(path.join(dataDir, 'newBlogsOct29.ts')),
    ...extractBlogsFromFile(path.join(dataDir, 'newBlogsOct26.ts')),
    ...extractBlogsFromFile(path.join(dataDir, 'newBlogsOct24.ts')),
    ...extractBlogsFromFile(path.join(dataDir, 'blogsData.ts')),
  ];

  // Remove duplicates by path
  const seenPaths = new Set();
  const allRoutes = [];

  for (const page of [...STATIC_PAGES, ...allBlogs]) {
    if (!seenPaths.has(page.path)) {
      seenPaths.add(page.path);
      allRoutes.push(page);
    }
  }

  console.log(`[SEO-Prerender] Generating dedicated static HTML shells for ${allRoutes.length} routes...`);

  let count = 0;
  for (const route of allRoutes) {
    const canonicalUrl = `${BASE_URL}${route.path}`;
    const cleanTitle = escapeHtml(route.title);
    const cleanDesc = escapeHtml(route.description);
    const cleanKeywords = escapeHtml(route.keywords || '');
    const cleanImage = route.image ? (route.image.startsWith('http') ? route.image : `${BASE_URL}${route.image}`) : `${BASE_URL}/kosmico-logo.png`;

    let html = baseHtml;

    // 1. Replace <title>
    html = html.replace(/<title>.*?<\/title>/is, `<title>${cleanTitle}</title>`);

    // 2. Replace description meta
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${cleanDesc}" />`
    );

    // 3. Replace or inject keywords meta
    if (html.includes('name="keywords"')) {
      html = html.replace(
        /<meta\s+name=["']keywords["'][^>]*>/i,
        `<meta name="keywords" content="${cleanKeywords}" />`
      );
    }

    // 4. Clean out any dynamic canonical script or existing link rel=canonical
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
    html = html.replace(/<!--\s*Canonical URL[\s\S]*?<\/script>/gi, '');

    // 5. Inject proper static <link rel="canonical" ... /> directly in <head>
    const canonicalTag = `<link rel="canonical" id="canonical-url" href="${canonicalUrl}" />\n`;
    html = html.replace('</head>', `  ${canonicalTag}</head>`);

    // 6. Update OpenGraph tags
    html = html.replace(
      /<meta\s+property=["']og:title["'][^>]*>/i,
      `<meta property="og:title" content="${cleanTitle}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:description["'][^>]*>/i,
      `<meta property="og:description" content="${cleanDesc}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:url["'][^>]*>/i,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:image["'][^>]*>/i,
      `<meta property="og:image" content="${cleanImage}" />`
    );

    // 7. Write to dist/<route>/index.html
    const targetDir = path.join(DIST_DIR, route.path.replace(/^\//, ''));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

    // Also mirror to root dist if it exists
    if (fs.existsSync(ROOT_DIST_DIR)) {
      const rootTargetDir = path.join(ROOT_DIST_DIR, route.path.replace(/^\//, ''));
      if (!fs.existsSync(rootTargetDir)) {
        fs.mkdirSync(rootTargetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(rootTargetDir, 'index.html'), html, 'utf8');
    }

    count++;
  }

  // Also make sure dist/404.html exists
  const dist404 = path.join(DIST_DIR, '404.html');
  fs.copyFileSync(indexHtmlPath, dist404);
  if (fs.existsSync(ROOT_DIST_DIR)) {
    fs.copyFileSync(indexHtmlPath, path.join(ROOT_DIST_DIR, '404.html'));
  }

  console.log(`[SEO-Prerender] Successfully generated static HTML files for all ${count} routes!`);
}

generateStaticPages();
