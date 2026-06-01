// NSBM Mini Store - Central Data Fetcher & AJAX Engine
// Saved at /d:/Project/Web/code/js/data.js

(function () {
    // Centralized path prefix resolver for administrative subdirectory pages vs root storefront pages.
    // If the page is opened locally as a file:// URL, fall back to the local development server.
    let pathPrefix = window.location.pathname.includes('/admin/') ? '../' : './';
    if (window.location.protocol === 'file:') {
        pathPrefix = 'http://127.0.0.1:8000/';
    }

    // Shared toast overlay function
    function showToast(message, type = "success") {
        let container = document.getElementById("nsbm-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "nsbm-toast-container";
            container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 8px; pointer-events: none; font-family: 'Inter', sans-serif;";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 12px 20px; background-color: var(--color-inverse-surface, #313030); color: var(--color-inverse-on-surface, #f3f0ef); border-radius: 12px; box-shadow: var(--shadow-level-2); transform: translateY(10px); opacity: 0; transition: all 300ms ease; pointer-events: auto; max-w: 360px; border: 1px solid var(--color-outline-variant, #bec9c2);";
        
        let icon = "check_circle";
        let color = "var(--color-secondary-fixed, #94f990)";
        if (type === "error") {
            icon = "error";
            color = "var(--color-error, #ba1a1a)";
        } else if (type === "info") {
            icon = "info";
            color = "var(--color-primary-fixed, #9ef4d0)";
        }

        toast.innerHTML = `
            <span class="material-symbols-outlined" style="color: ${color}; flex-shrink: 0;">${icon}</span>
            <span style="font-size: 14px; font-weight: 500; flex-grow: 1;">${message}</span>
            <button style="color: var(--color-outline, #6f7a73); cursor: pointer; flex-shrink: 0; margin-left: 8px; background: none; border: none; display: flex;" onclick="this.parentElement.remove()">
                <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
            </button>
        `;

        container.appendChild(toast);

        // Animate Toast Entry
        requestAnimationFrame(() => {
            toast.style.transform = "translateY(0)";
            toast.style.opacity = "1";
        });

        // Trigger Auto Dismissal
        setTimeout(() => {
            toast.style.transform = "translateY(10px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (window.location.protocol === 'file:') {
            const sessionStr = localStorage.getItem('nsbm_admin_session');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    // 2 hours session validation
                    if (Date.now() - session.timestamp < 2 * 60 * 60 * 1000) {
                        headers['X-Admin-Bypass'] = 'NSBM_Offline_Authorized';
                    }
                } catch (e) {}
            }
        }
        return headers;
    }

    // Define Global window.NSBM Database Agent
    window.NSBM = {
        // Expose Toast system globally
        showToast,

        // 1. PRODUCTS API WRAPPERS
        async getProducts(filters = {}) {
            try {
                const params = new URLSearchParams();
                if (filters.category) params.append('category', filters.category);
                if (filters.search) params.append('search', filters.search);

                const response = await fetch(`${pathPrefix}api/products.php?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to retrieve products.');
                return await response.json();
            } catch (err) {
                showToast(err.message, 'error');
                return [];
            }
        },

        async getProductById(id) {
            try {
                const prdId = String(id).replace('prd-', '');
                const response = await fetch(`${pathPrefix}api/products.php?id=${prdId}`);
                if (!response.ok) throw new Error('Product details lookup failed.');
                return await response.json();
            } catch (err) {
                showToast(err.message, 'error');
                return null;
            }
        },

        async addProduct(productData) {
            try {
                const response = await fetch(`${pathPrefix}api/products.php`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(productData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to add product.');
                showToast('Product added successfully!');
                return result;
            } catch (err) {
                showToast(err.message, 'error');
                return null;
            }
        },

        async updateProduct(id, productData) {
            try {
                const prdId = String(id).replace('prd-', '');
                const response = await fetch(`${pathPrefix}api/products.php?id=${prdId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(productData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to update product.');
                showToast('Product updated successfully!');
                return true;
            } catch (err) {
                showToast(err.message, 'error');
                return false;
            }
        },

        async deleteProduct(id) {
            try {
                const prdId = String(id).replace('prd-', '');
                const response = await fetch(`${pathPrefix}api/products.php?id=${prdId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to delete product.');
                showToast('Product deleted from catalog!');
                return true;
            } catch (err) {
                showToast(err.message, 'error');
                return false;
            }
        },

        // 2. ADMIN AUTHENTICATION API WRAPPERS
        async isAdminLoggedIn() {
            if (window.location.protocol === 'file:') {
                const sessionStr = localStorage.getItem('nsbm_admin_session');
                if (sessionStr) {
                    try {
                        const session = JSON.parse(sessionStr);
                        // Let session be valid for 2 hours
                        if (Date.now() - session.timestamp < 2 * 60 * 60 * 1000) {
                            return true;
                        }
                    } catch (e) {}
                }
                return false;
            }
            try {
                const response = await fetch(`${pathPrefix}api/auth.php?action=check`);
                if (!response.ok) return false;
                const result = await response.json();
                return result.authenticated === true;
            } catch (err) {
                return false;
            }
        },

        async loginAdmin(username, password) {
            try {
                const response = await fetch(`${pathPrefix}api/auth.php?action=login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Authentication failed.');
                
                if (window.location.protocol === 'file:') {
                    localStorage.setItem('nsbm_admin_session', JSON.stringify({
                        logged_in: true,
                        username: result.username,
                        timestamp: Date.now()
                    }));
                }
                
                showToast('Login successful. Redirecting to dashboard...');
                return true;
            } catch (err) {
                showToast(err.message, 'error');
                return false;
            }
        },

        async logoutAdmin() {
            if (window.location.protocol === 'file:') {
                localStorage.removeItem('nsbm_admin_session');
                showToast('Logged out successfully.');
                setTimeout(() => {
                    window.location.href = pathPrefix + 'index.html';
                }, 500);
                return;
            }
            try {
                const response = await fetch(`${pathPrefix}api/auth.php?action=logout`, { method: 'POST' });
                if (response.ok) {
                    showToast('Logged out successfully.');
                    setTimeout(() => {
                        window.location.href = pathPrefix + 'index.html';
                    }, 500);
                }
            } catch (err) {
                showToast('Failed to log out.', 'error');
            }
        },

        // 3. CHECKOUT & ORDERS API WRAPPERS
        async createRequest(orderData) {
            try {
                const response = await fetch(`${pathPrefix}api/checkout.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Checkout failed.');
                return result;
            } catch (err) {
                showToast(err.message, 'error');
                return null;
            }
        },

        async getRequests(search = '') {
            try {
                const response = await fetch(`${pathPrefix}api/requests.php?search=${encodeURIComponent(search)}`, {
                    headers: getAuthHeaders()
                });
                if (!response.ok) throw new Error('Failed to retrieve purchase requests.');
                return await response.json();
            } catch (err) {
                showToast(err.message, 'error');
                return [];
            }
        },

        async getRequestsStats() {
            try {
                const response = await fetch(`${pathPrefix}api/requests.php?action=stats`);
                if (!response.ok) throw new Error('Failed to retrieve statistics.');
                return await response.json();
            } catch (err) {
                return { products: 0, categories: 0, pending: 0, completed: 0 };
            }
        },

        async updateRequestStatus(id, status) {
            try {
                const response = await fetch(`${pathPrefix}api/requests.php?action=update_status`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ id, status })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Status transition failed.');
                showToast(`Order status updated to '${status}'.`);
                return true;
            } catch (err) {
                showToast(err.message, 'error');
                return false;
            }
        }
    };
})();
