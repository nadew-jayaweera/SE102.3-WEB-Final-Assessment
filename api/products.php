<?php
// NSBM Creators Hub - Products REST API
// Saved at /d:/Project/Web/code/api/products.php

require_once __DIR__ . '/../db.php';

// Handle CORS Options preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJSON(['status' => 'ok']);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // 1. RETRIEVE PRODUCTS
        if (isset($_GET['id'])) {
            // Fetch Single Product
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare('SELECT * FROM `products` WHERE `id` = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $product = $stmt->fetch();

            if ($product) {
                // Ensure price and quantity are returned with proper types
                $product['id'] = (string)$product['id']; // Match old client-side string ID style
                $product['price'] = floatval($product['price']);
                $product['quantity'] = intval($product['quantity']);
                sendJSON($product);
            } else {
                sendJSON(['status' => 'error', 'message' => 'Product not found.'], 404);
            }
        } else {
            // Fetch List of Products with optional search and category filters
            $category = isset($_GET['category']) ? trim($_GET['category']) : '';
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';

            $sql = 'SELECT * FROM `products` WHERE 1=1';
            $params = [];

            if (!empty($category) && $category !== 'all') {
                $sql .= ' AND `category` = :category';
                $params[':category'] = $category;
            }

            if (!empty($search)) {
                $sql .= ' AND (`name` LIKE :search OR `description` LIKE :search)';
                $params[':search'] = '%' . $search . '%';
            }

            // Return products ordered by newest additions first
            $sql .= ' ORDER BY `date_added` DESC, `id` DESC';
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll();

            // Convert numeric values to correct types for JSON compatibility
            foreach ($products as &$p) {
                $p['id'] = (string)$p['id'];
                $p['price'] = floatval($p['price']);
                $p['quantity'] = intval($p['quantity']);
            }

            sendJSON($products);
        }
        break;

    case 'POST':
        // 2. CREATE PRODUCT (Admin Protected)
        requireAdmin();

        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = isset($input['name']) ? trim($input['name']) : '';
        $price = isset($input['price']) ? floatval($input['price']) : 0.00;
        $category = isset($input['category']) ? trim($input['category']) : '';
        $quantity = isset($input['quantity']) ? intval($input['quantity']) : 0;
        $description = isset($input['desc']) ? trim($input['desc']) : (isset($input['description']) ? trim($input['description']) : '');
        $image = isset($input['image']) ? trim($input['image']) : '';
        $status = isset($input['status']) ? trim($input['status']) : 'Available';

        // Validations
        if (empty($name) || empty($category) || $price <= 0 || $quantity < 0) {
            sendJSON(['status' => 'error', 'message' => 'Invalid product parameters. Complete all required fields.'], 400);
        }

        if (empty($image)) {
            // Default high-quality placeholder image
            $image = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400';
        }

        // Adjust stock status automatically if quantity is 0
        if ($quantity === 0) {
            $status = 'Out of Stock';
        }

        $stmt = $pdo->prepare('
            INSERT INTO `products` (`name`, `price`, `category`, `quantity`, `status`, `description`, `image`, `date_added`)
            VALUES (:name, :price, :category, :quantity, :status, :description, :image, :date_added)
        ');

        $stmt->execute([
            ':name' => $name,
            ':price' => $price,
            ':category' => $category,
            ':quantity' => $quantity,
            ':status' => $status,
            ':description' => $description,
            ':image' => $image,
            ':date_added' => date('Y-m-d')
        ]);

        sendJSON([
            'status' => 'success',
            'message' => 'Product added successfully.',
            'id' => (string)$pdo->lastInsertId()
        ]);
        break;

    case 'PUT':
        // 3. UPDATE PRODUCT (Admin Protected)
        requireAdmin();

        if (!isset($_GET['id'])) {
            sendJSON(['status' => 'error', 'message' => 'Product ID is required for updates.'], 400);
        }

        $id = intval($_GET['id']);
        $input = json_decode(file_get_contents('php://input'), true);

        // Fetch original item to verify existence
        $checkStmt = $pdo->prepare('SELECT * FROM `products` WHERE `id` = :id');
        $checkStmt->execute([':id' => $id]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            sendJSON(['status' => 'error', 'message' => 'Product not found.'], 404);
        }

        // Use incoming updates or fall back to existing records
        $name = isset($input['name']) ? trim($input['name']) : $existing['name'];
        $price = isset($input['price']) ? floatval($input['price']) : floatval($existing['price']);
        $category = isset($input['category']) ? trim($input['category']) : $existing['category'];
        $quantity = isset($input['quantity']) ? intval($input['quantity']) : intval($existing['quantity']);
        $description = isset($input['desc']) ? trim($input['desc']) : (isset($input['description']) ? trim($input['description']) : $existing['description']);
        $image = isset($input['image']) ? trim($input['image']) : $existing['image'];
        $status = isset($input['status']) ? trim($input['status']) : $existing['status'];

        if (empty($name) || empty($category) || $price <= 0 || $quantity < 0) {
            sendJSON(['status' => 'error', 'message' => 'Invalid update parameters.'], 400);
        }

        // Auto transition status based on inventory
        if ($quantity === 0) {
            $status = 'Out of Stock';
        } else {
            $status = 'Available';
        }

        $stmt = $pdo->prepare('
            UPDATE `products` 
            SET `name` = :name, `price` = :price, `category` = :category, `quantity` = :quantity, `status` = :status, `description` = :description, `image` = :image
            WHERE `id` = :id
        ');

        $stmt->execute([
            ':name' => $name,
            ':price' => $price,
            ':category' => $category,
            ':quantity' => $quantity,
            ':status' => $status,
            ':description' => $description,
            ':image' => $image,
            ':id' => $id
        ]);

        sendJSON([
            'status' => 'success',
            'message' => 'Product updated successfully.'
        ]);
        break;

    case 'DELETE':
        // 4. DELETE PRODUCT (Admin Protected)
        requireAdmin();

        if (!isset($_GET['id'])) {
            sendJSON(['status' => 'error', 'message' => 'Product ID is required for deletions.'], 400);
        }

        $id = intval($_GET['id']);

        // Check if product exists
        $checkStmt = $pdo->prepare('SELECT 1 FROM `products` WHERE `id` = :id');
        $checkStmt->execute([':id' => $id]);
        if (!$checkStmt->fetch()) {
            sendJSON(['status' => 'error', 'message' => 'Product not found.'], 404);
        }

        $stmt = $pdo->prepare('DELETE FROM `products` WHERE `id` = :id');
        $stmt->execute([':id' => $id]);

        sendJSON([
            'status' => 'success',
            'message' => 'Product deleted successfully.'
        ]);
        break;

    default:
        sendJSON(['status' => 'error', 'message' => 'HTTP method not supported.'], 405);
        break;
}
