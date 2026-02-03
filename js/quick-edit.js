//  ========================================
// QUICK EDIT FUNCTIONS (v53)
// ========================================

/**
 * Enable inline editing mode for product fields
 * @param {HTMLElement} element - The element that was clicked
 */
function enableQuickEdit(element) {
    // Guard: cek authentication
    if (!isAuthenticated || !currentUser) {
        alert('Anda harus login sebagai admin untuk mengedit produk');
        return;
    }

    const productId = Number(element.dataset.productId);
    const field = element.dataset.field;
    const product = products.find(p => p.id === productId);

    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    // Jangan allow edit jika sudah dalam mode edit
    if (element.querySelector('input')) {
        return;
    }

    // Ambil nilai current
    const currentValue = product[field];

    // Simpan HTML original untuk restore nanti
    const originalHTML = element.innerHTML;
    element.dataset.originalHtml = originalHTML;

    // Buat input element berdasarkan field type
    let inputHTML = '';

    if (field === 'name') {
        // Edit Nama Barang
        inputHTML = `
            <input type="text" 
                   class="form-control form-control-sm quick-edit-input" 
                   value="${currentValue}" 
                   data-original="${currentValue}"
                   style="width: 100%; font-size: inherit;">`;
    } else if (field === 'stock') {
        // Edit Stok
        inputHTML = `
            <div class="d-inline-flex align-items-center gap-1">
                Stok: 
                <input type="number" 
                       class="form-control form-control-sm quick-edit-input" 
                       style="width: 70px;"
                       min="0" 
                       value="${currentValue}" 
                       data-original="${currentValue}">
            </div>`;
    } else if (field === 'price') {
        // Edit Harga
        inputHTML = `
            <div class="d-inline-flex align-items-center gap-1">
                Rp 
                <input type="number" 
                       class="form-control form-control-sm quick-edit-input" 
                       style="width: 110px;"
                       min="1" 
                       step="1000"
                       value="${currentValue}" 
                       data-original="${currentValue}">
            </div>`;
    }

    // Replace element dengan input
    element.innerHTML = inputHTML;

    // Auto focus ke input
    const input = element.querySelector('.quick-edit-input');
    if (input) {
        input.focus();
        input.select();

        // Event listeners
        input.addEventListener('blur', () => saveQuickEdit(input, productId, field, originalHTML, element));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveQuickEdit(input, productId, field, originalHTML, element);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelQuickEdit(element, originalHTML);
            }
        });
    }
}

/**
 * Save edited value to Firebase and LocalStorage
 */
async function saveQuickEdit(inputElement, productId, field, originalHTML, parentElement) {
    const newValue = inputElement.value.trim();
    const originalValue = inputElement.dataset.original;

    // Validation
    if (field === 'name' && newValue.length < 3) {
        alert('Nama barang minimal 3 karakter');
        cancelQuickEdit(parentElement, originalHTML);
        return;
    }

    if (field === 'stock') {
        const numStock = Number(newValue);
        if (!Number.isInteger(numStock) || numStock < 0) {
            alert('Stok harus berupa angka positif (≥ 0)');
            cancelQuickEdit(parentElement, originalHTML);
            return;
        }
    }

    if (field === 'price') {
        const numPrice = Number(newValue);
        if (numPrice <= 0 || isNaN(numPrice)) {
            alert('Harga harus lebih besar dari 0');
            cancelQuickEdit(parentElement, originalHTML);
            return;
        }
    }

    // Jika tidak ada perubahan, skip save
    if (String(newValue) === String(originalValue)) {
        cancelQuickEdit(parentElement, originalHTML);
        return;
    }

    // Update local products array
    const product = products.find(p => p.id === productId);
    if (!product) {
        cancelQuickEdit(parentElement, originalHTML);
        return;
    }

    const parsedValue = (field === 'stock' || field === 'price') ? Number(newValue) : newValue;
    product[field] = parsedValue;

    // Save to Firebase & LocalStorage
    try {
        // Show loading state
        inputElement.disabled = true;
        parentElement.style.opacity = '0.6';

        // Update Firebase
        if (useFirebase && firebaseReady) {
            await db.ref(`products/${productId}/${field}`).set(parsedValue);
        }

        // Update LocalStorage
        saveProducts();

        console.log(`✅ Quick Edit berhasil: Product ${productId} → ${field} = ${parsedValue}`);
        showAlert(`${getFieldLabel(field)} berhasil diubah!`, 'success');

        // Restore dengan nilai baru
        updateDisplayValue(parentElement, field, parsedValue);

    } catch (error) {
        console.error('❌ Quick Edit gagal:', error);
        alert('Gagal menyimpan perubahan: ' + error.message);

        // Revert perubahan lokal
        product[field] = (field === 'stock' || field === 'price') ? Number(originalValue) : originalValue;
        cancelQuickEdit(parentElement, originalHTML);
    }
}

