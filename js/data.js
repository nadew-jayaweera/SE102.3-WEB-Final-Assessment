/**
 * NSBM GREEN MINI STORE — MOCK DATA STORE
 * Global NSBMStore object — in-memory data layer
 */

const NSBMStore = (() => {
  /* ── Categories ───────────────────────────────────────────── */
  const categories = [
    { id: 'all',        name: 'All Products',      icon: '🛍️', count: 14 },
    { id: 'handmade',   name: 'Handmade Crafts',   icon: '🎨', count: 4  },
    { id: 'digital',    name: 'Digital Art',        icon: '🖼️', count: 2  },
    { id: 'baked',      name: 'Baked Goods',        icon: '🍰', count: 3  },
    { id: 'study',      name: 'Study Essentials',   icon: '📚', count: 3  },
    { id: 'accessories',name: 'Accessories',        icon: '💍', count: 2  },
  ];

  /* ── Products ─────────────────────────────────────────────── */
  const products = [
    {
      id: 'p001',
      name: 'Handcrafted Macramé Wall Hanging',
      category: 'handmade',
      price: 1850,
      description: 'Beautiful bohemian macramé wall hanging made with natural cotton rope. Handcrafted by an NSBM Fine Arts student. Perfect for dorm room decoration. Each piece is unique and measures approximately 45cm x 60cm.',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80',
      seller: 'Kavya Perera',
      sellerId: 's001',
      stock: 8,
      rating: 4.8,
      reviews: 12,
      featured: true,
      tags: ['decor', 'boho', 'cotton'],
    },
    {
      id: 'p002',
      name: 'Hand-Painted Ceramic Mug Set (2pc)',
      category: 'handmade',
      price: 1200,
      description: 'Set of 2 hand-painted ceramic mugs featuring original nature-inspired designs. Food-safe glaze, microwave and dishwasher safe. Capacity: 350ml each. A great gift for coffee lovers.',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
      seller: 'Dilshan Mendis',
      sellerId: 's002',
      stock: 5,
      rating: 4.6,
      reviews: 8,
      featured: true,
      tags: ['ceramics', 'mug', 'gift'],
    },
    {
      id: 'p003',
      name: 'Resin Art Coasters (Set of 4)',
      category: 'handmade',
      price: 950,
      description: 'Gorgeous set of 4 epoxy resin coasters with swirled ocean-inspired colors — teal, turquoise, and gold leaf accents. Each coaster is 10cm diameter. Comes with protective felt backing.',
      image: 'https://images.unsplash.com/photo-1615486364404-20c8c0e74e7e?w=600&q=80',
      seller: 'Sachini Fernando',
      sellerId: 's003',
      stock: 12,
      rating: 4.9,
      reviews: 21,
      featured: false,
      tags: ['resin', 'coasters', 'home'],
    },
    {
      id: 'p004',
      name: 'Pressed Flower Bookmark Collection',
      category: 'handmade',
      price: 350,
      description: 'Set of 5 laminated bookmarks featuring real pressed flowers and leaves. Each bookmark is unique and comes with a satin ribbon. Perfect for book lovers and stationery enthusiasts.',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
      seller: 'Kavya Perera',
      sellerId: 's001',
      stock: 30,
      rating: 4.7,
      reviews: 35,
      featured: false,
      tags: ['bookmarks', 'flowers', 'stationery'],
    },
    {
      id: 'p005',
      name: 'Digital Portrait — Custom Illustration',
      category: 'digital',
      price: 2500,
      description: 'Commission a one-of-a-kind digital portrait in a vibrant semi-realistic style. Send your photo and receive a high-resolution PNG (3000x3000px) within 5 business days. Personal use license included.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      seller: 'Tharindu Silva',
      sellerId: 's004',
      stock: 999,
      rating: 5.0,
      reviews: 7,
      featured: true,
      tags: ['digital', 'portrait', 'commission'],
    },
    {
      id: 'p006',
      name: 'NSBM Campus Poster Print (A3)',
      category: 'digital',
      price: 800,
      description: 'Professionally designed A3 poster showcasing iconic NSBM campus landmarks in a minimal line-art style. Printed on 200gsm matte paper. Makes a perfect keepsake or gift.',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&q=80',
      seller: 'Tharindu Silva',
      sellerId: 's004',
      stock: 50,
      rating: 4.5,
      reviews: 14,
      featured: false,
      tags: ['poster', 'campus', 'print'],
    },
    {
      id: 'p007',
      name: 'Homemade Red Velvet Cake Slice',
      category: 'baked',
      price: 280,
      description: 'Moist, fluffy red velvet cake slice with classic cream cheese frosting. Baked fresh daily using traditional recipes. Available Monday–Friday. Order by 8 AM for same-day pickup.',
      image: 'https://images.unsplash.com/photo-1586788680434-30d324626f14?w=600&q=80',
      seller: 'Nethmi Jayasinghe',
      sellerId: 's005',
      stock: 15,
      rating: 4.8,
      reviews: 42,
      featured: true,
      tags: ['cake', 'baked', 'dessert'],
    },
    {
      id: 'p008',
      name: 'Assorted Cookies Box (12pc)',
      category: 'baked',
      price: 750,
      description: 'A delightful box of 12 assorted homemade cookies — chocolate chip, oatmeal raisin, peanut butter, and coconut macaroons. Packaged in a pretty gift box with a ribbon.',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
      seller: 'Nethmi Jayasinghe',
      sellerId: 's005',
      stock: 10,
      rating: 4.9,
      reviews: 28,
      featured: false,
      tags: ['cookies', 'gift', 'baked'],
    },
    {
      id: 'p009',
      name: 'Banana Bread Loaf',
      category: 'baked',
      price: 550,
      description: 'Classic moist banana bread made with overripe bananas, walnuts, and a hint of cinnamon. One full loaf (approx. 750g). No preservatives. Made fresh every morning.',
      image: 'https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=600&q=80',
      seller: 'Ravindu Wickramasinghe',
      sellerId: 's006',
      stock: 0,
      rating: 4.7,
      reviews: 19,
      featured: false,
      tags: ['bread', 'banana', 'baked'],
    },
    {
      id: 'p010',
      name: 'Color-Coded Note Card Set (200pc)',
      category: 'study',
      price: 420,
      description: 'Set of 200 color-coded index cards (4 colors × 50 cards). Ruled on one side, blank on the other. Perfect for spaced-repetition studying, mind maps, and quick revision. Packed in a sturdy case.',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
      seller: 'Isuru Rajapaksha',
      sellerId: 's007',
      stock: 45,
      rating: 4.6,
      reviews: 33,
      featured: false,
      tags: ['study', 'notes', 'stationery'],
    },
    {
      id: 'p011',
      name: 'Premium Highlighter Set (8 Colors)',
      category: 'study',
      price: 380,
      description: 'Set of 8 dual-tip highlighters — chisel tip for broad strokes, bullet tip for fine details. Pastel and neon color mix. Smooth, bleed-resistant ink that works on all paper types.',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
      seller: 'Isuru Rajapaksha',
      sellerId: 's007',
      stock: 3,
      rating: 4.8,
      reviews: 56,
      featured: false,
      tags: ['highlighters', 'stationery', 'study'],
    },
    {
      id: 'p012',
      name: 'A5 Dot-Grid Notebook (192 Pages)',
      category: 'study',
      price: 650,
      description: 'Hardcover A5 dot-grid notebook with 192 pages of 100gsm acid-free paper. Features an index page, numbered pages, ribbon bookmark, and elastic closure. Ideal for bullet journaling.',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80',
      seller: 'Amaya Dissanayake',
      sellerId: 's008',
      stock: 18,
      rating: 4.9,
      reviews: 44,
      featured: false,
      tags: ['notebook', 'journaling', 'stationery'],
    },
    {
      id: 'p013',
      name: 'Handmade Beaded Friendship Bracelet',
      category: 'accessories',
      price: 280,
      description: 'Colorful handmade friendship bracelet with glass seed beads on elastic cord. Choose from 10 color combinations. Adjustable size, fits most wrists. Perfect gift for friends.',
      image: 'https://images.unsplash.com/photo-1573408301185-9519f94daefd?w=600&q=80',
      seller: 'Dilini Rathnayake',
      sellerId: 's009',
      stock: 25,
      rating: 4.7,
      reviews: 61,
      featured: false,
      tags: ['bracelet', 'jewelry', 'gift'],
    },
    {
      id: 'p014',
      name: 'Canvas Tote Bag — Custom Print',
      category: 'accessories',
      price: 750,
      description: 'Natural cotton canvas tote bag with custom screen-printed NSBM-themed design. 380g heavy canvas, reinforced handles, gusset bottom. Holds up to 15kg. Perfect for campus use.',
      image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
      seller: 'Amaya Dissanayake',
      sellerId: 's008',
      stock: 20,
      rating: 4.5,
      reviews: 17,
      featured: false,
      tags: ['tote', 'bag', 'canvas'],
    },
  ];

  /* ── Purchase Requests / Orders ───────────────────────────── */
  const purchaseRequests = [
    {
      id: 'ORD-2024-001',
      buyer: 'Ashan Gunawardena',
      studentId: 'NSBM/SE/2021/045',
      productId: 'p001',
      productName: 'Handcrafted Macramé Wall Hanging',
      qty: 1,
      total: 1850,
      status: 'pending',
      date: '2024-12-18',
      email: 'ashan.g@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-002',
      buyer: 'Malsha Rodrigo',
      studentId: 'NSBM/CS/2022/112',
      productId: 'p007',
      productName: 'Homemade Red Velvet Cake Slice',
      qty: 3,
      total: 840,
      status: 'approved',
      date: '2024-12-17',
      email: 'malsha.r@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-003',
      buyer: 'Yasitha Bandara',
      studentId: 'NSBM/IT/2020/089',
      productId: 'p010',
      productName: 'Color-Coded Note Card Set',
      qty: 2,
      total: 840,
      status: 'shipped',
      date: '2024-12-15',
      email: 'yasitha.b@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-004',
      buyer: 'Sithara Wijeratne',
      studentId: 'NSBM/BA/2023/034',
      productId: 'p005',
      productName: 'Digital Portrait — Custom Illustration',
      qty: 1,
      total: 2500,
      status: 'pending',
      date: '2024-12-18',
      email: 'sithara.w@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-005',
      buyer: 'Dineth Pathirana',
      studentId: 'NSBM/SE/2022/201',
      productId: 'p008',
      productName: 'Assorted Cookies Box (12pc)',
      qty: 1,
      total: 750,
      status: 'rejected',
      date: '2024-12-14',
      email: 'dineth.p@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-006',
      buyer: 'Pavithra Kumari',
      studentId: 'NSBM/CS/2021/178',
      productId: 'p012',
      productName: 'A5 Dot-Grid Notebook (192 Pages)',
      qty: 2,
      total: 1300,
      status: 'pending',
      date: '2024-12-18',
      email: 'pavithra.k@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-007',
      buyer: 'Kasun Madusanka',
      studentId: 'NSBM/IT/2023/056',
      productId: 'p013',
      productName: 'Handmade Beaded Friendship Bracelet',
      qty: 4,
      total: 1120,
      status: 'approved',
      date: '2024-12-16',
      email: 'kasun.m@students.nsbm.ac.lk',
    },
    {
      id: 'ORD-2024-008',
      buyer: 'Vinoda Perera',
      studentId: 'NSBM/BA/2022/091',
      productId: 'p011',
      productName: 'Premium Highlighter Set (8 Colors)',
      qty: 3,
      total: 1140,
      status: 'shipped',
      date: '2024-12-13',
      email: 'vinoda.p@students.nsbm.ac.lk',
    },
  ];

  /* ── Admin Credentials ────────────────────────────────────── */
  const adminUser = {
    email: 'admin@nsbm.ac.lk',
    password: 'admin123',
    name: 'Admin User',
    role: 'Store Administrator',
    initials: 'AU',
  };

  /* ── Recent Activity ──────────────────────────────────────── */
  const recentActivity = [
    { type: 'green',  text: '<strong>Malsha Rodrigo</strong> order #ORD-2024-002 was approved',      time: '5m ago'  },
    { type: 'blue',   text: '<strong>New product</strong> "Digital Portrait" listed by Tharindu',    time: '22m ago' },
    { type: 'orange', text: '<strong>Ashan Gunawardena</strong> submitted order #ORD-2024-001',       time: '1h ago'  },
    { type: 'green',  text: '<strong>Yasitha Bandara</strong> order #ORD-2024-003 marked as shipped', time: '2h ago'  },
    { type: 'red',    text: '<strong>Dineth Pathirana</strong> order #ORD-2024-005 was rejected',     time: '4h ago'  },
    { type: 'blue',   text: '<strong>New seller</strong> Dilini Rathnayake joined the marketplace',   time: '6h ago'  },
  ];

  /* ── Helpers ──────────────────────────────────────────────── */
  function getProductById(id) {
    return products.find(p => p.id === id) || null;
  }

  function getProductsByCategory(categoryId) {
    if (!categoryId || categoryId === 'all') return [...products];
    return products.filter(p => p.category === categoryId);
  }

  function searchProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [...products];
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.seller.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );
  }

  function getFeaturedProducts() {
    return products.filter(p => p.featured);
  }

  function getRelatedProducts(productId, limit = 3) {
    const product = getProductById(productId);
    if (!product) return [];
    return products
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, limit);
  }

  function getStats() {
    const totalRevenue = purchaseRequests
      .filter(r => r.status === 'approved' || r.status === 'shipped')
      .reduce((sum, r) => sum + r.total, 0);
    const pendingCount = purchaseRequests.filter(r => r.status === 'pending').length;
    const sellerIds = [...new Set(products.map(p => p.sellerId))];
    return {
      totalProducts: products.length,
      pendingOrders: pendingCount,
      totalRevenue,
      activeSellers: sellerIds.length,
    };
  }

  function addProduct(product) {
    product.id = 'p' + String(products.length + 1).padStart(3, '0');
    product.price = parseFloat(product.price);
    product.stock = parseInt(product.stock);
    product.rating = 0;
    product.reviews = 0;
    product.featured = false;
    product.tags = [];
    products.push(product);
    return product;
  }

  function updateProduct(id, updates) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    Object.assign(products[idx], updates);
    return true;
  }

  function deleteProduct(id) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  }

  function updateOrderStatus(orderId, status) {
    const order = purchaseRequests.find(r => r.id === orderId);
    if (!order) return false;
    order.status = status;
    return true;
  }

  function getStockChip(stock) {
    if (stock === 0) return { label: 'Out of Stock', cls: 'out-of-stock' };
    if (stock <= 5)  return { label: 'Low Stock',    cls: 'low-stock'    };
    return                  { label: 'In Stock',     cls: 'in-stock'      };
  }

  function formatPrice(amount) {
    return 'Rs. ' + amount.toLocaleString('en-LK');
  }

  function getStatusChip(status) {
    const map = {
      pending:  { label: 'Pending',  cls: 'chip-pending'  },
      approved: { label: 'Approved', cls: 'chip-success'  },
      shipped:  { label: 'Shipped',  cls: 'chip-info'     },
      rejected: { label: 'Rejected', cls: 'chip-danger'   },
    };
    return map[status] || { label: status, cls: 'chip-neutral' };
  }

  /* ── Public API ───────────────────────────────────────────── */
  return {
    categories,
    products,
    purchaseRequests,
    adminUser,
    recentActivity,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getFeaturedProducts,
    getRelatedProducts,
    getStats,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    getStockChip,
    formatPrice,
    getStatusChip,
  };
})();
