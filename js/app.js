// ========================================
// FIREBASE CONFIGURATION & AUTHENTICATION
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyCjRuA_yG39jArA1A00TkG2J29FJkq2e-A",
    authDomain: "kasir-sistem-dewa-ban.firebaseapp.com",
    databaseURL: "https://kasir-sistem-dewa-ban-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kasir-sistem-dewa-ban",
    storageBucket: "kasir-sistem-dewa-ban.firebasestorage.app",
    messagingSenderId: "860755099190",
    appId: "1:860755099190:web:4490ce270121dbc56de297"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
// const storage = firebase.storage(); // ← Not used anymore (migrated to Cloudinary)

// Set persistence to LOCAL (remember me - keeps login state across browser sessions)
// This must be called before any login attempt
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Auth persistence set to LOCAL - login akan bertahan');
    })
    .catch(err => {
        console.error('❌ Auth persistence error:', err);
        // Fallback: try again with SESSION at minimum
        auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .catch(e => console.error('Session persistence also failed:', e));
    });

// Global auth state
let currentUser = null;
let isAuthenticated = false;

// Flag untuk cek apakah menggunakan Firebase atau LocalStorage (fallback)
let useFirebase = true;
let firebaseReady = false;

// ========================================
// LOCAL STORAGE FUNCTIONS (FALLBACK)
// ========================================

// Get products from localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

// Update products in localStorage
function updateProducts(updatedProducts) {
    localStorage.setItem('products', JSON.stringify(updatedProducts));
}

// Initialize products
const DEFAULT_PRODUCTS = [
    { id: 1, brand: 'AHM', name: 'AHM K93 100/90-12', price: 260000, stock: 50, image: 'img/ahm.png' },
    { id: 2, brand: 'AHM', name: 'AHM K93 110/90-12', price: 310000, stock: 50, image: 'img/ahm.png' },
    { id: 3, brand: 'AHM', name: 'AHM K59 80/90-14', price: 240000, stock: 50, image: 'img/ahm.png' },
    { id: 4, brand: 'AHM', name: 'AHM K59 90/90-14', price: 280000, stock: 50, image: 'img/ahm.png' },
    { id: 5, brand: 'AHM', name: 'AHM K2S 100/80-14', price: 285000, stock: 50, image: 'img/ahm.png' },
    { id: 6, brand: 'AHM', name: 'AHM K2S 120/70-14', price: 335000, stock: 50, image: 'img/ahm.png' },

    { id: 101, brand: 'IRC', name: 'IRC NR 82 100/90-12', price: 255000, stock: 50, image: 'img/irc.png' },
    { id: 102, brand: 'IRC', name: 'IRC NR 83 110/90-12', price: 300000, stock: 50, image: 'img/irc.png' },
    { id: 103, brand: 'IRC', name: 'IRC SCT-001 110/70-12', price: 280000, stock: 50, image: 'img/irc.png' },
    { id: 104, brand: 'IRC', name: 'IRC SCT-001 130/80-12', price: 355000, stock: 50, image: 'img/irc.png' },
    { id: 105, brand: 'IRC', name: 'IRC GP-5 100/90-12', price: 255000, stock: 50, image: 'img/irc.png' },
    { id: 106, brand: 'IRC', name: 'IRC GP-5 110/90-12', price: 300000, stock: 50, image: 'img/irc.png' },
    { id: 107, brand: 'IRC', name: 'IRC NF 59 70/90-14', price: 170000, stock: 50, image: 'img/irc.png' },
    { id: 108, brand: 'IRC', name: 'IRC NR 76 80/90-14', price: 185000, stock: 50, image: 'img/irc.png' },
    { id: 109, brand: 'IRC', name: 'IRC NR 73 R 90/90-14', price: 225000, stock: 50, image: 'img/irc.png' },
    { id: 110, brand: 'IRC', name: 'IRC SP1 70/90-17', price: 175000, stock: 50, image: 'img/irc.png' },
    { id: 111, brand: 'IRC', name: 'IRC SP1 80/90-17', price: 210000, stock: 50, image: 'img/irc.png' },
    { id: 112, brand: 'IRC', name: 'IRC FASTI 2 90/80-14', price: 330000, stock: 50, image: 'img/irc.png' },
    { id: 113, brand: 'IRC', name: 'IRC FASTI PRO 90/80-14', price: 330000, stock: 50, image: 'img/irc.png' },

    { id: 201, brand: 'FDR', name: 'FDR SPORT ZEVO 110/70-12', price: 315000, stock: 50, image: 'img/fdr.png' },
    { id: 202, brand: 'FDR', name: 'FDR SPORT ZEVO 120/70-12', price: 340000, stock: 50, image: 'img/fdr.png' },
    { id: 203, brand: 'FDR', name: 'FDR SPORT ZEVO 130/70-12', price: 390000, stock: 50, image: 'img/fdr.png' },
    { id: 204, brand: 'FDR', name: 'FDR CITY GO 100/90-12', price: 285000, stock: 50, image: 'img/fdr.png' },
    { id: 205, brand: 'FDR', name: 'FDR CITY GO 110/90-12', price: 325000, stock: 50, image: 'img/fdr.png' },
    { id: 206, brand: 'FDR', name: 'FDR FLEMMO 80/90-14', price: 185000, stock: 50, image: 'img/fdr.png' },
    { id: 207, brand: 'FDR', name: 'FDR FLEMMO 90/90-14', price: 220000, stock: 50, image: 'img/fdr.png' },
    { id: 208, brand: 'FDR', name: 'FDR GENZI 80/80-14', price: 195000, stock: 50, image: 'img/fdr.png' },
    { id: 209, brand: 'FDR', name: 'FDR GENZI 90/80-14', price: 235000, stock: 50, image: 'img/fdr.png' },
    { id: 210, brand: 'FDR', name: 'FDR GENZI 100/80-14', price: 280000, stock: 50, image: 'img/fdr.png' },
    { id: 211, brand: 'FDR', name: 'FDR SPARTAX 70/90-14', price: 155000, stock: 50, image: 'img/fdr.png' },
    { id: 212, brand: 'FDR', name: 'FDR SPARTAX 80/90-14', price: 188000, stock: 50, image: 'img/fdr.png' },
    { id: 213, brand: 'FDR', name: 'FDR SPARTAX 90/90-14', price: 225000, stock: 50, image: 'img/fdr.png' },
    { id: 214, brand: 'FDR', name: 'FDR MP27 90/80-14', price: 335000, stock: 50, image: 'img/fdr.png' },
    { id: 215, brand: 'FDR', name: 'FDR MP76 90/80-14', price: 335000, stock: 50, image: 'img/fdr.png' },

    { id: 301, brand: 'MAXXIS', name: 'MAXXIS M6017 120/70-10', price: 370000, stock: 50, image: 'img/maxxis.png' },
    { id: 302, brand: 'MAXXIS', name: 'MAXXIS M6239 80/90-14', price: 215000, stock: 50, image: 'img/maxxis.png' },
    { id: 303, brand: 'MAXXIS', name: 'MAXXIS M6240 90/90-14', price: 275000, stock: 50, image: 'img/maxxis.png' },
    { id: 304, brand: 'MAXXIS', name: 'MAXXIS VICTRA 100/80-14', price: 370000, stock: 50, image: 'img/maxxis.png' },
    { id: 305, brand: 'MAXXIS', name: 'MAXXIS VICTRA 110/80-14', price: 430000, stock: 50, image: 'img/maxxis.png' },
    { id: 306, brand: 'MAXXIS', name: 'MAXXIS VICTRA 120/70-14', price: 470000, stock: 50, image: 'img/maxxis.png' },
    { id: 307, brand: 'MAXXIS', name: 'MAXXIS GREEN DEVIL 80/80-14', price: 285000, stock: 50, image: 'img/maxxis.png' },
    { id: 308, brand: 'MAXXIS', name: 'MAXXIS GREEN DEVIL 90/80-14', price: 345000, stock: 50, image: 'img/maxxis.png' },
    { id: 309, brand: 'MAXXIS', name: 'MAXXIS GREEN DEVIL 100/80-14', price: 405000, stock: 50, image: 'img/maxxis.png' },

    { id: 401, brand: 'PIRELLI', name: 'PIRELLI DIABLO ROSSO 120/70-12', price: 620000, stock: 50, image: 'img/pirelli.png' },
    { id: 402, brand: 'PIRELLI', name: 'PIRELLI ANGEL SCOOTER 90/90-14', price: 380000, stock: 50, image: 'img/pirelli.png' },
    { id: 403, brand: 'PIRELLI', name: 'PIRELLI ANGEL SCOOTER 100/90-14', price: 440000, stock: 50, image: 'img/pirelli.png' },
    { id: 404, brand: 'PIRELLI', name: 'PIRELLI DIABLO ROSSO 90/80-14', price: 410000, stock: 50, image: 'img/pirelli.png' },
    { id: 405, brand: 'PIRELLI', name: 'PIRELLI DIABLO ROSSO 100/80-14', price: 560000, stock: 50, image: 'img/pirelli.png' },

    { id: 501, brand: 'ASPIRA', name: 'ASPIRA MAXIO 70/90-14', price: 140000, stock: 50, image: 'img/aspira.png' },
    { id: 502, brand: 'ASPIRA', name: 'ASPIRA MAXIO 80/90-14', price: 170000, stock: 50, image: 'img/aspira.png' },
    { id: 503, brand: 'ASPIRA', name: 'ASPIRA MAXIO 90/90-14', price: 210000, stock: 50, image: 'img/aspira.png' },
    { id: 504, brand: 'ASPIRA', name: 'ASPIRA PREMIO SPORTIVO 80/80-14', price: 232000, stock: 50, image: 'img/aspira.png' },
    { id: 505, brand: 'ASPIRA', name: 'ASPIRA PREMIO SPORTIVO 90/80-14', price: 282000, stock: 50, image: 'img/aspira.png' },

    { id: 601, brand: 'SWALLOW', name: 'SWALLOW SB-117 100/80-14', price: 265000, stock: 50, image: 'img/swallow.png' },
    { id: 602, brand: 'SWALLOW', name: 'SWALLOW SB-117 70/90-14', price: 155000, stock: 50, image: 'img/swallow.png' },
    { id: 603, brand: 'SWALLOW', name: 'SWALLOW SB-117 80/90-14', price: 190000, stock: 50, image: 'img/swallow.png' },
    { id: 604, brand: 'SWALLOW', name: 'SWALLOW SLASH 80/90-17', price: 210000, stock: 50, image: 'img/swallow.png' },

    { id: 701, brand: 'KINGLAND', name: 'KINGLAND KING TIGER 70/90-14', price: 135000, stock: 50, image: 'img/kingland.png' },
    { id: 702, brand: 'KINGLAND', name: 'KINGLAND KING TIGER 80/90-14', price: 165000, stock: 50, image: 'img/kingland.png' },
    { id: 703, brand: 'KINGLAND', name: 'KINGLAND KING TIGER 90/90-14', price: 195000, stock: 50, image: 'img/kingland.png' },
    { id: 704, brand: 'KINGLAND', name: 'KINGLAND AXERO 80/80-14', price: 185000, stock: 50, image: 'img/kingland.png' },

    { id: 801, brand: 'CORSA', name: 'CORSA PLANETO 70/90-14', price: 160000, stock: 50, image: 'img/corsa.png' },
    { id: 802, brand: 'CORSA', name: 'CORSA PLANETO 80/90-14', price: 195000, stock: 50, image: 'img/corsa.png' },
    { id: 803, brand: 'CORSA', name: 'CORSA PLANETO 90/90-14', price: 235000, stock: 50, image: 'img/corsa.png' },
    { id: 804, brand: 'CORSA', name: 'CORSA R46 80/80-14', price: 280000, stock: 50, image: 'img/corsa.png' },
    { id: 805, brand: 'CORSA', name: 'CORSA R46 90/80-14', price: 330000, stock: 50, image: 'img/corsa.png' },

    { id: 901, brand: 'MIZZLE', name: 'MIZZLE M77 80/80-14', price: 195000, stock: 50, image: 'img/mizzle.png' },
    { id: 902, brand: 'MIZZLE', name: 'MIZZLE M77 90/80-14', price: 235000, stock: 50, image: 'img/mizzle.png' },
    { id: 903, brand: 'MIZZLE', name: 'MIZZLE MR01 90/80-14', price: 235000, stock: 50, image: 'img/mizzle.png' },
    { id: 904, brand: 'MIZZLE', name: 'MIZZLE HYDRA 80/80-14', price: 195000, stock: 50, image: 'img/mizzle.png' },

    { id: 1001, brand: 'ZENEOS', name: 'ZENEOS ZN62 80/90-14', price: 210000, stock: 50, image: 'img/zeneos.png' },
    { id: 1002, brand: 'ZENEOS', name: 'ZENEOS ZN62 90/90-14', price: 245000, stock: 50, image: 'img/zeneos.png' },
    { id: 1003, brand: 'ZENEOS', name: 'ZENEOS TURINO 80/90-14', price: 245000, stock: 50, image: 'img/zeneos.png' },
    { id: 1004, brand: 'ZENEOS', name: 'ZENEOS TURINO 90/90-14', price: 285000, stock: 50, image: 'img/zeneos.png' },

    { id: 1101, brand: 'PRIMAAX', name: 'PRIMAAX SK-01 90/80-17', price: 285000, stock: 50, image: 'img/primaax.png' },
    { id: 1102, brand: 'PRIMAAX', name: 'PRIMAAX SK-01 80/80-17', price: 250000, stock: 50, image: 'img/primaax.png' },

    { id: 1201, brand: 'TOMIMOTO', name: 'TOMIMOTO 250-17', price: 95000, stock: 50, image: 'img/tomimoto.png' },
    { id: 1202, brand: 'TOMIMOTO', name: 'TOMIMOTO 275-17', price: 110000, stock: 50, image: 'img/tomimoto.png' },

    { id: 2001, brand: 'BAN DALAM', name: 'Ban Dalam Ring 14 (Matic Standard)', price: 35000, stock: 100, image: 'img/bandalam.png' },
    { id: 2002, brand: 'BAN DALAM', name: 'Ban Dalam Ring 17 (Bebek Standard)', price: 35000, stock: 100, image: 'img/bandalam.png' },
    { id: 2003, brand: 'BAN DALAM', name: 'Ban Dalam Ring 12 (Scoopy Baru)', price: 45000, stock: 100, image: 'img/bandalam.png' },

    { id: 3001, brand: 'AKSESORIS', name: 'Cairan Anti Bocor (Tubeless) 350ml', price: 35000, stock: 100, image: 'img/aksesoris.png' },
    { id: 3002, brand: 'AKSESORIS', name: 'Cairan Anti Bocor (Tubeless) 500ml', price: 45000, stock: 100, image: 'img/aksesoris.png' },
    { id: 3003, brand: 'AKSESORIS', name: 'Pentil Tubeless Besi', price: 10000, stock: 200, image: 'img/aksesoris.png' },
    { id: 3004, brand: 'AKSESORIS', name: 'Bearing / Laher Roda', price: 25000, stock: 50, image: 'img/aksesoris.png' },

    { id: 4001, brand: 'JASA', name: 'Jasa Pasang Ban (Bawa Sendiri)', price: 15000, stock: 9999, image: 'img/jasa.png' },
    { id: 4002, brand: 'JASA', name: 'Jasa Tambal Ban Tubeless', price: 15000, stock: 9999, image: 'img/jasa.png' },
    { id: 4003, brand: 'JASA', name: 'Jasa Bongkar Pasang Velg', price: 20000, stock: 9999, image: 'img/jasa.png' },
    { id: 4004, brand: 'JASA', name: 'Nitrogen (Isi Ulang 2 Ban)', price: 5000, stock: 9999, image: 'img/jasa.png' }
].map(p => {
    const price = Number(p?.price) || 0;
    const rawCost = Number(p?.costPrice);
    const costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
    return { ...p, costPrice };
});

