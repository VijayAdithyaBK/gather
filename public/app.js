/**
 * gather. — your good things, together
 * Client Controller & State Management
 * Combines Codex Visual Design with Multi-tier Universal Extraction Backend
 * Features: Mobile Responsive, Full Collections Management (Add, Rename, Delete)
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    items: [],
    collections: [],
    filteredItems: [],
    activeFilter: 'All',
    activeStore: 'All',
    activeSort: 'newest',
    cart: new Set(),
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
  // 1. Data Fetching & Sync
  // ==========================================

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        state.items = data.items;
        updateStoreOptions();
        applyFiltersAndRender();
        updateCartBadge();
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      toast('Could not connect to database');
    }
  }

  async function loadCollections() {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success && Array.isArray(data.collections)) {
        state.collections = data.collections;
        renderCategoryChips();
        updateCategorySelectOptions();
        renderCollectionsModalList();
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
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

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const json = await res.json();
      if (json.success && json.data) {
        showReviewForm(json.data);
      } else {
        throw new Error(json.error || 'Extraction failed');
      }
    } catch (err) {
      console.warn('Extraction fallback:', err);
      showReviewForm({
        title: `${domainName} find`,
        secondaryTitle: domainName,
        price: '₹ Check Store',
        rawPrice: null,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        rawLink: url,
        store: domainName,
        category: 'Other'
      });
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
      const json = await res.json();
      if (json.success && json.item) {
        state.items.unshift(json.item);
        modalBack.classList.remove('open');
        urlInput.value = '';
        applyFiltersAndRender();
        updateStoreOptions();
        loadCollections(); // refresh counts
        toast('Added to your collection ✳');
      }
    } catch (err) {
      toast('Failed to save item');
    }
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
          const json = await res.json();
          if (json.success) {
            toast(`Collection "${col.name}" deleted`);
            await loadCollections();
            await loadItems();
          }
        } catch (e) {
          toast('Failed to delete collection');
        }
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
        const json = await res.json();
        if (json.success) {
          toast(`Renamed to "${updatedName}" ✳`);
          await loadCollections();
          await loadItems();
        }
      } catch (err) {
        toast('Failed to update collection');
      }
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
      const json = await res.json();
      if (json.success) {
        newColNameInput.value = '';
        toast(`Collection "${name}" added ✳`);
        await loadCollections();
      } else {
        toast(json.error || 'Could not add collection');
      }
    } catch (e) {
      toast('Failed to add collection');
    }
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
      const json = await res.json();
      if (json.success) {
        state.items = state.items.filter(it => it.id !== id);
        state.cart.delete(id);
        applyFiltersAndRender();
        updateCartBadge();
        loadCollections(); // refresh counts
        toast('Removed from your list');
      }
    } catch (e) {
      toast('Could not delete item');
    }
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

  exportCsvBtn.addEventListener('click', () => {
    window.location.href = '/api/export?format=csv';
    toast('Downloading CSV export...');
  });

  exportJsonBtn.addEventListener('click', () => {
    window.location.href = '/api/export?format=json';
    toast('Downloading JSON backup...');
  });

  restoreDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Restore the default showcase collection?')) {
      await fetch('/api/items/reset', { method: 'POST' }).catch(() => {});
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
