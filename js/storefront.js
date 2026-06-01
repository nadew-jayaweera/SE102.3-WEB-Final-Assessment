// NSBM Mini Store - E-Commerce Customer Storefront Page Controller
// Saved at /d:/Project/Web/code/js/storefront.js

(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const path = window.location.pathname;
        const lastSegment = path.split("/").pop();
        
        // Router Views Initialization
        if (lastSegment === "" || lastSegment === "index.html" || lastSegment === "index") {
            initLandingView();
        } else if (lastSegment === "products.html" || lastSegment === "products") {
            initCatalogView();
        } else if (lastSegment === "product-detail.html" || lastSegment === "product-detail") {
            initProductDetailView();
        } else if (lastSegment === "checkout.html" || lastSegment === "checkout") {
            initCheckoutView();
        }
    });

    // =========================================================================
    // 1. LANDING/HOME VIEW CONTROLLER (index.html)
    // =========================================================================
    async function initLandingView() {
        const grid = document.getElementById("featured-products-grid");
        if (!grid) return;

        // Fetch products catalog, displaying the first 3 featured items
        const products = await window.NSBM.getProducts();
        const featured = products.slice(0, 3);

        if (featured.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--color-on-surface-variant); padding: 40px 0;">No products featured yet.</div>`;
            return;
        }

        let html = "";
        featured.forEach(product => {
            const priceFormatted = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
            const isOutOfStock = product.quantity <= 0 || product.status === "Out of Stock";
            
            // Map category styles
            let badgeClass = "badge-default";
            if (product.category === "Apparel") badgeClass = "badge-apparel";
            else if (product.category === "Stationery") badgeClass = "badge-stationery";
            else if (product.category === "Handmade Crafts") badgeClass = "badge-crafts";

            html += `
                <div class="product-card">
                    <div class="product-card-image-wrap">
                        <img src="${product.image}" alt="${product.name}" class="product-card-image" />
                        <span class="product-card-badge ${badgeClass}">${product.category}</span>
                        ${isOutOfStock ? `
                            <div class="out-of-stock-overlay">
                                <span class="out-of-stock-label">Out of Stock</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="product-card-content">
                        <h3 class="product-card-title line-clamp-1">${product.name}</h3>
                        <p class="product-card-desc line-clamp-2">${product.description || product.desc || ''}</p>
                        <div class="product-card-footer">
                            <span class="product-card-price">LKR ${priceFormatted}</span>
                            ${!isOutOfStock ? `<span style="font-size: 12px; color: var(--color-on-surface-variant);">${product.quantity} left</span>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: auto;">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-secondary" style="flex: 1; padding: 8px;">Details</a>
                            ${isOutOfStock ? `
                                <button disabled class="btn" style="flex: 1; background-color: var(--color-surface-container); color: var(--color-outline); cursor: not-allowed; padding: 8px;">Sold Out</button>
                            ` : `
                                <button onclick="NSBM.addToCart('${product.id}')" class="btn btn-primary" style="flex: 1; padding: 8px;">Purchase</button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    // =========================================================================
    // 2. BROWSE CATALOG VIEW CONTROLLER (products.html)
    // =========================================================================
    async function initCatalogView() {
        const grid = document.getElementById("products-grid");
        const searchInput = document.getElementById("search-input");
        const chips = document.querySelectorAll("#category-chips .chip, .chips-bar .chip");

        if (!grid) return;

        let currentCategory = "all";
        let searchQuery = "";

        // Initial catalog drawing
        async function drawCatalog() {
            grid.innerHTML = `<div style="grid-column: span 4; text-align: center; color: var(--color-on-surface-variant); padding: 60px 0; font-weight: 500;">Loading catalog...</div>`;
            const products = await window.NSBM.getProducts({
                category: currentCategory,
                search: searchQuery
            });

            if (products.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: span 4; text-align: center; padding: 60px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-on-surface-variant);">
                        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--color-outline);">search_off</span>
                        <h3 style="font-size: 20px; font-weight: 600; color: var(--color-on-surface);">No products found</h3>
                        <p style="font-size: 14px;">Try modifying your keyword search or category filters.</p>
                    </div>
                `;
                return;
            }

            let html = "";
            products.forEach(product => {
                const priceFormatted = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
                const isOutOfStock = product.quantity <= 0 || product.status === "Out of Stock";

                let badgeClass = "badge-default";
                if (product.category === "Apparel") badgeClass = "badge-apparel";
                else if (product.category === "Stationery") badgeClass = "badge-stationery";
                else if (product.category === "Handmade Crafts") badgeClass = "badge-crafts";

                html += `
                    <div class="product-card">
                        <div class="product-card-image-wrap">
                            <img src="${product.image}" alt="${product.name}" class="product-card-image" />
                            <span class="product-card-badge ${badgeClass}">${product.category}</span>
                            ${isOutOfStock ? `
                                <div class="out-of-stock-overlay">
                                    <span class="out-of-stock-label">Out of Stock</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="product-card-content">
                            <h3 class="product-card-title line-clamp-1">${product.name}</h3>
                            <p class="product-card-desc line-clamp-2">${product.description || product.desc || ''}</p>
                            <div class="product-card-footer">
                                <span class="product-card-price">LKR ${priceFormatted}</span>
                                ${!isOutOfStock ? `<span style="font-size: 12px; color: var(--color-on-surface-variant);">${product.quantity} left</span>` : ''}
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: auto;">
                                <a href="product-detail.html?id=${product.id}" class="btn btn-secondary" style="flex: 1; padding: 8px;">Details</a>
                                ${isOutOfStock ? `
                                    <button disabled class="btn" style="flex: 1; background-color: var(--color-surface-container); color: var(--color-outline); cursor: not-allowed; padding: 8px;">Sold Out</button>
                                ` : `
                                    <button onclick="NSBM.addToCart('${product.id}')" class="btn btn-primary" style="flex: 1; padding: 8px;">Purchase</button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
        }

        // Binds category click handlers
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                currentCategory = chip.getAttribute("data-category");
                drawCatalog();
            });
        });

        // Binds search query input listener
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                drawCatalog();
            });
        }

        // Check if a category query exists in URL (e.g. ?category=Apparel)
        const catParam = window.NSBM_Router.getParam("category");
        if (catParam) {
            const matchedChip = Array.from(chips).find(c => c.getAttribute("data-category") === catParam);
            if (matchedChip) {
                matchedChip.click();
                return; // Catalog drawn inside matched click
            }
        }

        drawCatalog();
    }

    // =========================================================================
    // 3. PRODUCT DETAILS VIEW CONTROLLER (product-detail.html)
    // =========================================================================
    async function initProductDetailView() {
        const prdId = window.NSBM_Router.getParam("id");
        if (!prdId) {
            window.location.href = "products.html";
            return;
        }

        // DOM elements
        const nameNode = document.getElementById("product-name");
        const priceNode = document.getElementById("product-price");
        const descNode = document.getElementById("product-desc");
        const categoryNode = document.getElementById("product-category");
        const quantityNode = document.getElementById("product-quantity");
        const imageNode = document.getElementById("product-image");
        const actionBtnNode = document.getElementById("product-action-btn");

        if (!nameNode) return;

        const product = await window.NSBM.getProductById(prdId);
        if (!product) {
            window.NSBM.showToast("Product not found.", "error");
            setTimeout(() => { window.location.href = "products.html"; }, 1500);
            return;
        }

        const priceFormatted = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const isOutOfStock = product.quantity <= 0 || product.status === "Out of Stock";

        // Populates elements
        nameNode.innerText = product.name;
        priceNode.innerText = "LKR " + priceFormatted;
        descNode.innerText = product.description || product.desc || '';
        if (categoryNode) {
            categoryNode.innerText = product.category;
            // Map color classes
            categoryNode.className = "product-card-badge";
            let badgeClass = "badge-default";
            if (product.category === "Apparel") badgeClass = "badge-apparel";
            else if (product.category === "Stationery") badgeClass = "badge-stationery";
            else if (product.category === "Handmade Crafts") badgeClass = "badge-crafts";
            categoryNode.classList.add(badgeClass);
            categoryNode.style.position = "static";
            categoryNode.style.display = "inline-block";
        }
        
        if (quantityNode) {
            if (isOutOfStock) {
                quantityNode.innerHTML = `<span style="color: var(--color-error); font-weight: 600;">Out of Stock</span>`;
            } else {
                quantityNode.innerHTML = `<span style="color: var(--color-secondary); font-weight: 600;">${product.quantity} units in stock</span>`;
            }
        }

        if (imageNode) {
            imageNode.src = product.image;
            imageNode.alt = product.name;
        }

        if (actionBtnNode) {
            if (isOutOfStock) {
                actionBtnNode.innerText = "Sold Out";
                actionBtnNode.disabled = true;
                actionBtnNode.className = "btn";
                actionBtnNode.style.cssText = "width: 100%; background-color: var(--color-surface-container); color: var(--color-outline); cursor: not-allowed;";
            } else {
                actionBtnNode.innerText = "Add to Cart";
                actionBtnNode.disabled = false;
                actionBtnNode.className = "btn btn-primary";
                actionBtnNode.style.width = "100%";
                actionBtnNode.onclick = () => window.NSBM.addToCart(product.id);
            }
        }
    }

    // =========================================================================
    // 4. CHECKOUT VIEW CONTROLLER (checkout.html)
    // =========================================================================
    function initCheckoutView() {
        const cart = window.NSBM.getCart();
        if (cart.length === 0) {
            window.NSBM.showToast("Your cart is empty. Redirecting to products...", "error");
            setTimeout(() => { window.location.href = "products.html"; }, 1500);
            return;
        }

        const summaryList = document.getElementById("summary-items");
        const totalSpan = document.getElementById("summary-total");
        const checkoutForm = document.getElementById("checkout-form");
        const checkoutSuccessCard = document.getElementById("checkout-success");

        if (!summaryList || !totalSpan) return;

        // Render Checkout Cart Summaries
        let html = "";
        let subtotal = 0;

        cart.forEach(item => {
            const priceFormatted = Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            html += `
                <div style="display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--color-outline-variant); padding-bottom: 12px; margin-bottom: 12px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background-color: var(--color-surface-container-high);" />
                    <div style="flex-grow: 1;">
                        <h4 style="font-size: 13px; font-weight: 600; color: var(--color-on-surface); line-clamp: 1;">${item.name}</h4>
                        <p style="font-size: 12px; color: var(--color-on-surface-variant); margin: 0;">LKR ${priceFormatted} x ${item.qty}</p>
                    </div>
                    <span style="font-size: 13px; font-weight: 700; color: var(--color-primary);">LKR ${(itemTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            `;
        });

        summaryList.innerHTML = html;
        totalSpan.innerText = "LKR " + subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 });

        // Bind Checkout Form Submission Event Handler
        if (checkoutForm) {
            checkoutForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const customerName = document.getElementById("customer-name").value.trim();
                const nsbmId = document.getElementById("nsbm-id").value.trim();
                const email = document.getElementById("email").value.trim();
                const phone = document.getElementById("phone").value.trim();
                const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cash';

                // Validations
                if (!customerName || !nsbmId || !email || !phone) {
                    window.NSBM.showToast("All fields are required.", "error");
                    return;
                }

                // Build Request payload details
                const payload = {
                    customerName,
                    nsbmId,
                    email,
                    phone,
                    paymentMethod,
                    items: cart.map(item => ({ id: item.id, qty: item.qty, name: item.name })),
                    total: subtotal
                };

                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Processing checkout...";
                }

                const result = await window.NSBM.createRequest(payload);

                if (result && result.status === "success") {
                    // Purchase successful! Clear cart caches
                    window.NSBM.clearCart();

                    // Render successful pickup receipt screen
                    if (checkoutSuccessCard) {
                        checkoutForm.reset();
                        checkoutForm.parentElement.style.display = "none";
                        const summaryCard = document.querySelector(".checkout-summary-card");
                        if (summaryCard) summaryCard.style.display = "none";

                        const order = result.order;
                        const totalFormatted = Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 });

                        document.getElementById("success-req-id").innerText = order.id;
                        document.getElementById("success-student-name").innerText = order.customerName;
                        document.getElementById("success-student-id").innerText = order.nsbmId;
                        document.getElementById("success-total").innerText = "LKR " + totalFormatted;
                        document.getElementById("success-payment").innerText = order.paymentMethod === "cash" ? "Cash on Pickup" : "Bank Transfer Slip";
                        
                        checkoutSuccessCard.style.display = "block";
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Submit Purchase Request";
                    }
                }
            });
        }
    }
})();
