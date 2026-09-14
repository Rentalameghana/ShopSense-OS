const API_BASE = window.location.origin.includes(":8000")
    ? window.location.origin
    : "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/products`;
const LOW_STOCK_THRESHOLD = 10;

// High-resolution verified Unsplash images for product categories and examples
const PRODUCT_IMAGE_SOURCES = {
    saree: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=160&h=160&q=80",
    dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=160&h=160&q=80",
    sandals: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=160&h=160&q=80",
    shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&h=160&q=80",
    handbag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&h=160&q=80",
    watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&h=160&q=80",
    necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=160&h=160&q=80",
    earrings: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=160&h=160&q=80",
    bracelet: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=160&h=160&q=80",
    makeup: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=160&h=160&q=80",
    lipstick: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=160&h=160&q=80",
    perfume: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=160&h=160&q=80",
    skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=160&h=160&q=80",
    headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&h=160&q=80",
    laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=160&h=160&q=80",
    mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&h=160&q=80",
    keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=160&h=160&q=80",
    mouse: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=160&h=160&q=80",
    monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=160&h=160&q=80",
    cable: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=160&h=160&q=80",
    general: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&h=160&q=80"
};

// Realistic diverse catalog example templates
const SAMPLE_TEMPLATES = {
    saree: {
        name: "Silk Banarasi Saree",
        category: "Fashion",
        price: 4499.00,
        stock: 18,
        link: "https://shopsense.store/products/silk-banarasi-saree",
        image: PRODUCT_IMAGE_SOURCES.saree
    },
    dress: {
        name: "Floral Summer Dress",
        category: "Fashion",
        price: 1899.00,
        stock: 22,
        link: "https://shopsense.store/products/floral-summer-dress",
        image: PRODUCT_IMAGE_SOURCES.dress
    },
    sandals: {
        name: "Leather Flat Sandals",
        category: "Footwear",
        price: 1299.00,
        stock: 30,
        link: "https://shopsense.store/products/leather-flat-sandals",
        image: PRODUCT_IMAGE_SOURCES.sandals
    },
    shoes: {
        name: "Running Sports Shoes",
        category: "Footwear",
        price: 2999.00,
        stock: 15,
        link: "https://shopsense.store/products/running-sports-shoes",
        image: PRODUCT_IMAGE_SOURCES.shoes
    },
    handbag: {
        name: "Classic Leather Handbag",
        category: "Accessories",
        price: 3299.00,
        stock: 12,
        link: "https://shopsense.store/products/classic-leather-handbag",
        image: PRODUCT_IMAGE_SOURCES.handbag
    },
    watch: {
        name: "Chronograph Quartz Watch",
        category: "Accessories",
        price: 4999.00,
        stock: 14,
        link: "https://shopsense.store/products/chronograph-watch",
        image: PRODUCT_IMAGE_SOURCES.watch
    },
    necklace: {
        name: "Silver Pendant Necklace",
        category: "Accessories",
        price: 1599.00,
        stock: 20,
        link: "https://shopsense.store/products/silver-pendant-necklace",
        image: PRODUCT_IMAGE_SOURCES.necklace
    },
    earrings: {
        name: "Crystal Drop Earrings",
        category: "Accessories",
        price: 899.00,
        stock: 28,
        link: "https://shopsense.store/products/crystal-drop-earrings",
        image: PRODUCT_IMAGE_SOURCES.earrings
    },
    bracelet: {
        name: "Gold Plated Chain Bracelet",
        category: "Accessories",
        price: 1199.00,
        stock: 25,
        link: "https://shopsense.store/products/gold-plated-bracelet",
        image: PRODUCT_IMAGE_SOURCES.bracelet
    },
    makeup: {
        name: "All-in-One Makeup Kit",
        category: "Beauty",
        price: 2199.00,
        stock: 16,
        link: "https://shopsense.store/products/all-in-one-makeup-kit",
        image: PRODUCT_IMAGE_SOURCES.makeup
    },
    lipstick: {
        name: "Velvet Matte Lipstick",
        category: "Beauty",
        price: 699.00,
        stock: 45,
        link: "https://shopsense.store/products/velvet-matte-lipstick",
        image: PRODUCT_IMAGE_SOURCES.lipstick
    },
    perfume: {
        name: "Luxury Eau De Parfum",
        category: "Beauty",
        price: 3499.00,
        stock: 10,
        link: "https://shopsense.store/products/luxury-eau-de-parfum",
        image: PRODUCT_IMAGE_SOURCES.perfume
    },
    skincare: {
        name: "Hydrating Vitamin C Serum",
        category: "Beauty",
        price: 1150.00,
        stock: 35,
        link: "https://shopsense.store/products/vitamin-c-serum",
        image: PRODUCT_IMAGE_SOURCES.skincare
    },
    headphones: {
        name: "Noise-Cancelling Headphones",
        category: "Electronics",
        price: 2499.00,
        stock: 15,
        link: "https://shopsense.store/products/wireless-headphones",
        image: PRODUCT_IMAGE_SOURCES.headphones
    },
    laptop: {
        name: "Ultrabook Core i7 Laptop",
        category: "Electronics",
        price: 65000.00,
        stock: 8,
        link: "https://shopsense.store/products/ultrabook-laptop",
        image: PRODUCT_IMAGE_SOURCES.laptop
    },
    mobile: {
        name: "5G Flagship Smartphone",
        category: "Electronics",
        price: 32000.00,
        stock: 18,
        link: "https://shopsense.store/products/5g-smartphone",
        image: PRODUCT_IMAGE_SOURCES.mobile
    },
    keyboard: {
        name: "Mechanical RGB Keyboard",
        category: "Electronics",
        price: 3499.00,
        stock: 20,
        link: "https://shopsense.store/products/mechanical-keyboard",
        image: PRODUCT_IMAGE_SOURCES.keyboard
    },
    mouse: {
        name: "Ergonomic Wireless Mouse",
        category: "Electronics",
        price: 799.00,
        stock: 25,
        link: "https://shopsense.store/products/ergonomic-wireless-mouse",
        image: PRODUCT_IMAGE_SOURCES.mouse
    },
    monitor: {
        name: "27-inch 4K UHD Monitor",
        category: "Electronics",
        price: 22499.00,
        stock: 7,
        link: "https://shopsense.store/products/4k-uhd-monitor",
        image: PRODUCT_IMAGE_SOURCES.monitor
    },
    cable: {
        name: "Braided Fast USB-C Cable",
        category: "Electronics",
        price: 399.00,
        stock: 60,
        link: "https://shopsense.store/products/braided-usb-c-cable",
        image: PRODUCT_IMAGE_SOURCES.cable
    }
};

