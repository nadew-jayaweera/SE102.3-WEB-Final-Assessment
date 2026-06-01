/**
 * NSBM GREEN MINI STORE — CART MODULE
 * Manages cart state with localStorage persistence
 */

const NSBMCart = (() => {
  const STORAGE_KEY = 'nsbm_cart';

  /* ── Load / Save ──────────────────────────────────────────── */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    dispatch();
  }

  function dispatch() {
    const count = getCount();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { count, items: load() } }));
    updateBadge(count);
  }

  /* ── Badge Update ─────────────────────────────────────────── */
  function updateBadge(count) {
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
      // Bump animation
      el.classList.remove('bump');
      void el.offsetWidth; // reflow
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 400);
    });
  }

  /* ── Cart Operations ──────────────────────────────────────── */
  function addToCart(productId, qty = 1) {
    const product = NSBMStore.getProductById(productId);
    if (!product) return false;
    if (product.stock === 0) return false;

    const items = load();
    const existing = items.find(i => i.productId === productId);

    if (existing) {
      const newQty = Math.min(existing.qty + qty, product.stock);
      existing.qty = newQty;
    } else {
      items.push({
        productId,
        name:   product.name,
        price:  product.price,
        image:  product.image,
        seller: product.seller,
        qty:    Math.min(qty, product.stock),
        stock:  product.stock,
      });
    }

    save(items);
    return true;
  }

  function removeFromCart(productId) {
    const items = load().filter(i => i.productId !== productId);
    save(items);
  }

  function updateQty(productId, qty) {
    const items = load();
    const item = items.find(i => i.productId === productId);
    if (!item) return;
    if (qty <= 0) { removeFromCart(productId); return; }
    item.qty = Math.min(qty, item.stock);
    save(items);
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    dispatch();
  }

  /* ── Getters ──────────────────────────────────────────────── */
  function getItems() {
    return load();
  }

  function getCount() {
    return load().reduce((sum, i) => sum + i.qty, 0);
  }

  function getSubtotal() {
    return load().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getDelivery() {
    const sub = getSubtotal();
    if (sub === 0) return 0;
    return sub >= 2000 ? 0 : 150;
  }

  function getTotal() {
    return getSubtotal() + getDelivery();
  }

  function isEmpty() {
    return getCount() === 0;
  }

  /* ── Init: Sync badge on page load ───────────────────────── */
  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      updateBadge(getCount());
    });
  }

  init();

  return {
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    getItems,
    getCount,
    getSubtotal,
    getDelivery,
    getTotal,
    isEmpty,
  };
})();
