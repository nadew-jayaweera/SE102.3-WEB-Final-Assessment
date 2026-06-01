// NSBM Mini Store - Administrative Portal Views & CRUD Controller
// Saved at /d:/Project/Web/code/js/admin.js

(function () {
    // 1. Core Administrative Route Session Guards
    document.addEventListener("DOMContentLoaded", async () => {
        const path = window.location.pathname;
        const lastSegment = path.split("/").pop();
        const isAdminPage = path.includes("/admin/") && lastSegment !== "login.html";

        if (isAdminPage) {
            // Check session authentication status via PHP API
            const authenticated = await window.NSBM.isAdminLoggedIn();
            if (!authenticated) {
                window.NSBM.showToast("Unauthorized! Admin session expired, redirecting...", "error");
                setTimeout(() => {
                    // Navigate relatives back to admin login
                    const prefix = path.includes('/admin/') ? '' : 'admin/';
                    window.location.href = `${prefix}login.html`;
                }, 1000);
                return;
            }
            // Bind admin top and sidebar links
            setupAdminSidebar(path);
        }

        // View-specific routine router
        if (lastSegment === "login.html" || lastSegment === "login") {
            initLoginView();
        } else if (lastSegment === "dashboard.html" || lastSegment === "dashboard") {
            initDashboardView();
        } else if (lastSegment === "products.html" || lastSegment === "products") {
            initManageProductsView();
        } else if (lastSegment === "add-product.html" || lastSegment === "add-product") {
            initAddEditProductView();
        } else if (lastSegment === "purchase-requests.html" || lastSegment === "purchase-requests") {
            initPurchaseRequestsView();
        }
    });

    // Sidebar navigation highlight manager
    function setupAdminSidebar(currentPath) {
        const links = document.querySelectorAll(".admin-nav-link");
        links.forEach(a => {
            const href = a.getAttribute("href");
            if (href && currentPath.endsWith(href)) {
                a.classList.add("active");
            } else {
                a.classList.remove("active");
            }
        });

        // Binds Admin Responsive Toggling triggers for mobile Burger screens
        const burgerBtn = document.querySelector(".admin-mobile-top-bar button");
        const sidebar = document.querySelector(".admin-sidebar");
        
        if (burgerBtn && sidebar) {
            // Injects backdrop overlay if missing
            let backdrop = document.querySelector(".admin-sidebar-backdrop");
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.className = "admin-sidebar-backdrop";
                document.body.appendChild(backdrop);
            }

            const toggle = () => {
                sidebar.classList.toggle("open");
                backdrop.classList.toggle("open");
            };

            burgerBtn.addEventListener("click", toggle);
            backdrop.addEventListener("click", toggle);
        }
    }

    // =========================================================================
    // 2. ADMIN LOGIN VIEW CONTROLLER (login.html)
    // =========================================================================
    function initLoginView() {
        const form = document.getElementById("login-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                window.NSBM.showToast("Username and password are required.", "error");
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Authenticating admin...";
            }

            const result = await window.NSBM.loginAdmin(username, password);

            if (result) {
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Login";
                }
            }
        });
    }

    // =========================================================================
    // 3. ADMIN DASHBOARD VIEW CONTROLLER (dashboard.html)
    // =========================================================================
    async function initDashboardView() {
        updateDashboardMetrics();
        renderRecentProducts();
    }

    async function updateDashboardMetrics() {
        const stats = await window.NSBM.getRequestsStats();

        const pNode = document.getElementById("stat-products");
        const cNode = document.getElementById("stat-categories");
        const oNode = document.getElementById("stat-pending");
        const sNode = document.getElementById("stat-completed");

        if (pNode) pNode.innerText = stats.products;
        if (cNode) cNode.innerText = stats.categories;
        if (oNode) oNode.innerText = stats.pending;
        if (sNode) sNode.innerText = stats.completed;
    }

    async function renderRecentProducts() {
        const tableBody = document.getElementById("recent-products-table");
        if (!tableBody) return;

        const products = await window.NSBM.getProducts();
        const recent = products.slice(0, 4);

        if (recent.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--color-on-surface-variant);">No products in inventory yet.</td></tr>`;
            return;
        }

        let html = "";
        recent.forEach((product, idx) => {
            const priceFormatted = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
            const rowBgStyle = idx % 2 === 1 ? 'style="background-color: var(--color-surface-container-low);"' : '';

            html += `
                <tr ${rowBgStyle}>
                    <td style="padding: 16px; display: flex; align-items: center; gap: 12px; font-weight: 500;">
                        <img src="${product.image}" alt="${product.name.replace(/"/g, '&quot;')}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--color-outline-variant);" />
                        <span>${product.name}</span>
                    </td>
                    <td style="padding: 16px; color: var(--color-on-surface-variant);">LKR ${priceFormatted}</td>
                    <td style="padding: 16px; color: var(--color-on-surface-variant);">${product.date_added || product.dateAdded || ''}</td>
                    <td style="padding: 16px; text-align: right;">
                        <a href="add-product.html?edit=${product.id}" style="color: var(--color-primary-container);" title="Edit">
                            <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
                        </a>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    }

    // =========================================================================
    // 4. MANAGE PRODUCTS VIEW CONTROLLER (products.html)
    // =========================================================================
    async function initManageProductsView() {
        const tableBody = document.getElementById("inventory-table-body");
        const searchInput = document.getElementById("admin-search");
        const categoryFilter = document.getElementById("admin-category-filter");
        
        if (!tableBody) return;

        let categoryVal = "all";
        let searchVal = "";

        async function drawInventory() {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; font-weight: 500;">Loading inventory details...</td></tr>`;
            const products = await window.NSBM.getProducts({
                category: categoryVal,
                search: searchVal
            });

            if (products.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--color-on-surface-variant);">No products matching search criteria.</td></tr>`;
                return;
            }

            let html = "";
            products.forEach((product, idx) => {
                const priceFormatted = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
                const rowBgStyle = idx % 2 === 1 ? 'style="background-color: var(--color-surface-container-low);"' : '';
                const isOutOfStock = product.quantity <= 0 || product.status === "Out of Stock";

                html += `
                    <tr ${rowBgStyle}>
                        <td style="padding: 16px; display: flex; align-items: center; gap: 12px; font-weight: 500;">
                            <img src="${product.image}" alt="${product.name.replace(/"/g, '&quot;')}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--color-outline-variant);" />
                            <span>${product.name}</span>
                        </td>
                        <td style="padding: 16px; color: var(--color-on-surface-variant);">${product.category}</td>
                        <td style="padding: 16px; font-weight: 700; color: var(--color-primary);">LKR ${priceFormatted}</td>
                        <td style="padding: 16px;">
                            ${isOutOfStock ? `
                                <span class="status-pill pill-pending" style="padding: 2px 8px; font-size: 11px;">Out of Stock</span>
                            ` : `
                                <span class="status-pill pill-completed" style="padding: 2px 8px; font-size: 11px;">${product.quantity} left</span>
                            `}
                        </td>
                        <td style="padding: 16px; color: var(--color-on-surface-variant);">${product.date_added || product.dateAdded || ''}</td>
                        <td style="padding: 16px; text-align: right; white-space: nowrap;">
                            <a href="add-product.html?edit=${product.id}" class="btn-icon" style="display: inline-flex;" title="Edit">
                                <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
                            </a>
                            <button onclick="NSBM_Admin.confirmDelete('${product.id}', '${product.name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" class="btn-icon" style="color: var(--color-error);" title="Delete">
                                <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                            </button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
        }

        // Binds filters
        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
                categoryVal = e.target.value;
                drawInventory();
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchVal = e.target.value.toLowerCase().trim();
                drawInventory();
            });
        }

        // Exposes modal confirm handler inside NSBM_Admin global
        window.NSBM_Admin = {
            confirmDelete(id, name) {
                // Injects a modal dynamic element overlay if missing
                let modal = document.getElementById("delete-modal");
                if (!modal) {
                    modal = document.createElement("div");
                    modal.id = "delete-modal";
                    modal.className = "modal-overlay";
                    modal.innerHTML = `
                        <div class="modal-container">
                            <h3 style="font-size: 18px; font-weight: 700; color: var(--color-on-surface); margin-bottom: 12px;">Delete Product</h3>
                            <p style="font-size: 14px; color: var(--color-on-surface-variant); margin-bottom: var(--spacing-md);" id="delete-modal-text"></p>
                            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                <button class="btn btn-secondary" onclick="NSBM_Admin.closeDeleteModal()">Cancel</button>
                                <button class="btn btn-danger" id="delete-modal-confirm-btn">Confirm Delete</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                }

                document.getElementById("delete-modal-text").innerHTML = `Are you sure you want to permanently delete <strong>'${name}'</strong>? This operation cannot be undone.`;
                
                const confirmBtn = document.getElementById("delete-modal-confirm-btn");
                confirmBtn.onclick = async () => {
                    confirmBtn.disabled = true;
                    confirmBtn.innerText = "Deleting...";
                    const success = await window.NSBM.deleteProduct(id);
                    if (success) {
                        this.closeDeleteModal();
                        drawInventory();
                    } else {
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = "Confirm Delete";
                    }
                };

                modal.classList.add("open");
            },

            closeDeleteModal() {
                const modal = document.getElementById("delete-modal");
                if (modal) modal.classList.remove("open");
            }
        };

        drawInventory();
    }

    // =========================================================================
    // 5. ADD / EDIT PRODUCT VIEW CONTROLLER (add-product.html)
    // =========================================================================
    async function initAddEditProductView() {
        const form = document.getElementById("product-form");
        const editId = window.NSBM_Router.getParam("edit");
        
        const titleNode = document.getElementById("page-title");
        const subtitleNode = document.getElementById("page-subtitle");
        const submitBtn = form?.querySelector('button[type="submit"]');

        const nameInput = document.getElementById("name");
        const priceInput = document.getElementById("price");
        const categoryInput = document.getElementById("category");
        const quantityInput = document.getElementById("quantity");
        const descInput = document.getElementById("desc");
        const imageInput = document.getElementById("image");
        const previewImg = document.getElementById("preview-img");

        if (!form) return;

        // Binds Image input keyup to dynamic previewer thumbnail
        if (imageInput && previewImg) {
            imageInput.addEventListener("input", (e) => {
                const url = e.target.value.trim();
                previewImg.src = url ? url : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400';
            });
        }

        let isEditMode = false;

        if (editId) {
            // Fetch product record parameters
            isEditMode = true;
            if (titleNode) titleNode.innerText = "Edit Product Details";
            if (subtitleNode) subtitleNode.innerText = "Update your product info, pricing, and stock metrics.";
            if (submitBtn) submitBtn.innerText = "Save Product Updates";

            const product = await window.NSBM.getProductById(editId);
            if (product) {
                nameInput.value = product.name;
                priceInput.value = product.price;
                categoryInput.value = product.category;
                quantityInput.value = product.quantity;
                descInput.value = product.description || product.desc || '';
                imageInput.value = product.image;
                if (previewImg) previewImg.src = product.image;
            } else {
                window.NSBM.showToast("Product not found.", "error");
                setTimeout(() => { window.location.href = "products.html"; }, 1500);
                return;
            }
        }

        // Handle Submit form payload
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value);
            const category = categoryInput.value;
            const quantity = parseInt(quantityInput.value);
            const desc = descInput.value.trim();
            const image = imageInput.value.trim();

            if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity < 0) {
                window.NSBM.showToast("Please enter correct product details.", "error");
                return;
            }

            const payload = { name, price, category, quantity, desc, image };
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Saving changes...";
            }

            let success = false;
            if (isEditMode) {
                success = await window.NSBM.updateProduct(editId, payload);
            } else {
                const res = await window.NSBM.addProduct(payload);
                success = (res !== null);
            }

            if (success) {
                setTimeout(() => { window.location.href = "products.html"; }, 1000);
            } else {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = isEditMode ? "Save Product Updates" : "Add Product to Catalog";
                }
            }
        });
    }

    // =========================================================================
    // 6. PURCHASE REQUESTS WORKFLOW CONTROLLER (purchase-requests.html)
    // =========================================================================
    async function initPurchaseRequestsView() {
        const tableBody = document.getElementById("requests-table-body");
        const searchInput = document.getElementById("request-search");

        if (!tableBody) return;

        let searchVal = "";

        async function drawRequests() {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; font-weight: 500;">Loading student requests logs...</td></tr>`;
            const requests = await window.NSBM.getRequests(searchVal);

            // Update stats cards live on purchase page
            updateRequestsMetrics(requests);

            if (requests.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--color-on-surface-variant);">No purchase requests found matching search parameters.</td></tr>`;
                return;
            }

            let html = "";
            requests.forEach((req, idx) => {
                const rowBgStyle = idx % 2 === 1 ? 'style="background-color: var(--color-surface-container-low);"' : '';
                const totalFormatted = Number(req.total).toLocaleString('en-US', { minimumFractionDigits: 2 });
                
                // Map status style classes
                let statusPill = "pill-pending";
                if (req.status === "Approved") statusPill = "pill-approved";
                else if (req.status === "Completed") statusPill = "pill-completed";
                else if (req.status === "Cancelled") statusPill = "pill-cancelled";

                // Compile item descriptive strings
                const itemsDesc = req.items.map(it => `• ${it.name} (${it.qty})`).join("<br>");

                html += `
                    <tr ${rowBgStyle}>
                        <td style="padding: 16px; font-weight: 700; color: var(--color-primary-container);">${req.id}</td>
                        <td style="padding: 16px;">
                            <div style="font-weight: 600; color: var(--color-on-surface);">${req.customer_name}</div>
                            <div style="font-size: 12px; color: var(--color-on-surface-variant);">ID: ${req.nsbm_id}</div>
                        </td>
                        <td style="padding: 16px; font-size: 13px; color: var(--color-on-surface-variant);" title="${itemsDesc.replace(/<br>/g, "\n").replace(/"/g, '&quot;')}">
                            <div style="max-height: 48px; overflow: hidden; text-overflow: ellipsis;">
                                ${itemsDesc}
                            </div>
                        </td>
                        <td style="padding: 16px; font-weight: 700; color: var(--color-primary);">LKR ${totalFormatted}</td>
                        <td style="padding: 16px; text-transform: capitalize; color: var(--color-on-surface-variant); font-weight: 500;">
                            ${req.payment_method === "cash" ? "Cash" : "Bank Slip"}
                        </td>
                        <td style="padding: 16px;">
                            <span class="status-pill ${statusPill}">${req.status}</span>
                        </td>
                        <td style="padding: 16px; text-align: right; white-space: nowrap;">
                            ${req.status === "Pending" ? `
                                <button onclick="NSBM_Requests.updateStatus('${req.id}', 'Approved')" class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;">Approve</button>
                                <button onclick="NSBM_Requests.updateStatus('${req.id}', 'Cancelled')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; color: var(--color-error); border-color: var(--color-error-container);">Cancel</button>
                            ` : ''}
                            ${req.status === "Approved" ? `
                                <button onclick="NSBM_Requests.updateStatus('${req.id}', 'Completed')" class="btn btn-primary" style="padding: 4px 8px; font-size: 12px; background-color: var(--color-secondary); color: white;">Complete</button>
                                <button onclick="NSBM_Requests.updateStatus('${req.id}', 'Cancelled')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; color: var(--color-error); border-color: var(--color-error-container);">Cancel</button>
                            ` : ''}
                            ${(req.status === "Completed" || req.status === "Cancelled") ? `
                                <span style="font-size: 12px; color: var(--color-outline); font-weight: 500;">Archived Log</span>
                            ` : ''}
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
        }

        // Binds search keyword inputs
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                searchVal = e.target.value.toLowerCase().trim();
                drawRequests();
            });
        }

        function updateRequestsMetrics(list) {
            const pending = list.filter(r => r.status === "Pending").length;
            const approved = list.filter(r => r.status === "Approved").length;
            const completed = list.filter(r => r.status === "Completed").length;
            const total = list.length;

            const peNode = document.getElementById("stat-pending");
            const apNode = document.getElementById("stat-approved");
            const coNode = document.getElementById("stat-completed");
            const toNode = document.getElementById("stat-total");

            if (peNode) peNode.innerText = pending;
            if (apNode) apNode.innerText = approved;
            if (coNode) coNode.innerText = completed;
            if (toNode) toNode.innerText = total;
        }

        // Exposes dynamic status transitions under NSBM_Requests
        window.NSBM_Requests = {
            async updateStatus(id, newStatus) {
                const success = await window.NSBM.updateRequestStatus(id, newStatus);
                if (success) {
                    drawRequests();
                }
            }
        };

        drawRequests();
    }
})();
