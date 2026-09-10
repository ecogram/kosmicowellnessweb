# Kosmico Wellness - UI/UX System

## 1. Brand Direction

- **Personality**: Premium, Natural, Trustworthy, Health-focused, Clean, Modern.
- **Design Principles**: Minimalism, ample whitespace, high-quality imagery, clear visual hierarchy, conversion-focused CTAs.
- **Tone**: Educational yet aspirational. Reassuring users about health benefits without sounding overly clinical.

## 2. Color System

- **Primary Color**: `#1B5E20` (Deep Forest Green - represents natural, organic, health).
- **Secondary Color**: `#E8F5E9` (Soft Mint - for subtle backgrounds and highlighting).
- **Accent Color**: `#F57F17` (Warm Amber/Gold - for primary CTAs, Add to Cart buttons, representing sweetness and premium quality).
- **Background**: `#FAFAFA` (Off-white - warmer than pure white).
- **Surface**: `#FFFFFF` (Pure white - for cards, modals).
- **Text (Primary)**: `#212121` (Near black - for high readability).
- **Text (Muted)**: `#757575` (Gray - for secondary text, metadata).
- **Border**: `#E0E0E0` (Light gray).
- **Semantic**:
  - Success: `#388E3C`
  - Warning: `#FBC02D`
  - Error: `#D32F2F`
  - Info: `#1976D2`

## 3. Typography

- **Primary Font**: `Inter` or `Outfit` (Clean, modern sans-serif for UI and body text).
- **Secondary/Display Font**: `Playfair Display` or `Lora` (Elegant serif for main headings/hero to convey premium feel).
- **Hierarchy**:
  - H1: 48px / 56px (Mobile: 36px) - Page Titles, Hero
  - H2: 36px / 42px (Mobile: 28px) - Section Titles
  - H3: 24px / 32px (Mobile: 20px) - Card Titles
  - H4: 20px / 28px (Mobile: 18px) - Subtitles
  - Body: 16px / 24px (Mobile: 16px) - Paragraphs
  - Small: 14px / 20px - Captions, Metadata
  - Button Text: 16px, Semi-Bold, Uppercase or Title Case.

## 4. Spacing System

- Base unit: 8px.
- Scales: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px.
- Container Width: Max 1280px for desktop.

## 5. Component Design System

- **Button**: Solid (Primary action), Outline (Secondary), Ghost (Tertiary). Fully rounded corners (pill shape) for a friendly, modern feel.
- **Product Card**: Image at top (aspect-ratio 1:1 or 4:5), title, price, star rating, hover effect (slight lift + shadow), Add to Cart quick button.
- **Input/Forms**: Floating labels or clean top labels. Clear error states with red borders and helper text.
- **Cart Drawer**: Slides from right. Shows items, qty controls, subtotal, and sticky checkout button at bottom.
- **Toast Notifications**: Slide in from top-right or bottom-center. Green for success, red for error.

## 6. Responsive Design

- **Mobile First**: Design for 320px-480px first. Stacked layouts, sticky bottom CTAs on product pages, hamburger menus.
- **Tablet (768px - 1024px)**: 2-column grids for products, side-by-side layout on product detail page.
- **Desktop (1024px+)**: Multi-column mega menus, 3 or 4 column product grids, expansive image galleries.

## 7. Page UX Structures

**Homepage Structure:**

1. Announcement Bar (Free shipping info)
2. Navbar (Logo, Links, Search, User, Cart)
3. Hero Section (High-quality image, bold H1, Primary CTA)
4. Trust Indicators (Logos of certifications: Non-GMO, Keto, Vegan)
5. Product Showcase (Featured products)
6. Benefits (Icon + Text grid)
7. Comparison (Kosmico Wellness vs Sugar table)
8. Reviews (Carousel of testimonials)
9. FAQ (Accordion)
10. Footer

**Product Page (PDP) Structure:**

- Desktop: Left column (Sticky image gallery), Right column (Title, Reviews, Price, Variants, Qty, Add to Cart, Accordion details).
- Mobile: Image carousel at top, followed by details. Sticky "Add to Cart" bar at the bottom of the screen upon scrolling past the main CTA.

## 8. UX States & Accessibility

- **States**: Every component must have defined Default, Hover, Focus (visible ring for keyboard nav), Active, Disabled, Loading (Skeleton or spinner), Empty, and Error states.
- **Accessibility**: ARIA labels on icon buttons, WCAG AA compliant color contrast, semantic HTML (`<nav>`, `<main>`, `<article>`), logical tab ordering.