function withCacheBuster(url) {
    const s = String(url || '').trim();
    if (!s) return s;
    // Skip cache buster for cloud URLs (Firebase Storage, etc.)
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    // Only add cache buster for local img/ paths
    if (!s.startsWith('img/')) return s;
    if (s.includes('?')) return s;
    return `${s}?v=1`;
}

function normalizeProduct(p) {
    const id = Number(p?.id);
    const name = String(p?.name || '').trim();
    const brand = String(p?.brand || '').trim();
    const price = Number(p?.price) || 0;
    const rawCost = Number(p?.costPrice);
    const costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
    const stock = Math.max(0, Number(p?.stock) || 0);
    const image = String(p?.image || 'img/logo.png').trim() || 'img/logo.png';
    return { ...p, id, name, brand, price, costPrice, stock, image };
}

function getDefaultProductsMapById() {
    const map = new Map();
    DEFAULT_PRODUCTS.forEach(p => {
        map.set(Number(p.id), normalizeProduct(p));
    });
    return map;
}

function inferBrandFromName(name, knownBrands) {
    const upper = String(name || '').trim().toUpperCase();
    if (!upper) return '';
    const sorted = [...knownBrands].sort((a, b) => b.length - a.length);
    for (const b of sorted) {
        const bUpper = b.toUpperCase();
        if (upper === bUpper) return b;
        if (upper.startsWith(bUpper + ' ')) return b;
    }
    const first = upper.split(' ')[0];
    if (knownBrands.some(b => b.toUpperCase() === first)) return first;
    return '';
}

function mergeDefaultsWithStored(defaults, stored) {
    const defaultsById = getDefaultProductsMapById();
    const knownBrands = new Set(DEFAULT_PRODUCTS.map(p => String(p.brand || '').trim()).filter(Boolean));

    const resultById = new Map();

    // Start with defaults (master never disappears)
    defaultsById.forEach((p, id) => {
        resultById.set(id, { ...p });
    });

    // Apply stored overrides and new items
    (stored || []).forEach(raw => {
        const normalized = normalizeProduct(raw);
        if (!normalized.id) return;

        const existingDefault = defaultsById.get(normalized.id);
        if (existingDefault) {
            // Merge: stored overrides default fields, but keep default brand if stored brand missing
            const brand = normalized.brand || existingDefault.brand;
            resultById.set(normalized.id, { ...existingDefault, ...normalized, brand });
            return;
        }

        // New item: infer brand if missing
        const inferredBrand = normalized.brand || inferBrandFromName(normalized.name, knownBrands);
        const brand = inferredBrand || 'LAINNYA';
        resultById.set(normalized.id, { ...normalized, brand });
    });

    return Array.from(resultById.values());
}

function loadProducts() {
    const raw = localStorage.getItem('products');
    const hasRaw = raw !== null && String(raw).trim().length > 0;

    if (!hasRaw) {
        const seeded = DEFAULT_PRODUCTS.map(normalizeProduct);
        localStorage.setItem('products', JSON.stringify(seeded));
        return seeded;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            const seeded = DEFAULT_PRODUCTS.map(normalizeProduct);
            localStorage.setItem('products', JSON.stringify(seeded));
            return seeded;
        }

        const merged = mergeDefaultsWithStored(DEFAULT_PRODUCTS, parsed);
        localStorage.setItem('products', JSON.stringify(merged));
        return merged;
    } catch (e) {
        const seeded = DEFAULT_PRODUCTS.map(normalizeProduct);
        localStorage.setItem('products', JSON.stringify(seeded));
        return seeded;
    }
}

// Save products ke LocalStorage DAN Firebase
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));

    // Sync ke Firebase
    if (useFirebase && firebaseReady) {
        try {
            const productsObj = {};
            products.forEach(p => {
                productsObj[p.id] = p;
            });
            db.ref('products').set(productsObj)
                .catch(err => console.error('Firebase saveProducts error:', err));
        } catch (err) {
            console.error('Firebase saveProducts error:', err);
        }
    }
}

// Update single product stock ke Firebase
function updateProductStockFirebase(productId, newStock) {
    if (useFirebase && firebaseReady) {
        try {
            db.ref('products/' + productId + '/stock').set(newStock)
                .catch(err => console.error('Firebase updateStock error:', err));
        } catch (err) {
            console.error('Firebase updateStock error:', err);
        }
    }
}

// Inisialisasi Firebase Products dengan Realtime Listener (hanya jika authenticated)
function initFirebaseProducts() {
    // Guard: hanya jalankan jika user sudah login
    if (!isAuthenticated || !currentUser) {
        console.log('⚠️ Firebase products skipped: User not authenticated');
        return;
    }

    db.ref('products').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
            const firebaseProducts = Object.values(data).map(normalizeProduct);
            if (firebaseProducts.length > 0) {
                // Merge dengan defaults dan update local
                products = mergeDefaultsWithStored(DEFAULT_PRODUCTS, firebaseProducts);
                localStorage.setItem('products', JSON.stringify(products));
                firebaseReady = true;

                // Refresh UI jika DOM sudah ready
                if (typeof refreshCurrentProductView === 'function') {
                    refreshCurrentProductView();
                }
                if (typeof refreshAdminModal === 'function') {
                    refreshAdminModal();
                }
                console.log('✅ Firebase products synced:', products.length, 'items');
            }
        } else {
            console.log('⚠️ Firebase products kosong, gunakan LocalStorage');
            firebaseReady = true;
        }
    }, (error) => {
        console.error('❌ Firebase products listener error:', error);
        useFirebase = false;
        firebaseReady = true;
    });
}

