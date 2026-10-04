const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { extractProductInfo, normalizeUrl, identifyStore } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'wishlist.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read items safely
function getItems() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading wishlist data:', err);
    return [];
  }
}

// Helper to write items safely
function saveItems(items) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving wishlist data:', err);
    return false;
  }
}

const COLLECTIONS_FILE = path.join(__dirname, 'data', 'collections.json');

// Helper to read collections safely
function getCollections() {
  try {
    if (!fs.existsSync(COLLECTIONS_FILE)) {
      const defaults = [
        { id: 'col-clothing', name: 'Clothing', emoji: '👔' },
        { id: 'col-bags', name: 'Bags', emoji: '👜' },
        { id: 'col-accessories', name: 'Accessories', emoji: '💍' },
        { id: 'col-home', name: 'Home', emoji: '🏺' },
        { id: 'col-books', name: 'Books', emoji: '📖' },
        { id: 'col-other', name: 'Other', emoji: '✳' }
      ];
      fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(defaults, null, 2), 'utf8');
      return defaults;
    }
    const raw = fs.readFileSync(COLLECTIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading collections data:', err);
    return [];
  }
}

// Helper to save collections safely
function saveCollections(cols) {
  try {
    fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(cols, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving collections data:', err);
    return false;
  }
}

// Collections Endpoints
app.get('/api/collections', (req, res) => {
  const collections = getCollections();
  const items = getItems();
  // Attach live counts
  const enriched = collections.map(c => {
    const count = items.filter(it => (it.category || '').toLowerCase() === c.name.toLowerCase()).length;
    return { ...c, count };
  });
  res.json({ success: true, collections: enriched });
});

app.post('/api/collections', (req, res) => {
  const { name, emoji } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Collection name is required' });
  }
  const collections = getCollections();
  const trimmed = name.trim();
  if (collections.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return res.status(400).json({ error: 'Collection already exists' });
  }
  const id = `col-${Date.now()}`;
  const newCol = { id, name: trimmed, emoji: emoji || '✳' };
  collections.push(newCol);
  saveCollections(collections);
  res.status(201).json({ success: true, collection: newCol });
});

app.put('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  const { name, emoji } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Collection name is required' });
  }
  const collections = getCollections();
  const idx = collections.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const oldName = collections[idx].name;
  const newName = name.trim();
  collections[idx].name = newName;
  if (emoji) collections[idx].emoji = emoji;
  saveCollections(collections);

  // Update existing wishlist items with oldName -> newName
  if (oldName.toLowerCase() !== newName.toLowerCase()) {
    const items = getItems();
    let updatedCount = 0;
    items.forEach(it => {
      if ((it.category || '').toLowerCase() === oldName.toLowerCase()) {
        it.category = newName;
        updatedCount++;
      }
    });
    if (updatedCount > 0) saveItems(items);
  }

  res.json({ success: true, collection: collections[idx] });
});

app.delete('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  const collections = getCollections();
  const colToDelete = collections.find(c => c.id === id);
  if (!colToDelete) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const filtered = collections.filter(c => c.id !== id);
  saveCollections(filtered);

  // Reassign items in this collection to "Other"
  const items = getItems();
  let updatedCount = 0;
  items.forEach(it => {
    if ((it.category || '').toLowerCase() === colToDelete.name.toLowerCase()) {
      it.category = 'Other';
      updatedCount++;
    }
  });
  if (updatedCount > 0) saveItems(items);

  res.json({ success: true, message: `Collection "${colToDelete.name}" deleted` });
});

// 1. Extract product metadata from any URL
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  try {
    console.log(`[API] Extracting from: ${url}`);
    const data = await extractProductInfo(url);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[API] Extraction error:', err.message);
    const store = identifyStore(url);
    res.json({
      success: true,
      data: {
        title: 'Curated Wishlist Item',
        secondaryTitle: `${store.name} Item`,
        price: 'Check Store',
        rawPrice: null,
        currency: '',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        rawLink: normalizeUrl(url),
        store: store.name,
        domain: store.domain,
        storeColor: store.color,
        category: 'OBJECTS',
        extractedAt: new Date().toISOString()
      },
      warning: 'Extracted with standard metadata fallback.'
    });
  }
});

