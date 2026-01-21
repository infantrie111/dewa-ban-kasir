// ========================================
// AUTHENTICATION SYSTEM
// ========================================

const _u = 'am9zamlzdG9wdGlw';
const _p = 'Ym9zYWd1bmcxMjM0';

// Fungsi cek autentikasi
function checkAuth() {
    // Cek apakah sudah login di session ini
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        return true;
    }

    // Minta kredensial
    const inputUser = prompt('Masukkan Username:');
    if (!inputUser) {
        alert('Akses Ditolak!');
        location.reload();
        return false;
    }

    const inputPass = prompt('Masukkan Password:');
    if (!inputPass) {
        alert('Akses Ditolak!');
        location.reload();
        return false;
    }

    // Validasi dengan Base64
    const encodedUser = btoa(inputUser);
    const encodedPass = btoa(inputPass);

    if (encodedUser === _u && encodedPass === _p) {
        sessionStorage.setItem('isLoggedIn', 'true');
        return true;
    } else {
        alert('Akses Ditolak!');
        location.reload();
        return false;
    }
}

// Jalankan autentikasi SEGERA
if (!checkAuth()) {
    throw new Error('Unauthorized');
}

// ========================================
// FIREBASE CONFIGURATION
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

// Inisialisasi Firebase Products dengan Realtime Listener
function initFirebaseProducts() {
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

// Inisialisasi Firebase saat app load
try {
    initFirebaseProducts();
} catch (err) {
    console.error('Firebase init error:', err);
    useFirebase = false;
    firebaseReady = true;
}

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
const newNameEl = document.getElementById('new-name');
const newPriceEl = document.getElementById('new-price');
const newCostPriceEl = document.getElementById('new-cost-price');
const newStockEl = document.getElementById('new-stock');
const newImageEl = document.getElementById('new-image');
const saveNewProductBtn = document.getElementById('save-new-product');
const clearCartBtn = document.getElementById('clear-cart-btn');
const adminStockSearchInput = document.getElementById('admin-stock-search');
const adminHistoryTbody = document.getElementById('admin-history-tbody');
const adminHistoryTabBtn = document.getElementById('history-tab');

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

function getTransactionHistory() {
    return JSON.parse(localStorage.getItem(TRANSACTION_HISTORY_KEY) || '[]');
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

function renderTransactionHistory() {
    if (!adminHistoryTbody) return;
    const history = getTransactionHistory();
    const sorted = [...history].sort((a, b) => {
        const da = new Date(a?.date || 0).getTime();
        const db = new Date(b?.date || 0).getTime();
        return db - da;
    });

    adminHistoryTbody.innerHTML = '';
    sorted.forEach(t => {
        const txNo = String(t?.transactionNo || '');
        const d = new Date(t?.date || Date.now());
        const parts = formatDateTimeParts(d);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold">${txNo}</td>
            <td>${parts.dateTime}</td>
            <td>Rp ${formatNumber(Number(t?.total) || 0)}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary" data-action="reprint" data-tx="${txNo}">Cetak Ulang</button>
            </td>
            <td>
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
    const next = history.filter(t => String(t?.transactionNo || '') !== txNo);
    if (next.length === history.length) {
        showAlert('Transaksi tidak ditemukan', 'warning');
        return;
    }

    localStorage.setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(next));
    renderTransactionHistory();
    renderAdminDailyStats();
    showAlert('Transaksi dihapus', 'success');
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
            modal.show();
        });

        adminModalEl.addEventListener('show.bs.modal', () => {
            refreshAdminModal();
            renderAdminDailyStats();
            renderTransactionHistory();
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

function addNewProductFromForm() {
    const brandRaw = (newBrandEl?.value || '').trim();
    const name = (newNameEl?.value || '').trim();
    const brand = brandRaw.toUpperCase();
    const price = Number(newPriceEl?.value) || 0;
    const costRaw = (newCostPriceEl?.value ?? '').toString();
    const costPrice = costRaw.trim().length === 0 ? NaN : Number(costRaw);
    const stock = Math.max(0, Number(newStockEl?.value) || 0);
    const image = ((newImageEl?.value || '').trim() || 'img/no-image.png');

    if (!brand) {
        showAlert('Brand wajib diisi', 'warning');
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

    const newProduct = normalizeProduct({
        id: getNextProductId(),
        brand,
        name,
        price,
        costPrice,
        stock,
        image
    });

    products.push(newProduct);
    saveProducts();
    refreshCurrentProductView();
    refreshAdminModal();

    if (newBrandEl) newBrandEl.value = '';
    if (newNameEl) newNameEl.value = '';
    if (newPriceEl) newPriceEl.value = '';
    if (newCostPriceEl) newCostPriceEl.value = '';
    if (newStockEl) newStockEl.value = '0';
    if (newImageEl) newImageEl.value = '';
    showAlert('Produk baru berhasil ditambahkan', 'success');
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

    const fit = (s, len) => {
        const str = String(s);
        if (str.length <= len) return str;
        return str.slice(0, Math.max(0, len - 1)) + '…';
    };

    const lineLR = (left, right, width = 32) => {
        const r = String(right);
        const maxLeft = Math.max(0, width - r.length - 1);
        const l = fit(String(left), maxLeft);
        return (l + ' '.repeat(Math.max(1, width - l.length - r.length)) + r);
    };

    const bodyLines = [];
    bodyLines.push('--------------------------------');
    bodyLines.push(`No: ${txNo}`);
    bodyLines.push(`Tgl: ${parts.dateTime}`);
    if (transaction.cashier) bodyLines.push(`Kasir: ${transaction.cashier}`);
    if (transaction.staff) bodyLines.push(`Mekanik: ${transaction.staff}`);
    bodyLines.push('--------------------------------');

    (transaction.items || []).forEach(it => {
        const name = `${it.name} x${it.quantity}`;
        const amt = `Rp ${formatNumber((Number(it.price) || 0) * (Number(it.quantity) || 0))}`;
        bodyLines.push(lineLR(name, amt));
    });

    bodyLines.push('--------------------------------');
    bodyLines.push(lineLR('Sub Total', `Rp ${formatNumber(subtotal)}`));
    bodyLines.push(lineLR('Potongan', `-Rp ${formatNumber(discount)}`));
    bodyLines.push(lineLR(`Pajak (${taxPercent}%)`, `Rp ${formatNumber(taxAmount)}`));
    bodyLines.push(lineLR('TOTAL', `Rp ${formatNumber(total)}`));
    bodyLines.push(lineLR('Dibayar', `Rp ${formatNumber(amountPaid)}`));
    bodyLines.push(lineLR('Kembali', `Rp ${formatNumber(change)}`));
    bodyLines.push('--------------------------------');

    const receiptBodyText = escapeHtml(bodyLines.join('\n'));
    let receipt = `
        <div class="receipt">
            <div class="receipt-header">
                <h1>DEWA BAN</h1>
                <div class="receipt-address">
                    <div>Jl. Wolter Monginsidi No.KM. 12</div>
                    <div>Genuksari, Kec. Genuk, Semarang</div>
                    <div>Telp: 0812-2259-9525</div>
                </div>
            </div>
            <div class="receipt-body">
                <pre class="receipt-pre">${receiptBodyText}</pre>
            </div>
            <div class="receipt-footer">
                <div>"YOUR TIRE SOLUTION"</div>
                <div>TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
                <div>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
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
  #print-area .receipt { width: 58mm; margin: 0; padding: 2mm; }
  #print-area .receipt-pre { width: 58mm; margin: 0; padding: 0; white-space: pre-wrap; word-break: break-word; }
  #print-area .receipt-header { text-align: center; margin: 0 0 6mm 0; }
  #print-area .receipt-header h1 { font-weight: 900; font-size: 24px; font-style: italic; text-transform: uppercase; text-align: center; margin: 0 0 3mm 0; line-height: 1.1; }
  #print-area .receipt-address { text-align: center; font-size: 10px; line-height: 1.25; }
  #print-area .receipt-body { text-align: left; }
  #print-area .receipt-footer { text-align: center; margin-top: 4mm; font-size: 10px; line-height: 1.25; }
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
