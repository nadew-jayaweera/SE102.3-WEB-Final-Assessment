# NS SHOP — Hosting Setup Guide

This project is a **PHP + MySQL** campus storefront. The browser loads static HTML/CSS/JS pages; product data, checkout, admin auth, and student verification are handled by PHP scripts under `api/` and `db.php`.

You must serve the site over **HTTP(S)** (not by opening HTML files directly). PHP and MySQL must be running, and the database must be created from `schema.sql`.

---

## Requirements

| Component | Minimum |
|-----------|---------|
| **PHP** | 8.0+ (7.4 may work) |
| **MySQL** | 5.7+ or MariaDB 10.3+ |
| **Web server** | Apache (mod_php or PHP-FPM), Nginx + PHP-FPM, or PHP built-in server (development only) |
| **PHP extensions** | `pdo_mysql`, `json`, `session`, **`curl`** (student ID lookup) |

Optional but recommended for production: HTTPS, a dedicated MySQL user (not `root`), and outbound HTTPS to `students.nsbm.ac.lk` for checkout verification.

---

## 1. Get the project files

Clone or copy the repository into your web root.

**Examples:**

- **XAMPP (Windows):** `C:\xampp\htdocs\ns-shop\`
- **WAMP:** `C:\wamp64\www\ns-shop\`
- **Linux Apache:** `/var/www/html/ns-shop/`
- **macOS (MAMP):** `/Applications/MAMP/htdocs/ns-shop/`

The document root must be the **project root** (the folder that contains `index.html`, `api/`, and `db.php`).

---

## 2. Create and seed the database

1. Start **MySQL** (via XAMPP/WAMP control panel, `systemctl`, etc.).
2. Import the schema and sample data:

   **Command line:**

   ```bash
   mysql -u root -p < schema.sql
   ```

   **phpMyAdmin:** open `schema.sql`, copy its contents, run as SQL on the server.

3. Confirm the database exists:

   - Database name: `nsbm_ministore`
   - Tables: `admin_users`, `products`, `purchase_requests`, `request_items`

**Default admin login** (change after first deploy):

| Field | Value |
|-------|--------|
| Username | `admin` |
| Password | `admin` |

Admin UI: `admin/login.html` → dashboard at `admin/dashboard.html`.

---

## 3. Configure database credentials

Edit `db.php` and set your MySQL connection values:

```php
$db_host = '127.0.0.1';   // or your DB host
$db_name = 'nsbm_ministore';
$db_user = 'root';        // use a limited user in production
$db_pass = '';            // your MySQL password
```

On shared hosting, use the hostname, database name, username, and password provided by your host (often not `127.0.0.1` / `root`).

---

## 4. Local development

### Option A — XAMPP / WAMP / MAMP (recommended for Windows)

1. Install XAMPP (or WAMP/MAMP) with **Apache** and **MySQL**.
2. Place the project in `htdocs` (see section 1).
3. Complete sections 2 and 3.
4. Start Apache and MySQL.
5. Open in the browser:

   ```
   http://localhost/ns-shop/index.html
   ```

   Adjust `/ns-shop/` to match your folder name.

### Option B — PHP built-in server

From the **project root**:

```bash
php -S 127.0.0.1:8000
```

Then open:

```
http://127.0.0.1:8000/index.html
```

`js/data.js` uses `http://127.0.0.1:8000/` when pages are opened via `file://`; for normal use, always browse via the URL above.

**Note:** The built-in server is for development only, not production.

---

## 5. Production hosting

### Shared hosting (cPanel, Plesk, etc.)

1. Upload all project files to `public_html` (or the subdomain folder).
2. Create a MySQL database and user in the hosting panel.
3. Import `schema.sql` into that database (phpMyAdmin or host import tool).
4. Update `db.php` with the host’s DB host, name, user, and password.
5. Ensure PHP version is 8.0+ and **cURL** is enabled.
6. Visit `https://yourdomain.com/index.html`.

