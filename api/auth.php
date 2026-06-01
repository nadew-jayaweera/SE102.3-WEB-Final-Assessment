<?php
// NSBM Creators Hub - Authentication REST API
// Saved at /d:/Project/Web/code/api/auth.php

require_once __DIR__ . '/../db.php';

// Handle CORS Options preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJSON(['status' => 'ok']);
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'check':
        // 1. Validate if Admin is Logged In
        sendJSON([
            'authenticated' => isAdmin(),
            'username' => isset($_SESSION['admin_username']) ? $_SESSION['admin_username'] : null
        ]);
        break;

    case 'login':
        // 2. Process Login Request
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJSON(['status' => 'error', 'message' => 'Only POST method is allowed.'], 405);
        }

        // Parse JSON payload inputs
        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';

        if (empty($username) || empty($password)) {
            sendJSON(['status' => 'error', 'message' => 'Username and password are required.'], 400);
        }

        // Query Admin from DB
        $stmt = $pdo->prepare('SELECT * FROM `admin_users` WHERE `username` = :username LIMIT 1');
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Initiate valid session parameters
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $user['username'];
            
            sendJSON([
                'status' => 'success',
                'message' => 'Login successful.',
                'username' => $user['username']
            ]);
        } else {
            sendJSON(['status' => 'error', 'message' => 'Invalid username or password.'], 401);
        }
        break;

    case 'logout':
        // 3. Process Logout Request
        // Clear session variables
        $_SESSION = [];
        
        // Destroy cookies and active session tokens
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();

        sendJSON([
            'status' => 'success',
            'message' => 'Logged out successfully.'
        ]);
        break;

    default:
        sendJSON(['status' => 'error', 'message' => 'Invalid action parameter specified.'], 400);
        break;
}