// Firebase Init akan dipanggil dari onAuthStateChanged setelah login
// TIDAK dijalankan di sini lagi

let products = loadProducts();

// Cart data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentTransaction = {
    subtotal: 0,
    discount: 0,
    tax: 0, // Default tax 0%
    total: 0
};

const POS_SETTINGS_KEY = 'posSettings';
const TRANSACTION_HISTORY_KEY = 'transaction_history';

// DOM Elements
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const discountAmountEl = document.getElementById('discount-amount');
const taxAmountEl = document.getElementById('tax-amount');
const searchInput = document.getElementById('search-product');
const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
const billAmountEl = document.getElementById('bill-amount');
const amountPaidEl = document.getElementById('amount-paid');
const changeAmountEl = document.getElementById('change-amount');

const settingsCashierNameInput = document.getElementById('settings-cashier-name');
const settingsStaffNameInput = document.getElementById('settings-staff-name');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsModalEl = document.getElementById('settingsModal');
const downloadDailyReportBtn = document.getElementById('download-daily-report-btn');

const adminModalEl = document.getElementById('adminModal');
const openAdminModalBtn = document.getElementById('open-admin-modal');
const adminStockTbody = document.getElementById('admin-stock-tbody');
const adminDailyRefreshBtn = document.getElementById('admin-daily-refresh');
const adminDailyEmptyEl = document.getElementById('admin-daily-empty');
const adminDailyCardsEl = document.getElementById('admin-daily-cards');
const adminDailyOmzetEl = document.getElementById('admin-daily-omzet');
const adminDailyTransactionsEl = document.getElementById('admin-daily-transactions');
const adminDailyItemsEl = document.getElementById('admin-daily-items');
const adminDailyProfitEl = document.getElementById('admin-daily-profit');
const brandDatalist = document.getElementById('brand-list');
const newBrandEl = document.getElementById('new-brand');
const newNameEl = document.getElementById('new-product-name'); // Updated ID
const newPriceEl = document.getElementById('new-product-price'); // Updated ID
const newCostPriceEl = document.getElementById('new-product-cost'); // Updated ID
const newStockEl = document.getElementById('new-product-stock'); // Updated ID
const newImageEl = document.getElementById('new-image');
const saveNewProductBtn = document.getElementById('save-new-product');
const clearCartBtn = document.getElementById('clear-cart-btn');
const adminStockSearchInput = document.getElementById('admin-stock-search');
const adminHistoryTbody = document.getElementById('admin-history-tbody');
const adminHistoryTabBtn = document.getElementById('history-tab');
const analyticsTabBtn = document.getElementById('analytics-tab');
const refreshAnalyticsBtn = document.getElementById('refresh-analytics-btn');

// Brand dropdown & logo elements
const newBrandNameContainer = document.getElementById('new-brand-name-container');
const newBrandNameInput = document.getElementById('new-brand-name-input');
const brandLogoContainer = document.getElementById('brand-logo-container');
const brandLogoInput = document.getElementById('brand-logo-input');
const brandLogoPreview = document.getElementById('brand-logo-preview');

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatDateTimeParts(date) {
    const dd = pad2(date.getDate());
    const mm = pad2(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    const HH = pad2(date.getHours());
    const MM = pad2(date.getMinutes());
    const SS = pad2(date.getSeconds());
    return {
        date: `${dd}/${mm}/${yyyy}`,
        time: `${HH}:${MM}:${SS}`,
        dateTime: `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`
    };
}

function getSettings() {
    const saved = JSON.parse(localStorage.getItem(POS_SETTINGS_KEY) || 'null');
    return {
        cashierName: saved?.cashierName || 'Agung',
        staffName: saved?.staffName || 'Ipeng'
    };
}

function applySettingsToUI() {
    const settings = getSettings();

    if (settingsCashierNameInput) settingsCashierNameInput.value = settings.cashierName;
    if (settingsStaffNameInput) settingsStaffNameInput.value = settings.staffName;

    document.querySelectorAll('.js-cashier-name').forEach(el => {
        el.textContent = settings.cashierName;
    });
    document.querySelectorAll('.js-staff-name').forEach(el => {
        el.textContent = settings.staffName;
    });
}

function saveSettings() {
    const cashierName = (settingsCashierNameInput?.value || '').trim() || 'Agus Prawato Hadi';
    const staffName = (settingsStaffNameInput?.value || '').trim() || 'Agus Prawato Hadi';
    localStorage.setItem(POS_SETTINGS_KEY, JSON.stringify({ cashierName, staffName }));
    applySettingsToUI();
}

function setHeaderDateTime() {
    const now = new Date();
    const parts = formatDateTimeParts(now);
    const formatted = now.toLocaleDateString('id-ID', { weekday: 'long' });
    const text = `${formatted}, ${parts.date} ${parts.time}`;
    document.querySelectorAll('#current-date, #transaction-date').forEach(el => {
        el.textContent = text;
    });
}

function generateTransactionNo(date) {
    const parts = formatDateTimeParts(date);
    const compactDate = parts.date.replaceAll('/', '');
    const compactTime = parts.time.replaceAll(':', '');
    const rand = Math.floor(Math.random() * 1000);
    return `TRX-${compactDate}-${compactTime}-${String(rand).padStart(3, '0')}`;
}

function escapeCSV(value) {
    const s = String(value ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
}

// Variabel global untuk menyimpan transaksi dari Firebase
let firebaseTransactions = [];

function getTransactionHistory() {
    // Prioritas: Firebase jika ada, fallback ke LocalStorage
    if (useFirebase && firebaseTransactions.length > 0) {
        return firebaseTransactions;
    }
    return JSON.parse(localStorage.getItem(TRANSACTION_HISTORY_KEY) || '[]');
}

// Inisialisasi Firebase Transactions dengan Realtime Listener (hanya jika authenticated)
function initFirebaseTransactions() {
    // Guard: hanya jalankan jika user sudah login
    if (!isAuthenticated || !currentUser) {
        console.log('⚠️ Firebase transactions skipped: User not authenticated');
        return;
    }

    db.ref('transactions').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
            // Convert object ke array, tapi simpan Firebase key sebagai firebaseId
            firebaseTransactions = Object.keys(data).map(key => ({
                ...data[key],
                firebaseId: key  // Simpan Firebase key untuk keperluan delete
            }));

            // Juga simpan ke LocalStorage sebagai backup
            localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(firebaseTransactions));

            console.log('✅ Firebase transactions synced:', firebaseTransactions.length, 'items');
        } else {
            // Data kosong di Firebase - reset array lokal juga
            console.log('⚠️ Firebase transactions kosong');
            firebaseTransactions = [];
            localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify([]));
        }

        // Set flag bahwa Firebase sudah ready untuk transactions
        firebaseReady = true;

        // Refresh UI jika DOM sudah ready
        if (typeof renderTransactionHistory === 'function') {
            renderTransactionHistory();
        }
        if (typeof renderAdminDailyStats === 'function') {
            renderAdminDailyStats();
        }
    }, (error) => {
        console.error('❌ Firebase transactions listener error:', error);
        firebaseReady = true; // Still set ready so local fallback works
    });
}

function calculateDailyStats() {
    const history = getTransactionHistory();
    const today = new Date();
    const todays = history.filter(t => {
        const d = new Date(t.date);
        return isSameLocalDate(d, today);
    });

    const totalTransactions = todays.length;
    let totalRevenue = 0;
    let totalItems = 0;
    let totalProfit = 0;

    todays.forEach(t => {
        totalRevenue += Number(t.total) || 0;
        (t.items || []).forEach(it => {
            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            const rawCost = Number(it.costPrice);
            const costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
            totalItems += qty;
            totalProfit += (price - costPrice) * qty;
        });
    });

    return {
        totalRevenue,
        totalTransactions,
        totalItems,
        totalProfit
    };
}

function renderAdminDailyStats() {
    if (!adminDailyEmptyEl || !adminDailyCardsEl) return;
    const s = calculateDailyStats();
    if (!s || s.totalTransactions === 0) {
        adminDailyEmptyEl.classList.remove('d-none');
        adminDailyCardsEl.classList.add('d-none');
        return;
    }

    adminDailyEmptyEl.classList.add('d-none');
    adminDailyCardsEl.classList.remove('d-none');

    if (adminDailyOmzetEl) adminDailyOmzetEl.textContent = `Rp ${formatNumber(s.totalRevenue)}`;
    if (adminDailyTransactionsEl) adminDailyTransactionsEl.textContent = formatNumber(s.totalTransactions);
    if (adminDailyItemsEl) adminDailyItemsEl.textContent = `${formatNumber(s.totalItems)} pcs`;
    if (adminDailyProfitEl) adminDailyProfitEl.textContent = `Rp ${formatNumber(s.totalProfit)}`;
}

// ========================================
// BUSINESS ANALYTICS FUNCTIONS
// ========================================

// Get products with critical stock (≤ 5 units)
function getCriticalStockProducts() {
    const criticalThreshold = 5;
    return products
        .filter(p => p.stock <= criticalThreshold)
        .sort((a, b) => a.stock - b.stock); // Stok terendah di atas
}

// Get top selling products from all transaction history
function getTopSellingProducts(limit = 5) {
    const history = getTransactionHistory();
    const salesMap = new Map(); // productId -> { name, brand, totalQty, totalRevenue }

    history.forEach(transaction => {
        const items = transaction?.items || [];
        items.forEach(item => {
            const id = item.id;
            const name = item.name || 'Unknown';
            const brand = item.brand || '';
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const revenue = qty * price;

            if (salesMap.has(id)) {
                const existing = salesMap.get(id);
                existing.totalQty += qty;
                existing.totalRevenue += revenue;
            } else {
                salesMap.set(id, {
                    id,
                    name,
                    brand,
                    totalQty: qty,
                    totalRevenue: revenue
                });
            }
        });
    });

    // Convert to array and sort by total quantity sold
    return Array.from(salesMap.values())
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, limit);
}

