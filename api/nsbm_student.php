<?php
// NSBM Creators Hub - NSBM student registry lookup (payments pay_data.php)

/**
 * Fetches student details from NSBM online payments API.
 * @see https://students.nsbm.ac.lk/payments/pay_data.php
 */
function lookupNsbmStudent(string $umisid): ?array {
    $umisid = trim(str_replace('\\', '', $umisid));
    if ($umisid === '') {
        return null;
    }

    $ch = curl_init('https://students.nsbm.ac.lk/payments/pay_data.php');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'command' => 'view_details',
            'umisid' => $umisid,
        ]),
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded',
            'Referer: https://students.nsbm.ac.lk/payments/',
        ],
    ]);

    $body = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($body === false || $httpCode < 200 || $httpCode >= 300) {
        throw new RuntimeException(
            $curlError ?: 'Unable to reach NSBM student verification service.'
        );
    }

    $data = json_decode($body, true);
    if (!is_array($data) || ($data['status'] ?? '') !== 'OK') {
        return null;
    }

    $student = $data['student'] ?? [];
    $name = trim((string) ($student['name'] ?? ''));
    $registryId = trim((string) ($student['umisid'] ?? $student['std_id'] ?? ''));

    if ($name === '' && $registryId === '') {
        return null;
    }

    return [
        'umisid' => $registryId !== '' ? $registryId : $umisid,
        'name' => $name,
        'batch' => trim((string) ($student['intake'] ?? '')),
        'degree' => trim((string) ($student['degree'] ?? '')),
        'email' => trim((string) ($student['customer_receipt_email'] ?? '')),
        'orderno' => trim((string) ($student['orderno'] ?? '')),
    ];
}

/**
 * Compares a form name with the official registry name (ignores titles).
 */
function nsbmStudentNameMatches(string $entered, string $official): bool {
    $normalize = static function (string $name): string {
        $name = strtolower(trim($name));
        $name = preg_replace('/^(mr|mrs|ms|miss|dr)\.?\s+/i', '', $name);
        $name = preg_replace('/\s+/', ' ', $name);
        return $name;
    };

    $a = $normalize($entered);
    $b = $normalize($official);
    if ($a === '' || $b === '') {
        return false;
    }
    if ($a === $b) {
        return true;
    }

    return str_contains($b, $a) || str_contains($a, $b);
}
