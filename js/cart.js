// NS SHOP - E-Commerce Client Cart Engine
// Saved at /d:/Project/Web/code/js/cart.js

(function () {
    // 1. Check Seeding of Cart
    if (!localStorage.getItem("nsbm_cart")) {
        localStorage.setItem("nsbm_cart", JSON.stringify([]));
    }

    // Extend NSBM global utilities
    const CartSystem = {
        getCart() {
            return JSON.parse(localStorage.getItem("nsbm_cart")) || [];
        },
        
        saveCart(cart) {
            localStorage.setItem("nsbm_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("nsbm_cart_changed"));
            this.updateCartUI();
        },
        
        async addToCart(id, qty = 1) {
            // Retrieve item data from database
            const product = await window.NSBM.getProductById(id);
            if (!product) return false;

            if (product.quantity <= 0 || product.status === "Out of Stock") {
                window.NSBM.showToast("Sorry, this item is out of stock!", "error");
                return false;
            }

            const cart = this.getCart();
            const existingIndex = cart.findIndex(item => item.id === String(product.id));

            if (existingIndex !== -1) {
                const newQty = cart[existingIndex].qty + qty;
                if (newQty > product.quantity) {
                    window.NSBM.showToast(`Cannot add more. Only ${product.quantity} items available.`, "error");
                    return false;
                }
                cart[existingIndex].qty = newQty;
            } else {
                if (qty > product.quantity) {
                    window.NSBM.showToast(`Cannot add. Only ${product.quantity} items available.`, "error");
                    return false;
                }
                cart.push({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    qty: qty
                });
            }
            
            this.saveCart(cart);
            window.NSBM.showToast(`Added '${product.name}' to cart!`);
            this.toggleCart(true); // Auto-reveal cart drawer for premium user feedback
            return true;
        },
        
        updateCartQty(id, qty) {
            let cart = this.getCart();
            const item = cart.find(i => i.id === String(id));
            if (item) {
                item.qty = parseInt(qty) || 1;
                if (item.qty <= 0) {
                    cart = cart.filter(i => i.id !== String(id));
                }
                this.saveCart(cart);
            }
        },
        
        removeFromCart(id) {
            let cart = this.getCart();
            cart = cart.filter(item => item.id !== String(id));
            this.saveCart(cart);
            window.NSBM.showToast("Item removed from cart.", "info");
        },
        
        clearCart() {
            this.saveCart([]);
        },

        // --- 2. Slide Drawer Overlay Animations & State ---
        toggleCart(open) {
            const container = document.getElementById("cart-drawer-container");
            const backdrop = document.getElementById("cart-drawer-backdrop");
            const panel = document.getElementById("cart-drawer-panel");

            if (!container || !backdrop || !panel) return;

            if (open) {
                container.style.pointerEvents = "auto";
                backdrop.style.opacity = "0.4";
                panel.style.transform = "translateX(0)";
                this.updateCartUI();
            } else {
                backdrop.style.opacity = "0";
                panel.style.transform = "translateX(100%)";
                setTimeout(() => {
                    container.style.pointerEvents = "none";
                }, 300);
            }
        },

        // --- 3. Dynamic Drawer UI Redrawing ---
        updateCartUI() {
            const cart = this.getCart();
            const body = document.getElementById("cart-drawer-body");
            const totalSpan = document.getElementById("cart-drawer-total");
            const badge = document.getElementById("global-cart-badge");

            if (!body) return;

            // Update Badge Count Indicator
            const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
            if (badge) {
                badge.innerText = totalCount;
                if (totalCount > 0) {
                    badge.style.opacity = "1";
                    badge.style.transform = "scale(1)";
                } else {
                    badge.style.opacity = "0";
                    badge.style.transform = "scale(0.5)";
                }
            }

            // Fill items rows list inside drawer body
            if (cart.length === 0) {
                body.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--color-on-surface-variant); text-align: center; gap: 16px;">
                        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--color-outline);">shopping_cart_off</span>
                        <p style="font-size: 15px; font-weight: 500;">Your cart is empty.</p>
                        <a href="products.html" onclick="NSBM.toggleCart(false)" style="color: var(--color-primary); font-weight: 600; text-decoration: underline;">Start Shopping</a>
                    </div>
                `;
                if (totalSpan) totalSpan.innerText = "LKR 0.00";
            } else {
                let html = "";
                let subtotal = 0;

                cart.forEach(item => {
                    const priceFormatted = Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    const itemTotal = item.price * item.qty;
                    subtotal += itemTotal;

                    html += `
                        <div style="background-color: var(--color-surface); border: 1px solid var(--color-outline-variant); padding: 12px; border-radius: 12px; display: flex; gap: 12px; align-items: center; position: relative; margin-bottom: 12px; box-shadow: var(--shadow-level-1);">
                            <img src="${item.image}" alt="${item.name.replace(/"/g, '&quot;')}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background-color: var(--color-surface-container-low); flex-shrink: 0;" />
                            <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">
                                <h4 style="font-size: 13px; font-weight: 600; color: var(--color-on-surface); padding-right: 20px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 180px;">${item.name}</h4>
                                <p style="font-size: 13px; color: var(--color-primary); font-weight: 700; margin: 0;">LKR ${priceFormatted}</p>
                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                    <button onclick="NSBM.updateCartQty('${item.id}', ${item.qty - 1})" style="width: 24px; height: 24px; border: 1px solid var(--color-outline-variant); color: var(--color-on-surface-variant); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; background-color: var(--color-surface-container);">-</button>
                                    <span style="font-size: 13px; font-weight: 600; width: 24px; text-align: center;">${item.qty}</span>
                                    <button onclick="NSBM.updateCartQty('${item.id}', ${item.qty + 1})" style="width: 24px; height: 24px; border: 1px solid var(--color-outline-variant); color: var(--color-on-surface-variant); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; background-color: var(--color-surface-container);">+</button>
                                </div>
                            </div>
                            <button onclick="NSBM.removeFromCart('${item.id}')" style="position: absolute; top: 12px; right: 12px; color: var(--color-outline); border: none; cursor: pointer;" title="Remove">
                                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                            </button>
                        </div>
                    `;
                });

                body.innerHTML = html;
                if (totalSpan) totalSpan.innerText = "LKR " + subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 });
            }
        },

        proceedToCheckout() {
            const cart = this.getCart();
            if (cart.length === 0) {
                window.NSBM.showToast("Your cart is empty!", "error");
                return;
            }
            this.toggleCart(false);
            window.location.href = "checkout.html";
        },

        // --- 4. Dynamic Structure Injection ---
        injectSharedUI() {
            const isLoginPage = window.location.pathname.includes('/admin/') || window.location.pathname.includes('login.html');
            if (isLoginPage) return; // Do not inject on admin files

            // Injects dynamic Cart Drawer HTML elements
            const drawerContainer = document.createElement("div");
            drawerContainer.id = "cart-drawer-container";
            drawerContainer.style.cssText = "position: fixed; inset: 0; z-index: 1000; pointer-events: none;";
            
            drawerContainer.innerHTML = `
                <div id="cart-drawer-backdrop" class="drawer-backdrop" onclick="NSBM.toggleCart(false)"></div>
                <div id="cart-drawer-panel" class="drawer-panel">
                    <div class="drawer-head">
                        <div class="drawer-title">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Shopping Cart</h3>
                        </div>
                        <button class="btn-icon" style="display: flex;" onclick="NSBM.toggleCart(false)">
                            <span class="material-symbols-outlined" style="font-size: 24px;">close</span>
                        </button>
                    </div>
                    <div id="cart-drawer-body" class="drawer-body"></div>
                    <div class="drawer-footer">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; color: var(--color-on-surface);">
                            <span>Total</span>
                            <span id="cart-drawer-total" style="color: var(--color-primary); font-weight: 700;">LKR 0.00</span>
                        </div>
                        <button onclick="NSBM.proceedToCheckout()" class="btn btn-primary" style="width: 100%; display: flex; justify-content: center; gap: 8px; padding: 12px 16px;">
                            <span>Proceed to Checkout</span>
                            <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(drawerContainer);

            // Hook cart action badge inside navbar Actions div
            const actionsDiv = document.querySelector(".header-wrap .flex, header .flex");
            if (actionsDiv) {
                let cartBtn = actionsDiv.querySelector(".cart-trigger-btn");
                if (!cartBtn) {
                    cartBtn = document.createElement("button");
                    cartBtn.className = "cart-trigger-btn";
                    cartBtn.innerHTML = `
                        <span class="material-symbols-outlined">shopping_bag</span>
                        <span id="global-cart-badge" class="cart-badge" style="opacity: 0; transform: scale(0.5);">0</span>
                    `;
                    cartBtn.addEventListener("click", () => this.toggleCart(true));
                    actionsDiv.insertBefore(cartBtn, actionsDiv.firstChild);
                }
            }

            this.updateCartUI();
        }
    };

    // Merge into global NSBM
    Object.assign(window.NSBM, CartSystem);

    document.addEventListener("DOMContentLoaded", () => {
        window.NSBM.injectSharedUI();
    });
})();