// Render Business Analytics tab content
function renderBusinessAnalytics() {
    // Check authentication
    if (!isAuthenticated || !currentUser) {
        console.log('⚠️ Analytics skipped: User not authenticated');
        return;
    }

    // === Critical Stock Section ===
    const criticalStockEmpty = document.getElementById('critical-stock-empty');
    const criticalStockTable = document.getElementById('critical-stock-table');
    const criticalStockTbody = document.getElementById('critical-stock-tbody');
    const criticalStockThead = criticalStockTable?.querySelector('thead');

    const criticalProducts = getCriticalStockProducts();

    if (criticalStockTbody) {
        criticalStockTbody.innerHTML = '';

        if (criticalProducts.length === 0) {
            if (criticalStockEmpty) criticalStockEmpty.classList.remove('d-none');
            if (criticalStockThead) criticalStockThead.classList.add('d-none');
        } else {
            if (criticalStockEmpty) criticalStockEmpty.classList.add('d-none');
            if (criticalStockThead) criticalStockThead.classList.remove('d-none');

            criticalProducts.forEach(p => {
                const tr = document.createElement('tr');
                const stockClass = p.stock === 0 ? 'bg-danger text-white fw-bold' : 'text-danger fw-bold';
                const stockBadge = p.stock === 0
                    ? '<span class="badge bg-dark">HABIS</span>'
                    : `<span class="badge bg-danger">${p.stock}</span>`;

                tr.innerHTML = `
                    <td>
                        <div class="fw-semibold">${p.name}</div>
                        <small class="text-muted">${p.brand}</small>
                    </td>
                    <td class="text-center">${stockBadge}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-primary" 
                                onclick="focusStockInput(${p.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </td>
                `;
                criticalStockTbody.appendChild(tr);
            });
        }
    }

    // === Top Selling Products Section ===
    const topProductsEmpty = document.getElementById('top-products-empty');
    const topProductsTable = document.getElementById('top-products-table');
    const topProductsTbody = document.getElementById('top-products-tbody');
    const topProductsThead = topProductsTable?.querySelector('thead');

    const topProducts = getTopSellingProducts(5);

    if (topProductsTbody) {
        topProductsTbody.innerHTML = '';

        if (topProducts.length === 0) {
            if (topProductsEmpty) topProductsEmpty.classList.remove('d-none');
            if (topProductsThead) topProductsThead.classList.add('d-none');
        } else {
            if (topProductsEmpty) topProductsEmpty.classList.add('d-none');
            if (topProductsThead) topProductsThead.classList.remove('d-none');

            topProducts.forEach((p, index) => {
                const tr = document.createElement('tr');
                const rankBadge = index === 0
                    ? '<span class="badge bg-warning text-dark"><i class="bi bi-trophy-fill"></i> 1</span>'
                    : index === 1
                        ? '<span class="badge bg-secondary">2</span>'
                        : index === 2
                            ? '<span class="badge bg-dark">3</span>'
                            : `<span class="badge bg-light text-dark">${index + 1}</span>`;

                tr.innerHTML = `
                    <td class="text-center">${rankBadge}</td>
                    <td>
                        <div class="fw-semibold">${p.name}</div>
                        <small class="text-muted">${p.brand}</small>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-success">${formatNumber(p.totalQty)} pcs</span>
                    </td>
                    <td class="text-end fw-semibold text-success">Rp ${formatNumber(p.totalRevenue)}</td>
                `;
                topProductsTbody.appendChild(tr);
            });
        }
    }

    console.log('✅ Business analytics rendered:', criticalProducts.length, 'critical,', topProducts.length, 'top sellers');
}

// Helper function to focus on stock input in Manage Stock tab
function focusStockInput(productId) {
    // Switch to stock tab
    const stockTab = document.getElementById('stock-tab');
    if (stockTab) {
        stockTab.click();

        // Wait for tab switch, then scroll to and focus the input
        setTimeout(() => {
            const input = document.querySelector(`input[data-action="set"][data-id="${productId}"]`);
            if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
                input.select();
            }
        }, 300);
    }
}

function renderTransactionHistory() {
    if (!adminHistoryTbody) return;
    const history = getTransactionHistory();
    const sorted = [...history].sort((a, b) => {
        const da = new Date(a?.date || 0).getTime();
        const dbTime = new Date(b?.date || 0).getTime();
        return dbTime - da; // Terbaru di atas
    });

    adminHistoryTbody.innerHTML = '';
    sorted.forEach(t => {
        const txNo = String(t?.transactionNo || '');
        const d = new Date(t?.date || Date.now());
        const parts = formatDateTimeParts(d);

        // Ambil nama produk dari items
        const items = t?.items || [];
        let productNames = '';
        let totalQty = 0;

        if (items.length > 0) {
            // Tampilkan semua nama produk + qty (tanpa batasan panjang)
            productNames = items.map(it => {
                const name = it.name || it.itemName || 'Produk';
                const qty = Number(it.quantity) || 1;
                totalQty += qty;
                return `${name} x${qty}`;
            }).join(', ');
        } else {
            productNames = 'Tidak ada item';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="vertical-align: top;">
                <div class="fw-semibold" style="word-wrap: break-word; white-space: normal; line-height: 1.4; max-width: 350px;">${productNames}</div>
                <small class="text-muted">${parts.dateTime}</small>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <div class="fw-bold">Rp ${formatNumber(Number(t?.total) || 0)}</div>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <button type="button" class="btn btn-sm btn-outline-primary" data-action="reprint" data-tx="${txNo}">Cetak</button>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-tx="${txNo}" aria-label="Hapus">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        adminHistoryTbody.appendChild(tr);
    });
}

function reprintTransaction(transactionNo) {
    const txNo = String(transactionNo || '').trim();
    if (!txNo) return;
    const history = getTransactionHistory();
    const trx = history.find(t => String(t?.transactionNo || '') === txNo);
    if (!trx) {
        showAlert('Transaksi tidak ditemukan', 'warning');
        return;
    }
    showReceipt(trx);
}

function deleteTransaction(transactionNo) {
    const txNo = String(transactionNo || '').trim();
    if (!txNo) return;

    if (!confirm(`Hapus transaksi ${txNo}?`)) return;

    const history = getTransactionHistory();
    const trx = history.find(t => String(t?.transactionNo || '') === txNo);

    if (!trx) {
        showAlert('Transaksi tidak ditemukan', 'warning');
        return;
    }

    // Jika menggunakan Firebase dan transaksi memiliki firebaseId
    if (useFirebase && firebaseReady && trx.firebaseId) {
        // Hapus dari Firebase
        db.ref('transactions/' + trx.firebaseId).remove()
            .then(() => {
                console.log('✅ Transaksi berhasil dihapus dari Firebase:', txNo);

                // Update array lokal segera untuk UI responsif
                firebaseTransactions = firebaseTransactions.filter(
                    t => String(t?.transactionNo || '') !== txNo
                );

                // Update localStorage juga
                localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(firebaseTransactions));

                // Refresh UI
                renderTransactionHistory();
                renderAdminDailyStats();

                showAlert('Transaksi dihapus', 'success');
            })
            .catch(err => {
                console.error('❌ Gagal menghapus transaksi dari Firebase:', err);
                showAlert('Gagal menghapus transaksi: ' + err.message, 'danger');
            });
    } else {
        // Fallback: hapus dari localStorage saja
        const next = history.filter(t => String(t?.transactionNo || '') !== txNo);
        localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(next));

        // Jika ada firebaseTransactions, update juga
        if (firebaseTransactions.length > 0) {
            firebaseTransactions = firebaseTransactions.filter(
                t => String(t?.transactionNo || '') !== txNo
            );
        }

        renderTransactionHistory();
        renderAdminDailyStats();
        showAlert('Transaksi dihapus', 'success');
    }
}

function saveTransactionToHistory(transactionData) {
    // Simpan ke LocalStorage
    const history = getTransactionHistory();
    history.push(transactionData);
    localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(history));

    // Simpan ke Firebase
    if (useFirebase && firebaseReady) {
        try {
            // Bersihkan data yang tidak bisa di-serialize (Date objects)
            const cleanData = JSON.parse(JSON.stringify(transactionData));
            db.ref('transactions').push(cleanData)
                .then(() => console.log('✅ Transaksi saved to Firebase'))
                .catch(err => console.error('Firebase saveTransaction error:', err));
        } catch (err) {
            console.error('Firebase saveTransaction error:', err);
        }
    }
}

function isSameLocalDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function downloadCSV(csv, filename) {
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadDailyReport() {
    const history = getTransactionHistory();
    const today = new Date();
    const todayParts = formatDateTimeParts(today);
    const fileDate = todayParts.date.replaceAll('/', '-');
    const filename = `Rekap_Harian_${fileDate}.csv`;

    const todays = history.filter(t => {
        const d = new Date(t.date);
        return isSameLocalDate(d, today);
    });

    if (todays.length === 0) {
        showAlert('Belum ada transaksi hari ini', 'warning');
        return;
    }

    let grandTotal = 0;
    let grandProfit = 0;

    const header = 'Tanggal,Jam,No Transaksi,Kasir,Item,Nominal,Harga Modal,Laba per Item';
    const rows = [];

    todays.forEach(t => {
        const d = new Date(t.date);
        const parts = formatDateTimeParts(d);
        const jam = parts.time.slice(0, 5);
        const kasir = t.cashier || '';
        const noTrx = t.transactionNo || '';

        (t.items || []).forEach(it => {
            const itemName = it.quantity && it.quantity > 1 ? `${it.name} x${it.quantity}` : it.name;
            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            const nominal = price * qty;
            const rawCost = Number(it.costPrice);
            const costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
            const profit = (price - costPrice) * qty;
            grandTotal += nominal;
            grandProfit += profit;

            rows.push([
                parts.date,
                jam,
                noTrx,
                kasir,
                itemName,
                nominal,
                costPrice,
                profit
            ].map(escapeCSV).join(','));
        });
    });

    const summaryRowRevenue = ['TOTAL PENDAPATAN HARI INI', '', '', '', '', grandTotal, '', ''].map(escapeCSV).join(',');
    const summaryRowProfit = ['TOTAL LABA HARI INI', '', '', '', '', '', '', grandProfit].map(escapeCSV).join(',');
    const csv = `${header}\n${rows.join('\n')}\n\n${summaryRowRevenue}\n${summaryRowProfit}`;
    downloadCSV(csv, filename);
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// Login function dengan auto-append @dewaban.com
function loginWithEmail(username, password) {
    const email = username.includes('@') ? username : `${username}@dewaban.com`;

    return auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('✅ Login berhasil:', userCredential.user.email);
            return userCredential.user;
        })
        .catch((error) => {
            console.error('❌ Login error:', error);
            throw error;
        });
}

// Logout function
function logout() {
    return auth.signOut()
        .then(() => {
            console.log('✅ Logout berhasil');
        })
        .catch((error) => {
            console.error('❌ Logout error:', error);
            throw error;
        });
}

// Extract username dari email
function getUsernameFromEmail(email) {
    if (!email) return '';
    return email.replace('@dewaban.com', '');
}