// 2. Get all wishlist items with filters & sorting
app.get('/api/items', (req, res) => {
  let items = getItems();
  const { category, store, search, sort, status } = req.query;

  // Filter by category
  if (category && category !== 'ALL') {
    const catUpper = category.toUpperCase();
    if (catUpper === 'USED') {
      items = items.filter(it => it.status === 'sold-out' || it.category === 'USED');
    } else {
      items = items.filter(it => (it.category || '').toUpperCase() === catUpper);
    }
  }

  // Filter by store
  if (store && store !== 'ALL') {
    items = items.filter(it => (it.store || '').toLowerCase() === store.toLowerCase());
  }

  // Filter by status (cart, wishlist, sold-out)
  if (status) {
    items = items.filter(it => it.status === status);
  }

  // Text search
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(it =>
      (it.title && it.title.toLowerCase().includes(q)) ||
      (it.secondaryTitle && it.secondaryTitle.toLowerCase().includes(q)) ||
      (it.store && it.store.toLowerCase().includes(q)) ||
      (it.price && it.price.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === 'price-asc') {
    items.sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
  } else if (sort === 'price-desc') {
    items.sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
  } else if (sort === 'title') {
    items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    // Default newest first (reverse chronological by createdAt)
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  res.json({ success: true, count: items.length, items });
});

// 3. Add new item
app.post('/api/items', (req, res) => {
  const newItem = req.body;
  if (!newItem.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const items = getItems();
  const id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const itemToSave = {
    id,
    title: newItem.title,
    secondaryTitle: newItem.secondaryTitle || '',
    price: newItem.price || 'Check Store',
    rawPrice: newItem.rawPrice !== undefined ? newItem.rawPrice : null,
    currency: newItem.currency || '',
    image: newItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    rawLink: newItem.rawLink || '#',
    store: newItem.store || 'Store',
    domain: newItem.domain || '',
    storeColor: newItem.storeColor || '#111111',
    category: (newItem.category || 'OBJECTS').toUpperCase(),
    status: newItem.status || 'wishlist',
    notes: newItem.notes || '',
    createdAt: new Date().toISOString()
  };

  items.unshift(itemToSave);
  saveItems(items);

  res.status(201).json({ success: true, item: itemToSave });
});

// 4. Update item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const items = getItems();

  const idx = items.findIndex(it => it.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  saveItems(items);

  res.json({ success: true, item: items[idx] });
});

// 5. Delete item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const items = getItems();
  const filtered = items.filter(it => it.id !== id);

  if (filtered.length === items.length) {
    return res.status(404).json({ error: 'Item not found' });
  }

  saveItems(filtered);
  res.json({ success: true, message: 'Item deleted' });
});

// Reset items to initial default showcase
app.post('/api/items/reset', (req, res) => {
  const seedFile = path.join(__dirname, 'data', 'seed.json');
  if (fs.existsSync(seedFile)) {
    const seedData = fs.readFileSync(seedFile, 'utf8');
    fs.writeFileSync(DATA_FILE, seedData, 'utf8');
    return res.json({ success: true, message: 'Reset to default showcase items' });
  }
  res.status(500).json({ error: 'Seed file not found' });
});

// 6. Overall stats
app.get('/api/stats', (req, res) => {
  const items = getItems();
  const categories = {};
  const stores = {};
  let totalInr = 0;
  let totalKrw = 0;
  let totalUsd = 0;

  items.forEach(it => {
    const cat = it.category || 'OBJECTS';
    categories[cat] = (categories[cat] || 0) + 1;

    const st = it.store || 'Other';
    stores[st] = (stores[st] || 0) + 1;

    if (it.rawPrice && typeof it.rawPrice === 'number') {
      if (it.currency === 'INR' || it.currency === '₹') totalInr += it.rawPrice;
      else if (it.currency === 'KRW' || it.currency === '₩') totalKrw += it.rawPrice;
      else if (it.currency === 'USD' || it.currency === '$') totalUsd += it.rawPrice;
    }
  });

  res.json({
    totalCount: items.length,
    categories,
    stores,
    currencyTotals: {
      INR: `₹${totalInr.toLocaleString('en-IN')}`,
      KRW: `₩${totalKrw.toLocaleString('ko-KR')}`,
      USD: `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }
  });
});

// 7. Export Wishlist as JSON or CSV
app.get('/api/export', (req, res) => {
  const format = req.query.format || 'json';
  const items = getItems();

  if (format === 'csv') {
    let csv = 'ID,Title,Subtitle,Price,Store,Category,RawLink,DateAdded\n';
    items.forEach(it => {
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      csv += `${escape(it.id)},${escape(it.title)},${escape(it.secondaryTitle)},${escape(it.price)},${escape(it.store)},${escape(it.category)},${escape(it.rawLink)},${escape(it.createdAt)}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="wishlist-export.csv"');
    return res.send(csv);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="wishlist-export.json"');
  res.send(JSON.stringify(items, null, 2));
});

// Compatibility route for Codex mockup (/api/metadata?url=...)
app.get('/api/metadata', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const data = await extractProductInfo(url);
    res.json({ title: data.title, image: data.image, price: data.price });
  } catch (e) {
    res.status(422).json({ error: e.message || 'Scrape failed' });
  }
});

// View Codex's alternative mockup
app.get('/codex-mockup', (req, res) => {
  const filePath = path.join(__dirname, 'reference-mockup', 'index.html');
  if (fs.existsSync(filePath)) {
    return res.type('html').send(fs.readFileSync(filePath, 'utf8'));
  }
  res.status(404).send('Codex mockup not found');
});

// Notion API Proxy for local development
const axios = require('axios');
app.all('/api/notion/proxy', async (req, res) => {
  const endpoint = req.query.endpoint;
  const token = req.headers['x-notion-token'] || process.env.NOTION_API_KEY;
  if (!token) {
    return res.status(401).json({ error: 'Notion token required in x-notion-token header' });
  }
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint query param' });
  }
  try {
    const notionRes = await axios({
      method: req.method,
      url: `https://api.notion.com/v1${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      data: ['POST', 'PATCH', 'PUT'].includes(req.method) ? req.body : undefined
    });
    res.json(notionRes.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { error: err.message });
  }
});

// Fallback to index.html for SPA feel
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.type('html').send(fs.readFileSync(indexPath, 'utf8'));
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` BUY a READ - Universal Wishlist Aggregator`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`===============================================`);
});