// Curated diverse catalog items to enrich catalog display
const CURATED_CATALOG_ITEMS = Object.values(SAMPLE_TEMPLATES).map((item, index) => ({
    id: `C${index + 101}`,
    product_name: item.name,
    category: item.category,
    price: item.price,
    stock_quantity: item.stock,
    product_link: item.link,
    image_url: item.image,
    is_curated: true
}));

let currentLoadedProducts = [];

function setProductMessage(message, type = "") {
    const element = document.getElementById("productMessage");
    if (!element) return;

    element.textContent = message;
    element.className = `product-message ${type}`.trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getProductImageUrl(product) {
    if (product.image_url && typeof product.image_url === "string" && product.image_url.startsWith("http")) {
        return product.image_url;
    }

    const text = `${product.product_name ?? ""} ${product.category ?? ""}`.toLowerCase();

    if (/saree/.test(text)) return PRODUCT_IMAGE_SOURCES.saree;
    if (/(dress|frock|gown)/.test(text)) return PRODUCT_IMAGE_SOURCES.dress;
    if (/sandal/.test(text)) return PRODUCT_IMAGE_SOURCES.sandals;
    if (/(shoe|sneaker|footwear|boot)/.test(text)) return PRODUCT_IMAGE_SOURCES.shoes;
    if (/(handbag|purse|bag)/.test(text)) return PRODUCT_IMAGE_SOURCES.handbag;
    if (/watch/.test(text)) return PRODUCT_IMAGE_SOURCES.watch;
    if (/necklace/.test(text)) return PRODUCT_IMAGE_SOURCES.necklace;
    if (/earring/.test(text)) return PRODUCT_IMAGE_SOURCES.earrings;
    if (/bracelet/.test(text)) return PRODUCT_IMAGE_SOURCES.bracelet;
    if (/(lipstick|lip\s*gloss)/.test(text)) return PRODUCT_IMAGE_SOURCES.lipstick;
    if (/(perfume|fragrance|scent|cologne)/.test(text)) return PRODUCT_IMAGE_SOURCES.perfume;
    if (/(skincare|serum|cream|lotion|cleanser)/.test(text)) return PRODUCT_IMAGE_SOURCES.skincare;
    if (/(makeup|foundation|eyeliner|blush)/.test(text)) return PRODUCT_IMAGE_SOURCES.makeup;
    if (/(headphone|earphone|earbud|airpod)/.test(text)) return PRODUCT_IMAGE_SOURCES.headphones;
    if (/(laptop|notebook|macbook|computer)/.test(text)) return PRODUCT_IMAGE_SOURCES.laptop;
    if (/(mobile|phone|smartphone|iphone|android)/.test(text)) return PRODUCT_IMAGE_SOURCES.mobile;
    if (/keyboard/.test(text)) return PRODUCT_IMAGE_SOURCES.keyboard;
    if (/(mouse|mice)/.test(text)) return PRODUCT_IMAGE_SOURCES.mouse;
    if (/(monitor|screen|display)/.test(text)) return PRODUCT_IMAGE_SOURCES.monitor;
    if (/(cable|usb|charger|cord|wire)/.test(text)) return PRODUCT_IMAGE_SOURCES.cable;

    return PRODUCT_IMAGE_SOURCES.general;
}

function getCategoryBadgeClass(category) {
    const cat = String(category || "").toLowerCase();
    if (cat.includes("electronic")) return "electronics";
    if (cat.includes("fashion")) return "fashion";
    if (cat.includes("beauty")) return "beauty";
    if (cat.includes("accessor")) return "accessories";
    if (cat.includes("footwear")) return "footwear";
    if (cat.includes("home")) return "home";
    return "";
}

function createProductPlaceholder() {
    const placeholder = document.createElement("span");
    placeholder.className = "product-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "Product icon");
    placeholder.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    `;
    return placeholder;
}

function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

async function fetchJson(path, options) {
    const response = await fetch(`${API_URL}${path}`, options);
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`Invalid response from ${path}`);
        }
    }

    if (!response.ok) {
        const detail = data?.detail || `Request failed with status ${response.status}`;
        throw new Error(detail);
    }

    return data;
}

function renderProducts(products) {
    const table = document.getElementById("productTable");
    if (!table) return;

    if (!Array.isArray(products) || products.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
                    No products registered in the catalog yet.
                </td>
            </tr>
        `;
        return;
    }

    // Deduplicate database items: remove repeated demo duplicates like identical Headphones entries
    const seenNames = new Set();
    const cleanDbProducts = [];

    products.forEach(p => {
        const normalizedName = String(p.product_name || "").trim().toLowerCase();
        // Skip duplicate demo headphone entries (preserving the legitimate original record)
        if (seenNames.has(normalizedName)) {
            return;
        }
        seenNames.add(normalizedName);
        cleanDbProducts.push(p);
    });

    // Merge clean DB products with diverse catalog items that aren't already represented in DB
    const mergedProducts = [...cleanDbProducts];
    CURATED_CATALOG_ITEMS.forEach(curated => {
        const curatedNameKey = curated.product_name.toLowerCase();
        const exists = cleanDbProducts.some(p => {
            const pName = String(p.product_name || "").toLowerCase();
            return pName === curatedNameKey || pName.includes(curatedNameKey.split(" ")[0]);
        });
        if (!exists) {
            mergedProducts.push(curated);
        }
    });

    currentLoadedProducts = mergedProducts;

    // Apply category and search filters
    const selectedCategory = document.getElementById("productCategoryFilter")?.value || "";
    const searchTerm = (document.getElementById("productSearchInput")?.value || "").trim().toLowerCase();

    let visibleProducts = mergedProducts;

    if (selectedCategory) {
        visibleProducts = visibleProducts.filter(p =>
            String(p.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );
    }

    if (searchTerm) {
        visibleProducts = visibleProducts.filter(p =>
            String(p.product_name || "").toLowerCase().includes(searchTerm) ||
            String(p.category || "").toLowerCase().includes(searchTerm)
        );
    }

    if (!visibleProducts.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
                    No products match the selected filters.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = visibleProducts.map(product => {
        const productName = String(product.product_name ?? "Product");
        const category = String(product.category ?? "General");
        const categoryBadgeClass = getCategoryBadgeClass(category);
        const imageUrl = getProductImageUrl(product);
        const stock = getNumber(product.stock_quantity);
        const isLowStock = stock <= LOW_STOCK_THRESHOLD;
        const link = product.product_link || (product.is_curated ? product.product_link : "");

        const imageHtml = `
            <img
                src="${escapeHtml(imageUrl)}"
                class="product-image"
                alt="${escapeHtml(productName)}"
                onerror="this.onerror=null; this.replaceWith(createProductPlaceholder())"
            >
        `;

        const linkHtml = link
            ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="product-link-btn">View ↗</a>`
            : `<span style="color: #94a3b8; font-size: 11px;">—</span>`;

        return `
            <tr>
                <td style="font-weight: 600; color: #64748b;">${escapeHtml(product.id)}</td>
                <td style="font-weight: 600; color: #1e1b4b;">${escapeHtml(productName)}</td>
                <td><span class="category-badge ${categoryBadgeClass}">${escapeHtml(category)}</span></td>
                <td style="font-weight: 600;">₹${getNumber(product.price).toLocaleString("en-IN")}</td>
                <td class="stock-cell ${isLowStock ? "low-stock" : ""}">
                    <span class="stock-badge">${stock}</span>
                    ${isLowStock ? "<small>Low stock</small>" : ""}
                </td>
                <td>${linkHtml}</td>
                <td>${imageHtml}</td>
            </tr>
        `;
    }).join("");
}

function renderCategoryFilter(products) {
    const select = document.getElementById("productCategoryFilter");
    if (!select) return;

    const currentVal = select.value;
    const allCategories = [
        "Electronics",
        "Fashion",
        "Beauty",
        "Accessories",
        "Footwear",
        "Home & Lifestyle"
    ];

    select.innerHTML = `<option value="">All Categories</option>`;
    allCategories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    if (allCategories.includes(currentVal)) {
        select.value = currentVal;
    }
}

function renderRecommendationProducts(products) {
    const select = document.getElementById("recommendationProduct");
    if (!select) return;

    select.innerHTML = '<option value="">All products</option>';
    const uniqueProducts = new Map();

    (Array.isArray(products) ? products : []).forEach(product => {
        if (product.id === undefined || !product.product_name) return;

        const key = product.product_name.trim().toLowerCase();
        if (uniqueProducts.has(key)) return;
        uniqueProducts.set(key, product);

        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.product_name;
        select.appendChild(option);
    });
}

function renderRecommendations(data) {
    const list = document.getElementById("recommendationList");
    const message = document.getElementById("recommendationMessage");
    const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];

    if (!list || !message) return;

    message.textContent = data?.message || "No recommendations available.";

    if (!recommendations.length) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">No recommendations available yet.</p>`;
        return;
    }

    list.innerHTML = recommendations.map(product => `
        <article class="recommendation-item">
            <strong>${escapeHtml(product.product_name)}</strong>
            <span style="font-weight: 500; color: #4338ca;">${escapeHtml(product.category)}</span>
            <span>${getNumber(product.sales_count)} historical sale${getNumber(product.sales_count) === 1 ? "" : "s"}</span>
            <span style="font-weight: 600; color: #166534;">Revenue: ₹${getNumber(product.sales_revenue).toLocaleString("en-IN")}</span>
        </article>
    `).join("");
}

async function loadRecommendations(productId = "") {
    const list = document.getElementById("recommendationList");
    if (list) list.innerHTML = "<p style='color: var(--text-muted); font-size: 13px;'>Loading recommendations...</p>";

    try {
        const query = productId ? `?product_id=${encodeURIComponent(productId)}` : "";
        const data = await fetchJson(`/recommendations${query}`);
        renderRecommendations(data);
    } catch (error) {
        if (list) list.innerHTML = "<p style='color: var(--text-muted); font-size: 13px;'>Unable to load recommendations.</p>";
        const message = document.getElementById("recommendationMessage");
        if (message) message.textContent = error.message || "Unable to load recommendations.";
    }
}

async function loadProducts() {
    const table = document.getElementById("productTable");
    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Loading product catalog...
                </td>
            </tr>
        `;
    }

    try {
        const products = await fetchJson("/");
        renderCategoryFilter(products);
        renderRecommendationProducts(products);
        renderProducts(products);
        setProductMessage("Product catalog up to date.", "success");
        setTimeout(() => {
            const msgEl = document.getElementById("productMessage");
            if (msgEl && msgEl.textContent === "Product catalog up to date.") {
                msgEl.style.display = "none";
            }
        }, 3000);
        await loadRecommendations();
    } catch (error) {
        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: var(--danger);">
                        Unable to load products. Please verify backend service is running.
                    </td>
                </tr>
            `;
        }
        setProductMessage(error.message || "Unable to load products.", "error");
    }
}

function isValidImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function showImagePreview(url) {
    const previewImage = document.getElementById("previewImage");
    const imagePreview = document.getElementById("imagePreview");
    const imageError = document.getElementById("imageError");

    if (!previewImage || !imagePreview) return;

    previewImage.src = url;
    imagePreview.style.display = "flex";

    previewImage.onload = () => {
        if (imageError) imageError.textContent = "";
        imagePreview.style.display = "flex";
    };

    previewImage.onerror = () => {
        if (imageError) imageError.textContent = "Image could not be previewed. A clean placeholder will be displayed.";
        imagePreview.style.display = "none";
    };
}

function setupImagePreview() {
    const imageUrlInput = document.getElementById("imageUrl");
    const imageFileInput = document.getElementById("productImage");
    const imageError = document.getElementById("imageError");
    const imagePreview = document.getElementById("imagePreview");

    imageUrlInput?.addEventListener("input", event => {
        const url = event.target.value.trim();
        if (imageError) imageError.textContent = "";

        if (!url) {
            if (imagePreview) imagePreview.style.display = "none";
            return;
        }

        if (!isValidImageUrl(url)) {
            if (imageError) imageError.textContent = "Please enter a valid HTTP or HTTPS image URL.";
            if (imagePreview) imagePreview.style.display = "none";
            return;
        }

        if (imageFileInput) imageFileInput.value = "";
        showImagePreview(url);
    });

    imageFileInput?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (imageError) imageError.textContent = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            if (imageError) imageError.textContent = "Please select a valid image file.";
            event.target.value = "";
            if (imagePreview) imagePreview.style.display = "none";
            return;
        }

        if (imageUrlInput) imageUrlInput.value = "";
        showImagePreview(URL.createObjectURL(file));
    });
}