// Update profile button display
function updateProfileButton(user) {
    const profileStatus = document.getElementById('profile-status');
    const profileUsername = document.getElementById('profile-username');

    if (user && profileUsername) {
        const username = getUsernameFromEmail(user.email);
        profileUsername.textContent = username;
        // Add click handler to profile status for logout
        if (profileStatus) {
            profileStatus.style.cursor = 'pointer';
            profileStatus.title = 'Klik untuk logout';
        }
    } else if (profileUsername) {
        profileUsername.textContent = '-';
        if (profileStatus) {
            profileStatus.style.cursor = 'default';
            profileStatus.title = '';
        }
    }
}

// Auth State Listener - This is the core of the auth system
auth.onAuthStateChanged((user) => {
    currentUser = user;
    isAuthenticated = !!user;

    if (user) {
        console.log('✅ User logged in:', user.email);

        // Update UI
        updateProfileButton(user);

        // Hide login modal
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
            const loginModal = bootstrap.Modal.getInstance(loginModalEl);
            if (loginModal) {
                loginModal.hide();
            }
        }

        // Initialize Firebase data listeners (sekarang aman karena authenticated)
        try {
            initFirebaseProducts();
            initFirebaseTransactions();
        } catch (err) {
            console.error('Firebase init error:', err);
            useFirebase = false;
            firebaseReady = true;
        }

        // Clear old session storage
        sessionStorage.removeItem('isLoggedIn');

    } else {
        console.log('⚠️ User not logged in');

        // Update UI
        updateProfileButton(null);

        // Show login modal
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        }

        // Clear auth state
        isAuthenticated = false;
        currentUser = null;
        useFirebase = false;
        firebaseReady = true;
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    applySettingsToUI();
    setHeaderDateTime();
    setInterval(setHeaderDateTime, 1000);

    // Load products and cart
    renderBrandList();
    updateCart();

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    document.getElementById('process-payment').addEventListener('click', showPaymentModal);
    document.getElementById('complete-payment').addEventListener('click', completePayment);
    discountEl.addEventListener('input', updateTotals);
    taxEl.addEventListener('input', updateTotals);
    amountPaidEl.addEventListener('input', calculateChange);

    // Authentication event listeners
    const loginBtn = document.getElementById('login-btn');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = loginUsernameInput?.value?.trim();
            const password = loginPasswordInput?.value?.trim();

            if (!username || !password) {
                if (loginErrorMessage) {
                    loginErrorMessage.textContent = 'Username dan password harus diisi';
                    loginErrorMessage.classList.remove('d-none');
                }
                return;
            }

            // Disable button saat login
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Login...';

            try {
                await loginWithEmail(username, password);
                // Success handled by onAuthStateChanged
                if (loginErrorMessage) {
                    loginErrorMessage.classList.add('d-none');
                }
                if (loginUsernameInput) loginUsernameInput.value = '';
                if (loginPasswordInput) loginPasswordInput.value = '';
            } catch (error) {
                console.error('Login error:', error);
                if (loginErrorMessage) {
                    let message = 'Login gagal. Periksa username dan password.';
                    if (error.code === 'auth/user-not-found') {
                        message = 'Username tidak ditemukan';
                    } else if (error.code === 'auth/wrong-password') {
                        message = 'Password salah';
                    } else if (error.code === 'auth/invalid-email') {
                        message = 'Format email tidak valid';
                    } else if (error.code === 'auth/too-many-requests') {
                        message = 'Terlalu banyak percobaan. Tunggu sebentar.';
                    }
                    loginErrorMessage.textContent = message;
                    loginErrorMessage.classList.remove('d-none');
                }
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
            }
        });
    }

    // Enter key support untuk login
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn?.click();
            }
        });
    }

    // Profile status - show user info or login modal
    const profileStatus = document.getElementById('profile-status');
    if (profileStatus) {
        profileStatus.addEventListener('click', () => {
            if (isAuthenticated && currentUser) {
                // Show logout confirmation
                if (confirm(`Logout dari akun ${getUsernameFromEmail(currentUser.email)}?`)) {
                    logout();
                }
            } else {
                // Show login modal
                const loginModalEl = document.getElementById('loginModal');
                if (loginModalEl) {
                    const loginModal = new bootstrap.Modal(loginModalEl);
                    loginModal.show();
                }
            }
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettings();
            const modal = bootstrap.Modal.getInstance(settingsModalEl);
            if (modal) modal.hide();
            showAlert('Pengaturan disimpan', 'success');
        });
    }

    if (adminHistoryTbody) {
        adminHistoryTbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const txNo = btn.dataset.tx;
            const action = btn.dataset.action;
            if (action === 'reprint') reprintTransaction(txNo);
            if (action === 'delete') deleteTransaction(txNo);
        });
    }

    if (adminHistoryTabBtn) {
        adminHistoryTabBtn.addEventListener('shown.bs.tab', () => {
            renderTransactionHistory();
        });
    }

    if (downloadDailyReportBtn) {
        downloadDailyReportBtn.addEventListener('click', () => {
            downloadDailyReport();
        });
    }

    if (settingsModalEl) {
        settingsModalEl.addEventListener('show.bs.modal', () => {
            applySettingsToUI();
        });
    }

    if (openAdminModalBtn && adminModalEl) {
        const modal = new bootstrap.Modal(adminModalEl);
        openAdminModalBtn.addEventListener('click', () => {
            refreshAdminModal();
            renderAdminDailyStats();
            renderTransactionHistory();
            renderBusinessAnalytics();
            modal.show();
        });

        adminModalEl.addEventListener('show.bs.modal', () => {
            refreshAdminModal();
            renderAdminDailyStats();
            renderTransactionHistory();
            renderBusinessAnalytics();
        });
    }

    if (adminDailyRefreshBtn) {
        adminDailyRefreshBtn.addEventListener('click', () => {
            renderAdminDailyStats();
        });
    }

    if (saveNewProductBtn) {
        saveNewProductBtn.addEventListener('click', () => {
            addNewProductFromForm();
        });
    }

    // Image preview when file is selected
    if (newImageEl) {
        newImageEl.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('image-preview');

            if (file && preview) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showAlert('File harus berupa gambar', 'warning');
                    e.target.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('Ukuran gambar maksimal 5MB', 'warning');
                    e.target.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            } else if (preview) {
                preview.src = 'img/logo.png';
            }
        });
    }

    if (adminStockSearchInput) {
        adminStockSearchInput.addEventListener('input', filterAdminStockRows);
    }

    if (adminStockTbody) {
        adminStockTbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            if (action === 'delete') {
                deleteProduct(id);
                return;
            }

            const p = products.find(pp => pp.id === id);
            if (!p) return;

            if (action === 'inc') {
                p.stock += 1;
            } else if (action === 'dec') {
                p.stock = Math.max(0, p.stock - 1);
            }
            saveProducts();
            refreshAdminModal();
            syncCartStockFromProducts();
            refreshCurrentProductView();
        });

        adminStockTbody.addEventListener('change', (e) => {
            const input = e.target.closest('input[data-action]');
            if (!input) return;
            const id = Number(input.dataset.id);
            const action = input.dataset.action;
            const value = Number(input.value);
            const p = products.find(pp => pp.id === id);
            if (!p) return;

            if (action === 'set') {
                p.stock = Math.max(0, Number.isFinite(value) ? value : p.stock);
            } else if (action === 'costPrice') {
                p.costPrice = Math.max(0, Number.isFinite(value) ? value : p.costPrice);
            } else if (action === 'price') {
                p.price = Math.max(0, Number.isFinite(value) ? value : p.price);
            } else {
                return;
            }

            saveProducts();
            refreshAdminModal();
            syncCartStockFromProducts();
            refreshCurrentProductView();
        });
    }

    // Analytics tab event listeners
    if (analyticsTabBtn) {
        analyticsTabBtn.addEventListener('shown.bs.tab', () => {
            renderBusinessAnalytics();
        });
    }

    if (refreshAnalyticsBtn) {
        refreshAnalyticsBtn.addEventListener('click', () => {
            renderBusinessAnalytics();
            showAlert('Data analisis diperbarui', 'success');
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            resetCart();
        });
    }
});

// Display products in the product list
function displayProducts(productsToDisplay) {
    if (productsToDisplay.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'col-12 text-center py-4';
        emptyState.textContent = 'Produk tidak ditemukan';
        productList.appendChild(emptyState);
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-6 col-md-4 col-lg-3 mb-3';
        const imgSrc = withCacheBuster(product.image);
        productCard.innerHTML = `
            <div class="card product-card h-100" data-id="${product.id}">
                <img src="${imgSrc}" class="card-img-top" alt="${product.name}" onerror="this.onerror=null;this.src='img/logo.png?v=1';">
                <div class="card-body p-2">
                    <h6 class="card-title">${product.name}</h6>
                    <p class="card-text">Rp ${formatNumber(product.price)}</p>
                    <small class="text-muted">Stok: ${product.stock}</small>
                </div>
            </div>
        `;

        productCard.addEventListener('click', () => addToCart(product));
        productList.appendChild(productCard);
    });
}

// Handle product search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const trimmed = searchTerm.trim();
    if (trimmed.length === 0) {
        activeBrand = null;
        activeView = 'brands';
        renderBrandList();
        return;
    }

    activeBrand = null;
    activeView = 'search';
    const filteredProducts = products.filter(product => {
        return (
            product.name.toLowerCase().includes(trimmed) ||
            product.brand.toLowerCase().includes(trimmed) ||
            product.id.toString().includes(trimmed)
        );
    });
    renderProductsWithHeader(`Hasil Pencarian: ${searchInput.value}`, filteredProducts, true);
}

let activeBrand = null;
let activeView = 'brands';

function getBrandImage(brandName) {
    const slug = String(brandName || '').toLowerCase().replace(/\s+/g, '');
    return withCacheBuster(`img/${slug}.png`);
}

