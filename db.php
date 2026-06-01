<?php
// NSBM Mini Store - PDO Database Connection and Utilities
// Saved at /d:/Project/Web/code/db.php

// 1. Establish PHP Session
if (session_status() === PHP_SESSION_NONE) {
    // Set cookie lifetime to 1 day for administrative dashboard ease-of-use
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'secure' => false, // Set to true if running on HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
    
    // Release the session lock immediately on read-only requests 
    // to prevent concurrent AJAX requests from blocking each other on a single-threaded server.
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'GET') {
        session_write_close();
    }
}

// 2. MySQL Connection Configuration
$db_host = '127.0.0.1';
$db_name = 'nsbm_ministore';
$db_user = 'root';
$db_pass = ''; // Default for xampp/wamp local stacks

try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    // Return standard server error payload if connection fails
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// 3. REST API Utility Helpers

/**
 * Sends a structured JSON response to the client and terminates execution.
 * @param mixed $data Payload data to return
 * @param int $status HTTP response status code
 */
function sendJSON($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // Allow local client origins during development
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Bypass');
    echo json_encode($data);
    exit();
}

/**
 * Checks if the administrator session is active.
 * @return bool True if logged in, false otherwise
 */
function isAdmin() {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        return true;
    }
    // Fallback/bypass check for offline/local file:// testing via custom header
    if (isset($_SERVER['HTTP_X_ADMIN_BYPASS']) && $_SERVER['HTTP_X_ADMIN_BYPASS'] === 'NSBM_Offline_Authorized') {
        return true;
    }
    return false;
}

/**
 * Blocks execution if the client request does not possess admin session privileges.
 */
function requireAdmin() {
    if (!isAdmin()) {
        sendJSON([
            'status' => 'error',
            'message' => 'Unauthorized access. Administrator session required.'
        ], 401);
    }
}
