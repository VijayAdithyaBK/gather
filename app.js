/**
 * gather. — your good things, together
 * Client Controller & State Management
 * Combines Codex Visual Design with Multi-tier Universal Extraction Backend
 * Features: Mobile Responsive, Full Collections Management (Add, Rename, Delete)
 */

document.addEventListener('DOMContentLoaded', () => {
  let initialCart = [];
  try {
    const rawCart = localStorage.getItem('gather_cart');
    if (rawCart) initialCart = JSON.parse(rawCart);
  } catch (e) {}

  // App State
  const state = {
    items: [],
    collections: [],
    filteredItems: [],
    activeFilter: 'All',
    activeStore: 'All',
    activeSort: 'newest',
    cart: new Set(initialCart),
    selectedItem: null,
    pendingExtraction: null
  };

  // Tone palette for warm editorial card backgrounds
  const TONES = ['#eeeae2', '#ece7dc', '#e8ece9', '#f0eae1', '#e9e6df', '#eae7eb', '#ebe4db', '#eee6dd'];

  function getTone(id = '') {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return TONES[hash % TONES.length];
  }

  // DOM Elements
  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('count');
  const footerCountEl = document.getElementById('footer-count');
  const allCountEl = document.getElementById('all-n');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const categoriesEl = document.getElementById('categories');
  const manageCollectionsBtn = document.getElementById('manage-collections-btn');
  const storeSelect = document.getElementById('store-select');
  const sortSelect = document.getElementById('sort-select');
  const urlForm = document.getElementById('url-form');
  const urlInput = document.getElementById('url-input');
  const pasteBtn = document.getElementById('paste-clipboard-btn');
  const manualAddTrigger = document.getElementById('manual-add-trigger');
  const sampleChips = document.querySelectorAll('.sample-chip[data-url]');
  const resetFilterBtn = document.getElementById('reset-filter-btn');

  // Manage Collections Modal
  const collectionsModalBack = document.getElementById('collections-modal-back');
  const closeColModalBtn = document.getElementById('close-col-modal');
  const addCollectionForm = document.getElementById('add-collection-form');
  const newColNameInput = document.getElementById('new-col-name');
  const collectionsListContainer = document.getElementById('collections-list-container');

  // Extraction Review Modal
  const modalBack = document.getElementById('modal-back');
  const modalLoadingState = document.getElementById('modal-loading-state');
  const modalContentState = document.getElementById('modal-content-state');
  const cancelBtn = document.getElementById('cancel');
  const productForm = document.getElementById('product-form');
  const pUrl = document.getElementById('p-url');
  const pTitle = document.getElementById('p-title');
  const pSubtitle = document.getElementById('p-subtitle');
  const pPrice = document.getElementById('p-price');
  const pCategory = document.getElementById('p-category');
  const pImage = document.getElementById('p-image');
  const pImagePreview = document.getElementById('p-image-preview');
  const pRawlinkDisplay = document.getElementById('p-rawlink-display');
  const pTestLink = document.getElementById('p-test-link');
  const pStoreBadge = document.getElementById('p-store-badge');
  const scannerBrandTag = document.getElementById('scanner-brand-tag');
  const extractHeading = document.getElementById('extract-heading');

  // Product Detail Modal
  const detailModalBack = document.getElementById('detail-modal-back');
  const closeDetailBtn = document.getElementById('close-detail-modal');
  const detailImg = document.getElementById('detail-img');
  const detailToneBg = document.getElementById('detail-tone-bg');
  const detailStoreBadge = document.getElementById('detail-store-badge');
  const detailCategoryBadge = document.getElementById('detail-category-badge');
  const detailTitle = document.getElementById('detail-title');
  const detailSubtitle = document.getElementById('detail-subtitle');
  const detailPrice = document.getElementById('detail-price');
  const detailRawlink = document.getElementById('detail-rawlink');
  const detailCopyLinkBtn = document.getElementById('detail-copy-link-btn');
  const detailVisitBtn = document.getElementById('detail-visit-btn');
  const detailCartToggle = document.getElementById('detail-cart-toggle');
  const detailDeleteBtn = document.getElementById('detail-delete-btn');

  // Search Modal
  const searchTriggerBtn = document.getElementById('search-trigger-btn');
  const searchModalBack = document.getElementById('search-modal-back');
  const searchPaletteInput = document.getElementById('search-palette-input');
  const searchResultsBox = document.getElementById('search-results-box');

  // Cart Drawer
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartDrawerBtn = document.getElementById('close-cart-drawer');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const exportCartCsvBtn = document.getElementById('export-cart-csv-btn');

  // General Actions
  const shareBtn = document.getElementById('share-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const restoreDefaultsBtn = document.getElementById('restore-defaults-btn');
  const toastEl = document.getElementById('toast');

  // ==========================================
  // 1. Data Fetching & Sync (Backend + Static Fallback)
  // ==========================================

  const DEFAULT_COLLECTIONS = window.INITIAL_SEED_COLLECTIONS || [
    { id: 'col-clothing', name: 'Clothing', emoji: '👔' },
    { id: 'col-bags', name: 'Bags', emoji: '👜' },
    { id: 'col-accessories', name: 'Accessories', emoji: '💍' },
    { id: 'col-home', name: 'Home', emoji: '🏺' },
    { id: 'col-books', name: 'Books', emoji: '📖' },
    { id: 'col-other', name: 'Other', emoji: '✳' }
  ];

  const DEFAULT_ITEMS = window.INITIAL_SEED_ITEMS || [];

  function saveLocalState() {
    try {
      localStorage.setItem('gather_items', JSON.stringify(state.items));
      localStorage.setItem('gather_collections', JSON.stringify(state.collections));
      localStorage.setItem('gather_cart', JSON.stringify(Array.from(state.cart)));
    } catch (e) {}
  }

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          state.items = data.items;
          saveLocalState();
          updateStoreOptions();
          applyFiltersAndRender();
          updateCartBadge();
          return;
        }
      }
    } catch (err) {
      // Backend not accessible (e.g. GitHub Pages static hosting or offline)
    }

    // Static mode / LocalStorage fallback
    const saved = localStorage.getItem('gather_items');
    if (saved) {
      try {
        state.items = JSON.parse(saved);
        updateStoreOptions();
        applyFiltersAndRender();
        updateCartBadge();
        return;
      } catch (e) {}
    }

    // Default seed fallback
    state.items = [...DEFAULT_ITEMS];
    saveLocalState();
    updateStoreOptions();
    applyFiltersAndRender();
    updateCartBadge();
  }

  async function loadCollections() {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.collections)) {
          state.collections = data.collections;
          saveLocalState();
          renderCategoryChips();
          updateCategorySelectOptions();
          renderCollectionsModalList();
          return;
        }
      }
    } catch (err) {
      // Backend not accessible
    }

    // Static mode / LocalStorage fallback
    const saved = localStorage.getItem('gather_collections');
    if (saved) {
      try {
        state.collections = JSON.parse(saved);
        renderCategoryChips();
        updateCategorySelectOptions();
        renderCollectionsModalList();
        return;
      } catch (e) {}
    }

    // Default seed fallback
    state.collections = [...DEFAULT_COLLECTIONS];
    saveLocalState();
    renderCategoryChips();
    updateCategorySelectOptions();
    renderCollectionsModalList();
  }

  function updateCategorySelectOptions() {
    pCategory.innerHTML = '';
    state.collections.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = `${c.emoji || '✳'} ${c.name}`;
      pCategory.appendChild(opt);
    });
  }

  function renderCategoryChips() {
    categoriesEl.innerHTML = '';

    // 'All' Chip
    const allChip = document.createElement('button');
    allChip.className = `chip ${state.activeFilter === 'All' ? 'active' : ''}`;
    allChip.dataset.filter = 'All';
    allChip.innerHTML = `All <span id="all-n">${state.items.length}</span>`;
    categoriesEl.appendChild(allChip);

    // Dynamic Collection Chips
    state.collections.forEach(col => {
      const chip = document.createElement('button');
      chip.className = `chip ${state.activeFilter === col.name ? 'active' : ''}`;
      chip.dataset.filter = col.name;
      chip.textContent = col.name;
      categoriesEl.appendChild(chip);
    });
  }

  function updateStoreOptions() {
    const stores = new Set();
    state.items.forEach(it => {
      if (it.store) stores.add(it.store);
    });

    const curr = storeSelect.value;
    storeSelect.innerHTML = '<option value="All">All Stores</option>';
    Array.from(stores).sort().forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      storeSelect.appendChild(opt);
    });
    if (stores.has(curr)) storeSelect.value = curr;
  }

  // ==========================================
  // 2. Filters & Sorting Logic
  // ==========================================

  function applyFiltersAndRender() {
    let result = [...state.items];

    // Category / Collection Filter
    if (state.activeFilter !== 'All') {
      const target = state.activeFilter.toLowerCase();
      result = result.filter(it => {
        const itemCat = (it.category || '').toLowerCase();
        if (target === 'home') return itemCat === 'home' || itemCat === 'objects';
        if (target === 'books') return itemCat === 'books' || itemCat === 'read';
        return itemCat === target;
      });
    }

    // Store Filter
    if (state.activeStore !== 'All') {
      result = result.filter(it => (it.store || '').toLowerCase() === state.activeStore.toLowerCase());
    }

    // Sorting
    if (state.activeSort === 'price-asc') {
      result.sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
    } else if (state.activeSort === 'price-desc') {
      result.sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
    } else if (state.activeSort === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    state.filteredItems = result;

    const countText = `${result.length} ${result.length === 1 ? 'find' : 'finds'} saved`;
    countEl.textContent = countText;
    footerCountEl.textContent = `${state.items.length} finds saved`;
    const allN = document.getElementById('all-n');
    if (allN) allN.textContent = state.items.length;

    renderGrid(result);
  }

  // ==========================================
  // 3. Grid Rendering matching Codex Style
  // ==========================================

  function renderGrid(items) {
    if (!items || items.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = item.id;
      const tone = item.tone || getTone(item.id);

      const isSoldOut = item.price === 'Sold Out' || item.status === 'sold-out';

      card.innerHTML = `
        <!-- Floating Hover / Mobile Tap Actions -->
        <div class="card-actions" onclick="event.stopPropagation()">
          <a class="iconbtn" href="${escapeHtml(item.rawLink || '#')}" target="_blank" rel="noreferrer" title="Open in official store">↗</a>
          <button class="iconbtn edit-btn" title="Edit find" data-id="${item.id}">✎</button>
          <button class="iconbtn del-btn" title="Remove find" data-id="${item.id}">×</button>
        </div>

        <!-- Product Image Frame -->
        <a class="photo" href="${escapeHtml(item.rawLink || '#')}" style="--tone: ${tone}">
          <span class="badge">${escapeHtml(item.store || 'A good find')}</span>
          <img 
            src="${escapeHtml(item.image)}" 
            alt="${escapeHtml(item.title)}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'"
          />
        </a>

        <!-- Meta Block -->
        <div class="meta">
          <div class="title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="store" title="${escapeHtml(item.secondaryTitle || item.store)}">${escapeHtml(item.secondaryTitle || item.store || item.category || 'Other')}</div>
          <div class="price ${isSoldOut ? 'sold-out' : ''}">${escapeHtml(item.price || 'Price not listed')}</div>
        </div>
      `;

      card.addEventListener('click', () => openDetailModal(item));

      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(item);
      });

      card.querySelector('.del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(item.id);
      });

      grid.appendChild(card);
    });
  }

  // ==========================================
  // 4. Universal Extraction Flow
  // ==========================================

  urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;
    await handleUrlExtraction(url);
  });

  sampleChips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const url = chip.dataset.url;
      if (url) {
        urlInput.value = url;
        await handleUrlExtraction(url);
      }
    });
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && /^https?:\/\//i.test(text.trim())) {
        urlInput.value = text.trim();
        toast('Link pasted from clipboard');
        await handleUrlExtraction(text.trim());
      } else if (text) {
        urlInput.value = text.trim();
        toast('Pasted into input');
      } else {
        toast('Clipboard is empty');
      }
    } catch (e) {
      urlInput.focus();
      toast('Press Ctrl+V to paste link');
    }
  });

  manualAddTrigger.addEventListener('click', () => {
    openManualAddModal();
  });

  const SAMPLE_PRESETS = {
    'B00N9RCNXI': {
      title: 'STANLEY STMT72794-8 1/4" 46-Piece Square Drive Metric Socket & Bit Set',
      secondaryTitle: 'Amazon Official Store',
      price: '₹2,368',
      rawPrice: 2368,
      currency: 'INR',
      image: 'https://m.media-amazon.com/images/I/81a9VNS3eBL._SX679_.jpg',
      store: 'Amazon',
      domain: 'amazon.in',
      category: 'Home'
    },
    '1847941834': {
      title: 'Atomic Habits: Tiny Changes, Remarkable Results by James Clear',
      secondaryTitle: 'Amazon Official Store',
      price: '₹284',
      rawPrice: 284,
      currency: 'INR',
      image: 'https://m.media-amazon.com/images/P/1847941834.01._SCLZZZZZZZ_SX500_.jpg',
      store: 'Amazon',
      domain: 'amazon.in',
      category: 'Books'
    },
    'itmd3f92': {
      title: 'FUJIFILM Instax Mini 12 Instant Camera',
      secondaryTitle: 'Flipkart Official Store',
      price: '₹6,499',
      rawPrice: 6499,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      store: 'Flipkart',
      domain: 'flipkart.com',
      category: 'Other'
    },
    '23849102': {
      title: 'Nike Dunk Low Retro Men Casual Sneakers',
      secondaryTitle: 'Nike Official Store',
      price: '₹8,295',
      rawPrice: 8295,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
      store: 'Nike / Myntra',
      domain: 'myntra.com',
      category: 'Clothing'
    },
    '46519283': {
      title: 'Polo Ralph Lauren Regular Fit Linen Shirt',
      secondaryTitle: 'Ajio Official Store',
      price: '₹14,990',
      rawPrice: 14990,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      store: 'Ajio',
      domain: 'ajio.com',
      category: 'Clothing'
    }
  };

  function extractAmazonAsin(url) {
    try {
      const match = url.match(/\/(?:dp|gp\/product|product|asin)\/([A-Z0-9]{10})/i) ||
                    url.match(/\/([A-Z0-9]{10})(?:[/?#]|$)/i);
      return match ? match[1].toUpperCase() : null;
    } catch (e) {
      return null;
    }
  }

  function isTitleGeneric(title) {
    if (!title || typeof title !== 'string') return true;
    const t = title.trim();
    if (t.length < 4) return true;
    if (/^(Amazon(\.in|\.com|\.co\.uk)?|Online Shopping.*|Welcome to.*|Home Page.*|Robot Check|Bot Check|Security Check|403|500|Page Not Found|Site Maintenance|Access Denied|Sorry!.*|Error.*)$/i.test(t)) return true;
    if (/^Flipkart(\.com)?$/i.test(t)) return true;
    if (/^Myntra(\.com)?$/i.test(t)) return true;
    if (/^Ajio(\.com)?$/i.test(t)) return true;
    return false;
  }

  async function extractViaMicrolink(url) {
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (e) {
      return null;
    }
  }

  function parseFallbackMetadata(url) {
    let domain = 'store.com';
    let storeName = 'Web Store';
    try {
      const u = new URL(url);
      domain = u.hostname.replace(/^www\./, '');
      const dLower = domain.toLowerCase();
      if (dLower.includes('amazon')) storeName = 'Amazon';
      else if (dLower.includes('flipkart')) storeName = 'Flipkart';
      else if (dLower.includes('myntra')) storeName = 'Myntra';
      else if (dLower.includes('ajio')) storeName = 'Ajio';
      else if (dLower.includes('zara')) storeName = 'Zara';
      else if (dLower.includes('nike')) storeName = 'Nike';
      else if (dLower.includes('apple')) storeName = 'Apple';
      else if (dLower.includes('etsy')) storeName = 'Etsy';
      else if (dLower.includes('ikea')) storeName = 'IKEA';
      else if (dLower.includes('uniqlo')) storeName = 'Uniqlo';
      else {
        const seg = domain.split('.')[0];
        storeName = seg.charAt(0).toUpperCase() + seg.slice(1);
      }

      let title = '';
      const pathParts = u.pathname.split('/').filter(Boolean);
      for (const part of pathParts) {
        if (part.length > 3 && !/^(dp|gp|product|p|item|itm|buy|in|en)$/i.test(part) && !/^[A-Z0-9]{10}$/i.test(part) && !/^\d+$/.test(part)) {
          const cleaned = decodeURIComponent(part)
            .replace(/[-_+]+/g, ' ')
            .replace(/\.(html?|php|aspx?)$/i, '')
            .trim();
          if (cleaned.length > 3) {
            title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            break;
          }
        }
      }

      let image = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
      const asin = extractAmazonAsin(url);
      if (storeName === 'Amazon' && asin) {
        image = `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`;
      }

      return {
        title: title || `${storeName} find`,
        secondaryTitle: `${storeName} Official Store`,
        price: '₹ Check Store',
        rawPrice: null,
        image,
        rawLink: url,
        store: storeName,
        domain: domain,
        category: 'Other'
      };
    } catch (e) {
      return {
        title: 'Curated Wishlist Item',
        secondaryTitle: 'Web Store',
        price: '₹ Check Store',
        rawPrice: null,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        rawLink: url,
        store: 'Web Store',
        domain: '',
        category: 'Other'
      };
    }
  }

  async function handleUrlExtraction(url) {
    if (!/^https?:\/\//i.test(url)) {
      toast('Please enter a full link (starting with https://)');
      return;
    }

    modalBack.classList.add('open');
    modalLoadingState.classList.remove('hidden');
    modalContentState.classList.add('hidden');

    let domainName = 'Web Store';
    try {
      domainName = new URL(url).hostname.replace(/^www\./, '').split('.')[0].toUpperCase();
    } catch (e) {}

    scannerBrandTag.textContent = domainName;
    extractHeading.textContent = `Gathering from ${domainName}...`;

    // 1. Check quick sample preset for instant 1-click test experience
    for (const [key, preset] of Object.entries(SAMPLE_PRESETS)) {
      if (url.includes(key)) {
        setTimeout(() => {
          showReviewForm({ ...preset, rawLink: url });
        }, 350);
        return;
      }
    }

    // 2. Try Backend API first (if local server is running)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && !isTitleGeneric(json.data.title)) {
          showReviewForm(json.data);
          return;
        }
      }
    } catch (err) {}

    // 3. Client-side extraction via Microlink + Smart heuristics (GitHub Pages / Standalone)
    try {
      const mlData = await extractViaMicrolink(url);
      const fallback = parseFallbackMetadata(url);

      let finalTitle = fallback.title;
      if (mlData?.title && !isTitleGeneric(mlData.title)) {
        finalTitle = mlData.title;
      }

      let finalImage = fallback.image;
      if (mlData?.image?.url && !mlData.image.url.includes('logo') && !mlData.image.url.includes('sprite') && !mlData.image.url.includes('prime')) {
        finalImage = mlData.image.url;
      }
      const asin = extractAmazonAsin(url);
      if (asin) {
        finalImage = `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`;
      }

      showReviewForm({
        title: finalTitle,
        secondaryTitle: mlData?.publisher || fallback.secondaryTitle,
        price: fallback.price || '₹ Check Store',
        rawPrice: fallback.rawPrice,
        image: finalImage,
        rawLink: url,
        store: fallback.store,
        domain: fallback.domain,
        category: fallback.category
      });
    } catch (e) {
      const fallbackData = parseFallbackMetadata(url);
      showReviewForm(fallbackData);
      toast('Review details below before saving');
    }
  }

  function showReviewForm(data) {
    state.pendingExtraction = { ...data };

    modalLoadingState.classList.add('hidden');
    modalContentState.classList.remove('hidden');

    pUrl.value = data.rawLink || '';
    pTitle.value = data.title || '';
    pSubtitle.value = data.secondaryTitle || data.store || '';
    pPrice.value = data.price || '';

    // Match best collection
    const rawCat = (data.category || '').toLowerCase();
    const matchedCol = state.collections.find(c => {
      const cn = c.name.toLowerCase();
      return cn === rawCat || (rawCat.includes('home') && cn.includes('home')) || (rawCat.includes('book') && cn.includes('book'));
    });
    pCategory.value = matchedCol ? matchedCol.name : (state.collections[0]?.name || 'Other');

    pImage.value = data.image || '';
    pImagePreview.src = data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
    pRawlinkDisplay.value = data.rawLink || '';
    pTestLink.href = data.rawLink || '#';
    pStoreBadge.textContent = data.store || 'Store';

    pImage.oninput = () => {
      pImagePreview.src = pImage.value.trim();
    };
  }

  function openManualAddModal() {
    modalBack.classList.add('open');
    modalLoadingState.classList.add('hidden');
    modalContentState.classList.remove('hidden');

    pUrl.value = 'https://';
    pTitle.value = '';
    pSubtitle.value = 'Custom Addition';
    pPrice.value = '₹1,499';
    pCategory.value = state.collections[0]?.name || 'Other';
    pImage.value = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
    pImagePreview.src = pImage.value;
    pRawlinkDisplay.value = '';
    pTestLink.href = '#';
    pStoreBadge.textContent = 'Custom';

    state.pendingExtraction = { store: 'Custom', rawLink: '#' };
    pTitle.focus();
  }

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = pTitle.value.trim();
    if (!title) {
      toast('Please enter a product name');
      return;
    }

    const item = {
      title,
      secondaryTitle: pSubtitle.value.trim(),
      price: pPrice.value.trim() || 'Price not listed',
      image: pImage.value.trim() || pImagePreview.src,
      category: pCategory.value,
      rawLink: pUrl.value.trim(),
      store: state.pendingExtraction?.store || 'Web Store',
      domain: state.pendingExtraction?.domain || '',
      tone: getTone(title),
      status: 'wishlist'
    };

    const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) item.rawPrice = num;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.item) {
          state.items.unshift(json.item);
          saveLocalState();
          modalBack.classList.remove('open');
          urlInput.value = '';
          applyFiltersAndRender();
          updateStoreOptions();
          loadCollections();
          toast('Added to your collection ✳');
          return;
        }
      }
    } catch (err) {}

    // Standalone / Static GitHub Pages fallback
    const fallbackItem = {
      ...item,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    state.items.unshift(fallbackItem);
    saveLocalState();
    modalBack.classList.remove('open');
    urlInput.value = '';
    applyFiltersAndRender();
    updateStoreOptions();
    loadCollections();
    toast('Added to your collection ✳');
  });

  cancelBtn.addEventListener('click', () => modalBack.classList.remove('open'));
  modalBack.addEventListener('click', (e) => {
    if (e.target === modalBack) modalBack.classList.remove('open');
  });

  // ==========================================
  // 5. Manage Collections Modal Logic
  // ==========================================

  manageCollectionsBtn.addEventListener('click', () => {
    renderCollectionsModalList();
    collectionsModalBack.classList.add('open');
    newColNameInput.value = '';
    newColNameInput.focus();
  });

  closeColModalBtn.addEventListener('click', () => {
    collectionsModalBack.classList.remove('open');
  });

  collectionsModalBack.addEventListener('click', (e) => {
    if (e.target === collectionsModalBack) collectionsModalBack.classList.remove('open');
  });

  function renderCollectionsModalList() {
    collectionsListContainer.innerHTML = '';
    if (state.collections.length === 0) {
      collectionsListContainer.innerHTML = '<div style="padding: 12px; color: var(--muted); font-size: 12px;">No collections defined.</div>';
      return;
    }

    state.collections.forEach(col => {
      const row = document.createElement('div');
      row.className = 'col-row';
      row.dataset.id = col.id;

      const count = state.items.filter(it => (it.category || '').toLowerCase() === col.name.toLowerCase()).length;

      row.innerHTML = `
        <div class="col-row-left">
          <span class="col-emoji">${col.emoji || '✳'}</span>
          <span class="col-name">${escapeHtml(col.name)}</span>
          <span class="col-count-badge">${count} items</span>
        </div>
        <div class="col-actions">
          <button class="col-action-btn edit-col-btn" title="Rename collection">✎ Rename</button>
          <button class="col-action-btn del-btn del-col-btn" title="Delete collection">🗑</button>
        </div>
      `;

      // Inline rename button
      row.querySelector('.edit-col-btn').addEventListener('click', () => {
        showInlineColRename(row, col);
      });

      // Delete button
      row.querySelector('.del-col-btn').addEventListener('click', async () => {
        if (!confirm(`Delete collection "${col.name}"? Items in it will move to "Other".`)) return;
        try {
          const res = await fetch(`/api/collections/${col.id}`, { method: 'DELETE' });
          if (res.ok) {
            toast(`Collection "${col.name}" deleted`);
            await loadCollections();
            await loadItems();
            return;
          }
        } catch (e) {}

        // Fallback for static GitHub Pages / offline
        state.collections = state.collections.filter(c => c.id !== col.id);
        state.items.forEach(it => {
          if ((it.category || '').toLowerCase() === col.name.toLowerCase()) {
            it.category = 'Other';
          }
        });
        saveLocalState();
        toast(`Collection "${col.name}" deleted`);
        renderCollectionsModalList();
        renderCategoryChips();
        applyFiltersAndRender();
      });

      collectionsListContainer.appendChild(row);
    });
  }

  function showInlineColRename(row, col) {
    row.innerHTML = `
      <form class="col-edit-inline">
        <input type="text" value="${escapeHtml(col.name)}" required />
        <button type="submit" class="primary" style="padding: 4px 10px; font-size: 10px;">Save</button>
        <button type="button" class="textbtn cancel-inline-btn" style="padding: 4px 8px; font-size: 10px;">Cancel</button>
      </form>
    `;

    const input = row.querySelector('input');
    input.focus();
    input.select();

    row.querySelector('.col-edit-inline').addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedName = input.value.trim();
      if (!updatedName) return;

      try {
        const res = await fetch(`/api/collections/${col.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: updatedName, emoji: col.emoji })
        });
        if (res.ok) {
          toast(`Renamed to "${updatedName}" ✳`);
          await loadCollections();
          await loadItems();
          return;
        }
      } catch (err) {}

      // Fallback
      const oldName = col.name;
      col.name = updatedName;
      state.items.forEach(it => {
        if ((it.category || '').toLowerCase() === oldName.toLowerCase()) {
          it.category = updatedName;
        }
      });
      saveLocalState();
      toast(`Renamed to "${updatedName}" ✳`);
      renderCollectionsModalList();
      renderCategoryChips();
      updateCategorySelectOptions();
      applyFiltersAndRender();
    });

    row.querySelector('.cancel-inline-btn').addEventListener('click', () => {
      renderCollectionsModalList();
    });
  }

  // Add New Collection
  addCollectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = newColNameInput.value.trim();
    if (!name) return;

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emoji: '✳' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          newColNameInput.value = '';
          toast(`Collection "${name}" added ✳`);
          await loadCollections();
          return;
        }
      }
    } catch (e) {}

    // Fallback
    const newCol = { id: `col-${Date.now()}`, name, emoji: '✳' };
    state.collections.push(newCol);
    saveLocalState();
    newColNameInput.value = '';
    toast(`Collection "${name}" added ✳`);
    renderCollectionsModalList();
    renderCategoryChips();
    updateCategorySelectOptions();
  });

  // ==========================================
  // 6. Product Detail Modal
  // ==========================================

  function openDetailModal(item) {
    state.selectedItem = item;
    detailImg.src = item.image;
    detailToneBg.style.backgroundColor = item.tone || getTone(item.id);
    detailStoreBadge.textContent = item.store || 'Store';
    detailCategoryBadge.textContent = item.category || 'Collection';
    detailTitle.textContent = item.title;
    detailSubtitle.textContent = item.secondaryTitle || item.store || '';
    detailPrice.textContent = item.price || 'Price not listed';
    detailRawlink.value = item.rawLink || '';
    detailVisitBtn.href = item.rawLink || '#';

    detailCartToggle.textContent = state.cart.has(item.id) ? 'Remove from Cart' : 'Add to Cart';

    detailModalBack.classList.add('open');
  }

  closeDetailBtn.addEventListener('click', () => detailModalBack.classList.remove('open'));
  detailModalBack.addEventListener('click', (e) => {
    if (e.target === detailModalBack) detailModalBack.classList.remove('open');
  });

  detailCopyLinkBtn.addEventListener('click', async () => {
    if (state.selectedItem?.rawLink) {
      await navigator.clipboard.writeText(state.selectedItem.rawLink);
      detailCopyLinkBtn.textContent = 'Copied!';
      setTimeout(() => { detailCopyLinkBtn.textContent = 'Copy'; }, 1800);
      toast('Product link copied to clipboard');
    }
  });

  detailCartToggle.addEventListener('click', () => {
    if (!state.selectedItem) return;
    const id = state.selectedItem.id;
    if (state.cart.has(id)) {
      state.cart.delete(id);
      toast('Removed from cart');
    } else {
      state.cart.add(id);
      toast('Added to cart');
    }
    updateCartBadge();
    detailModalBack.classList.remove('open');
  });

  detailDeleteBtn.addEventListener('click', async () => {
    if (state.selectedItem) {
      await deleteItem(state.selectedItem.id);
      detailModalBack.classList.remove('open');
    }
  });

  async function deleteItem(id) {
    if (!confirm('Remove this find from your list?')) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.items = state.items.filter(it => it.id !== id);
        state.cart.delete(id);
        saveLocalState();
        applyFiltersAndRender();
        updateCartBadge();
        loadCollections();
        toast('Removed from your list');
        return;
      }
    } catch (e) {}

    // Fallback for static GitHub Pages / offline
    state.items = state.items.filter(it => it.id !== id);
    state.cart.delete(id);
    saveLocalState();
    applyFiltersAndRender();
    updateCartBadge();
    loadCollections();
    toast('Removed from your list');
  }

  function openEditModal(item) {
    showReviewForm(item);
    modalBack.classList.add('open');
    modalLoadingState.classList.add('hidden');
    modalContentState.classList.remove('hidden');
  }

  // ==========================================
  // 7. Category Chips & Secondary Filters
  // ==========================================

  categoriesEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.activeFilter = chip.dataset.filter;
    applyFiltersAndRender();
  });

  resetFilterBtn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    const allChip = document.querySelector('.chip[data-filter="All"]');
    if (allChip) allChip.classList.add('active');
    state.activeFilter = 'All';
    state.activeStore = 'All';
    storeSelect.value = 'All';
    applyFiltersAndRender();
  });

  storeSelect.addEventListener('change', () => {
    state.activeStore = storeSelect.value;
    applyFiltersAndRender();
  });

  sortSelect.addEventListener('change', () => {
    state.activeSort = sortSelect.value;
    applyFiltersAndRender();
  });

  // ==========================================
  // 8. Search Palette (⌘K)
  // ==========================================

  searchTriggerBtn.addEventListener('click', openSearch);
  searchModalBack.addEventListener('click', (e) => {
    if (e.target === searchModalBack) searchModalBack.classList.remove('open');
  });

  function openSearch() {
    searchModalBack.classList.add('open');
    searchPaletteInput.value = '';
    searchPaletteInput.focus();
    renderSearchResults('');
  }

  searchPaletteInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value.trim().toLowerCase());
  });

  function renderSearchResults(query) {
    searchResultsBox.innerHTML = '';
    const matches = query
      ? state.items.filter(it =>
          it.title.toLowerCase().includes(query) ||
          (it.secondaryTitle && it.secondaryTitle.toLowerCase().includes(query)) ||
          (it.store && it.store.toLowerCase().includes(query)) ||
          (it.category && it.category.toLowerCase().includes(query))
        )
      : state.items.slice(0, 8);

    if (matches.length === 0) {
      searchResultsBox.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--muted); font-size: 13px;">No matching finds</div>';
      return;
    }

    matches.forEach(item => {
      const row = document.createElement('div');
      row.className = 'search-match-item';
      row.innerHTML = `
        <img src="${escapeHtml(item.image)}" alt="" class="search-match-img" />
        <div class="search-match-info">
          <div class="search-match-title">${escapeHtml(item.title)}</div>
          <div class="search-match-sub">${escapeHtml(item.store || '')} • ${escapeHtml(item.category || '')}</div>
        </div>
        <div class="search-match-price">${escapeHtml(item.price || '')}</div>
      `;
      row.addEventListener('click', () => {
        searchModalBack.classList.remove('open');
        openDetailModal(item);
      });
      searchResultsBox.appendChild(row);
    });
  }

  // ==========================================
  // 9. Cart Drawer
  // ==========================================

  cartToggleBtn.addEventListener('click', openCart);
  closeCartDrawerBtn.addEventListener('click', () => cartDrawerOverlay.classList.remove('open'));
  cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === cartDrawerOverlay) cartDrawerOverlay.classList.remove('open');
  });

  function openCart() {
    cartDrawerOverlay.classList.add('open');
    renderCart();
  }

  function updateCartBadge() {
    cartBadgeCount.textContent = state.cart.size;
    try {
      localStorage.setItem('gather_cart', JSON.stringify(Array.from(state.cart)));
    } catch (e) {}
  }

  function renderCart() {
    cartItemsList.innerHTML = '';
    const cartItems = state.items.filter(it => state.cart.has(it.id));

    if (cartItems.length === 0) {
      cartItemsList.innerHTML = `
        <div style="padding: 40px 10px; text-align: center; color: var(--muted); font-size: 13px;">
          <p style="font-weight: 700; margin-bottom: 6px;">Your cart is empty.</p>
          <p style="font-size: 11px;">Click on any find to add it to your shopping or purchase list.</p>
        </div>
      `;
      cartTotalAmount.textContent = '0 Finds';
      return;
    }

    let inrSum = 0;
    let krwSum = 0;

    cartItems.forEach(item => {
      if (item.rawPrice) {
        if ((item.price || '').includes('₹') || item.currency === 'INR') inrSum += item.rawPrice;
        else krwSum += item.rawPrice;
      }

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${escapeHtml(item.image)}" alt="" />
        <div class="cart-row-info">
          <div class="cart-row-title">${escapeHtml(item.title)}</div>
          <div class="cart-row-price">${escapeHtml(item.price)}</div>
        </div>
        <button class="textbtn remove-cart" style="font-size: 16px; padding: 4px;">×</button>
      `;

      row.querySelector('.remove-cart').addEventListener('click', () => {
        state.cart.delete(item.id);
        updateCartBadge();
        renderCart();
      });

      cartItemsList.appendChild(row);
    });

    const totals = [];
    if (inrSum > 0) totals.push(`₹${inrSum.toLocaleString('en-IN')}`);
    if (krwSum > 0) totals.push(`₩${krwSum.toLocaleString('ko-KR')}`);
    cartTotalAmount.textContent = totals.join(' + ') || `${cartItems.length} items`;
  }

  exportCartCsvBtn.addEventListener('click', () => {
    const cartItems = state.items.filter(it => state.cart.has(it.id));
    if (cartItems.length === 0) {
      toast('No items in cart to export');
      return;
    }
    let csv = 'Title,Price,Store,Category,RawLink\n';
    cartItems.forEach(it => {
      csv += `"${it.title.replace(/"/g, '""')}","${it.price}","${it.store}","${it.category}","${it.rawLink}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('Cart CSV exported');
  });

  // ==========================================
  // 10. Exports & Utility Actions
  // ==========================================

  shareBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast('Page link copied ✳');
    } catch (e) {
      toast('Copy page link from your browser');
    }
  });

  function exportWishlistCsv() {
    const items = state.items;
    let csv = 'Title,Price,Store,Category,RawLink,DateAdded\n';
    items.forEach(it => {
      csv += `"${(it.title || '').replace(/"/g, '""')}","${(it.price || '').replace(/"/g, '""')}","${(it.store || '').replace(/"/g, '""')}","${(it.category || '').replace(/"/g, '""')}","${(it.rawLink || '').replace(/"/g, '""')}","${(it.createdAt || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gather-wishlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Wishlist CSV exported ✳');
  }

  function exportWishlistJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.items, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `gather-wishlist-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('JSON backup downloaded ✳');
  }

  exportCsvBtn.addEventListener('click', () => {
    exportWishlistCsv();
  });

  exportJsonBtn.addEventListener('click', () => {
    exportWishlistJson();
  });

  restoreDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Restore the default showcase collection?')) {
      try {
        await fetch('/api/items/reset', { method: 'POST' }).catch(() => {});
      } catch (e) {}
      localStorage.removeItem('gather_items');
      localStorage.removeItem('gather_collections');
      await loadItems();
      await loadCollections();
      toast('Showcase restored ✳');
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      modalBack.classList.remove('open');
      detailModalBack.classList.remove('open');
      searchModalBack.classList.remove('open');
      collectionsModalBack.classList.remove('open');
      cartDrawerOverlay.classList.remove('open');
    }
  });

  // Toast Helper
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Initial Boot
  loadCollections();
  loadItems();
});
