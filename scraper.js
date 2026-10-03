const axios = require('axios');
const cheerio = require('cheerio');

// Realistic modern browser headers
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

/**
 * Clean & normalize product URLs
 */
function normalizeUrl(inputUrl) {
  let urlStr = (inputUrl || '').trim();
  if (!urlStr) return '';
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }
  try {
    const parsed = new URL(urlStr);
    // Remove analytics tracking parameters
    const cleanParams = new URLSearchParams();
    for (const [key, val] of parsed.searchParams.entries()) {
      if (!/^(utm_|fbclid|gclid|_ga|ref_|_hsenc|_hsmi|gbraid|wbraid)/i.test(key)) {
        cleanParams.append(key, val);
      }
    }
    parsed.search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    return parsed.href;
  } catch (err) {
    return urlStr;
  }
}

/**
 * Identify platform / store brand
 */
function identifyStore(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    if (domain.includes('amazon')) return { name: 'Amazon', domain, color: '#FF9900' };
    if (domain.includes('flipkart')) return { name: 'Flipkart', domain, color: '#2874F0' };
    if (domain.includes('ajio')) return { name: 'Ajio', domain, color: '#2C4152' };
    if (domain.includes('myntra')) return { name: 'Myntra', domain, color: '#FF3F6C' };
    if (domain.includes('zara')) return { name: 'Zara', domain, color: '#000000' };
    if (domain.includes('nike')) return { name: 'Nike', domain, color: '#111111' };
    if (domain.includes('apple')) return { name: 'Apple', domain, color: '#333333' };
    if (domain.includes('etsy')) return { name: 'Etsy', domain, color: '#F16521' };
    if (domain.includes('uniqlo')) return { name: 'Uniqlo', domain, color: '#FF0000' };
    if (domain.includes('ebay')) return { name: 'eBay', domain, color: '#E53238' };
    if (domain.includes('hm.com')) return { name: 'H&M', domain, color: '#E50010' };
    if (domain.includes('nykaa')) return { name: 'Nykaa', domain, color: '#FC2779' };
    if (domain.includes('tata')) return { name: 'Tata CLiQ', domain, color: '#000000' };
    if (domain.includes('meesho')) return { name: 'Meesho', domain, color: '#F43397' };
    if (domain.includes('snitch')) return { name: 'Snitch', domain, color: '#000000' };
    
    const parts = domain.split('.');
    const brand = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return { name: brand, domain, color: '#111111' };
  } catch (e) {
    return { name: 'Web Store', domain: '', color: '#111111' };
  }
}

/**
 * Format currency and price
 */