/**
 * Cancel edit and restore original HTML
 */
function cancelQuickEdit(element, originalHTML) {
    element.innerHTML = originalHTML;
    element.style.opacity = '1';
}

/**
 * Update display value after successful save
 */
function updateDisplayValue(element, field, newValue) {
    element.style.opacity = '1';

    if (field === 'name') {
        element.innerHTML = newValue;
    } else if (field === 'stock') {
        element.innerHTML = `Stok: <span class="editable-value">${newValue}</span>`;
    } else if (field === 'price') {
        element.innerHTML = `Rp <span class="editable-value">${formatNumber(newValue)}</span>`;
    }
}

/**
 * Get field label in Indonesian
 */
function getFieldLabel(field) {
    const labels = {
        name: 'Nama Barang',
        stock: 'Stok',
        price: 'Harga'
    };
    return labels[field] || field;
}

// ========================================
// HELPER: Add editable class to product cards
// ========================================

/**
 * Make product cards editable by adding necessary attributes
 * Call this function after rendering product cards
 */
function makeProductCardsEditable() {
    // Find all product cards (adjust selector based on your HTML structure)
    const productCards = document.querySelectorAll('.product-card, [data-product-id]');

    productCards.forEach(card => {
        const productId = card.dataset.productId;
        if (!productId) return;

        // Find nama barang (biasanya h5, h6, atau .card-title)
        const nameElement = card.querySelector('.card-title, h5, h6');
        if (nameElement && !nameElement.classList.contains('editable-field')) {
            nameElement.classList.add('editable-field', 'editable-name');
            nameElement.dataset.field = 'name';
            nameElement.dataset.productId = productId;
            nameElement.style.cursor = 'pointer';
            nameElement.onclick = function () { enableQuickEdit(this); };
        }

        // Find stok (biasanya ada text "Stok:")
        const stockElement = Array.from(card.querySelectorAll('p, div, span'))
            .find(el => el.textContent.includes('Stok:'));
        if (stockElement && !stockElement.classList.contains('editable-field')) {
            stockElement.classList.add('editable-field', 'editable-stock');
            stockElement.dataset.field = 'stock';
            stockElement.dataset.productId = productId;
            stockElement.style.cursor = 'pointer';
            stockElement.onclick = function () { enableQuickEdit(this); };
        }

        // Find harga (biasanya ada text "Rp ")
        const priceElement = Array.from(card.querySelectorAll('p, div, span'))
            .find(el => el.textContent.includes('Rp ') && !el.textContent.includes('Stok'));
        if (priceElement && !priceElement.classList.contains('editable-field')) {
            priceElement.classList.add('editable-field', 'editable-price');
            priceElement.dataset.field = 'price';
            priceElement.dataset.productId = productId;
            priceElement.style.cursor = 'pointer';
            priceElement.onclick = function () { enableQuickEdit(this); };
        }
    });

    console.log(`✅ Made ${productCards.length} product cards editable`);
}
