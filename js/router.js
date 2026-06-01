/**
 * NSBM GREEN MINI STORE — ROUTER & UTILITIES
 * URL param management, nav highlighting, toast, mobile menu
 */

/* ── URL Params ───────────────────────────────────────────────── */
const NSBMRouter = {
  getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },
  setParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },
  buildUrl(base, params = {}) {
    const url = new URL(base, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.pathname + url.search;
  },
};

/* ── Toast Notifications ──────────────────────────────────────── */
const NSBMToast = {
  container: null,

  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  },

  show(message, type = 'success', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur)   { this.show(msg, 'error',   dur); },
  info(msg, dur)    { this.show(msg, 'info',     dur); },
};

/* ── Nav Highlighting ─────────────────────────────────────────── */
function highlightActiveNav() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop();
    if (
      linkFile === filename ||
      (filename === 'index.html' && (href === '/' || href === './')) ||
      (filename === ''           && (href === '/' || href === './' || linkFile === 'index.html'))
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ── Mobile Menu ──────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

/* ── Modal Helpers ────────────────────────────────────────────── */
const NSBMModal = {
  open(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) this.close(modalId);
    }, { once: true });
  },
  close(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  },
};

/* ── Debounce ─────────────────────────────────────────────────── */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ── Render Product Card ──────────────────────────────────────── */
function renderProductCard(product) {
  const stock = NSBMStore.getStockChip(product.stock);
  const price = NSBMStore.formatPrice(product.price);
  const catLabel = NSBMStore.categories.find(c => c.id === product.category)?.name || product.category;
  const root = window.location.pathname.includes('/admin') ? '../' : './';

  return `
    <article class="product-card animate-fade-in-up" onclick="window.location='${root}product-detail.html?id=${product.id}'" role="button" tabindex="0" aria-label="${product.name}">
      <div class="product-card-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-card-img-overlay"></div>
        <span class="stock-chip ${stock.cls}">${stock.label}</span>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">
          <span class="chip chip-primary">${catLabel}</span>
        </div>
        <h3 class="product-card-title">${product.name}</h3>
        <p class="product-card-seller">by ${product.seller}</p>
        <div class="product-card-footer">
          <div class="product-card-price">${price} <span>LKR</span></div>
          <button
            class="btn btn-primary btn-sm"
            onclick="event.stopPropagation(); handleAddToCart('${product.id}', this)"
            ${product.stock === 0 ? 'disabled' : ''}
            aria-label="Add ${product.name} to cart">
            ${product.stock === 0 ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </article>`;
}

/* ── Handle Add to Cart (shared) ──────────────────────────────── */
function handleAddToCart(productId, btn) {
  const ok = NSBMCart.addToCart(productId);
  if (ok) {
    const orig = btn.textContent;
    btn.textContent = '✓ Added';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
    }, 1500);
    NSBMToast.success('Added to cart!');
  } else {
    NSBMToast.error('Could not add to cart.');
  }
}

/* ── DOMContentLoaded bootstrap ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  NSBMToast.init();
  highlightActiveNav();
  initMobileMenu();
});