If the site lives in a subfolder (e.g. `https://example.com/shop/`), no code change is required: `js/data.js` resolves API paths relative to the current URL.

### VPS / dedicated server (Apache)

1. Install Apache, PHP, and MySQL/MariaDB.
2. Enable `mod_rewrite` only if you add your own rewrite rules (the app works without it using direct `.html` and `.php` paths).
3. Set the **VirtualHost `DocumentRoot`** to the project root.
4. Import `schema.sql` and configure `db.php`.
5. Set folder permissions so the web user can read all files (typically `755` for directories, `644` for files).
6. Enable HTTPS (Let’s Encrypt / certbot) and update session security (see section 7).

### VPS (Nginx + PHP-FPM)

Point the site root to the project folder and pass `*.php` to PHP-FPM. Example location block:

```nginx
root /var/www/ns-shop;
index index.html;

location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
}
```

Adjust the PHP-FPM socket path and PHP version for your system.

---

## 6. Verify the deployment

Run through these checks after setup:

| Check | How |
|-------|-----|
| Storefront loads | Open `index.html` — products should appear |
| API / DB | Browser dev tools → Network → `api/products.php` returns JSON, not 500 |
| Admin login | `admin/login.html` with `admin` / `admin` |
| Checkout (optional) | `checkout.html` — student ID verification calls NSBM; server needs **outbound HTTPS** and **curl** |

**API smoke test** (replace base URL):

```
https://yourdomain.com/api/products.php
```

Expected: JSON list of products.

---

## 7. Production security checklist

- [ ] Change the default `admin` password (update hash in `admin_users` or add a change-password flow).
- [ ] Use a **dedicated MySQL user** with privileges only on `nsbm_ministore`.
- [ ] Enable **HTTPS** and in `db.php` set session cookie `'secure' => true`.
- [ ] Do not commit real production passwords to git; keep `db.php` secrets on the server only.
- [ ] Restrict `admin/` if your host allows directory or IP rules (optional).

Student verification uses `https://students.nsbm.ac.lk/payments/pay_data.php`. If that service is down or blocked by firewall rules, checkout ID validation will fail even when the shop itself works.

---

## 8. Project structure (reference)

```
├── index.html, products.html, checkout.html, …   # Storefront pages
├── admin/                                          # Admin HTML + JS
├── api/                                            # PHP REST endpoints
├── css/, js/, img/                                 # Static assets
├── db.php                                          # DB connection + helpers
└── schema.sql                                      # Database setup + seed data
```

---

## 9. Troubleshooting

| Problem | Likely cause | Fix |
|---------|----------------|-----|
| Blank product list / API 500 | DB not imported or wrong `db.php` credentials | Re-run `schema.sql`; verify MySQL user can access `nsbm_ministore` |
| `Database connection failed` in JSON | MySQL not running or wrong host/user/password | Start MySQL; fix `db.php` |
| Admin login always fails | Wrong credentials or empty `admin_users` | Re-import `schema.sql` or reset admin row |
| Student ID verification fails | Missing `curl`, firewall, or NSBM API unavailable | Enable `php-curl`; test outbound HTTPS from server |
| CORS errors when testing from another origin | App expects same-origin API calls | Serve frontend and `api/` from the same domain/path |
| Opening `index.html` from disk (`file://`) | No PHP execution | Use `http://localhost/...` or `php -S 127.0.0.1:8000` |

---

## Quick start (XAMPP on Windows)

1. Copy project → `C:\xampp\htdocs\ns-shop\`
2. Start **Apache** and **MySQL** in XAMPP
3. Import `schema.sql` via phpMyAdmin (`http://localhost/phpmyadmin`)
4. Set `$db_pass` in `db.php` if your MySQL root has a password
5. Visit `http://localhost/ns-shop/index.html`

For questions about assessment scope or NSBM-specific hosting, refer to your course or institution’s deployment guidelines.