function formatPrice(amount, currency = '') {
  if (amount === undefined || amount === null || amount === '') return null;
  
  if (typeof amount === 'string') {
    // If it already contains currency symbol formatted nicely, clean up whitespace
    if (/^[₹$€£₩¥]/.test(amount.trim())) {
      return amount.trim();
    }
  }

  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return typeof amount === 'string' ? amount.trim() : null;

  const curr = (currency || '').toUpperCase();
  if (curr === 'INR' || curr === '₹' || curr === 'RS') {
    return `₹${num.toLocaleString('en-IN')}`;
  } else if (curr === 'KRW' || curr === '₩') {
    return `₩${num.toLocaleString('ko-KR')}`;
  } else if (curr === 'USD' || curr === '$') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (curr === 'EUR' || curr === '€') {
    return `€${num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (curr === 'GBP' || curr === '£') {
    return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (curr === 'JPY' || curr === '¥') {
    return `¥${num.toLocaleString('ja-JP')}`;
  }

  return `${currency ? currency + ' ' : ''}${num.toLocaleString()}`;
}

/**
 * Clean redundant store suffixes and repeated phrases from titles
 */
function cleanTitle(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(/\s+/g, ' ').trim();

  // Remove common store marketing suffixes
  cleaned = cleaned
    .replace(/\s*[:|–—-]\s*(Amazon\.in|Amazon\.com|Flipkart\.com|Ajio|Myntra|Buy Online at Best Price.*)$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();

  // Deduplicate repeated title halves (e.g. Amazon duplicate mobile + desktop title)
  const len = cleaned.length;
  if (len > 15) {
    const half = Math.floor(len / 2);
    const firstHalf = cleaned.slice(0, half).trim();
    const secondHalf = cleaned.slice(half).trim();
    if (firstHalf === secondHalf) {
      cleaned = firstHalf;
    }
  }

  return cleaned;
}

/**
 * Extract clean title from URL slug when HTML title is empty or generic
 */
function deriveTitleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const parts = path.split('/').filter(Boolean);
    
    // Look for product slug part
    let candidate = '';
    for (let part of parts) {
      if (part === 'dp' || part === 'p' || part === 'product' || part === 'item' || part === 'buy') continue;
      if (/^[A-Z0-9]{10}$/i.test(part) || /^itm[a-z0-9]+$/i.test(part)) continue; // ASIN or Flipkart item ID
      if (part.length > candidate.length) {
        candidate = part;
      }
    }

    if (!candidate && parts.length > 0) {
      candidate = parts[parts.length - 1];
    }

    if (candidate) {
      const words = decodeURIComponent(candidate)
        .replace(/[-_+]/g, ' ')
        .replace(/\.[a-z0-9]+$/i, '')
        .split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      return words.join(' ');
    }
  } catch (e) {}
  return 'Curated Wishlist Item';
}

/**
 * Recursive Schema.org JSON-LD extractor
 */
function extractFromJsonLd($, baseUrl) {
  let found = { title: null, price: null, currency: null, image: null, description: null };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).contents().text();
      if (!raw) return;
      const data = JSON.parse(raw);

      function searchNode(node) {
        if (!node || typeof node !== 'object') return;

        const type = node['@type'];
        const isProduct = type === 'Product' || type === 'IndividualProduct' || type === 'Book' ||
          (Array.isArray(type) && (type.includes('Product') || type.includes('Book')));

        if (isProduct || node.offers) {
          if (!found.title && (node.name || node.headline)) {
            found.title = String(node.name || node.headline).trim();
          }

          if (!found.image && node.image) {
            if (typeof node.image === 'string') {
              found.image = node.image;
            } else if (Array.isArray(node.image) && node.image.length > 0) {
              found.image = typeof node.image[0] === 'string' ? node.image[0] : node.image[0]?.url || node.image[0]?.contentUrl;
            } else if (typeof node.image === 'object') {
              found.image = node.image.url || node.image.contentUrl;
            }
          }

          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          if (offers && !found.price) {
            const rawPrice = offers.price ?? offers.lowPrice ?? offers.highPrice;
            const currency = offers.priceCurrency || offers.priceSpecification?.priceCurrency;
            if (rawPrice !== undefined && rawPrice !== null) {
              found.price = rawPrice;
              found.currency = currency || found.currency;
            }
          }
        }

        if (node['@graph'] && Array.isArray(node['@graph'])) {
          node['@graph'].forEach(searchNode);
        }
        for (const key of Object.keys(node)) {
          if (typeof node[key] === 'object' && node[key] !== null) {
            searchNode(node[key]);
          }
        }
      }

      searchNode(data);
    } catch (e) {}
  });

  return found;
}

/**
 * Site specific extractors (Amazon, Flipkart, Myntra, Ajio, Zara, etc.)
 */
function extractSiteSpecific($, url) {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();
  const res = { title: null, price: null, currency: null, image: null, secondaryTitle: null };

  // 1. AMAZON
  if (hostname.includes('amazon')) {
    const titleEl = $('#productTitle, #title, #ebooksProductTitle');
    if (titleEl.length) res.title = cleanTitle(titleEl.text());

    const priceWhole = $('.priceToPay .a-price-whole, .apexPriceToPay .a-price-whole').first().text().replace(/[^\d]/g, '');
    const priceFraction = $('.priceToPay .a-price-fraction, .apexPriceToPay .a-price-fraction').first().text().replace(/[^\d]/g, '');
    const priceOffscreen = $('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #corePrice_desktop .a-offscreen').first().text().trim();

    if (priceWhole) {
      res.price = priceFraction ? `${priceWhole}.${priceFraction}` : priceWhole;
      res.currency = hostname.includes('.in') ? 'INR' : 'USD';
    } else if (priceOffscreen) {
      res.price = priceOffscreen;
      if (priceOffscreen.includes('₹')) res.currency = 'INR';
      else if (priceOffscreen.includes('$')) res.currency = 'USD';
      else if (priceOffscreen.includes('£')) res.currency = 'GBP';
      else if (priceOffscreen.includes('€')) res.currency = 'EUR';
    }

    const landingImg = $('#landingImage, #imgBlkFront, #main-image');
    if (landingImg.length) {
      const dynamicImages = landingImg.attr('data-a-dynamic-image');
      if (dynamicImages) {
        try {
          const parsedImgs = JSON.parse(dynamicImages);
          let bestUrl = null;
          let maxArea = 0;
          for (const [imgUrl, dims] of Object.entries(parsedImgs)) {
            if (Array.isArray(dims) && dims.length >= 2) {
              const area = dims[0] * dims[1];
              if (area > maxArea) {
                maxArea = area;
                bestUrl = imgUrl;
              }
            }
          }
          res.image = bestUrl || Object.keys(parsedImgs)[0];
        } catch (e) {}
      }
      if (!res.image) {
        res.image = landingImg.attr('data-old-hires') || landingImg.attr('src');
      }
    }
    res.secondaryTitle = 'Amazon Official Store';
  }

  // 2. FLIPKART
  else if (hostname.includes('flipkart')) {
    const titleEl = $('span.B_NuCI, h1.yhB1nd, ._35KyD6, .VU-ZEz').first();
    if (titleEl.length) res.title = cleanTitle(titleEl.text());

    const priceEl = $('div._30jeq3._16Jk6d, div._30jeq3, div.Nx9bqj, div.Nx9bqj.CxhGGd').first();
    if (priceEl.length) {
      res.price = priceEl.text().trim();
      res.currency = 'INR';
    }

    const imgEl = $('img._396cs4._16Oddu, img._2r_T1I, img._396cs4, img.DByuf4').first();
    if (imgEl.length) {
      res.image = imgEl.attr('src');
    }
    res.secondaryTitle = 'Flipkart Marketplace';
  }

  // 3. MYNTRA
  else if (hostname.includes('myntra')) {
    const brand = $('h1.pdp-title').text().trim();
    const name = $('h1.pdp-name').text().trim();
    if (name) {
      res.title = brand ? `${brand} ${name}` : name;
      res.secondaryTitle = brand || 'Myntra Fashion';
    }

    const priceEl = $('span.pdp-price strong, span.pdp-price').first();
    if (priceEl.length) {
      res.price = priceEl.text().trim();
      res.currency = 'INR';
    }

    const imgEl = $('div.image-grid-image, .image-grid-container img').first();
    if (imgEl.length) {
      const bg = imgEl.css('background-image');
      if (bg && bg.includes('url(')) {
        res.image = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      } else {
        res.image = imgEl.attr('src');
      }
    }
  }

  // 4. AJIO
  else if (hostname.includes('ajio')) {
    const brand = $('h2.brand-name').text().trim();
    const name = $('h1.prod-name').text().trim();
    if (name) {
      res.title = brand ? `${brand} - ${name}` : name;
      res.secondaryTitle = brand || 'Ajio Collection';
    }

    const priceEl = $('div.prod-sp, span.prod-sp').first();
    if (priceEl.length) {
      res.price = priceEl.text().trim();
      res.currency = 'INR';
    }

    const imgEl = $('div.img-holder img, img.prod-image').first();
    if (imgEl.length) {
      res.image = imgEl.attr('src');
    }
  }

  return res;
}

/**
 * Universal metadata extractor using OpenGraph & Twitter
 */
function extractOpenGraph($, baseUrl) {
  const ogTitle = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('meta[name="title"]').attr('content') ||
                  $('title').text().trim();

  const ogImage = $('meta[property="og:image:secure_url"]').attr('content') ||
                  $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content') ||
                  $('meta[name="twitter:image:src"]').attr('content');

  const ogPrice = $('meta[property="og:price:amount"]').attr('content') ||
                  $('meta[property="product:price:amount"]').attr('content');

  const ogCurrency = $('meta[property="og:price:currency"]').attr('content') ||
                     $('meta[property="product:price:currency"]').attr('content');

  const ogSite = $('meta[property="og:site_name"]').attr('content');

  return {
    title: ogTitle ? cleanTitle(ogTitle) : null,
    image: ogImage ? resolveRelativeUrl(ogImage, baseUrl) : null,
    price: ogPrice || null,
    currency: ogCurrency || null,
    siteName: ogSite || null
  };
}

function resolveRelativeUrl(url, base) {
  if (!url) return null;
  try {
    return new URL(url, base).href;
  } catch (e) {
    return url;
  }
}

/**
 * Fallback to Microlink API if directly blocked
 */
async function fetchFromMicrolink(url) {
  try {
    const apiEndpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`;
    const res = await axios.get(apiEndpoint, { timeout: 8000 });
    const data = res.data?.data;
    if (!data) return null;

    return {
      title: data.title || null,
      image: data.image?.url || data.logo?.url || null,
      description: data.description || null,
      siteName: data.publisher || null
    };
  } catch (err) {
    return null;
  }
}