function getUniqueBrands() {
    const set = new Set(products.map(p => p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function renderBrandList() {
    activeView = 'brands';
    activeBrand = null;

    const brands = getUniqueBrands();

    productList.innerHTML = '';

    brands.forEach(brand => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3 mb-3';
        const image = getBrandImage(brand);

        col.innerHTML = `
            <div class="card product-card h-100" data-brand="${brand}">
                <img src="${image}" class="card-img-top" alt="${brand}" onerror="this.onerror=null;this.src='img/logo.png?v=1';">
                <div class="card-body p-2 text-center">
                    <h6 class="card-title mb-0">${brand}</h6>
                </div>
            </div>
        `;

        col.querySelector('.product-card').addEventListener('click', () => {
            showProductsByBrand(brand);
        });

        productList.appendChild(col);
    });
}

function filterAdminStockRows() {
    if (!adminStockSearchInput || !adminStockTbody) return;
    const q = (adminStockSearchInput.value || '').trim().toLowerCase();

    adminStockTbody.querySelectorAll('tr').forEach(tr => {
        const hay = String(tr.dataset.search || '').toLowerCase();
        tr.style.display = q.length === 0 || hay.includes(q) ? '' : 'none';
    });
}

function renderProductsWithHeader(title, productsToDisplay, showBackToBrands) {
    productList.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'col-12 d-flex align-items-center justify-content-between mb-2';
    header.innerHTML = `
        <div class="d-flex align-items-center">
            ${showBackToBrands ? '<button type="button" class="btn btn-sm btn-outline-secondary" id="back-to-brands"><i class="bi bi-arrow-left"></i> Back</button>' : ''}
            <span class="ms-2 fw-semibold">${title}</span>
        </div>
    `;
    productList.appendChild(header);

    if (showBackToBrands) {
        const backBtn = header.querySelector('#back-to-brands');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                searchInput.value = '';
                renderBrandList();
            });
        }
    }

    displayProducts(productsToDisplay);
}

function showProductsByBrand(brandName) {
    activeView = 'brand';
    activeBrand = brandName;
    const filtered = products.filter(p => p.brand === brandName);
    renderProductsWithHeader(brandName, filtered, true);
}

function refreshCurrentProductView() {
    const query = (searchInput?.value || '').trim();
    if (query.length > 0) {
        handleSearch();
        return;
    }
    if (activeView === 'brand' && activeBrand) {
        showProductsByBrand(activeBrand);
        return;
    }
    renderBrandList();
}

function syncCartStockFromProducts() {
    if (!Array.isArray(cart) || cart.length === 0) return;
    let changed = false;
    cart = cart
        .map(item => {
            const p = products.find(pp => pp.id === item.id);
            if (!p) return item;
            const next = { ...item, stock: p.stock, price: p.price, costPrice: p.costPrice, name: p.name };
            if (next.stock !== item.stock || next.price !== item.price || next.name !== item.name) {
                changed = true;
            }
            if (next.quantity > next.stock) {
                next.quantity = next.stock;
                changed = true;
            }
            return next;
        })
        .filter(item => item.quantity > 0);

    if (changed) {
        saveCart();
        updateCart();
    }
}

function getNextProductId() {
    const maxId = products.reduce((m, p) => (p.id > m ? p.id : m), 0);
    return maxId + 1;
}

function refreshBrandDatalist() {
    if (!brandDatalist) return;
    brandDatalist.innerHTML = '';
    getUniqueBrands().forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        brandDatalist.appendChild(opt);
    });
}

function deleteProduct(productId) {
    const id = Number(productId);
    const p = products.find(pp => pp.id === id);
    if (!p) return;

    const ok = confirm(`Hapus ${p.name} secara permanen dari sistem?`);
    if (!ok) return;

    products = products.filter(pp => pp.id !== id);
    saveProducts();

    if (Array.isArray(cart) && cart.length > 0) {
        const before = cart.length;
        cart = cart.filter(it => it.id !== id);
        if (cart.length !== before) {
            saveCart();
            updateCart();
        }
    }

    refreshCurrentProductView();
    refreshAdminModal();
}