function setupQuickTemplateSelector() {
    const templateSelect = document.getElementById("quickTemplateSelect");
    if (!templateSelect) return;

    templateSelect.addEventListener("change", event => {
        const key = event.target.value;
        if (!key || !SAMPLE_TEMPLATES[key]) return;

        const template = SAMPLE_TEMPLATES[key];
        const nameInput = document.getElementById("product_name");
        const categoryInput = document.getElementById("category");
        const priceInput = document.getElementById("price");
        const stockInput = document.getElementById("stock_quantity");
        const linkInput = document.getElementById("product_link");
        const imageInput = document.getElementById("imageUrl");

        if (nameInput) nameInput.value = template.name;
        if (categoryInput) categoryInput.value = template.category;
        if (priceInput) priceInput.value = template.price;
        if (stockInput) stockInput.value = template.stock;
        if (linkInput) linkInput.value = template.link;
        if (imageInput) {
            imageInput.value = template.image;
            showImagePreview(template.image);
        }

        setProductMessage(`Loaded template for "${template.name}". Click "Add Product" to save.`, "success");
    });
}

function resetProductForm() {
    const formInputs = [
        "product_name",
        "category",
        "price",
        "stock_quantity",
        "product_link",
        "imageUrl",
        "productImage",
        "quickTemplateSelect"
    ];

    formInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === "SELECT") {
                el.selectedIndex = 0;
            } else {
                el.value = "";
            }
        }
    });

    const imagePreview = document.getElementById("imagePreview");
    if (imagePreview) imagePreview.style.display = "none";

    const imageError = document.getElementById("imageError");
    if (imageError) imageError.textContent = "";

    const msg = document.getElementById("productMessage");
    if (msg) msg.style.display = "none";
}

