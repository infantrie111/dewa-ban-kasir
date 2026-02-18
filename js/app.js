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

// v4.4: Global flag for 'Tanpa Pasang' mode
let isTanpaPasangMode = false;

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
const downloadMonthlyReportBtn = document.getElementById('download-monthly-report-btn');

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

    document.querySelectorAll('.js-cashier-name').forEach(el => {
        el.textContent = settings.cashierName;
    });

    // v4.2: Show active shift mechanic name, fallback to '-'
    const activeShiftData = JSON.parse(localStorage.getItem('activeShift') || 'null');
    const mechanicName = activeShiftData?.mechanic || '-';
    document.querySelectorAll('.js-staff-name').forEach(el => {
        el.textContent = mechanicName;
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
    const timeHtml = `${parts.time.slice(0, 5)}<span class="d-none d-sm-inline">${parts.time.slice(5)}</span>`;
    document.querySelectorAll('#current-date, #transaction-date').forEach(el => {
        el.innerHTML = `<span class="d-none d-sm-inline">${formatted}, </span>${parts.date} ${timeHtml}`;
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
        // v3.1: Skip refunded transactions
        if (t.isRefunded) return;

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
        const isRefunded = t.isRefunded === true;

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

        // Visual Cue: Strikethrough for Refunded
        const textStyle = isRefunded ? 'text-decoration: line-through;' : '';
        const textClass = isRefunded ? 'text-muted' : 'fw-semibold';
        const refundBadge = isRefunded ? '<br><span class="badge bg-danger mt-1">REFUNDED</span>' : '';

        const tr = document.createElement('tr');
        if (isRefunded) tr.classList.add('table-light'); // Highlight row

        tr.innerHTML = `
            <td style="vertical-align: top;">
                <div class="${textClass}" style="word-wrap: break-word; white-space: normal; line-height: 1.4; max-width: 350px; ${textStyle}">${productNames}</div>
                ${refundBadge}
                <small class="text-muted">${parts.dateTime}</small>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <div class="fw-bold ${isRefunded ? 'text-decoration-line-through text-muted' : ''}">Rp ${formatNumber(Number(t?.total) || 0)}</div>
                <small class="text-muted d-block" style="font-size: 0.75rem;">${t.payment?.method ? t.payment.method.toUpperCase() : 'CASH'}</small>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <div class="d-flex justify-content-center gap-1">
                    <button type="button" class="btn btn-sm btn-outline-dark" data-action="reprint" data-tx="${txNo}" title="Cetak Thermal">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-action="print-pdf" data-tx="${txNo}" title="Cetak PDF">
                        <i class="bi bi-file-pdf"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success" data-action="share-wa" data-tx="${txNo}" title="Kirim WA">
                        <i class="bi bi-whatsapp"></i>
                    </button>
                </div>
            </td>
            <td style="text-align: center; vertical-align: middle;">
                <button type="button" class="btn btn-sm btn-outline-warning" data-action="refund" data-tx="${txNo}" 
                    title="Refund Transaksi" ${isRefunded ? 'disabled' : ''}>
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
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

function refundTransaction(transactionNo) {
    const txNo = String(transactionNo || '').trim();
    if (!txNo) return;

    if (!confirm("Apakah Anda yakin ingin me-refund transaksi ini? Stok barang akan dikembalikan ke sistem.")) return;

    const history = getTransactionHistory();
    const trxIndex = history.findIndex(t => String(t?.transactionNo || '') === txNo);

    if (trxIndex === -1) {
        showAlert('Transaksi tidak ditemukan', 'warning');
        return;
    }

    const trx = history[trxIndex];

    if (trx.isRefunded) {
        showAlert('Transaksi sudah di-refund sebelumnya', 'warning');
        return;
    }

    // 1. Kembalikan Stok
    (trx.items || []).forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const qtyToReturn = Number(item.quantity) || 0;
            product.stock += qtyToReturn;
            // Update stock di Firebase jika aktif
            updateProductStockFirebase(product.id, product.stock);
        }
    });

    // 2. Simpan perubahan stok
    saveProducts();
    syncCartStockFromProducts();

    // 3. Mark as Refunded
    trx.isRefunded = true;

    // 4. Simpan History (Local & Firebase)
    if (useFirebase && firebaseReady && trx.firebaseId) {
        db.ref('transactions/' + trx.firebaseId).update({ isRefunded: true })
            .then(() => console.log('✅ Refund status updated in Firebase'))
            .catch(err => console.error('❌ Failed update refund status:', err));
    }

    // Update Local Storage History
    localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(history));

    // 5. Refresh UI
    renderTransactionHistory();
    renderAdminDailyStats();
    renderBusinessAnalytics();
    refreshCurrentProductView(); // Refresh product list stock display

    showAlert('Transaksi berhasil di-refund. Stok telah dikembalikan.', 'success');
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
    // v2.3.0: Cetak ulang via WebUSB (Raw ESC/POS) — bukan lagi window.print()
    cetakStruk(trx);
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

    // v4.8: Read target date from report date picker, fallback to today
    const datePickerVal = document.getElementById('report-date-picker')?.value;
    const targetDate = datePickerVal ? new Date(datePickerVal + 'T00:00:00') : new Date();
    const targetParts = formatDateTimeParts(targetDate);
    const fileDate = targetParts.date.replaceAll('/', '-');
    const filename = `Rekap_Harian_${fileDate}.csv`;

    const todays = history.filter(t => {
        const d = new Date(t.date);
        return isSameLocalDate(d, targetDate);
    });

    if (todays.length === 0) {
        showAlert(`Belum ada transaksi pada ${targetParts.date}`, 'warning');
        return;
    }

    let grandTotal = 0;
    let grandProfit = 0;
    let totalMechanicFee = 0;
    let totalDiscount = 0; // v4.2: Track total discounts

    const header = 'Tanggal,Jam,No Transaksi,Kasir,Shift,Mekanik,Jumlah Bongkar,Fee Mekanik,Diskon,Item,Nominal,Harga Modal,Laba per Item';
    const rows = [];

    todays.forEach(t => {
        const d = new Date(t.date);
        const parts = formatDateTimeParts(d);
        const jam = parts.time.slice(0, 5);
        const kasir = t.cashier || '';
        const noTrx = t.transactionNo || '';
        const shift = t.shift || '-';
        const mechanic = t.mechanic || '-';
        const bongkarCount = t.bongkarCount || 0;
        const mechanicFee = t.mechanicFee || 0;
        const discount = Number(t.discount) || 0;
        const isRefunded = t.isRefunded === true;

        if (!isRefunded) {
            totalMechanicFee += Number(mechanicFee) || 0;
            totalDiscount += discount; // v4.2
        }

        (t.items || []).forEach(it => {
            let itemName = it.quantity && it.quantity > 1 ? `${it.name} x${it.quantity}` : it.name;

            // v3.1: Mark refunded items
            if (isRefunded) {
                itemName = `[REFUNDED] ${itemName}`;
            }

            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            let nominal = price * qty;
            let rawCost = Number(it.costPrice);
            let costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
            let profit = (price - costPrice) * qty;

            // v3.1: Zero out value for refunded transactions
            if (isRefunded) {
                nominal = 0;
                costPrice = 0;
                profit = 0;
            } else {
                grandTotal += nominal;
                grandProfit += profit;
            }

            rows.push([
                parts.date,
                jam,
                noTrx,
                kasir,
                shift,
                mechanic,
                bongkarCount,
                mechanicFee,
                discount,
                itemName,
                nominal,
                costPrice,
                profit
            ].map(escapeCSV).join(','));
        });
    });

    const netProfit = grandProfit - totalMechanicFee - totalDiscount; // v4.2: Subtract discounts

    const summaryRowRevenue = [`TOTAL PENDAPATAN ${fileDate}`, '', '', '', '', '', '', '', '', '', grandTotal, '', ''].map(escapeCSV).join(',');
    const summaryRowGrossProfit = ['TOTAL LABA KOTOR', '', '', '', '', '', '', '', '', '', '', '', grandProfit].map(escapeCSV).join(',');
    const summaryRowDiscount = ['TOTAL DISKON (Tanpa Pasang dll)', '', '', '', '', '', '', '', '', '', '', '', `-${totalDiscount}`].map(escapeCSV).join(',');
    const summaryRowFee = ['BEBAN GAJI MEKANIK', '', '', '', '', '', '', '', '', '', '', '', `-${totalMechanicFee}`].map(escapeCSV).join(',');
    const summaryRowNetProfit = ['TOTAL LABA BERSIH (Setelah Gaji & Diskon)', '', '', '', '', '', '', '', '', '', '', '', netProfit].map(escapeCSV).join(',');

    const csv = `${header}\n${rows.join('\n')}\n\n${summaryRowRevenue}\n${summaryRowGrossProfit}\n${summaryRowDiscount}\n${summaryRowFee}\n${summaryRowNetProfit}`;
    downloadCSV(csv, filename);
}

// Helper untuk cek apakah tanggal sama bulan & tahun
function isSameLocalMonth(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Nama bulan dalam Bahasa Indonesia
function getMonthName(monthIndex) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[monthIndex] || '';
}

function downloadMonthlyReport() {
    const history = getTransactionHistory();

    // v4.8: Read target month from report month picker, fallback to this month
    const monthPickerVal = document.getElementById('report-month-picker')?.value; // 'YYYY-MM'
    let targetYear, targetMonthIndex, monthName;
    if (monthPickerVal) {
        const [y, m] = monthPickerVal.split('-');
        targetYear = Number(y);
        targetMonthIndex = Number(m) - 1;
        monthName = getMonthName(targetMonthIndex);
    } else {
        const now = new Date();
        targetYear = now.getFullYear();
        targetMonthIndex = now.getMonth();
        monthName = getMonthName(targetMonthIndex);
    }
    const filename = `Rekap_Bulanan_${monthName}_${targetYear}.csv`;

    const thisMonth = history.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonthIndex;
    });

    if (thisMonth.length === 0) {
        showAlert(`Belum ada transaksi di bulan ${monthName} ${targetYear}`, 'warning');
        return;
    }

    let grandTotal = 0;
    let grandProfit = 0;
    let totalMechanicFee = 0;
    let totalDiscount = 0; // v4.2: Track total discounts

    const header = 'Tanggal,Jam,No Transaksi,Kasir,Shift,Mekanik,Jumlah Bongkar,Fee Mekanik,Diskon,Item,Nominal,Harga Modal,Laba per Item';
    const rows = [];

    thisMonth.forEach(t => {
        const d = new Date(t.date);
        const parts = formatDateTimeParts(d);
        const jam = parts.time.slice(0, 5);
        const kasir = t.cashier || '';
        const noTrx = t.transactionNo || '';
        const shift = t.shift || '-';
        const mechanic = t.mechanic || '-';
        const bongkarCount = t.bongkarCount || 0;
        const mechanicFee = t.mechanicFee || 0;
        const discount = Number(t.discount) || 0;
        const isRefunded = t.isRefunded === true;

        if (!isRefunded) {
            totalMechanicFee += Number(mechanicFee) || 0;
            totalDiscount += discount; // v4.2
        }

        (t.items || []).forEach(it => {
            let itemName = it.quantity && it.quantity > 1 ? `${it.name} x${it.quantity}` : it.name;

            // v3.1: Mark refunded items
            if (isRefunded) {
                itemName = `[REFUNDED] ${itemName}`;
            }

            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            let nominal = price * qty;
            let rawCost = Number(it.costPrice);
            let costPrice = Number.isFinite(rawCost) ? Math.max(0, rawCost) : Math.round(price * 0.8);
            let profit = (price - costPrice) * qty;

            // v3.1: Zero out value for refunded transactions
            if (isRefunded) {
                nominal = 0;
                costPrice = 0;
                profit = 0;
            } else {
                grandTotal += nominal;
                grandProfit += profit;
            }

            rows.push([
                parts.date,
                jam,
                noTrx,
                kasir,
                shift,
                mechanic,
                bongkarCount,
                mechanicFee,
                discount,
                itemName,
                nominal,
                costPrice,
                profit
            ].map(escapeCSV).join(','));
        });
    });

    const netProfit = grandProfit - totalMechanicFee - totalDiscount; // v4.2: Subtract discounts

    const summaryRowRevenue = [`TOTAL PENDAPATAN BULAN ${monthName.toUpperCase()} ${targetYear}`, '', '', '', '', '', '', '', '', '', grandTotal, '', ''].map(escapeCSV).join(',');
    const summaryRowGrossProfit = [`TOTAL LABA KOTOR`, '', '', '', '', '', '', '', '', '', '', '', grandProfit].map(escapeCSV).join(',');
    const summaryRowDiscount = ['TOTAL DISKON (Tanpa Pasang dll)', '', '', '', '', '', '', '', '', '', '', '', `-${totalDiscount}`].map(escapeCSV).join(',');
    const summaryRowFee = ['BEBAN GAJI MEKANIK', '', '', '', '', '', '', '', '', '', '', '', `-${totalMechanicFee}`].map(escapeCSV).join(',');
    const summaryRowNetProfit = ['TOTAL LABA BERSIH', '', '', '', '', '', '', '', '', '', '', '', netProfit].map(escapeCSV).join(',');

    const csv = `${header}\n${rows.join('\n')}\n\n${summaryRowRevenue}\n${summaryRowGrossProfit}\n${summaryRowDiscount}\n${summaryRowFee}\n${summaryRowNetProfit}`;
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

    if (downloadMonthlyReportBtn) {
        downloadMonthlyReportBtn.addEventListener('click', () => {
            downloadMonthlyReport();
        });
    }

    if (settingsModalEl) {
        settingsModalEl.addEventListener('show.bs.modal', () => {
            applySettingsToUI();
            // v4.8: Smart defaults for report date/month pickers
            const now = new Date();
            const reportDatePicker = document.getElementById('report-date-picker');
            const reportMonthPicker = document.getElementById('report-month-picker');
            if (reportDatePicker && !reportDatePicker.value) {
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                reportDatePicker.value = `${yyyy}-${mm}-${dd}`;
            }
            if (reportMonthPicker && !reportMonthPicker.value) {
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                reportMonthPicker.value = `${yyyy}-${mm}`;
            }
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
            // v4.8: Auto-reset payroll date filter & render dashboard when admin opens
            resetPayrollDateFilter();
            populatePayrollMechanicFilter();
            renderPayrollDashboard();
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

    // Image preview when file is selected (UNLIMITED SIZE - AUTO COMPRESS)
    if (newImageEl) {
        newImageEl.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('image-preview');
            const uploadStatus = document.getElementById('upload-status');

            if (file && preview) {
                // Validate file type only (NO SIZE LIMIT)
                if (!file.type.startsWith('image/')) {
                    showAlert('File harus berupa gambar', 'warning');
                    e.target.value = '';
                    return;
                }

                try {
                    // Show compressing status
                    if (uploadStatus) {
                        uploadStatus.classList.remove('d-none');
                        uploadStatus.textContent = 'Sedang mengompres...';
                        uploadStatus.classList.remove('text-success', 'text-danger');
                        uploadStatus.classList.add('text-muted');
                    }

                    // Auto-compress image (accepts ANY size)
                    const compressedBase64 = await compressImage(file);
                    preview.src = compressedBase64;

                    // Update status
                    if (uploadStatus) {
                        uploadStatus.textContent = `Gambar siap (${Math.round(file.size / 1024)}KB → compressed)`;
                        uploadStatus.classList.remove('text-muted');
                        uploadStatus.classList.add('text-success');
                    }
                } catch (err) {
                    console.error('Compression error:', err);
                    // Fallback to original preview
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);

                    if (uploadStatus) {
                        uploadStatus.textContent = 'Kompres gagal, menggunakan asli';
                        uploadStatus.classList.add('text-warning');
                    }
                }
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

    const deleteAllBtn = document.getElementById('delete-all-transactions-btn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllTransactions);
    }

    // v4.10: Show delete button ONLY when history tab is active
    const adminTabsEl = document.getElementById('adminTabs');
    if (adminTabsEl && deleteAllBtn) {
        adminTabsEl.addEventListener('shown.bs.tab', (e) => {
            if (e.target.id === 'history-tab') {
                deleteAllBtn.classList.remove('d-none');
            } else {
                deleteAllBtn.classList.add('d-none');
            }
        });
    }

    // Analytics Refresh
    const refreshAnalyticsBtn = document.getElementById('refresh-analytics-btn');
    if (refreshAnalyticsBtn) {
        refreshAnalyticsBtn.addEventListener('click', () => {
            renderBusinessAnalytics();
            showAlert('Data analisis diperbarui', 'success');
        });
    }

    // Payment Method Listener
    const paymentMethodEl = document.getElementById('payment-method');
    const cashFields = document.getElementById('cash-payment-fields');
    if (paymentMethodEl && cashFields) {
        paymentMethodEl.addEventListener('change', () => {
            const method = paymentMethodEl.value;
            if (method === 'cash') {
                cashFields.style.display = 'block';
                amountPaidEl.value = '';
                changeAmountEl.value = '';
                amountPaidEl.focus();
            } else {
                cashFields.style.display = 'none';
                // Auto fill for non-cash
                if (currentTransaction && currentTransaction.total) {
                    amountPaidEl.value = currentTransaction.total;
                }
            }
            calculateChange();
        });
    }

    // Analytics tab event listeners
    if (analyticsTabBtn) {
        analyticsTabBtn.addEventListener('shown.bs.tab', () => {
            renderBusinessAnalytics();
        });
    }

    if (adminHistoryTbody) {
        adminHistoryTbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const txNo = btn.dataset.tx;
            const action = btn.dataset.action;

            const trx = getTransactionHistory().find(t => t.transactionNo === txNo);

            if (action === 'reprint') reprintTransaction(txNo);
            if (action === 'print-pdf') showReceipt(trx);
            if (action === 'share-wa') shareViaWhatsApp(trx);
            if (action === 'delete') deleteTransaction(txNo);
            if (action === 'refund') refundTransaction(txNo);
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
    // v3.1 Initialize Payroll System
    initPayrollSystem();

    // ========================================
    // v4.11: SMART NAVIGATION (History API)
    // Prevents Android back button from closing
    // the app; instead closes modals / navigates tabs
    // ========================================

    // --- Flag to prevent circular history.back() calls ---
    let _navIgnoreNextPop = false;
    let _navIgnoreHide = false;

    // --- List of ALL application modal IDs ---
    const NAV_MODAL_IDS = [
        'paymentModal',
        'settingsModal',
        'adminModal',
        'quickEditModal',
        'brandEditModal',
        'payrollSettingsModal',
        'openShiftModal',
        'mechanicModal',
        'loginModal'
    ];

    // 1) Push state whenever ANY Bootstrap modal is shown
    NAV_MODAL_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('show.bs.modal', () => {
            history.pushState({ modalOpen: true, modalId: id }, '');
        });

        // 3) Cleanup: when user closes a modal manually (X button / Tutup),
        //    pop the matching history entry so the stack stays in sync.
        el.addEventListener('hidden.bs.modal', () => {
            if (_navIgnoreHide) return;          // we already called history.back()
            _navIgnoreNextPop = true;            // tell popstate handler to skip
            history.back();                      // remove the pushed state
        });
    });

    // 2) Admin tab navigation — push state on secondary tab activation
    const _navAdminTabsEl = document.getElementById('adminTabs');
    const FIRST_ADMIN_TAB_ID = 'stock-tab';      // The "home" tab
    if (_navAdminTabsEl) {
        _navAdminTabsEl.addEventListener('shown.bs.tab', (e) => {
            if (e.target.id !== FIRST_ADMIN_TAB_ID) {
                history.pushState({ tabActive: true, tabId: e.target.id }, '');
            }
        });
    }

    // --- Global popstate handler (fires on Back button press) ---
    window.addEventListener('popstate', (e) => {
        // Guard: if this pop was triggered by our own history.back() cleanup
        if (_navIgnoreNextPop) {
            _navIgnoreNextPop = false;
            return;
        }

        const state = e.state;

        // (A) If the state says a tab was active → go back to the first tab
        if (state && state.tabActive) {
            const firstTab = document.getElementById(FIRST_ADMIN_TAB_ID);
            if (firstTab) {
                const bsTab = new bootstrap.Tab(firstTab);
                bsTab.show();
            }
            return;
        }

        // (B) Check if ANY Bootstrap modal is currently visible → close it
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            // Skip static-backdrop modals like login
            if (openModal.getAttribute('data-bs-backdrop') === 'static') return;

            const instance = bootstrap.Modal.getInstance(openModal);
            if (instance) {
                _navIgnoreHide = true;           // prevent hidden handler from calling history.back()
                instance.hide();
                _navIgnoreHide = false;
                // Push a blank state so that the next Back press can be intercepted
                // (keep the app "alive" in the history stack)
                history.pushState(null, '');
            }
            return;
        }

        // (C) No modal open, no tab state → re-push a blank state
        //     so that the NEXT back press can also be caught
        //     (prevents the app from actually closing on back press).
        history.pushState(null, '');
    });

    // Seed the history with an initial blank state so the very first
    // Back press does not navigate away.
    history.pushState(null, '');

    console.log('✅ v4.11 Smart Navigation initialized');
    // ========================================
    // END: SMART NAVIGATION
    // ========================================
});

// Display products in the product list
// V2: SEPARATED brand logo and product photo for better visual hierarchy
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

        // SEPARATED LOGIC: Brand Logo vs Product Photo
        // 1. Brand Logo (small badge) - prioritized from product.logo field
        const brandLogo = product.logo && product.logo.trim() !== '' && product.logo !== 'img/logo.png'
            ? product.logo
            : 'img/logo.png';
        const brandLogoSrc = withCacheBuster(brandLogo);

        // 2. Product Photo (main image) - from product.image field
        // Placeholder 'Ikon Ban Abu-abu' (Cloudinary) used if photo is missing
        const productPhoto = product.image && product.image.trim() !== '' && product.image !== 'img/logo.png'
            ? product.image
            : 'https://res.cloudinary.com/dxdstqvad/image/upload/v1737597143/produk_dewa_ban/placeholder_tire_grey.png'; // <-- placeholder ban abu-abu elegan
        const productPhotoSrc = withCacheBuster(productPhoto);

        productCard.innerHTML = `
            <div class="card product-card h-100" data-id="${product.id}">
                <!-- Edit Badge (v54 - Minimalist) -->
                <div class="edit-badge" onclick="event.stopPropagation(); openEditModal('${product.id}')">
                    <i class="bi bi-pencil-fill" style="font-size: 14px;"></i>
                </div>

                <!-- Brand Logo Badge (Overlay) -->
                <div class="brand-logo-badge">
                    <img src="${brandLogoSrc}" alt="${product.brand}" onerror="this.onerror=null;this.src='img/logo.png?v=1';">
                </div>
                
                <!-- Main Product Photo -->
                <img src="${productPhotoSrc}" class="card-img-top product-main-image" alt="${product.name}" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dxdstqvad/image/upload/v1737597143/produk_dewa_ban/placeholder_tire_grey.png';">
                
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

// ========================================
// RENDER BRAND LIST (v54 - Fixed Image Logic)
// Priority: 1. Master Data (LocalStorage Base64)
//           2. Cloudinary URL (http)
//           3. Fallback Local (img/brand.png)
// ========================================
function renderBrandList() {
    activeView = 'brands';
    activeBrand = null;

    const brands = getUniqueBrands();

    // Load categories from LocalStorage (Master Data with Base64 logos)
    const categoriesRaw = localStorage.getItem('categories');
    let categoriesMap = new Map();
    if (categoriesRaw) {
        try {
            const categoriesArray = JSON.parse(categoriesRaw);
            if (Array.isArray(categoriesArray)) {
                categoriesArray.forEach(cat => {
                    if (cat.name && cat.logo) {
                        categoriesMap.set(cat.name.toUpperCase(), cat.logo);
                    }
                });
            }
        } catch (e) {
            console.warn('Failed to parse categories from LocalStorage:', e);
        }
    }

    productList.innerHTML = '';

    brands.forEach(brand => {
        const col = document.createElement('div');
        col.className = 'col-3 col-md-4 col-lg-3 mb-3';

        const brandUpper = brand.toUpperCase();

        // PRIORITY 1: Check Master Data (LocalStorage categories with Base64)
        let image = categoriesMap.get(brandUpper);

        // PRIORITY 2: Check product.logo field for Cloudinary URL or Base64
        if (!image) {
            const productWithLogo = products.find(p =>
                p.brand &&
                p.brand.toUpperCase() === brandUpper &&
                p.logo &&
                (p.logo.startsWith('http') || p.logo.startsWith('data:image'))
            );
            if (productWithLogo) {
                image = productWithLogo.logo;
            }
        }

        // PRIORITY 3: Fallback to local img/brand.png
        if (!image) {
            image = getBrandImage(brand);
        }

        col.innerHTML = `
            <div class="card product-card h-100" data-brand="${brand}" data-brand-logo="${image}">
                <!-- Brand Edit Badge (v54 - Minimalist) -->
                <div class="brand-edit-badge" onclick="event.stopPropagation(); openBrandEditModal('${brand}')">
                    <i class="bi bi-pencil-fill" style="font-size: 14px;"></i>
                </div>
                
                <img src="${image}" class="card-img-top" alt="${brand}" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dxdstqvad/image/upload/v1737597143/produk_dewa_ban/placeholder_tire_grey.png';">
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
            <td class="text-center">
                <input type="number" class="form-control form-control-sm" style="width: 80px; margin: 0 auto; text-align: center;" min="0" value="${p.stock}" data-action="set" data-id="${p.id}">
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

// ========================================
// UNIVERSAL IMAGE COMPRESSION UTILITY (v54)
// Designed to handle UNLIMITED file sizes (10MB+)
// Max width: 800px, Quality: 70% JPEG
// Output: Base64 String for LocalStorage/Firebase
// ========================================

function compressImage(file) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Compressing image: ${file.name} (${Math.round(file.size / 1024)}KB)`);

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const QUALITY = 0.7;

                let width = img.width;
                let height = img.height;

                // Resize if width exceeds MAX_WIDTH
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 JPEG
                const base64 = canvas.toDataURL('image/jpeg', QUALITY);

                const originalSize = file.size;
                // Estimate compressed size (Base64 is ~1.37x binary size)
                const compressedEstimate = Math.round((base64.length * 3) / 4);
                const compressionRatio = ((1 - compressedEstimate / originalSize) * 100).toFixed(1);

                console.log(`✅ Image compressed: ${Math.round(originalSize / 1024)}KB → ~${Math.round(compressedEstimate / 1024)}KB (${compressionRatio}% reduction)`);
                console.log(`   Dimensions: ${img.width}x${img.height} → ${width}x${height}`);

                resolve(base64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Wrapper function for backwards compatibility (returns File object)
async function compressImageToFile(file) {
    const base64 = await compressImage(file);
    const response = await fetch(base64);
    const blob = await response.blob();
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now()
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
// FIXED: Properly retrieves logo from product.logo field
function getBrandLogoUrl(brandName) {
    const brandUpper = brandName.toUpperCase();
    // Search for any product with this brand that has a logo URL
    const productWithLogo = products.find(p =>
        p.brand.toUpperCase() === brandUpper &&
        p.logo &&
        p.logo.trim() !== '' &&
        p.logo !== 'img/logo.png'
    );

    if (productWithLogo && productWithLogo.logo) {
        console.log('✅ Found logo for brand:', brandName, '→', productWithLogo.logo);
        return productWithLogo.logo;
    }

    // Fallback to default store logo if no brand logo found
    console.log('⚠️ No logo found for brand:', brandName, '→ using default');
    return 'img/logo.png';
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

    // --- GATEKEEPER: CHECK SHIFT STATUS ---
    const activeShiftJson = localStorage.getItem('activeShift');

    // 1. Cek Apakah Shift Ada?
    if (!activeShiftJson) {
        alert('⚠️ Anda belum membuka Shift! Silakan Buka Shift di menu Admin > Gaji Karyawan terlebih dahulu.');
        return; // STOP!
    }

    // 2. Cek Apakah Shift Kadaluarsa (Beda Hari)?
    const activeShift = JSON.parse(activeShiftJson);
    const shiftDate = new Date(activeShift.startTime).toDateString(); // "Wed Feb 18 2026"
    const todayDate = new Date().toDateString();

    if (shiftDate !== todayDate) {
        // Shift Expired -> Kill It
        localStorage.removeItem('activeShift');
        if (typeof updateShiftButtonUI === 'function') updateShiftButtonUI();

        alert('⚠️ Shift kemarin sudah kadaluarsa! Silakan Buka Shift baru untuk hari ini.');
        return; // STOP!
    }
    // --------------------------------------

    // v4.8: Force-reset Tanpa Pasang state when opening payment modal
    isTanpaPasangMode = false;
    discountEl.value = '0';
    const btnTP = document.getElementById('btn-tanpa-pasang');
    if (btnTP) {
        btnTP.className = 'btn btn-warning w-100 mb-3';
        btnTP.innerHTML = '<i class="bi bi-box-seam me-2"></i>Tanpa Pasang (Diskon Rp 10.000) \u2014 OFF';
    }

    const total = updateTotals();
    billAmountEl.value = `Rp ${formatNumber(total)}`;
    amountPaidEl.value = '';
    changeAmountEl.value = '';
    paymentModal.show();
    amountPaidEl.focus();
}

// Calculate change
// Calculate change
function calculateChange() {
    const paymentMethodEl = document.getElementById('payment-method');
    const method = paymentMethodEl ? paymentMethodEl.value : 'cash';
    const amountPaid = parseFloat(amountPaidEl.value) || 0;
    const total = currentTransaction.total;
    const completeBtn = document.getElementById('complete-payment');

    if (method === 'cash') {
        if (amountPaid >= total) {
            const change = amountPaid - total;
            changeAmountEl.value = `Rp ${formatNumber(change)}`;
            completeBtn.disabled = false;
        } else {
            changeAmountEl.value = '0';
            completeBtn.disabled = true; // Wait full payment
        }
    } else {
        // QRIS / Transfer: Assume paid exactly
        changeAmountEl.value = 'Rp 0';
        // Auto-set amount paid if empty
        if (!amountPaidEl.value) amountPaidEl.value = total;
        completeBtn.disabled = false;
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
    const paymentMethod = document.getElementById('payment-method')?.value || 'cash';

    // v4.0 Payroll Injection
    const activeShift = JSON.parse(localStorage.getItem('activeShift') || '{}');
    const payrollSettings = JSON.parse(localStorage.getItem('payrollSettings') || '{}');

    // v4.4: Dynamic bongkarCount with exclusion filter & Tanpa Pasang override
    const excludedBrands = payrollSettings.excludedBrands || [];
    let bongkarCount = 0;

    if (isTanpaPasangMode) {
        // Kondisi A: Tanpa Pasang → ban tidak dikerjakan di tempat
        bongkarCount = 0;
    } else {
        // Kondisi B: Hitung item yang brand-nya TIDAK di-exclude
        bongkarCount = cart.reduce((sum, item) => {
            const brand = (item.brand || '').toUpperCase();
            if (excludedBrands.includes(item.brand)) return sum; // Skip excluded brands
            return sum + (Number(item.quantity) || 0);
        }, 0);
    }

    // Hitung Fee Mekanik
    let mechanicFee = 0;
    const shiftType = (activeShift.type || '').toLowerCase();
    if (shiftType === 'siang') {
        mechanicFee = bongkarCount * (Number(payrollSettings.tireFeeDay) || 0);
    } else if (shiftType === 'malam') {
        mechanicFee = bongkarCount * (Number(payrollSettings.tireFeeNight) || 0);
    }

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
            method: paymentMethod
        },
        date: paidAtDate.toISOString(),
        paidAtDate,
        paidAt: formatDateTimeParts(paidAtDate).dateTime,
        transactionNo,
        cashier: settings.cashierName,
        staff: activeShift.mechanic || null, // v4.2: Only use shift mechanic
        shift: activeShift.type || null, // v3.1
        mechanic: activeShift.mechanic || null, // v4.2: Only use shift mechanic
        bongkarCount: bongkarCount, // v4.0
        mechanicFee: mechanicFee // v4.0
    };

    // ✅ v53: Cetak struk via RawBT Silent Print (bukan window.print lagi)
    cetakStruk(transactionData);

    // Hide modal after print command sent
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
        // v4.8: Reset Tanpa Pasang toggle state fully
        isTanpaPasangMode = false;
        const btnTP = document.getElementById('btn-tanpa-pasang');
        if (btnTP) {
            btnTP.className = 'btn btn-warning w-100 mb-3';
            btnTP.innerHTML = '<i class="bi bi-box-seam me-2"></i>Tanpa Pasang (Diskon Rp 10.000) \u2014 OFF';
        }
    }
}

// ========================================
// PRINTING FUNCTIONS — Smart Auto-Routing
// v2.9.3
// USB OTG (Priority 1) → RawBT Intent (Fallback)
// Kompatibel: Windows Laptop + Android HP
// ========================================

// Variabel Global untuk WebUSB Printer
let usbPrinterDevice = null;
let usbEndpointInfo = null;

/**
 * Update UI status koneksi USB (tombol header, modal Settings, status bar)
 */
function updateUSBStatusUI(connected, printerName = '') {
    const headerBtn = document.getElementById('btn-usb-header');
    const connectBtn = document.getElementById('btn-connect-usb');
    const disconnectBtn = document.getElementById('btn-disconnect-usb');
    const statusBar = document.getElementById('usb-status-bar');

    if (connected) {
        // Header button — hijau solid
        if (headerBtn) {
            headerBtn.style.border = '1px solid #198754';
            headerBtn.style.color = '#fff';
            headerBtn.style.backgroundColor = '#198754';
            headerBtn.title = `Printer: ${printerName}`;
        }
        // Settings modal
        if (connectBtn) connectBtn.classList.add('d-none');
        if (disconnectBtn) disconnectBtn.classList.remove('d-none');
        if (statusBar) {
            statusBar.innerHTML = `<i class="bi bi-check-circle-fill me-1 text-success"></i><strong class="text-success">${printerName || 'Printer'}</strong> terhubung`;
        }
    } else {
        // Header button — outline hijau
        if (headerBtn) {
            headerBtn.style.border = '1px solid #198754';
            headerBtn.style.color = '#198754';
            headerBtn.style.backgroundColor = 'transparent';
            headerBtn.title = 'Hubungkan Printer USB';
        }
        // Settings modal
        if (connectBtn) connectBtn.classList.remove('d-none');
        if (disconnectBtn) disconnectBtn.classList.add('d-none');
        if (statusBar) {
            statusBar.innerHTML = '<i class="bi bi-usb-symbol me-1"></i>Printer belum terhubung';
        }
    }
}

/**
 * Cek apakah browser mendukung WebUSB API
 */
function isWebUSBSupported() {
    return !!navigator.usb;
}

/**
 * AGGRESSIVE: Cari Bulk OUT endpoint pada USB device
 * Scan SEMUA interface dan SEMUA alternate settings
 * Return: { interfaceNum, endpointNum, fallbacks: [...] } atau null
 */
function findPrinterEndpoint(device) {
    if (!device.configuration) {
        console.warn('⚠️ findPrinterEndpoint: No configuration on device');
        return null;
    }

    const results = [];
    const interfaces = device.configuration.interfaces;

    for (const iface of interfaces) {
        for (const alt of iface.alternates) {
            for (const ep of alt.endpoints) {
                if (ep.direction === 'out') {
                    results.push({
                        interfaceNum: iface.interfaceNumber,
                        endpointNum: ep.endpointNumber,
                        type: ep.type  // 'bulk', 'interrupt', etc.
                    });
                    console.log(`📡 Found OUT endpoint: IF#${iface.interfaceNumber} EP#${ep.endpointNumber} type=${ep.type}`);
                }
            }
        }
    }

    // Prioritas: Bulk OUT pertama
    const bulkOut = results.find(r => r.type === 'bulk');
    if (bulkOut) {
        return {
            interfaceNum: bulkOut.interfaceNum,
            endpointNum: bulkOut.endpointNum,
            fallbacks: results.filter(r => r !== bulkOut)
        };
    }

    // Fallback: Ambil ANY out endpoint (interrupt, dsb)
    if (results.length > 0) {
        const primary = results[0];
        console.warn(`⚠️ No Bulk OUT found, using ${primary.type} EP#${primary.endpointNum} as fallback`);
        return {
            interfaceNum: primary.interfaceNum,
            endpointNum: primary.endpointNum,
            fallbacks: results.slice(1)
        };
    }

    return null;
}

/**
 * AGGRESSIVE: Coba claim interface dengan multiple strategy
 * Strategy 1: Claim interface yang ditemukan dari endpoint scan
 * Strategy 2: Force claim interface 0 (Windows sering butuh ini)
 * Strategy 3: Coba selectAlternateInterface jika claim gagal
 */
async function aggressiveClaimInterface(device, targetInterface) {
    const strategies = [
        { name: 'Target Interface', ifNum: targetInterface },
        { name: 'Force Interface 0', ifNum: 0 },
        { name: 'Force Interface 1', ifNum: 1 }
    ];

    // Deduplicate
    const seen = new Set();
    const uniqueStrategies = strategies.filter(s => {
        if (seen.has(s.ifNum)) return false;
        seen.add(s.ifNum);
        return true;
    });

    for (const strategy of uniqueStrategies) {
        try {
            console.log(`🔧 Trying claimInterface: ${strategy.name} (IF#${strategy.ifNum})...`);
            await device.claimInterface(strategy.ifNum);
            console.log(`✅ claimInterface SUCCESS: ${strategy.name} (IF#${strategy.ifNum})`);
            return strategy.ifNum;
        } catch (err) {
            console.warn(`⚠️ claimInterface FAILED for ${strategy.name} (IF#${strategy.ifNum}):`, err.message);
            // Pada Windows, coba selectAlternateInterface sebelum claim ulang
            try {
                await device.selectAlternateInterface(strategy.ifNum, 0);
                await device.claimInterface(strategy.ifNum);
                console.log(`✅ claimInterface SUCCESS via selectAlternateInterface: IF#${strategy.ifNum}`);
                return strategy.ifNum;
            } catch (_) {
                // Lanjut ke strategy berikutnya
            }
        }
    }

    throw new Error('Gagal claim interface pada semua strategy. Coba cabut dan pasang ulang kabel USB.');
}

/**
 * UNIVERSAL: Connect ke Printer USB via OTG Cable (WebUSB API)
 * v2.3.0 — Aggressive mode untuk Windows + Android
 */
async function connectToUSBPrinter() {
    // --- FAILSAFE 1: Cek dukungan browser ---
    if (!isWebUSBSupported()) {
        showAlert('❌ Browser tidak mendukung WebUSB. Gunakan Chrome/Edge versi terbaru.', 'danger');
        return false;
    }

    try {
        console.log('🔌 Meminta akses USB Device...');

        // Request device — user akan memilih dari popup browser
        usbPrinterDevice = await navigator.usb.requestDevice({ filters: [] });

        console.log(`🔌 Device dipilih: ${usbPrinterDevice.productName || 'Unknown'} (VID:${usbPrinterDevice.vendorId}, PID:${usbPrinterDevice.productId})`);

        // Open device
        await usbPrinterDevice.open();
        console.log('✅ USB Device Opened');

        // Select configuration jika belum ada
        if (usbPrinterDevice.configuration === null) {
            try {
                await usbPrinterDevice.selectConfiguration(1);
                console.log('✅ Configuration Selected');
            } catch (cfgErr) {
                console.warn('⚠️ selectConfiguration(1) failed, continuing...', cfgErr.message);
            }
        }

        // --- STEP 1: Cari endpoint via auto-scan ---
        usbEndpointInfo = findPrinterEndpoint(usbPrinterDevice);

        if (usbEndpointInfo) {
            console.log(`✅ Auto-detected Endpoint: IF#${usbEndpointInfo.interfaceNum}, EP#${usbEndpointInfo.endpointNum}`);
        } else {
            // --- STEP 2: FALLBACK — Paksa endpoint default printer thermal ---
            console.warn('⚠️ Auto-detect endpoint GAGAL. Menggunakan fallback default...');
            usbEndpointInfo = {
                interfaceNum: 0,
                endpointNum: 1,  // Endpoint 1 = default printer thermal 58mm/80mm
                fallbacks: [{ interfaceNum: 0, endpointNum: 2 }, { interfaceNum: 0, endpointNum: 3 }]
            };
            console.log(`🔧 Fallback Endpoint: IF#0, EP#1 (dengan fallback EP#2, EP#3)`);
        }

        // --- STEP 3: AGGRESSIVE Claim Interface ---
        const claimedInterface = await aggressiveClaimInterface(usbPrinterDevice, usbEndpointInfo.interfaceNum);
        usbEndpointInfo.interfaceNum = claimedInterface;
        console.log(`✅ Final Claimed Interface: IF#${claimedInterface}`);

        // --- STEP 4: Wake-up printer dengan ESC @ (Initialize) ---
        try {
            const wakeUpCmd = new Uint8Array([0x1B, 0x40]); // ESC @ = Initialize/Reset printer
            await usbPrinterDevice.transferOut(usbEndpointInfo.endpointNum, wakeUpCmd);
            console.log('✅ Wake-up ESC @ sent! Printer terjaga.');
        } catch (wakeErr) {
            console.warn('⚠️ Wake-up ESC @ gagal di EP#' + usbEndpointInfo.endpointNum + ':', wakeErr.message);

            // Coba fallback endpoint untuk wake-up
            if (usbEndpointInfo.fallbacks && usbEndpointInfo.fallbacks.length > 0) {
                for (const fb of usbEndpointInfo.fallbacks) {
                    try {
                        const wakeUpCmd2 = new Uint8Array([0x1B, 0x40]);
                        await usbPrinterDevice.transferOut(fb.endpointNum, wakeUpCmd2);
                        console.log(`✅ Wake-up berhasil via fallback EP#${fb.endpointNum}!`);
                        // Switch ke endpoint yang berhasil
                        usbEndpointInfo.endpointNum = fb.endpointNum;
                        break;
                    } catch (_) {
                        console.warn(`⚠️ Fallback EP#${fb.endpointNum} juga gagal`);
                    }
                }
            }
        }

        showAlert(`🖨️ Printer USB terhubung: ${usbPrinterDevice.productName || 'Printer'} (EP#${usbEndpointInfo.endpointNum})`, 'success');
        updateUSBStatusUI(true, usbPrinterDevice.productName || 'Printer USB');
        return true;

    } catch (error) {
        console.error('❌ USB Connection Error:', error);
        usbPrinterDevice = null;
        usbEndpointInfo = null;

        // --- Error handling spesifik ---
        if (error.name === 'NotFoundError') {
            showAlert('⚠️ Tidak ada perangkat USB dipilih. Pastikan kabel OTG terhubung.', 'warning');
        } else if (error.name === 'SecurityError') {
            showAlert('❌ Akses USB ditolak oleh browser. Coba lagi atau cek izin.', 'danger');
        } else if (error.name === 'NetworkError') {
            showAlert('❌ Gagal membuka koneksi USB. Cabut dan pasang ulang kabel OTG, lalu coba lagi.', 'danger');
        } else {
            showAlert('❌ Gagal menghubungkan printer USB: ' + error.message, 'danger');
        }
        updateUSBStatusUI(false);
        return false;
    }
}

/**
 * UNIVERSAL: Kirim byte data ke printer USB via transferOut
 * v2.3.0 — Dengan wake-up command, chunking, dan retry fallback endpoint
 */
async function sendToUSBPrinter(data) {
    if (!usbPrinterDevice || !usbEndpointInfo) {
        throw new Error('Printer USB belum terhubung.');
    }

    // Prepend wake-up ESC @ sebelum setiap payload untuk memastikan printer awake
    const wakeUp = new Uint8Array([0x1B, 0x40]);
    const fullPayload = new Uint8Array(wakeUp.length + data.length);
    fullPayload.set(wakeUp, 0);
    fullPayload.set(data, wakeUp.length);

    const CHUNK_SIZE = 4096;

    // Attempt 1: Kirim ke endpoint utama
    try {
        for (let i = 0; i < fullPayload.length; i += CHUNK_SIZE) {
            const chunk = fullPayload.slice(i, i + CHUNK_SIZE);
            await usbPrinterDevice.transferOut(usbEndpointInfo.endpointNum, chunk);
        }
        console.log(`✅ Data terkirim via EP#${usbEndpointInfo.endpointNum} (${fullPayload.length} bytes)`);
        return;
    } catch (primaryErr) {
        console.warn(`⚠️ transferOut EP#${usbEndpointInfo.endpointNum} gagal:`, primaryErr.message);
    }

    // Attempt 2: Retry dengan fallback endpoints
    const fallbacks = usbEndpointInfo.fallbacks || [
        { endpointNum: 1 }, { endpointNum: 2 }, { endpointNum: 3 }
    ];

    for (const fb of fallbacks) {
        if (fb.endpointNum === usbEndpointInfo.endpointNum) continue; // Skip yang sudah gagal
        try {
            console.log(`🔄 Retry via fallback EP#${fb.endpointNum}...`);
            for (let i = 0; i < fullPayload.length; i += CHUNK_SIZE) {
                const chunk = fullPayload.slice(i, i + CHUNK_SIZE);
                await usbPrinterDevice.transferOut(fb.endpointNum, chunk);
            }
            // Switch ke endpoint yang berhasil untuk penggunaan selanjutnya
            console.log(`✅ Data terkirim via fallback EP#${fb.endpointNum}! Switching default endpoint.`);
            usbEndpointInfo.endpointNum = fb.endpointNum;
            return;
        } catch (fbErr) {
            console.warn(`⚠️ Fallback EP#${fb.endpointNum} juga gagal:`, fbErr.message);
        }
    }

    // Semua endpoint gagal
    throw new Error('Semua endpoint gagal mengirim data. Coba cabut dan pasang ulang kabel USB.');
}

/**
 * Disconnect printer USB
 */
async function disconnectUSBPrinter() {
    if (usbPrinterDevice) {
        try {
            if (usbEndpointInfo) {
                await usbPrinterDevice.releaseInterface(usbEndpointInfo.interfaceNum);
            }
            await usbPrinterDevice.close();
        } catch (e) {
            console.warn('USB disconnect warning:', e);
        }
        usbPrinterDevice = null;
        usbEndpointInfo = null;
        console.log('🔌 Printer USB terputus.');
        showAlert('Printer USB terputus.', 'warning');
        updateUSBStatusUI(false);
    }
}

/**
 * Convert Uint8Array to Base64 string
 * @param {Uint8Array} bytes - ESC/POS byte array
 * @returns {string} Base64 encoded string
 */
function uint8ArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Send ESC/POS data to RawBT via custom rawbt: URI scheme
 * Uses the correct scheme that matches RawBT's registered Intent Filter.
 *
 * Format: rawbt:base64,<Base64EncodedESCPOSData>
 *
 * The previous "intent:...#Intent;scheme=rawbt;..." Chrome Intent syntax
 * was INCORRECT — it caused Android to redirect to Play Store because
 * Chrome's intent:// resolver couldn't match it to RawBT's actual
 * intent filter. The rawbt: custom scheme is what RawBT registers
 * in its AndroidManifest.xml and will directly launch the app.
 *
 * @param {Uint8Array} bytes - ESC/POS byte array
 */
function sendToRawBT(bytes) {
    try {
        const base64Data = uint8ArrayToBase64(bytes);

        // Construct rawbt: URI — this is the scheme RawBT actually registers
        // Format: rawbt:base64,<data>
        const rawbtURI = 'rawbt:base64,' + base64Data;

        console.log(`📲 Launching RawBT via custom scheme (${bytes.length} bytes → ${base64Data.length} chars Base64)...`);

        // Strategy: Use a hidden iframe to trigger the intent WITHOUT navigating
        // away from the current POS page. This prevents the page from reloading
        // and losing state. If iframe approach fails (some browsers block it),
        // fall back to window.location.href with a slight delay.
        let launched = false;

        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = rawbtURI;
            document.body.appendChild(iframe);

            // Cleanup iframe after 3 seconds
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 3000);

            launched = true;
            console.log('✅ RawBT intent dispatched via iframe');
        } catch (iframeErr) {
            console.warn('⚠️ Iframe launch failed, using window.location fallback:', iframeErr.message);
        }

        // Fallback: direct location change (may cause page reload on some browsers)
        if (!launched) {
            window.location.href = rawbtURI;
            console.log('✅ RawBT intent dispatched via window.location');
        }

        showAlert('📲 Struk dikirim ke printer Bluetooth via RawBT', 'success');

    } catch (error) {
        console.error('❌ RawBT Intent error:', error);
        showAlert('❌ Gagal mengirim ke printer Bluetooth: ' + error.message, 'danger');
    }
}

// Fungsi untuk format teks struk dengan padding yang benar (32 karakter)
function formatStrukLine(left, right, width = 32) {
    const leftStr = String(left);
    const rightStr = String(right);
    const spaces = Math.max(1, width - leftStr.length - rightStr.length);
    return leftStr + ' '.repeat(spaces) + rightStr;
}

// Kirim struk ke printer (Smart Auto-Routing: USB OTG → RawBT Intent)
// v2.9.0-auto-routing — Silent fallback, no user prompts
async function cetakStruk(transaksi) {
    try {
        // --- PREPARE DATA ---
        const paidAtDate = transaksi?.paidAtDate ? new Date(transaksi.paidAtDate) :
            (transaksi?.date ? new Date(transaksi.date) : new Date());
        const parts = formatDateTimeParts(paidAtDate);
        const txNo = transaksi.transactionNo || generateTransactionNo(paidAtDate);

        const subtotal = Number(transaksi.subtotal) || 0;
        const discount = Number(transaksi.discount) || 0;
        const taxPercent = Number(transaksi.tax) || 0;
        const taxableBase = Math.max(0, subtotal - discount);
        const taxAmount = (taxableBase * taxPercent) / 100;
        const total = Number(transaksi.total) || taxableBase + taxAmount;
        const amountPaid = Number(transaksi.payment?.amountPaid) || total;
        const change = Number(transaksi.payment?.change) || Math.max(0, amountPaid - total);

        // === ENCODING ESC/POS COMMANDS (Raw Text Mode) ===
        const encoder = new TextEncoder();
        const ESC = 0x1B;
        const GS = 0x1D;

        const CMD_INIT = [ESC, 0x40];                    // Initialize printer
        const CMD_ALIGN_CENTER = [ESC, 0x61, 0x01];      // Center alignment
        const CMD_ALIGN_LEFT = [ESC, 0x61, 0x00];        // Left alignment
        const CMD_BOLD_ON = [ESC, 0x45, 0x01];           // Bold ON
        const CMD_BOLD_OFF = [ESC, 0x45, 0x00];          // Bold OFF
        const CMD_ITALIC_ON = [ESC, 0x34];               // Italic ON (ESC 4)
        const CMD_ITALIC_OFF = [ESC, 0x35];              // Italic OFF (ESC 5)
        const CMD_FEED_5 = [ESC, 0x64, 0x05];            // Feed 5 lines agar teks kebijakan pengembalian melewati pisau
        const CMD_CUT_PAPER = [GS, 0x56, 0x41, 0x00];   // Partial cut (GS V 65 0) — lebih aman dari full cut

        // === HEADER (Center-aligned, DEWA BAN = Bold+Italic) ===
        const headerBytes = [
            ...CMD_INIT,
            ...CMD_ALIGN_CENTER,
            ...CMD_BOLD_ON,
            ...CMD_ITALIC_ON,
            ...encoder.encode('DEWA BAN\n'),
            ...CMD_BOLD_OFF,                                // Bold OFF segera setelah judul
            ...CMD_ITALIC_OFF,                              // Italic OFF segera setelah judul
            ...encoder.encode('Jl. Wolter Monginsidi No.KM.12\n'),
            ...encoder.encode('Genuksari, Kec. Genuk, Semarang\n'),
            ...encoder.encode('Telp: 0812-2259-9525\n'),
        ];

        // === INFO TRANSAKSI (Left-aligned) ===
        const infoBytes = [
            ...CMD_ALIGN_LEFT,
            ...encoder.encode('================================\n'),
            ...encoder.encode(`No: ${txNo}\n`),
            ...encoder.encode(`Tgl: ${parts.dateTime}\n`),
            ...(transaksi.cashier ? encoder.encode(`Kasir: ${transaksi.cashier}\n`) : []),
            ...((transaksi.mechanic || transaksi.staff) ? encoder.encode(`Mekanik: ${transaksi.mechanic || transaksi.staff}\n`) : []),
            ...encoder.encode('================================\n'),
        ];

        // === ITEMS (Left-aligned, 32 char padded) ===
        const itemsBytes = [];
        (transaksi.items || []).forEach(it => {
            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            const namaBarang = `${it.name} x${qty}`;
            const harga = `Rp ${formatNumber(price * qty)}`;

            // v3.0: Split item names if too long
            if ((namaBarang.length + harga.length + 1) <= 32) {
                const line = formatStrukLine(namaBarang, harga, 32) + '\n';
                itemsBytes.push(...encoder.encode(line));
            } else {
                // Line 1: Item Name (truncated to 32 chars)
                const line1 = namaBarang.substring(0, 32) + '\n';
                itemsBytes.push(...encoder.encode(line1));

                // Line 2: Price right aligned
                const line2 = formatStrukLine('', harga, 32) + '\n';
                itemsBytes.push(...encoder.encode(line2));
            }
        });

        // === TOTALS (Left-aligned, 32 char padded) ===
        const totalBytes = [
            ...encoder.encode('================================\n'),
            ...encoder.encode(formatStrukLine('Sub Total', `Rp ${formatNumber(subtotal)}`, 32) + '\n'),
            ...(discount > 0 ? encoder.encode(formatStrukLine('Potongan', `-Rp ${formatNumber(discount)}`, 32) + '\n') : []),
            ...(taxPercent > 0 ? encoder.encode(formatStrukLine(`Pajak (${taxPercent}%)`, `Rp ${formatNumber(taxAmount)}`, 32) + '\n') : []),
            ...CMD_BOLD_ON,
            ...encoder.encode(formatStrukLine('TOTAL', `Rp ${formatNumber(total)}`, 32) + '\n'),
            ...CMD_BOLD_OFF,
            ...encoder.encode(formatStrukLine('Dibayar', `Rp ${formatNumber(amountPaid)}`, 32) + '\n'),
            ...encoder.encode(formatStrukLine('Kembali', `Rp ${formatNumber(change)}`, 32) + '\n'),
            ...encoder.encode('================================\n'),
        ];

        // === FOOTER (Center-aligned) + CUT setelah feed 5 baris ===
        const footerBytes = [
            ...CMD_ALIGN_CENTER,
            ...CMD_ITALIC_ON,                                       // Italic ON untuk tagline
            ...encoder.encode('YOUR TYRE SOLUTION\n'),
            ...CMD_ITALIC_OFF,                                      // Italic OFF segera setelah tagline
            ...encoder.encode('TERIMA KASIH ATAS KUNJUNGAN ANDA\n'),
            ...encoder.encode('Barang yang sudah dibeli\n'),
            ...encoder.encode('tidak dapat ditukar/dikembalikan'),  // TANPA \n — langsung feed
            ...CMD_FEED_5,                                          // Feed 5 baris agar teks melewati pisau
            ...CMD_CUT_PAPER                                        // Potong kertas setelah feed selesai
        ];

        // === GABUNGKAN SEMUA BYTES ===
        const allBytes = new Uint8Array([
            ...headerBytes,
            ...infoBytes,
            ...itemsBytes,
            ...totalBytes,
            ...footerBytes
        ]);

        // ========================================
        // SMART AUTO-ROUTING LOGIC
        // ========================================

        // Prioritas 1: USB OTG (jika sudah terkoneksi)
        if (usbPrinterDevice && usbEndpointInfo) {
            try {
                console.log('🔌 Attempting USB print...');
                await sendToUSBPrinter(allBytes);
                showAlert('🖨️ Struk terkirim via USB!', 'success');
                return true;
            } catch (usbError) {
                // USB gagal (kabel tercabut, device error, dll)
                console.warn('⚠️ USB print failed, switching to RawBT...', usbError);

                // Reset USB state
                usbPrinterDevice = null;
                usbEndpointInfo = null;
                updateUSBStatusUI(false);

                // Fallback ke RawBT secara silent
                sendToRawBT(allBytes);
                return true;
            }
        }

        // Prioritas 2: Jika USB tidak terkoneksi sejak awal, langsung gunakan RawBT
        console.log('📲 USB not connected, using RawBT Intent...');
        sendToRawBT(allBytes);
        return true;

    } catch (error) {
        console.error('❌ Error cetakStruk:', error);
        showAlert('❌ Error Print: ' + error.message, 'danger');
        return false;
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
                <div><b><i>"YOUR TYRE SOLUTION"</i></b></div>
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

// Brand logo file input change event (preview) - UNLIMITED SIZE
if (brandLogoInput) {
    brandLogoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file && brandLogoPreview) {
            // Validate file type only (NO SIZE LIMIT)
            if (!file.type.startsWith('image/')) {
                showAlert('File harus berupa gambar', 'warning');
                e.target.value = '';
                return;
            }

            try {
                // Show compressing status
                const statusEl = document.querySelector('#brand-logo-container .text-muted');
                if (statusEl) {
                    statusEl.innerHTML = '<i class="bi bi-arrow-repeat spin me-1"></i>Sedang mengompres...';
                }

                // Auto-compress
                const compressedBase64 = await compressImage(file);
                brandLogoPreview.src = compressedBase64;

                if (statusEl) {
                    statusEl.innerHTML = `<i class="bi bi-check-circle text-success me-1"></i>Logo siap (${Math.round(file.size / 1024)}KB → compressed)`;
                }
            } catch (err) {
                console.error('Compression error:', err);
                // Fallback
                const reader = new FileReader();
                reader.onload = (event) => {
                    brandLogoPreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
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


// ===================================
// QUICK EDIT INTEGRATED FUNCTIONS (v53.4)
// ===================================

// Temporary storage for new images (Base64)
let pendingProductImage = null;
let pendingBrandLogo = null;

window.openEditModal = function (productId) {
    // Reset pending image
    pendingProductImage = null;

    // Cari produk
    const product = products.find(p => p.id == productId);
    if (!product) {
        console.error('Produk tidak ditemukan:', productId);
        return;
    }

    // Isi Form
    const costPrice = product.costPrice || 0;

    document.getElementById('qe-product-id').value = product.id;
    document.getElementById('qe-product-name').value = product.name;
    document.getElementById('qe-product-stock').value = product.stock;
    document.getElementById('qe-product-price').value = product.price;
    document.getElementById('qe-product-cost').value = costPrice;

    // Set image preview
    const preview = document.getElementById('qe-product-image-preview');
    if (preview) {
        preview.src = product.image || 'img/logo.png';
    }

    // Reset file input
    const fileInput = document.getElementById('qe-product-image');
    if (fileInput) fileInput.value = '';

    // Tampilkan Modal
    const modalEl = document.getElementById('quickEditModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};

// Handle product image preview on file select (UNLIMITED SIZE - AUTO COMPRESS)
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('qe-product-image');
    const preview = document.getElementById('qe-product-image-preview');
    const statusLabel = document.querySelector('#quickEditModal .text-muted');

    if (fileInput && preview) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate type only (NO SIZE LIMIT)
            if (!file.type.startsWith('image/')) {
                alert('File harus berupa gambar');
                e.target.value = '';
                return;
            }

            try {
                // Show compressing status
                if (statusLabel) {
                    statusLabel.textContent = 'Sedang mengompres...';
                    statusLabel.classList.remove('text-success', 'text-danger');
                    statusLabel.classList.add('text-warning');
                }

                // Auto-compress image (accepts ANY size)
                const compressedBase64 = await compressImage(file);
                pendingProductImage = compressedBase64;
                preview.src = pendingProductImage;

                // Update status
                if (statusLabel) {
                    statusLabel.textContent = `Siap disimpan (${Math.round(file.size / 1024)}KB → compressed)`;
                    statusLabel.classList.remove('text-warning');
                    statusLabel.classList.add('text-success');
                }
            } catch (err) {
                console.error('Compression error:', err);
                // Fallback to Base64 without compression
                const reader = new FileReader();
                reader.onload = (event) => {
                    pendingProductImage = event.target.result;
                    preview.src = pendingProductImage;
                };
                reader.readAsDataURL(file);

                if (statusLabel) {
                    statusLabel.textContent = 'Kompres gagal, disimpan tanpa kompres';
                    statusLabel.classList.remove('text-warning', 'text-success');
                    statusLabel.classList.add('text-danger');
                }
            }
        });
    }

    // Brand logo preview handler (UNLIMITED SIZE - AUTO COMPRESS)
    const brandLogoInput = document.getElementById('be-brand-logo');
    const brandLogoPreview = document.getElementById('be-brand-logo-preview');
    const brandStatusLabel = document.querySelector('#brandEditModal .text-muted');

    if (brandLogoInput && brandLogoPreview) {
        brandLogoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate type only (NO SIZE LIMIT)
            if (!file.type.startsWith('image/')) {
                alert('File harus berupa gambar');
                e.target.value = '';
                return;
            }

            try {
                // Show compressing status
                if (brandStatusLabel) {
                    brandStatusLabel.textContent = 'Sedang mengompres...';
                    brandStatusLabel.classList.remove('text-success', 'text-danger');
                    brandStatusLabel.classList.add('text-warning');
                }

                // Auto-compress image (accepts ANY size)
                const compressedBase64 = await compressImage(file);
                pendingBrandLogo = compressedBase64;
                brandLogoPreview.src = pendingBrandLogo;

                // Update status
                if (brandStatusLabel) {
                    brandStatusLabel.textContent = `Logo siap (${Math.round(file.size / 1024)}KB → compressed)`;
                    brandStatusLabel.classList.remove('text-warning');
                    brandStatusLabel.classList.add('text-success');
                }
            } catch (err) {
                console.error('Compression error:', err);
                // Fallback to Base64 without compression
                const reader = new FileReader();
                reader.onload = (event) => {
                    pendingBrandLogo = event.target.result;
                    brandLogoPreview.src = pendingBrandLogo;
                };
                reader.readAsDataURL(file);

                if (brandStatusLabel) {
                    brandStatusLabel.textContent = 'Kompres gagal';
                    brandStatusLabel.classList.add('text-danger');
                }
            }
        });
    }
});

window.saveProductChange = function () {
    const id = document.getElementById('qe-product-id').value;
    const name = document.getElementById('qe-product-name').value;
    const stock = Number(document.getElementById('qe-product-stock').value);
    const price = Number(document.getElementById('qe-product-price').value);
    const cost = Number(document.getElementById('qe-product-cost').value);

    // Validasi Sederhana
    if (stock < 0 || price < 0 || cost < 0) {
        alert('Nilai tidak boleh negatif');
        return;
    }

    // Update Array Produk
    const index = products.findIndex(p => p.id == id);
    if (index !== -1) {
        products[index].name = name;
        products[index].stock = stock;
        products[index].price = price;
        products[index].costPrice = cost;

        // Update image if new one was uploaded
        if (pendingProductImage) {
            products[index].image = pendingProductImage;
        }

        // Simpan ke LocalStorage
        localStorage.setItem('products', JSON.stringify(products));

        // Update Firebase (Jika tersedia)
        if (typeof db !== 'undefined' && typeof firebase !== 'undefined') {
            const updateData = {
                name: name,
                stock: stock,
                price: price,
                costPrice: cost
            };

            if (pendingProductImage) {
                updateData.image = pendingProductImage;
            }

            db.ref('products/' + id).update(updateData).then(() => {
                console.log('Firebase updated');
            }).catch(err => {
                console.error('Firebase update failed', err);
            });
        }

        // Reset pending image
        pendingProductImage = null;

        // Render Ulang / Reload
        alert('Produk berhasil diperbarui!');
        window.location.reload();
    } else {
        alert('Gagal menemukan produk untuk diupdate');
    }
};

// ===================================
// BRAND EDIT FUNCTIONS (v53.4 - NEW)
// ===================================

window.openBrandEditModal = function (brandName) {
    // Reset pending logo
    pendingBrandLogo = null;

    // Store original brand name for cascade update
    document.getElementById('be-brand-original').value = brandName;
    document.getElementById('be-brand-name').value = brandName;

    // Find a product with this brand to get existing logo
    const productWithLogo = products.find(p =>
        p.brand && p.brand.toUpperCase() === brandName.toUpperCase() && p.logo
    );

    const logoUrl = productWithLogo?.logo || getBrandImage(brandName);

    // Set logo preview
    const preview = document.getElementById('be-brand-logo-preview');
    if (preview) {
        preview.src = logoUrl;
    }

    // Reset file input
    const fileInput = document.getElementById('be-brand-logo');
    if (fileInput) fileInput.value = '';

    // Tampilkan Modal
    const modalEl = document.getElementById('brandEditModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};

window.saveBrandChange = function () {
    const originalBrand = document.getElementById('be-brand-original').value;
    const newBrandName = document.getElementById('be-brand-name').value.trim();

    // Validasi
    if (!newBrandName || newBrandName.length < 2) {
        alert('Nama merek minimal 2 karakter');
        return;
    }

    // Count products affected
    const affectedProducts = products.filter(p =>
        p.brand && p.brand.toUpperCase() === originalBrand.toUpperCase()
    );

    if (affectedProducts.length === 0) {
        alert('Tidak ada produk dengan merek ini');
        return;
    }

    // Confirm if brand name changed
    if (originalBrand !== newBrandName) {
        const confirmMsg = `Anda akan mengubah nama merek "${originalBrand}" menjadi "${newBrandName}".\n\n` +
            `${affectedProducts.length} produk akan terupdate.\n\nLanjutkan?`;
        if (!confirm(confirmMsg)) {
            return;
        }
    }

    // CASCADE UPDATE: Update all products with this brand
    affectedProducts.forEach(product => {
        const idx = products.findIndex(p => p.id === product.id);
        if (idx !== -1) {
            // Update brand name
            products[idx].brand = newBrandName;

            // Update logo if new one was uploaded
            if (pendingBrandLogo) {
                products[idx].logo = pendingBrandLogo;
            }

            // Update Firebase if available
            if (typeof db !== 'undefined' && typeof firebase !== 'undefined') {
                const updateData = { brand: newBrandName };
                if (pendingBrandLogo) {
                    updateData.logo = pendingBrandLogo;
                }

                db.ref('products/' + product.id).update(updateData).catch(err => {
                    console.error('Firebase update failed for product', product.id, err);
                });
            }
        }
    });

    // Save to LocalStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Reset pending logo
    pendingBrandLogo = null;

    // Success message
    alert(`Merek berhasil diubah!\n${affectedProducts.length} produk terupdate.`);
    window.location.reload();
};


// ========================================
// v3.0 FEATURE ADDITIONS
// ========================================

/**
 * Kirim Struk via WhatsApp
 * Membuka WA dengan pesan terformat berisi detail transaksi
 */
function shareViaWhatsApp(transaction) {
    if (!transaction) return;

    // 1. Minta nomor WA pelanggan (opsional, bisa kosong jika user ingin input manual di WA)
    let phoneNumber = prompt("Masukkan nomor WhatsApp pelanggan (contoh: 0812...):", "");
    if (phoneNumber === null) return; // Cancelled

    // Format nomor: Ganti 08... dengan 628...
    phoneNumber = phoneNumber.trim();
    if (phoneNumber.startsWith("08")) {
        phoneNumber = "628" + phoneNumber.substring(2);
    } else if (phoneNumber.startsWith("8")) {
        phoneNumber = "62" + phoneNumber;
    }
    // Jika user tidak input, biarkan kosong (akan buka WA tanpa nomor spesifik, user pilih kontak sendiri)

    // 2. Buat Teks Struk
    const paidAtDate = transaction.paidAtDate ? new Date(transaction.paidAtDate) : new Date(transaction.date);
    const dateStr = formatDateTimeParts(paidAtDate).dateTime;
    const items = transaction.items || [];

    let text = `*DEWA BAN - STRUK TRANSAKSI*\n`;
    text += `No: ${transaction.transactionNo}\n`;
    text += `Tgl: ${dateStr}\n`;
    text += `Kasir: ${transaction.cashier || '-'}\n`;
    text += `--------------------------------\n`;

    items.forEach(it => {
        text += `${it.name} x${it.quantity} = Rp ${formatNumber((it.price || 0) * (it.quantity || 0))}\n`;
    });

    text += `--------------------------------\n`;
    text += `Subtotal: Rp ${formatNumber(transaction.subtotal || 0)}\n`;
    if (transaction.discount > 0) text += `Diskon: -Rp ${formatNumber(transaction.discount)}\n`;
    if (transaction.tax > 0) text += `Pajak: Rp ${formatNumber((transaction.total - (transaction.subtotal - transaction.discount)))}\n`;
    text += `*TOTAL: Rp ${formatNumber(transaction.total || 0)}*\n`;
    text += `Metode: ${transaction.payment?.method ? transaction.payment.method.toUpperCase() : 'CASH'}\n`;
    text += `\n_Terima kasih telah berbelanja di DEWA BAN._`;

    // 3. Encode URI
    const encodedText = encodeURIComponent(text);

    // 4. Buka WA Link
    let url = "";
    if (phoneNumber) {
        url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    } else {
        url = `https://wa.me/?text=${encodedText}`;
    }

    window.open(url, '_blank');
}

/**
 * Hapus Semua Transaksi (Danger Zone)
 * 2x Konfirmasi untuk keamanan
 */
function deleteAllTransactions() {
    const history = getTransactionHistory();
    if (history.length === 0) {
        showAlert('Riwayat transaksi sudah kosong.', 'info');
        return;
    }

    if (!confirm(`⚠️ PERINGATAN KERAS ⚠️\n\nAnda akan MENGHAPUS SEMUA riwayat transaksi (${history.length} data).\nData yang dihapus TIDAK BISA dipulihkan.\n\nApakah anda yakin?`)) {
        return;
    }

    if (!confirm(`🛡️ KONFIRMASI TERAKHIR 🛡️\n\nKetik "OK" jika anda benar-benar ingin menghapus seluruh data penjualan dari database.`)) {
        return;
    }

    // Eksekusi Hapus LocalStorage
    localStorage.removeItem('transactions');

    // Eksekusi Hapus Firebase (Jika connected)
    if (typeof db !== 'undefined' && typeof firebase !== 'undefined') {
        db.ref('transactions').remove()
            .then(() => {
                console.log('🔥 Semua transaksi dihapus dari Firebase.');
            })
            .catch(err => {
                console.error('Gagal hapus Firebase:', err);
            });
    }

    renderTransactionHistory();
    renderBusinessAnalytics(); // Update chart jadi kosong
    renderAdminDailyStats();   // Update stats jadi 0
    showAlert('Semua riwayat transaksi telah dihapus.', 'success');
}

// ========================================
// ANALISIS BISNIS (Chart.js)
// ========================================

const charts = {
    revenue: null,
    topProducts: null,
    brandSales: null
};

window.renderBusinessAnalytics = function () {
    console.log('📊 Rendering Analytics...');
    // Dapatkan data terbaru
    const transactions = getTransactionHistory(); // Gunakan fungsi helper yang ada

    renderRevenueChart(transactions);
    renderTopProductsChart(transactions);
    renderBrandSalesChart(transactions);

    // Update critical stock table juga
    const criticalTable = document.getElementById('critical-stock-tbody');
    if (criticalTable) {
        // Logic critical stock (≤ 5)
        const criticalItems = products.filter(p => (Number(p.stock) || 0) <= 5);
        criticalTable.innerHTML = '';

        const emptyMsg = document.getElementById('critical-stock-empty');
        if (criticalItems.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('d-none');
        } else {
            if (emptyMsg) emptyMsg.classList.add('d-none');
            criticalItems.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="fw-bold">${p.name}</div>
                        <small class="text-muted">${p.brand || '-'}</small>
                    </td>
                    <td class="text-center">
                        <span class="badge ${p.stock <= 0 ? 'bg-danger' : 'bg-warning text-dark'}">
                            ${p.stock} pcs
                        </span>
                    </td>
                    <td class="text-end">
                       <button class="btn btn-sm btn-link p-0" onclick="openEditModal('${p.id}')">
                           <i class="bi bi-pencil-square"></i>
                       </button>
                    </td>
                `;
                criticalTable.appendChild(tr);
            });
        }
    }

    // Update KPI Cards
    const today = new Date();
    const todayTrans = transactions.filter(t => isSameLocalDate(new Date(t.date), today));

    const omzet = todayTrans.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    const profit = todayTrans.reduce((sum, t) => {
        const itemProfit = (t.items || []).reduce((isum, it) => {
            const cost = Number(it.costPrice) || (Number(it.price) * 0.8);
            return isum + ((Number(it.price) - cost) * Number(it.quantity));
        }, 0);
        return sum + itemProfit;
    }, 0);

    const itemsSold = todayTrans.reduce((sum, t) => {
        return sum + (t.items || []).reduce((isum, it) => isum + (Number(it.quantity) || 0), 0);
    }, 0);

    document.getElementById('admin-daily-omzet').textContent = `Rp ${formatNumber(omzet)}`;
    document.getElementById('admin-daily-transactions').textContent = todayTrans.length;
    document.getElementById('admin-daily-items').textContent = `${itemsSold} pcs`;
    document.getElementById('admin-daily-profit').textContent = `Rp ${formatNumber(profit)}`;
};

function renderRevenueChart(transactions) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Prepare Data: Last 7 Days
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); // "18 Feb"
        labels.push(dateStr);

        // Sum revenue for this day
        const dayRevenue = transactions
            .filter(t => isSameLocalDate(new Date(t.date), d) && !t.isRefunded) // v3.1 Exclude Refunded
            .reduce((sum, t) => {
                const profit = (t.items || []).reduce((psum, it) => {
                    const cost = Number(it.costPrice) || Math.round(Number(it.price) * 0.8);
                    return psum + ((Number(it.price) - cost) * Number(it.quantity));
                }, 0);
                return sum + profit;
            }, 0);

        data.push(dayRevenue);
    }

    if (charts.revenue) charts.revenue.destroy();

    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Laba',
                data: data,
                borderColor: '#dc3545', // Danger Red
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: (val) => 'Rp ' + formatNumber(val) } }
            }
        }
    });
}

function renderTopProductsChart(transactions) {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    // Aggregate Product Sales from ALL history? Or just this month? Let's do ALL for now or last 30 days.
    // User asked for "Top 5 Products Sold". Usually historical.
    const productSales = {};
    transactions.forEach(t => {
        if (t.isRefunded) return; // v3.1 Exclude Refunded
        (t.items || []).forEach(it => {
            const name = it.name;
            const qty = Number(it.quantity) || 0;
            productSales[name] = (productSales[name] || 0) + qty;
        });
    });

    // Sort Top 5
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1]) // Descending
        .slice(0, 5);

    const labels = sortedProducts.map(p => p[0]); // Names
    const data = sortedProducts.map(p => p[1]);   // Qtys

    if (charts.topProducts) charts.topProducts.destroy();

    charts.topProducts = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Terjual (Pcs)',
                data: data,
                backgroundColor: [
                    '#ffc107', '#fd7e14', '#dc3545', '#198754', '#0d6efd'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal Bar
            plugins: { legend: { display: false } }
        }
    });
}

function renderBrandSalesChart(transactions) {
    const ctx = document.getElementById('brandSalesChart');
    if (!ctx) return;

    // Aggregate Brand Sales
    const brandSales = {};
    transactions.forEach(t => {
        if (t.isRefunded) return; // v3.1 Exclude Refunded
        (t.items || []).forEach(it => {
            let brand = it.brand;

            if (!brand) {
                // Cari di master product
                const masterP = products.find(p => p.id === it.id || p.name === it.name);
                if (masterP && masterP.brand) brand = masterP.brand;
                else brand = 'Lainnya';
            }

            const qty = Number(it.quantity) || 0;
            brandSales[brand] = (brandSales[brand] || 0) + qty;
        });
    });

    const labels = Object.entries(brandSales).map(([k, v]) => `${k} (${v} pcs)`);
    const data = Object.values(brandSales);

    if (charts.brandSales) charts.brandSales.destroy();

    charts.brandSales = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF0000', // Red
                    '#00FF00', // Green
                    '#0000FF', // Blue
                    '#FFFF00', // Yellow
                    '#FFA500', // Orange
                    '#800080', // Purple
                    '#00FFFF', // Cyan
                    '#FF00FF', // Magenta
                    '#008000', // Dark Green
                    '#000080', // Navy
                    '#808000', // Olive
                    '#800000', // Maroon
                    '#008080', // Teal
                    '#808080', // Grey
                    '#C0C0C0'  // Silver
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10 } }
            }
        }
    });
}


// ========================================
// PAYROLL & SHIFT SYSTEM (v4.0 - FINAL)
// ========================================

// v4.8: Helper to reset payroll date filter to today
function resetPayrollDateFilter() {
    const dateInput = document.getElementById('payroll-date-filter');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

function initPayrollSystem() {
    // 1. Bind Payroll Settings Save Button
    const savePayrollBtn = document.getElementById('save-payroll-settings-btn');
    if (savePayrollBtn) {
        savePayrollBtn.addEventListener('click', savePayrollSettings);
    }

    // 2. Bind Start Shift Button
    const startShiftBtn = document.getElementById('start-shift-btn');
    if (startShiftBtn) {
        startShiftBtn.addEventListener('click', startShift);
    }

    // 3. Load Payroll Settings to Modal Inputs
    const payrollModal = document.getElementById('payrollSettingsModal');
    if (payrollModal) {
        payrollModal.addEventListener('show.bs.modal', loadPayrollSettings);
    }

    // 4. v4.8: Live 'change' listeners on filter inputs (replaces dead filter button)
    const payrollDateInput = document.getElementById('payroll-date-filter');
    const payrollMechanicSelect = document.getElementById('payroll-mechanic-filter');
    if (payrollDateInput) {
        payrollDateInput.addEventListener('change', renderPayrollDashboard);
    }
    if (payrollMechanicSelect) {
        payrollMechanicSelect.addEventListener('change', renderPayrollDashboard);
    }

    const payrollTab = document.getElementById('payroll-tab');
    if (payrollTab) {
        payrollTab.addEventListener('shown.bs.tab', () => {
            resetPayrollDateFilter(); // v4.8: Always reset to today
            populatePayrollMechanicFilter(); // Refresh mechanics list
            renderPayrollDashboard();
        });
    }

    // 5. Set Default Date to Today
    resetPayrollDateFilter();

    // 6. The Gatekeeper: Check Active Shift
    checkShiftGatekeeper();

    // =============================================
    // v4.2: CONNECT DEAD BUTTONS & MODAL SYNC
    // =============================================

    // 7. Connect #add-mechanic-cbtn to addNewMechanicMaster()
    const addMechanicBtn = document.getElementById('add-mechanic-cbtn');
    if (addMechanicBtn) {
        addMechanicBtn.addEventListener('click', addNewMechanicMaster);
    }

    // 8. Connect #btn-toggle-shift to handleToggleShift()
    const toggleShiftBtn = document.getElementById('btn-toggle-shift');
    if (toggleShiftBtn) {
        toggleShiftBtn.addEventListener('click', handleToggleShift);
    }

    // 9. Sync Mechanic Modal: populate list every time it opens
    const mechanicModalEl = document.getElementById('mechanicModal');
    if (mechanicModalEl) {
        mechanicModalEl.addEventListener('show.bs.modal', () => {
            populateMechanicListModal();
        });
        // v4.2: When mechanic modal closes, refresh ALL dependent dropdowns
        mechanicModalEl.addEventListener('hidden.bs.modal', () => {
            populatePayrollMechanicFilter();
            populateShiftMechanicDropdown();
        });
    }

    // 10. Sync Open Shift Modal: populate dropdown every time it opens
    const openShiftModalEl = document.getElementById('openShiftModal');
    if (openShiftModalEl) {
        openShiftModalEl.addEventListener('show.bs.modal', () => {
            populateShiftMechanicDropdown();
        });
    }

    // 11. 'Tanpa Pasang' Toggle Button (v4.8: proper ON/OFF toggle)
    const btnTanpaPasang = document.getElementById('btn-tanpa-pasang');
    if (btnTanpaPasang) {
        btnTanpaPasang.addEventListener('click', () => {
            const discountInput = document.getElementById('discount');
            const billEl = document.getElementById('bill-amount');

            if (!isTanpaPasangMode) {
                // === TURN ON ===
                isTanpaPasangMode = true;
                if (discountInput) discountInput.value = 10000;
                btnTanpaPasang.className = 'btn btn-danger w-100 mb-3';
                btnTanpaPasang.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Tanpa Pasang AKTIF \u2014 Batalkan';
            } else {
                // === TURN OFF ===
                isTanpaPasangMode = false;
                if (discountInput) discountInput.value = 0;
                btnTanpaPasang.className = 'btn btn-warning w-100 mb-3';
                btnTanpaPasang.innerHTML = '<i class="bi bi-box-seam me-2"></i>Tanpa Pasang (Diskon Rp 10.000) \u2014 OFF';
            }

            // Recalculate totals & refresh payment modal
            updateTotals();
            const total = currentTransaction.total;
            if (billEl) billEl.value = `Rp ${formatNumber(total)}`;
            calculateChange();
        });
    }

    // 12. Update staff name in header based on active shift (v4.2)
    applySettingsToUI();
}

function loadPayrollSettings() {
    const settings = JSON.parse(localStorage.getItem('payrollSettings') || '{}');
    if (document.getElementById('payroll-basic-salary')) {
        document.getElementById('payroll-basic-salary').value = settings.basicSalary || '';
    }
    if (document.getElementById('payroll-tire-fee-day')) {
        document.getElementById('payroll-tire-fee-day').value = settings.tireFeeDay || '';
    }
    if (document.getElementById('payroll-tire-fee-night')) {
        document.getElementById('payroll-tire-fee-night').value = settings.tireFeeNight || '';
    }

    // v4.4: Render brand exclusion checkboxes
    const container = document.getElementById('payroll-exclusion-list');
    if (container) {
        container.innerHTML = '';
        const excludedBrands = settings.excludedBrands || [];

        // Collect all unique brands from product catalog
        const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

        allBrands.forEach(brand => {
            const id = `excl-brand-${brand.replace(/\s+/g, '-').toLowerCase()}`;
            const isChecked = excludedBrands.includes(brand);
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input payroll-brand-exclusion" type="checkbox" value="${brand}" id="${id}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="${id}">${brand}</label>
            `;
            container.appendChild(div);
        });
    }
}

function savePayrollSettings() {
    const basicSalary = document.getElementById('payroll-basic-salary').value;
    const tireFeeDay = document.getElementById('payroll-tire-fee-day').value;
    const tireFeeNight = document.getElementById('payroll-tire-fee-night').value;

    // v4.4: Collect excluded brands from checkboxes
    const excludedBrands = [];
    document.querySelectorAll('.payroll-brand-exclusion:checked').forEach(cb => {
        excludedBrands.push(cb.value);
    });

    const settings = {
        basicSalary: Number(basicSalary) || 0,
        tireFeeDay: Number(tireFeeDay) || 0,
        tireFeeNight: Number(tireFeeNight) || 0,
        excludedBrands: excludedBrands // v4.4
    };

    localStorage.setItem('payrollSettings', JSON.stringify(settings));

    // Hide Modal
    const modalEl = document.getElementById('payrollSettingsModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    showAlert('Parameter gaji berhasil disimpan', 'success');
    renderPayrollDashboard(); // Refresh dashboard if settings changed
}

// --- SHIFT LOGIC ---

function updateShiftButtonUI() {
    const activeShift = localStorage.getItem('activeShift');
    const btn = document.getElementById('btn-toggle-shift');
    if (!btn) return;

    if (activeShift) {
        // Shift Open -> Show Close Option
        btn.innerHTML = '<i class="bi bi-stop-circle-fill me-1"></i>Tutup Shift';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-danger');
    } else {
        // Shift Closed -> Show Open Option
        btn.innerHTML = '<i class="bi bi-play-circle-fill me-1"></i>Buka Shift';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-success');
    }
}

function handleToggleShift() {
    const activeShift = localStorage.getItem('activeShift');
    if (activeShift) {
        // Close Shift
        if (confirm('Apakah Anda yakin ingin MENUTUP Shift ini?')) {
            localStorage.removeItem('activeShift');
            updateShiftButtonUI();
            // v4.2: Update staff name in header
            applySettingsToUI();
            showAlert('Shift berhasil ditutup.', 'success');
        }
    } else {
        // Open Shift Modal
        const modalEl = document.getElementById('openShiftModal');
        const modal = new bootstrap.Modal(modalEl);
        // Refresh mechanic dropdown in modal from master list
        populateShiftMechanicDropdown();
        modal.show();
    }
}

// --- MASTER EMPLOYEE CRUD ---

function getMechanicMasterList() {
    const defaultMechs = ['Ipeng', 'Kipli', 'Agus'];
    const stored = JSON.parse(localStorage.getItem('mechanicsList') || '[]');
    // Merge defaults if stored is empty or just use stored
    if (stored.length === 0) return defaultMechs;
    return stored;
}

function saveMechanicMasterList(list) {
    localStorage.setItem('mechanicsList', JSON.stringify(list));
    populatePayrollMechanicFilter();
    populateMechanicListModal();
    populateShiftMechanicDropdown(); // Update the shift modal dropdown too
}

function addNewMechanicMaster() {
    const input = document.getElementById('new-mechanic-cname');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;

    const list = getMechanicMasterList();
    if (list.includes(name)) {
        alert('Nama karyawan sudah ada!');
        return;
    }

    list.push(name);
    saveMechanicMasterList(list);
    input.value = '';
    showAlert('Karyawan berhasil ditambahkan', 'success');
}

function deleteMechanicMaster(name) {
    if (!confirm(`Hapus karyawan ${name}?`)) return;
    let list = getMechanicMasterList();
    list = list.filter(m => m !== name);
    saveMechanicMasterList(list);
}

function populateMechanicListModal() {
    const ul = document.getElementById('mechanic-list-group');
    if (!ul) return;
    ul.innerHTML = '';
    const list = getMechanicMasterList();

    list.forEach(name => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${name}
            <button class="btn btn-sm btn-outline-danger" onclick="deleteMechanicMaster('${name}')">
                <i class="bi bi-trash"></i>
            </button>
        `;
        ul.appendChild(li);
    });
}

function populateShiftMechanicDropdown() {
    const select = document.getElementById('shift-mechanic');
    if (!select) return;
    const list = getMechanicMasterList();
    select.innerHTML = '<option value="" selected disabled>Pilih Mekanik...</option>';
    list.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });
}

function checkShiftGatekeeper() {
    // Deprecated: No longer force popup on load
    // Keep function for potential future manual checks
    updateShiftButtonUI();
}

function startShift() {
    const mechanic = document.getElementById('shift-mechanic').value;
    const type = document.getElementById('shift-type').value;

    if (!mechanic) {
        alert('Harap pilih mekanik yang bertugas!');
        return;
    }

    const shiftData = {
        mechanic: mechanic,
        type: type, // 'Siang' or 'Malam'
        startTime: new Date().toISOString()
    };

    localStorage.setItem('activeShift', JSON.stringify(shiftData));

    // Hide Modal
    const modalEl = document.getElementById('openShiftModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    updateShiftButtonUI();
    // v4.2: Update staff name in header immediately
    applySettingsToUI();
    showAlert(`Shift ${type} dimulai. Selamat bertugas, ${mechanic}!`, 'success');
}

// ----------------------------------------------------
// PAYROLL DASHBOARD LOGIC
// ----------------------------------------------------

function populatePayrollMechanicFilter() {
    const select = document.getElementById('payroll-mechanic-filter');
    if (!select) return;

    // v4.2: Get unique mechanics from history + master list (no hardcoded names)
    const history = getTransactionHistory();
    const mechanics = new Set();

    // Add from transaction history (including legacy 'staff' field)
    history.forEach(t => {
        if (t.mechanic) mechanics.add(t.mechanic);
        if (t.staff && !t.mechanic) mechanics.add(t.staff); // Fallback for old data
    });

    // v4.2: Add from master employee list (replaces hardcoded ['Ipeng', 'Kipli', 'Agus'])
    getMechanicMasterList().forEach(m => mechanics.add(m));

    // Preserve selection
    const currentVal = select.value;

    select.innerHTML = '<option value="all">Semua Mekanik</option>';
    Array.from(mechanics).sort().forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });

    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
        select.value = currentVal;
    }
}

function renderPayrollDashboard() {
    const dateInput = document.getElementById('payroll-date-filter');
    const mechanicSelect = document.getElementById('payroll-mechanic-filter');
    const tbody = document.getElementById('payroll-audit-tbody');

    if (!dateInput || !mechanicSelect || !tbody) return;

    const filterDate = dateInput.value; // YYYY-MM-DD
    const filterMechanic = mechanicSelect.value;
    const settings = JSON.parse(localStorage.getItem('payrollSettings') || '{}');
    const dailyBase = Number(settings.basicSalary) || 0;

    // 1. Get Transaction History (exclude refunded)
    const history = getTransactionHistory().filter(t => !t.isRefunded);

    // 2. Filter Logic
    const filtered = history.filter(t => {
        // Date Filter
        if (filterDate) {
            const tDate = new Date(t.date);
            const tDateStr = tDate.getFullYear() + '-' +
                String(tDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(tDate.getDate()).padStart(2, '0');
            if (tDateStr !== filterDate) return false;
        }

        // Mechanic Filter
        if (filterMechanic !== 'all') {
            const tMech = t.mechanic || t.staff; // Fallback
            if (tMech !== filterMechanic) return false;
        }

        return true;
    });

    // 3. Calculate Totals
    let totalTrx = filtered.length;
    let totalBongkar = 0;
    let totalFee = 0;

    // 4. Populate Table & Sums
    tbody.innerHTML = '';
    filtered.forEach(t => {
        // Sums
        const bongkar = Number(t.bongkarCount) || 0;
        const fee = Number(t.mechanicFee) || 0;
        totalBongkar += bongkar;
        totalFee += fee;

        // Table Row
        const d = new Date(t.date);
        const parts = formatDateTimeParts(d);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${parts.dateTime}</td>
            <td>${t.transactionNo}</td>
            <td>${t.mechanic || t.staff || '-'}</td>
            <td class="text-center"><span class="badge ${t.shift === 'Siang' || t.shift === 'siang' ? 'bg-warning text-dark' : 'bg-dark'}">${t.shift || '-'}</span></td>
            <td class="text-center fw-bold">${bongkar}</td>
            <td class="text-end font-monospace">Rp ${formatNumber(fee)}</td>
        `;
        tbody.appendChild(tr);
    });

    // 5. Calculate Daily Salary Logic
    // "Cari tahu ada berapa "hari unik" (tanggal berbeda) di mana mekanik tersebut memiliki transaksi dengan shift === 'siang'"
    let totalDailySalary = 0;
    const uniqueDaysMap = new Map(); // Mechanic -> Set of Dates

    filtered.forEach(t => {
        const mech = t.mechanic || t.staff;
        if (!mech) return;

        // Check Shift Type (Case insensitive)
        const shift = (t.shift || '').toLowerCase();
        if (shift === 'siang') {
            const dateStr = new Date(t.date).toDateString(); // "Wed Feb 18 2026"

            if (!uniqueDaysMap.has(mech)) {
                uniqueDaysMap.set(mech, new Set());
            }
            uniqueDaysMap.get(mech).add(dateStr);
        }
    });

    uniqueDaysMap.forEach((datesSet, mechanic) => {
        totalDailySalary += datesSet.size * dailyBase;
    });

    const takeHomePay = totalFee + totalDailySalary;

    // 6. Update Summary Cards
    document.getElementById('payroll-summary-trx').textContent = totalTrx;
    document.getElementById('payroll-summary-bongkar-qty').textContent = totalBongkar;
    document.getElementById('payroll-summary-fee').textContent = `Rp ${formatNumber(totalFee)}`;
    document.getElementById('payroll-summary-daily').textContent = `Rp ${formatNumber(totalDailySalary)}`;
    document.getElementById('payroll-summary-total').textContent = `Rp ${formatNumber(takeHomePay)}`;
}