function refreshAdminModal() {
    refreshBrandDatalist();
    if (!adminStockTbody) return;

    const sorted = [...products].sort((a, b) => {
        const byBrand = a.brand.localeCompare(b.brand);
        if (byBrand !== 0) return byBrand;
        return a.name.localeCompare(b.name);
    });

    adminStockTbody.innerHTML = '';
    sorted.forEach(p => {
        const tr = document.createElement('tr');
        tr.dataset.search = `${p.name} ${p.brand}`;
        tr.innerHTML = `
            <td>
                <div class="fw-semibold">${p.name}</div>
                <div class="small text-muted">${p.brand}</div>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary" type="button" data-action="dec" data-id="${p.id}">-</button>
                    <input type="number" class="form-control" min="0" value="${p.stock}" data-action="set" data-id="${p.id}">
                    <button class="btn btn-outline-secondary" type="button" data-action="inc" data-id="${p.id}">+</button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm" min="0" value="${p.costPrice}" data-action="costPrice" data-id="${p.id}">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm" min="0" value="${p.price}" data-action="price" data-id="${p.id}">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${p.id}" aria-label="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        adminStockTbody.appendChild(tr);
    });

    filterAdminStockRows();
}

function updateProductStock(productId, newStock) {
    const nextStock = Math.max(0, Number(newStock) || 0);
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    products[idx] = { ...products[idx], stock: nextStock };
    saveProducts();
    syncCartStockFromProducts();
    refreshCurrentProductView();
    refreshAdminModal();
}

// ========================================
// IMAGE UPLOAD FUNCTIONS
// ========================================

// Upload image to Cloudinary (Free tier, no billing issues!)
async function uploadImageToStorage(file, productId) {
    // Check authentication
    console.log('🔍 Upload Debug:', {
        isAuthenticated,
        currentUser: currentUser?.email,
        uid: currentUser?.uid,
        fileSize: `${Math.round(file.size / 1024)}KB`,
        fileType: file.type
    });

    if (!isAuthenticated || !currentUser) {
        throw new Error('Anda harus login untuk mengupload gambar');
    }

    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME = 'dxdstqvad';
    const CLOUDINARY_UPLOAD_PRESET = 'dewa_ban_preset';
    const CLOUDINARY_FOLDER = 'produk_dewa_ban';
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Create unique public_id for the image
    const timestamp = Date.now();
    const publicId = `${CLOUDINARY_FOLDER}/${productId}_${timestamp}`;

    console.log('📤 Uploading to Cloudinary:', publicId);

    // Get UI elements for progress
    const progressBar = document.getElementById('upload-progress');
    const progressFill = progressBar?.querySelector('.progress-bar');
    const uploadStatus = document.getElementById('upload-status');

    try {
        // Show progress bar
        if (progressBar) progressBar.classList.remove('d-none');
        if (uploadStatus) {
            uploadStatus.classList.remove('d-none');
            uploadStatus.textContent = 'Mengupload gambar ke Cloudinary...';
            uploadStatus.classList.remove('text-danger', 'text-success');
            uploadStatus.classList.add('text-muted');
        }

        // Simulate progress (Cloudinary doesn't provide real-time progress via fetch)
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90 && progressFill) {
                progressFill.style.width = progress + '%';
            }
        }, 200);

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('public_id', publicId);
        formData.append('folder', CLOUDINARY_FOLDER);

        console.log('📦 FormData prepared:', {
            fileSize: file.size,
            fileName: file.name,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            publicId: publicId
        });

        // Upload to Cloudinary
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        // Clear progress interval
        clearInterval(progressInterval);

        // Check response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        // Parse response
        const data = await response.json();

        console.log('✅ Cloudinary response:', {
            secure_url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes
        });

        // Complete progress bar
        if (progressFill) progressFill.style.width = '100%';

        // Hide progress bar and show success
        setTimeout(() => {
            if (progressBar) progressBar.classList.add('d-none');
            if (uploadStatus) {
                uploadStatus.textContent = 'Upload berhasil!';
                uploadStatus.classList.remove('text-muted');
                uploadStatus.classList.add('text-success');
            }
        }, 500);

        console.log('✅ Image uploaded successfully:', data.secure_url);

        // Return the secure URL (this will be saved to Firebase Realtime Database)
        return data.secure_url;

    } catch (error) {
        // Clear progress interval if any
        if (progressInterval) clearInterval(progressInterval);

        // Handle errors dengan detail logging
        console.error('❌ Cloudinary upload error:', {
            message: error.message,
            error: error
        });

        // Show user-friendly error message
        const errorMessage = `Upload gagal: ${error.message}`;

        if (progressBar) progressBar.classList.add('d-none');
        if (uploadStatus) {
            uploadStatus.classList.remove('d-none');
            uploadStatus.textContent = errorMessage;
            uploadStatus.classList.remove('text-muted', 'text-success');
            uploadStatus.classList.add('text-danger');
        }

        // Re-throw error untuk di-handle oleh caller
        throw error;
    }
}

// Compress image before upload with aggressive compression targeting 100KB-200KB
function compressImage(file, targetMinSize = 100 * 1024, targetMaxSize = 200 * 1024) {
    return new Promise((resolve) => {
        // If file is already within target range, use it
        if (file.size >= targetMinSize && file.size <= targetMaxSize) {
            console.log(`Image already optimal: ${file.size} bytes`);
            resolve(file);
            return;
        }

        // If file is smaller than minimum, don't compress
        if (file.size < targetMinSize) {
            console.log(`Image too small to compress: ${file.size} bytes`);
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Helper function to compress with specific parameters
                const compressWithParams = (maxWidth, quality) => {
                    return new Promise((resolveCompress) => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Calculate new dimensions
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            resolveCompress(blob);
                        }, 'image/jpeg', quality);
                    });
                };

                // Iterative compression algorithm
                const findOptimalCompression = async () => {
                    const originalSize = file.size;

                    // Start with aggressive settings for large files (5MB+)
                    let maxWidth = originalSize > 5 * 1024 * 1024 ? 600 : 800;
                    let quality = originalSize > 5 * 1024 * 1024 ? 0.6 : 0.7;

                    let blob = await compressWithParams(maxWidth, quality);

                    // If still too large, reduce further
                    while (blob.size > targetMaxSize && (maxWidth > 400 || quality > 0.3)) {
                        if (blob.size > targetMaxSize * 2) {
                            // Much too large, reduce both dimensions and quality
                            maxWidth = Math.max(400, Math.round(maxWidth * 0.8));
                            quality = Math.max(0.3, quality - 0.1);
                        } else {
                            // Slightly too large, reduce quality only
                            quality = Math.max(0.3, quality - 0.05);
                        }
                        blob = await compressWithParams(maxWidth, quality);
                    }

                    // If too small, try to increase quality (but prioritize speed)
                    if (blob.size < targetMinSize && quality < 0.85) {
                        quality = Math.min(0.85, quality + 0.1);
                        const newBlob = await compressWithParams(maxWidth, quality);
                        if (newBlob.size <= targetMaxSize) {
                            blob = newBlob;
                        }
                    }

                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    const compressionRatio = ((1 - compressedFile.size / originalSize) * 100).toFixed(1);
                    console.log(`✅ Image compressed: ${Math.round(originalSize / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB (${compressionRatio}% reduction)`);

                    resolve(compressedFile);
                };

                findOptimalCompression();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Reset upload UI state
function resetUploadUI() {
    const progressBar = document.getElementById('upload-progress');
    const progressFill = progressBar?.querySelector('.progress-bar');
    const uploadStatus = document.getElementById('upload-status');
    const imagePreview = document.getElementById('image-preview');

    if (progressBar) progressBar.classList.add('d-none');
    if (progressFill) progressFill.style.width = '0%';
    if (uploadStatus) {
        uploadStatus.classList.add('d-none');
        uploadStatus.textContent = '';
        uploadStatus.classList.remove('text-success', 'text-danger');
        uploadStatus.classList.add('text-muted');
    }
    if (imagePreview) imagePreview.src = 'img/logo.png';
}

// ========================================
// BRAND DROPDOWN & LOGO FUNCTIONS
// ========================================

// Get unique brands from products
function getUniqueBrands() {
    const brandsSet = new Set();
    products.forEach(p => {
        if (p.brand && p.brand.trim() !== '') {
            brandsSet.add(p.brand.toUpperCase());
        }
    });
    return Array.from(brandsSet).sort();
}

// Get logo URL for a specific brand (from existing products)
function getBrandLogoUrl(brandName) {
    const brandUpper = brandName.toUpperCase();
    const productWithLogo = products.find(p => p.brand.toUpperCase() === brandUpper && p.logo);
    return productWithLogo?.logo || 'img/logo.png'; // Fallback to default if not found
}

// Populate brand dropdown with existing brands
function populateBrandDropdown() {
    if (!newBrandEl) return;

    const uniqueBrands = getUniqueBrands();

    // Clear existing options except first and last (-- Pilih -- and + TAMBAH BRAND BARU)
    while (newBrandEl.options.length > 2) {
        newBrandEl.remove(1); // Remove from index 1 (after "-- Pilih --")
    }

    // Add existing brands
    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        // Insert before the last option (+ TAMBAH BRAND BARU)
        newBrandEl.insertBefore(option, newBrandEl.lastElementChild);
    });

    console.log('✅ Brand dropdown populated:', uniqueBrands.length, 'brands');
}

// Toggle brand logo input visibility based on dropdown selection
function toggleBrandLogoInput() {
    const selectedValue = newBrandEl?.value;

    if (selectedValue === '__NEW_BRAND__') {
        // Show input for new brand name and logo
        if (newBrandNameContainer) newBrandNameContainer.style.display = 'block';
        if (brandLogoContainer) brandLogoContainer.style.display = 'block';
    } else {
        // Hide inputs
        if (newBrandNameContainer) newBrandNameContainer.style.display = 'none';
        if (brandLogoContainer) brandLogoContainer.style.display = 'none';

        // Reset inputs
        if (newBrandNameInput) newBrandNameInput.value = '';
        if (brandLogoInput) brandLogoInput.value = '';
        if (brandLogoPreview) brandLogoPreview.src = 'img/logo.png';
    }
}

async function addNewProductFromForm() {
    // Get brand selection
    const brandSelection = newBrandEl?.value?.trim() || '';
    const isNewBrand = brandSelection === '__NEW_BRAND__';

    // Determine actual brand name
    let brand = '';
    if (isNewBrand) {
        brand = (newBrandNameInput?.value || '').trim().toUpperCase();
    } else {
        brand = brandSelection;
    }

    const name = (newNameEl?.value || '').trim();
    const price = Number(newPriceEl?.value) || 0;
    const costRaw = (newCostPriceEl?.value ?? '').toString();
    const costPrice = costRaw.trim().length === 0 ? NaN : Number(costRaw);
    const stock = Math.max(0, Number(newStockEl?.value) || 0);

    // Get files from file inputs
    const productImageFile = newImageEl?.files?.[0];
    const brandLogoFile = brandLogoInput?.files?.[0];

    // Validation
    if (!isAuthenticated || !currentUser) {
        showAlert('Anda harus login untuk menambah produk', 'danger');
        return;
    }
    if (!brand) {
        showAlert(isNewBrand ? 'Nama brand baru wajib diisi' : 'Brand wajib dipilih', 'warning');
        return;
    }
    if (isNewBrand && !brandLogoFile) {
        showAlert('Logo brand baru wajib diupload', 'warning');
        return;
    }
    if (!name) {
        showAlert('Nama produk wajib diisi', 'warning');
        return;
    }
    if (price < 0) {
        showAlert('Harga tidak valid', 'warning');
        return;
    }
    if (Number.isFinite(costPrice) && costPrice < 0) {
        showAlert('Harga modal tidak valid', 'warning');
        return;
    }

    // Disable save button during processing
    const saveBtn = document.getElementById('save-new-product');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
    }

    try {
        const productId = getNextProductId();
        let productImageUrl = 'img/logo.png'; // Default fallback for product
        let brandLogoUrl = '';

        // STEP 1: Upload brand logo if new brand
        if (isNewBrand && brandLogoFile) {
            try {
                console.log('📤 Uploading brand logo for new brand:', brand);
                const compressedLogo = await compressImage(brandLogoFile);
                brandLogoUrl = await uploadImageToStorage(compressedLogo, `brand_${brand.toLowerCase()}`);
                console.log('✅ Brand logo uploaded:', brandLogoUrl);
            } catch (logoError) {
                console.error('Brand logo upload failed:', logoError);
                showAlert('Gagal mengupload logo brand: ' + logoError.message, 'danger');
                // Reset button
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Simpan Produk Baru';
                }
                return; // Stop if logo upload fails for new brand
            }
        } else {
            // Use existing brand logo
            brandLogoUrl = getBrandLogoUrl(brand);
            console.log('📋 Using existing logo for brand:', brand, '→', brandLogoUrl);
        }

        // STEP 2: Upload product image if file is selected
        if (productImageFile) {
            try {
                console.log('📤 Uploading product image...');
                const compressedFile = await compressImage(productImageFile);
                productImageUrl = await uploadImageToStorage(compressedFile, productId);
                console.log('✅ Product image uploaded:', productImageUrl);
            } catch (uploadError) {
                console.error('Product image upload failed:', uploadError);
                showAlert('Gagal mengupload gambar produk: ' + uploadError.message, 'danger');
                // Continue with default image
                productImageUrl = 'img/logo.png';
            }
        }

        // STEP 3: Create product object with logo
        const newProduct = normalizeProduct({
            id: productId,
            brand,
            name,
            price,
            costPrice,
            stock,
            image: productImageUrl,
            logo: brandLogoUrl  // ← NEW: Logo URL for brand
        });

        products.push(newProduct);
        saveProducts();
        refreshCurrentProductView();
        refreshAdminModal();
        populateBrandDropdown(); // ← Refresh dropdown after adding

        // Reset form
        if (newBrandEl) newBrandEl.value = '';
        if (newBrandNameInput) newBrandNameInput.value = '';
        if (newNameEl) newNameEl.value = '';
        if (newPriceEl) newPriceEl.value = '';
        if (newCostPriceEl) newCostPriceEl.value = '';
        if (newStockEl) newStockEl.value = '0';
        if (newImageEl) newImageEl.value = '';
        if (brandLogoInput) brandLogoInput.value = '';
        resetUploadUI();

        // Reset brand logo preview
        if (brandLogoPreview) brandLogoPreview.src = 'img/logo.png';

        showAlert(`Produk ${name} berhasil ditambahkan!`, 'success');
    } catch (error) {
        console.error('Error adding product:', error);
        showAlert('Gagal menambahkan produk: ' + error.message, 'danger');
    } finally {
        // Re-enable save button
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Simpan Produk Baru';
        }
    }
}

// Add product to cart
function addToCart(product) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Increase quantity if stock allows
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            saveCart();
        } else {
            showAlert('Stok tidak mencukupi', 'danger');
            return;
        }
    } else {
        // Add new item to cart
        if (product.stock > 0) {
            cart.push({
                ...product,
                quantity: 1
            });
            saveCart();
        } else {
            showAlert('Stok habis', 'danger');
            return;
        }
    }

    updateCart();
    showAlert(`${product.name} ditambahkan ke keranjang`, 'success');
}

// Update cart display
function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-cart-x display-4 d-block mb-2"></i>
                <span>Keranjang kosong</span>
            </div>
        `;
    } else {
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="me-3">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">Rp ${formatNumber(item.price)} x ${item.quantity}</div>
                        <div class="small text-muted">Stok: ${item.stock}</div>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                        <div class="item-total mb-2">Rp ${formatNumber(itemTotal)}</div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                            <input type="number" class="form-control form-control-sm mx-1 quantity-input" 
                                   value="${item.quantity}" min="1" max="${item.stock}" 
                                   data-index="${index}" style="width: 50px;">
                            <button class="btn btn-sm btn-outline-primary increase-qty" data-index="${index}">+</button>
                        </div>
                        <button class="btn btn-sm btn-link text-danger p-0 mt-1 delete-item" data-index="${index}">
                            <small><i class="bi bi-trash"></i> Hapus</small>
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        // Add event listeners for quantity controls
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                updateQuantity(index, cart[index].quantity - 1);
            });
        });

        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                updateQuantity(index, cart[index].quantity + 1);
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value) || 1;
                updateQuantity(index, newQuantity);
            });
        });

        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.delete-item').dataset.index);
                removeItem(index);
            });
        });
    }

    updateTotals();
}

// Update item quantity
function updateQuantity(index, newQuantity) {
    if (isNaN(newQuantity) || newQuantity < 1) return;
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > cart[index].stock) {
        showAlert('Stok tidak mencukupi', 'danger');
        newQuantity = cart[index].stock;
    }

    cart[index].quantity = newQuantity;
    saveCart();
    updateCart();
}

// Remove item from cart
function removeItem(index) {
    if (confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) {
        cart.splice(index, 1);
        saveCart();
        updateCart();
        showAlert('Item dihapus dari keranjang', 'warning');
    }
}

// Update order totals
function updateTotals() {
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    currentTransaction.subtotal = subtotal;

    // Get discount amount (nominal Rupiah)
    let discountAmount = parseFloat(discountEl.value) || 0;
    if (discountAmount > subtotal) discountAmount = subtotal;
    if (discountAmount < 0) discountAmount = 0;
    discountEl.value = discountAmount;

    // Get tax percentage and amount
    const taxPercent = parseFloat(taxEl.value) || 0;
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableBase * taxPercent) / 100;

    // Calculate total
    const total = taxableBase + taxAmount;

    // Update UI
    subtotalEl.textContent = `Rp ${formatNumber(subtotal)}`;
    discountAmountEl.textContent = `-Rp ${formatNumber(discountAmount)}`;
    taxAmountEl.textContent = `Rp ${formatNumber(taxAmount)}`;
    totalEl.textContent = `Rp ${formatNumber(total)}`;

    // Update transaction object
    currentTransaction.discount = discountAmount;
    currentTransaction.tax = taxPercent;
    currentTransaction.total = total;

    return total;
}