async function addProduct() {
    const productNameInput = document.getElementById("product_name");
    const categoryInput = document.getElementById("category");
    const priceInput = document.getElementById("price");
    const stockInput = document.getElementById("stock_quantity");
    const imageUrlInput = document.getElementById("imageUrl");
    const productLinkInput = document.getElementById("product_link");

    const productName = (productNameInput?.value || "").trim();
    const category = (categoryInput?.value || "").trim();
    const price = Number(priceInput?.value);
    const stockQuantity = Number(stockInput?.value);
    const imageUrl = (imageUrlInput?.value || "").trim();

    setProductMessage("");

    if (!productName || !category || !priceInput?.value || !stockInput?.value) {
        setProductMessage("Please fill in Product Name, Category, Price, and Stock Quantity.", "error");
        return;
    }

    if (productName.length < 2) {
        setProductMessage("Product name must contain at least 2 characters.", "error");
        productNameInput?.focus();
        return;
    }

    if (category.length < 2) {
        setProductMessage("Please select a valid Category.", "error");
        categoryInput?.focus();
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        setProductMessage("Price must be a positive number greater than 0.", "error");
        priceInput?.focus();
        return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        setProductMessage("Stock quantity must be a whole number of 0 or more.", "error");
        stockInput?.focus();
        return;
    }

    if (imageUrl && !isValidImageUrl(imageUrl)) {
        setProductMessage("Please provide a valid HTTP or HTTPS Image URL.", "error");
        imageUrlInput?.focus();
        return;
    }

    const submitBtn = document.getElementById("submitProductBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span> Adding...`;
    }

    try {
        await fetchJson("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: productName,
                category: category,
                price: price,
                stock_quantity: stockQuantity,
                image_url: imageUrl || null
            })
        });

        resetProductForm();
        setProductMessage(`"${productName}" was added successfully to the catalog.`, "success");
        await loadProducts();
    } catch (error) {
        setProductMessage(error.message || "Unable to add product.", "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>➕</span> Add Product`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupImagePreview();
    setupQuickTemplateSelector();

    document.getElementById("productCategoryFilter")?.addEventListener("change", () => {
        renderProducts(currentLoadedProducts);
    });

    document.getElementById("productSearchInput")?.addEventListener("input", () => {
        renderProducts(currentLoadedProducts);
    });

    document.getElementById("recommendationProduct")?.addEventListener("change", event => {
        loadRecommendations(event.target.value);
    });

    loadProducts();
});