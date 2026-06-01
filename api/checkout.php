<?php
// NS SHOP - Checkout Transaction REST API
// Saved at /d:/Project/Web/code/api/checkout.php

require_once __DIR__ . '/../db.php';

// Handle CORS Options preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJSON(['status' => 'ok']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['status' => 'error', 'message' => 'Only POST requests are allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$customerName = isset($input['customerName']) ? trim($input['customerName']) : '';
$nsbmId = isset($input['nsbmId']) ? trim($input['nsbmId']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$paymentMethod = isset($input['paymentMethod']) ? trim($input['paymentMethod']) : '';
$items = isset($input['items']) ? $input['items'] : [];
$total = isset($input['total']) ? floatval($input['total']) : 0.00;

// 1. INPUT FORM VALIDATION
if (empty($customerName) || empty($nsbmId) || empty($email) || empty($phone) || empty($paymentMethod) || empty($items) || $total <= 0) {
    sendJSON(['status' => 'error', 'message' => 'Checkout failed. Missing student details or empty cart items.'], 400);
}

if ($paymentMethod !== 'cash' && $paymentMethod !== 'bank') {
    sendJSON(['status' => 'error', 'message' => 'Invalid payment method.'], 400);
}

try {
    // 2. BEGIN DATABASE TRANSACTION (ACID Compliance)
    $pdo->beginTransaction();

    // A. Validate inventory levels first
    $validatedItems = [];
    foreach ($items as $item) {
        // Strip out 'prd-' prefix from client-side dynamic string ID to get true SQL INT ID
        $clientPrdId = $item['id'];
        $dbPrdId = intval(str_replace('prd-', '', $clientPrdId));
        $qtyRequested = intval($item['qty']);

        if ($dbPrdId <= 0 || $qtyRequested <= 0) {
            $pdo->rollBack();
            sendJSON(['status' => 'error', 'message' => 'Invalid cart items detected.'], 400);
        }

        // Query product details with a shared read lock or FOR UPDATE lock
        $stmt = $pdo->prepare('SELECT `id`, `name`, `price`, `quantity`, `status` FROM `products` WHERE `id` = :id FOR UPDATE');
        $stmt->execute([':id' => $dbPrdId]);
        $product = $stmt->fetch();

        if (!$product) {
            $pdo->rollBack();
            sendJSON(['status' => 'error', 'message' => "Product '{$item['name']}' not found in database."], 404);
        }

        if (intval($product['quantity']) < $qtyRequested) {
            $pdo->rollBack();
            sendJSON([
                'status' => 'error',
                'message' => "Insufficient stock. Only {$product['quantity']} of '{$product['name']}' remains in inventory."
            ], 409);
        }

        $validatedItems[] = [
            'db_id' => $dbPrdId,
            'client_id' => $clientPrdId,
            'name' => $product['name'],
            'price' => floatval($product['price']),
            'qty' => $qtyRequested,
            'new_qty' => intval($product['quantity']) - $qtyRequested
        ];
    }

    // B. Generate unique Request ID (REQ-XXXX)
    $requestId = '';
    $uniqueGenerated = false;
    while (!$uniqueGenerated) {
        $candidateId = 'REQ-' . rand(1000, 9999);
        $checkStmt = $pdo->prepare('SELECT 1 FROM `purchase_requests` WHERE `id` = :id');
        $checkStmt->execute([':id' => $candidateId]);
        if (!$checkStmt->fetch()) {
            $requestId = $candidateId;
            $uniqueGenerated = true;
        }
    }

    // C. Insert Purchase Request header row
    $reqStmt = $pdo->prepare('
        INSERT INTO `purchase_requests` (`id`, `customer_name`, `nsbm_id`, `email`, `phone`, `payment_method`, `total`, `status`)
        VALUES (:id, :customer_name, :nsbm_id, :email, :phone, :payment_method, :total, :status)
    ');
    $reqStmt->execute([
        ':id' => $requestId,
        ':customer_name' => $customerName,
        ':nsbm_id' => $nsbmId,
        ':email' => $email,
        ':phone' => $phone,
        ':payment_method' => $paymentMethod,
        ':total' => $total,
        ':status' => 'Pending'
    ]);

    // D. Insert request line items and decrement product inventory
    $itemStmt = $pdo->prepare('
        INSERT INTO `request_items` (`request_id`, `product_id`, `quantity`, `price`)
        VALUES (:request_id, :product_id, :quantity, :price)
    ');
    
    $updateProductStmt = $pdo->prepare('
        UPDATE `products` 
        SET `quantity` = :quantity, `status` = :status
        WHERE `id` = :id
    ');

    foreach ($validatedItems as $valItem) {
        // Insert line item
        $itemStmt->execute([
            ':request_id' => $requestId,
            ':product_id' => $valItem['db_id'],
            ':quantity' => $valItem['qty'],
            ':price' => $valItem['price']
        ]);

        // Decrement inventory
        $newStatus = ($valItem['new_qty'] === 0) ? 'Out of Stock' : 'Available';
        $updateProductStmt->execute([
            ':quantity' => $valItem['new_qty'],
            ':status' => $newStatus,
            ':id' => $valItem['db_id']
        ]);
    }

    // 3. COMMIT ALL OPERATIONS IF SUCCESSFUL
    $pdo->commit();

    // 4. RETURN TRANSACTION SUCCESS WITH ORDER DETAIL DETAILS
    sendJSON([
        'status' => 'success',
        'message' => 'Purchase request submitted successfully.',
        'order' => [
            'id' => $requestId,
            'customerName' => $customerName,
            'nsbmId' => $nsbmId,
            'email' => $email,
            'phone' => $phone,
            'paymentMethod' => $paymentMethod,
            'total' => $total,
            'status' => 'Pending',
            'date' => date('M d, Y h:i A')
        ]
    ]);

} catch (Exception $e) {
    // Rollback changes on standard exceptions
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJSON([
        'status' => 'error',
        'message' => 'Checkout system encountered an unexpected transaction failure: ' . $e->getMessage()
    ], 500);
}