// Show payment modal
function showPaymentModal() {
    if (cart.length === 0) {
        showAlert('Keranjang kosong', 'warning');
        return;
    }

    const total = updateTotals();
    billAmountEl.value = `Rp ${formatNumber(total)}`;
    amountPaidEl.value = '';
    changeAmountEl.value = '';
    paymentModal.show();
    amountPaidEl.focus();
}

// Calculate change
function calculateChange() {
    const amountPaid = parseFloat(amountPaidEl.value) || 0;
    const total = currentTransaction.total;

    if (amountPaid >= total) {
        const change = amountPaid - total;
        changeAmountEl.value = `Rp ${formatNumber(change)}`;
        document.getElementById('complete-payment').disabled = false;
    } else {
        changeAmountEl.value = '0';
        document.getElementById('complete-payment').disabled = true;
    }
}

// Complete payment
function completePayment() {
    const amountPaid = parseFloat(amountPaidEl.value) || 0;

    if (amountPaid < currentTransaction.total) {
        showAlert('Jumlah pembayaran kurang', 'danger');
        return;
    }

    const paidAtDate = new Date();
    const transactionNo = generateTransactionNo(paidAtDate);
    const settings = getSettings();

    const transactionData = {
        ...currentTransaction,
        items: cart.map(it => {
            const price = Number(it.price) || 0;
            const rawCost = Number(it.costPrice);
            const costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
            return { ...it, costPrice };
        }),
        payment: {
            amountPaid: amountPaid,
            change: amountPaid - currentTransaction.total,
            method: 'cash' // In a real app, you would have a payment method selector
        },
        date: paidAtDate.toISOString(),
        paidAtDate,
        paidAt: formatDateTimeParts(paidAtDate).dateTime,
        transactionNo,
        cashier: settings.cashierName,
        staff: settings.staffName
    };

    // Show receipt
    showReceipt(transactionData);

    // Hide modal after print window is opened (Android PWA can block print if modal/alerts interfere)
    paymentModal.hide();

    saveTransactionToHistory(transactionData);

    // Update stok produk ke Firebase
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            product.stock = newStock;
            updateProductStockFirebase(item.id, newStock);
        }
    });
    saveProducts(); // Simpan perubahan stok ke LocalStorage & Firebase

    console.log('Transaction completed:', transactionData);

    // Reset cart and close modal
    resetCart(true);
}
function saveTransaction() {
    if (cart.length === 0) {
        showAlert('Keranjang kosong', 'warning');
        return;
    }

    const total = updateTotals();

    const settings = getSettings();
    const transactionData = {
        ...currentTransaction,
        items: [...cart],
        status: 'pending',
        date: new Date().toISOString(),
        cashier: settings.cashierName,
        staff: settings.staffName
    };

    console.log('Transaction saved:', transactionData);

    // In a real app, you would save this to a database
    resetCart();
    showAlert('Transaksi disimpan', 'success');
}

// Reset cart
function resetCart(skipConfirm = false) {
    if (cart.length === 0) return;
    if (skipConfirm || confirm('Kosongkan semua item di keranjang?')) {
        cart = [];
        saveCart();
        updateCart();
        discountEl.value = '0';
        taxEl.value = '0';
        updateTotals();
    }
}

// Show receipt
function showReceipt(transaction) {
    // In a real app, you would generate a proper receipt and either print it or show it in a modal
    if (!transaction || !Array.isArray(transaction.items) || transaction.items.length === 0) {
        showAlert('Data transaksi kosong', 'danger');
        return null;
    }

    const paidAtDate = transaction?.paidAtDate ? new Date(transaction.paidAtDate) : (transaction?.date ? new Date(transaction.date) : new Date());
    const parts = formatDateTimeParts(paidAtDate);
    const txNo = transaction.transactionNo || generateTransactionNo(paidAtDate);

    // Layout sederhana untuk menghindari error engine print mobile (konten kosong / gagal cetak)
    const subtotal = Number(transaction.subtotal) || 0;
    const discount = Number(transaction.discount) || 0;
    const taxPercent = Number(transaction.tax) || 0;
    const taxableBase = Math.max(0, subtotal - discount);
    const taxAmount = (taxableBase * taxPercent) / 100;
    const total = Number(transaction.total) || taxableBase + taxAmount;
    const amountPaid = Number(transaction.payment?.amountPaid) || total;
    const change = Number(transaction.payment?.change) || Math.max(0, amountPaid - total);

    const escapeHtml = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // lineLR untuk baris summary (left-right alignment)
    const lineLR = (left, right, width = 32) => {
        const l = String(left);
        const r = String(right);
        const spaces = Math.max(1, width - l.length - r.length);
        return (l + ' '.repeat(spaces) + r);
    };

    // Info Transaksi (Header section after store info)
    const infoLines = [];
    infoLines.push('--------------------------------');
    infoLines.push(`No: ${txNo}`);
    infoLines.push(`Tgl: ${parts.dateTime}`);
    if (transaction.cashier) infoLines.push(`Kasir: ${transaction.cashier}`);
    if (transaction.staff) infoLines.push(`Mekanik: ${transaction.staff}`);
    infoLines.push('--------------------------------');

    // Build item lines dengan HTML (untuk nama wrap dan harga di kanan)
    let itemsHtml = '';
    (transaction.items || []).forEach(it => {
        const name = escapeHtml(`${it.name} x${it.quantity}`);
        const amt = `Rp ${formatNumber((Number(it.price) || 0) * (Number(it.quantity) || 0))}`;
        itemsHtml += `<div class="receipt-item"><span class="item-name">${name}</span><span class="item-price">${amt}</span></div>`;
    });

    // Total section
    const totalLines = [];
    totalLines.push('--------------------------------');
    totalLines.push(lineLR('Sub Total', `Rp ${formatNumber(subtotal)}`));
    totalLines.push(lineLR('Potongan', `-Rp ${formatNumber(discount)}`));
    totalLines.push(lineLR(`Pajak (${taxPercent}%)`, `Rp ${formatNumber(taxAmount)}`));
    totalLines.push(lineLR('TOTAL', `Rp ${formatNumber(total)}`));
    totalLines.push(lineLR('Dibayar', `Rp ${formatNumber(amountPaid)}`));
    totalLines.push(lineLR('Kembali', `Rp ${formatNumber(change)}`));
    totalLines.push('--------------------------------');

    const receiptInfoText = escapeHtml(infoLines.join('\n'));
    const receiptTotalText = escapeHtml(totalLines.join('\n'));
    let receipt = `
        <div class="receipt">
            <div class="receipt-header">
                <h1>DEWA BAN</h1>
                <div class="receipt-address">
                    <div><b>Jl. Wolter Monginsidi No.KM. 12</b></div>
                    <div><b>Genuksari, Kec. Genuk, Semarang</b></div>
                    <div><b>Telp: 0812-2259-9525</b></div>
                </div>
            </div>
            <div class="receipt-body">
                <pre class="receipt-pre">${receiptInfoText}</pre>
                <div class="receipt-items">${itemsHtml}</div>
                <pre class="receipt-pre">${receiptTotalText}</pre>
            </div>
            <div class="receipt-footer">
                <div><b>"YOUR TIRE SOLUTION"</b></div>
                <div><b>TERIMA KASIH ATAS KUNJUNGAN ANDA</b></div>
                <div><b>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</b></div>
            </div>
        </div>
    `;

    // Hindari aset berat yang bisa bikin Android gagal render / print kosong
    receipt = receipt.replace(/<img\b[^>]*>/gi, '');

    let printArea = document.getElementById('print-area');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-area';
        document.body.appendChild(printArea);
    }

    let printStyle = document.getElementById('print-area-style');
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-area-style';
        document.head.appendChild(printStyle);
    }

    printStyle.textContent = `
@media print {
  body > *:not(#print-area) { display: none !important; }
  #print-area {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0;
  }
  @page { size: 58mm auto; margin: 0mm; }
  html, body { height: auto; overflow: visible; }
  body { width: 58mm; margin: 0; padding: 0; }
  #print-area .receipt { width: 58mm; margin: 0; padding: 2mm; font-family: 'Courier New', monospace; font-size: 11px; }
  #print-area .receipt-pre { width: 58mm; margin: 0; padding: 0; white-space: pre-wrap; word-break: break-word; font-family: 'Courier New', monospace; font-size: 11px; }
  #print-area .receipt-header { text-align: center; margin: 0 0 4mm 0; }
  #print-area .receipt-header h1 { font-weight: 900; font-size: 24px; font-style: italic; text-transform: uppercase; text-align: center; margin: 0 0 2mm 0; line-height: 1.1; }
  #print-area .receipt-address { text-align: center; font-size: 10px; line-height: 1.3; font-weight: bold; }
  #print-area .receipt-body { text-align: left; }
  #print-area .receipt-items { margin: 0; padding: 0; }
  #print-area .receipt-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 2mm; margin-bottom: 1mm; }
  #print-area .receipt-item .item-name { flex: 1; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; }
  #print-area .receipt-item .item-price { flex-shrink: 0; text-align: right; white-space: nowrap; }
  #print-area .receipt-footer { text-align: center; margin-top: 4mm; font-size: 10px; line-height: 1.3; }
}
@media screen {
  #print-area { display: none; }
}
    `.trim();

    printArea.innerHTML = receipt;

    try {
        window.print();
    } catch (_) {
        // ignore
    }

    return printArea;
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1100';
    alertDiv.role = 'alert';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remove alert after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 150);
    }, 3000);
}

// Format number with thousand separators
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ========================================
// EVENT LISTENERS - BRAND DROPDOWN
// ========================================

// Brand dropdown change event
if (newBrandEl) {
    newBrandEl.addEventListener('change', toggleBrandLogoInput);
}

// Brand logo file input change event (preview)
if (brandLogoInput) {
    brandLogoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && brandLogoPreview) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showAlert('File harus berupa gambar', 'warning');
                e.target.value = '';
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert('Ukuran gambar maksimal 5MB', 'warning');
                e.target.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                brandLogoPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else if (brandLogoPreview) {
            brandLogoPreview.src = 'img/logo.png';
        }
    });
}

// Populate brand dropdown on auth state change
const originalOnAuthStateChanged = auth.onAuthStateChanged;
auth.onAuthStateChanged((user) => {
    // Original auth state logic exists elsewhere in the code
    // We just need to populate dropdown after products are loaded
    if (user) {
        // Wait a bit for products to load
        setTimeout(() => {
            populateBrandDropdown();
        }, 500);
    }
});
