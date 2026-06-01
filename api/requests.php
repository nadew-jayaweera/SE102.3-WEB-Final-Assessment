<?php
// NS SHOP - Purchase Requests REST API
// Saved at /d:/Project/Web/code/api/requests.php

require_once __DIR__ . '/../db.php';

// Handle CORS Options preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJSON(['status' => 'ok']);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if ($action === 'stats') {
            // 1. COMPILE DASHBOARD STATISTICS (Public or Admin, lightweight counters)
            // Fetch total count of products
            $prdStmt = $pdo->query('SELECT COUNT(*) AS total FROM `products`');
            $totalProducts = intval($prdStmt->fetch()['total']);

            // Fetch total count of unique categories in stock
            $catStmt = $pdo->query('SELECT COUNT(DISTINCT `category`) AS total FROM `products`');
            $totalCategories = intval($catStmt->fetch()['total']);

            // Fetch pending requests
            $pendStmt = $pdo->query("SELECT COUNT(*) AS total FROM `purchase_requests` WHERE `status` = 'Pending'");
            $pendingRequests = intval($pendStmt->fetch()['total']);

            // Fetch completed requests
            $compStmt = $pdo->query("SELECT COUNT(*) AS total FROM `purchase_requests` WHERE `status` = 'Completed'");
            $completedOrders = intval($compStmt->fetch()['total']);

            sendJSON([
                'products' => $totalProducts,
                'categories' => $totalCategories,
                'pending' => $pendingRequests,
                'completed' => $completedOrders
            ]);
        } else {
            // 2. RETRIEVE PURCHASE REQUESTS (Admin Protected)
            requireAdmin();

            $id = isset($_GET['id']) ? trim($_GET['id']) : '';
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';

            $sql = 'SELECT * FROM `purchase_requests` WHERE 1=1';
            $params = [];

            if (!empty($id)) {
                $sql .= ' AND `id` = :id';
                $params[':id'] = $id;
            }

            if (!empty($search)) {
                $sql .= ' AND (`id` LIKE :search OR `customer_name` LIKE :search OR `nsbm_id` LIKE :search)';
                $params[':search'] = '%' . $search . '%';
            }

            // Return purchase requests ordered by newest first
            $sql .= ' ORDER BY `date` DESC, `id` DESC';

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $requests = $stmt->fetchAll();

            // Loop through each request and append its corresponding order line items
            foreach ($requests as &$req) {
                $req['total'] = floatval($req['total']);

                // Fetch line items with product names and images for rich UI mapping
                $itemsStmt = $pdo->prepare('
                    SELECT ri.*, p.name AS productName, p.image, p.category 
                    FROM `request_items` ri
                    JOIN `products` p ON ri.product_id = p.id
                    WHERE ri.request_id = :req_id
                ');
                $itemsStmt->execute([':req_id' => $req['id']]);
                $items = $itemsStmt->fetchAll();

                // Format types for JSON client compatibility
                foreach ($items as &$item) {
                    $item['id'] = (int)$item['id'];
                    $item['product_id'] = (string)$item['product_id']; // Match dynamic frontend client schema
                    $item['qty'] = (int)$item['quantity'];
                    unset($item['quantity']); // Match old client property name 'qty'
                    $item['price'] = floatval($item['price']);
                    $item['name'] = $item['productName']; // Keep client mapping parameter
                }

                $req['items'] = $items;
                // Reformat MySQL timestamp to human-friendly local string matching original: "Oct 24, 2024 09:41 AM"
                $time = strtotime($req['date']);
                $req['date'] = date('M d, Y h:i A', $time);
            }

            sendJSON($requests);
        }
        break;

    case 'POST':
        // 3. TRANSITION ORDER STATUS (Admin Protected)
        requireAdmin();

        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if ($action === 'update_status') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? trim($input['id']) : '';
            $status = isset($input['status']) ? trim($input['status']) : '';

            $allowedStatuses = ['Pending', 'Approved', 'Completed', 'Cancelled'];

            if (empty($id) || empty($status) || !in_array($status, $allowedStatuses)) {
                sendJSON(['status' => 'error', 'message' => 'Invalid parameters. Order ID and allowed status transitions are required.'], 400);
            }

            try {
                // Begin atomic transaction
                $pdo->beginTransaction();

                // Fetch request state
                $reqStmt = $pdo->prepare('SELECT `status` FROM `purchase_requests` WHERE `id` = :id FOR UPDATE');
                $reqStmt->execute([':id' => $id]);
                $request = $reqStmt->fetch();

                if (!$request) {
                    $pdo->rollBack();
                    sendJSON(['status' => 'error', 'message' => 'Purchase request order not found.'], 404);
                }

                $oldStatus = $request['status'];

                // If transition is changed to Cancelled and the order was not already cancelled: restore catalog quantities!
                if ($status === 'Cancelled' && $oldStatus !== 'Cancelled') {
                    // Fetch all ordered products
                    $itemsStmt = $pdo->prepare('SELECT `product_id`, `quantity` FROM `request_items` WHERE `request_id` = :req_id');
                    $itemsStmt->execute([':req_id' => $id]);
                    $items = $itemsStmt->fetchAll();

                    $restoreStmt = $pdo->prepare('
                        UPDATE `products` 
                        SET `quantity` = `quantity` + :qty, `status` = :status 
                        WHERE `id` = :prd_id
                    ');

                    foreach ($items as $item) {
                        $prdId = intval($item['product_id']);
                        $qtyToRestore = intval($item['quantity']);

                        // Get current inventory of product to make sure we set status back to 'Available'
                        $restoreStmt->execute([
                            ':qty' => $qtyToRestore,
                            ':status' => 'Available',
                            ':prd_id' => $prdId
                        ]);
                    }
                }

                // Update request header status
                $updateStmt = $pdo->prepare('UPDATE `purchase_requests` SET `status` = :status WHERE `id` = :id');
                $updateStmt->execute([
                    ':status' => $status,
                    ':id' => $id
                ]);

                $pdo->commit();

                sendJSON([
                    'status' => 'success',
                    'message' => "Order {$id} status updated successfully to '{$status}'."
                ]);

            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                sendJSON(['status' => 'error', 'message' => 'Transaction failed: ' . $e->getMessage()], 500);
            }
        } else {
            sendJSON(['status' => 'error', 'message' => 'Invalid POST operation.'], 400);
        }
        break;

    default:
        sendJSON(['status' => 'error', 'message' => 'HTTP method not supported.'], 405);
        break;
}
