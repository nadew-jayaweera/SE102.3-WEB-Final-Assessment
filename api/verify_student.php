<?php
// NSBM Creators Hub - Verify NSBM Student ID against official registry

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/nsbm_student.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJSON(['status' => 'ok']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['status' => 'error', 'message' => 'Only POST requests are allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$umisid = isset($input['umisid']) ? trim((string) $input['umisid']) : '';

if ($umisid === '') {
    sendJSON(['status' => 'error', 'message' => 'Student ID is required.'], 400);
}

try {
    $student = lookupNsbmStudent($umisid);

    if ($student === null) {
        sendJSON([
            'status' => 'not_found',
            'message' => 'No student record found for this ID. Please check your NSBM Student ID.',
            'available' => false,
        ], 404);
    }

    sendJSON([
        'status' => 'success',
        'message' => 'Student verified successfully.',
        'available' => true,
        'student' => $student,
    ]);
} catch (RuntimeException $e) {
    sendJSON([
        'status' => 'error',
        'message' => $e->getMessage(),
        'available' => false,
    ], 502);
}