/**
 * Jina AI Reader Proxy fallback
 */
async function fetchFromJina(url) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await axios.get(jinaUrl, {
      timeout: 10000,
      headers: { 'Accept': 'text/plain, text/markdown' }
    });
    const text = res.data;
    if (!text || typeof text !== 'string') return null;

    let title = null;
    let image = null;
    let price = null;

    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
    if (imgMatch) image = imgMatch[1];

    const priceMatch = text.match(/(₹|Rs\.?|\$|₩|€|£)\s*([\d,]+(\.\d{2})?)/);
    if (priceMatch) {
      price = `${priceMatch[1]}${priceMatch[2]}`;
    }

    return { title, image, price };
  } catch (e) {
    return null;
  }
}

/**
 * Guess category based on title, description, or store
 */
function guessCategory(title = '', store = '') {
  const text = (title + ' ' + store).toLowerCase();
  if (/\b(book|magazine|novel|paper|catalog|read|journal|guide|fact|hardcover|paperback|author|edition)\b/i.test(text)) {
    return 'READ';
  }
  if (/\b(bag|tote|backpack|handbag|wallet|purse|duffle|luggage|clutch)\b/i.test(text)) {
    return 'BAGS';
  }
  if (/\b(hat|cap|necklace|ring|earring|bracelet|sunglasses|watch|belt|jewel|jewelry|scarf|socks|eyewear)\b/i.test(text)) {
    return 'ACCESSORIES';
  }
  if (/\b(shirt|tee|t-shirt|pants|trousers|dress|hoodie|sweatshirt|jeans|skirt|saree|kurta|clothing|apparel|footwear|sneakers|shoes|boots)\b/i.test(text)) {
    return 'CLOTHING';
  }
  if (/\b(candle|vase|sculpture|tree|lamp|table|chair|mug|cup|decor|object|art|gadget|camera|headphones|audio|tool|tools|socket|drill|driver|hardware|electronics|set)\b/i.test(text)) {
    return 'OBJECTS';
  }
  return 'OBJECTS';
}

