# gather. — your good things, together

An editorial-grade, universal wishlist aggregator web application featuring the visual aesthetic from the Codex design (`gather.`) powered by an advanced multi-tier web scraper and persistent REST backend.

---

## ✨ Features

1. **Codex Editorial Aesthetic**:
   - **Typography**: Google Fonts `DM Sans` (headings/body) and `DM Mono` (eyebrows, badges, chips, code).
   - **Color Palette**: Warm paper background (`#f8f7f3`), dark ink (`#191917`), muted grey (`#85847e`), soft line dividers (`#d9d7d0`), vibrant vermilion orange (`#e24a37`), and lime badge accent (`#d9f36c`).
   - **Header**: Minimalist `gather.` wordmark, `✳ the wishlist club` brand badge, live search modal trigger (`⌘K`), cart pill, and share action.
   - **5-Column Editorial Grid**: Warm tone card backgrounds (`--tone`), mix-blend multiply isolated product imagery, top-left store badges, and floating action buttons on hover (visit store `↗`, edit `✎`, remove `×`).
   - **Category Chips**: `All`, `Clothing`, `Bags`, `Accessories`, `Home / Objects`, and `Books / Read` with active orange pills and live counts.

2. **Universal E-Commerce Scraper & Extractor Engine**:
   - **Extract from Any Store**: Amazon (`amazon.in`, `amazon.com`), Flipkart, Myntra, Ajio, Zara, Nike, Apple, Etsy, Uniqlo, Shopify, and any valid product link.
   - **Multi-Stage Extraction Engine**:
     1. Real desktop browser emulation (Chrome 124 User-Agent, Brotli/Gzip, Sec-Ch-Ua).
     2. **Schema.org JSON-LD** Product & Book parser (`offers`, `price`, `image`, `name`).
     3. **OpenGraph & Twitter Card** meta tag extractor.
     4. **Platform-Specific DOM Selectors** for Amazon (`#productTitle`, `#landingImage`, `.a-price-whole`), Flipkart (`div._30jeq3`, `span.B_NuCI`), Myntra (`.pdp-title`, `.pdp-price`), and Ajio (`.prod-name`, `.prod-sp`).
     5. Multi-currency detection (₹, ₩, $, €, £, ¥).
     6. Proxy fallbacks (Jina Reader & Microlink) when encountering anti-bot challenges or dynamic single-page rendering.
     7. Intelligent URL slug title reconstruction if a store serves a generic error title.
   - **Laser Scanner Review Modal**: Animated scanning beam while extracting, followed by an interactive review form where you can tweak the title, price, category, image URL, or raw link before saving.
   - **1-Click Sample Chips**: Quick test buttons for Amazon, Flipkart, Myntra, and Ajio.

3. **Curated Wishlist Management**:
   - **Instant Search Palette**: Accessible via header button or keyboard shortcut (`⌘K` or `/`).
   - **Store & Sorting Controls**: Filter by store (Amazon, Flipkart, Myntra, etc.) and sort by recently added, price low-to-high, price high-to-low, or alphabetical.
   - **Product Detail Modal**: High-res isolated image view, store badge, 1-click **Copy Raw Link**, and direct **Visit Official Store ↗** action.
   - **Cart Drawer**: Tracks selected purchases and calculates total wishlist budget.
   - **Persistence & Export**: Data is saved to `data/wishlist.json` with 1-click CSV and JSON export, plus single-click restoration of the showcase collection.

---

## 🌐 Live GitHub Pages Demo

The application is deployed on GitHub Pages:
👉 **[https://vijayadithyabk.github.io/gather/](https://vijayadithyabk.github.io/gather/)**

---

## 🚀 How to Run Locally

The backend scraper & API server runs locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

To run or restart the server manually:

```powershell
cd "C:\Users\vijay\.gemini\antigravity-ide\scratch\gather"
npm start
```