/**
 * Master Extraction Function
 */
async function extractProductInfo(rawUrl) {
  const url = normalizeUrl(rawUrl);
  const store = identifyStore(url);

  let extracted = {
    title: '',
    secondaryTitle: '',
    price: '',
    rawPrice: null,
    currency: '',
    image: '',
    rawLink: url,
    store: store.name,
    domain: store.domain,
    storeColor: store.color,
    category: 'OBJECTS',
    extractedAt: new Date().toISOString()
  };

  let html = null;
  let responseUrl = url;

  // Step 1: Direct Fetch with browser emulation
  try {
    const response = await axios.get(url, {
      headers: {
        ...DEFAULT_HEADERS,
        'Referer': 'https://www.google.com/',
        'Host': new URL(url).host
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });
    html = response.data;
    if (response.request?.res?.responseUrl) {
      responseUrl = response.request.res.responseUrl;
    }
  } catch (directErr) {
    console.log(`[Scraper] Direct fetch failed for ${url}: ${directErr.message}`);
  }

  // Step 2: Parse Direct HTML
  if (html && typeof html === 'string') {
    const $ = cheerio.load(html);

    const siteData = extractSiteSpecific($, responseUrl);
    const jsonLd = extractFromJsonLd($, responseUrl);
    const og = extractOpenGraph($, responseUrl);

    extracted.title = siteData.title || jsonLd.title || og.title || $('h1').first().text().trim() || '';
    extracted.secondaryTitle = siteData.secondaryTitle || (store.name ? `${store.name} Curated Item` : '');

    let rawPrice = siteData.price || jsonLd.price || og.price;
    let curr = siteData.currency || jsonLd.currency || og.currency;

    if (!rawPrice) {
      const priceRegex = /(₹|Rs\.?|\$|₩|€|£)\s*([\d,]+(\.\d{2})?)/i;
      const bodyText = $('body').text().slice(0, 15000);
      const match = bodyText.match(priceRegex);
      if (match) {
        curr = curr || match[1];
        rawPrice = match[2];
      }
    }

    if (rawPrice) {
      extracted.rawPrice = rawPrice;
      extracted.currency = curr || (store.name === 'Flipkart' || store.name === 'Ajio' || store.name === 'Myntra' ? 'INR' : '');
      extracted.price = formatPrice(rawPrice, extracted.currency) || String(rawPrice);
    }

    let foundImg = siteData.image || jsonLd.image || og.image;
    if (!foundImg) {
      $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !foundImg && !src.includes('sprite') && !src.includes('icon') && !src.includes('logo') && !src.includes('banner')) {
          foundImg = src;
        }
      });
    }
    if (foundImg) {
      extracted.image = resolveRelativeUrl(foundImg, responseUrl);
    }
  }

  // Check if title is generic homepage or error title
  const isGenericTitle = !extracted.title ||
    /^(Online Shopping India|Amazon\.com|Welcome to|Home Page|Loading\.\.\.|Access Denied|403|500)/i.test(extracted.title);

  // Step 3: If direct fetch failed or gave poor data, try Jina / Microlink proxies
  if (isGenericTitle || !extracted.image || !extracted.price) {
    console.log(`[Scraper] Querying proxy fallbacks for ${url}...`);

    // Try Jina Reader
    const jinaData = await fetchFromJina(url);
    if (jinaData) {
      if (isGenericTitle && jinaData.title && !jinaData.title.includes('Warning: Target URL returned error')) {
        extracted.title = cleanTitle(jinaData.title);
      }
      if (!extracted.image && jinaData.image && !jinaData.image.includes('logo')) {
        extracted.image = jinaData.image;
      }
      if (!extracted.price && jinaData.price) {
        extracted.price = jinaData.price;
      }
    }

    // Try Microlink
    if (isGenericTitle || !extracted.image) {
      const microlink = await fetchFromMicrolink(url);
      if (microlink) {
        if (isGenericTitle && microlink.title) {
          extracted.title = cleanTitle(microlink.title);
        }
        if (!extracted.image && microlink.image) {
          extracted.image = microlink.image;
        }
        if (!extracted.secondaryTitle && microlink.siteName) {
          extracted.secondaryTitle = microlink.siteName;
        }
      }
    }
  }

  // Step 4: Fallback cleanup if still generic
  if (!extracted.title || /^(Online Shopping India|Welcome to|Home Page|403|500)/i.test(extracted.title)) {
    extracted.title = deriveTitleFromUrl(url);
  }

  if (!extracted.secondaryTitle) {
    extracted.secondaryTitle = `${store.name} Edition`;
  }

  if (!extracted.price) {
    extracted.price = '₹ Check Store';
  }

  if (!extracted.image) {
    extracted.image = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80`;
  }

  extracted.title = cleanTitle(extracted.title);
  extracted.category = guessCategory(extracted.title, store.name);

  return extracted;
}

module.exports = {
  extractProductInfo,
  normalizeUrl,
  identifyStore,
  formatPrice,
  guessCategory
};
