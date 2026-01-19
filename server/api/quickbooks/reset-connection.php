<?php
/**
 * QuickBooks Reset/Disconnect Endpoint
 * - Deletes stored OAuth tokens
 * - Optionally clears the saved realmId if clearRealm=1 is passed
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

require_once(__DIR__ . '/config.php');

try {
    $clearRealm = false;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents('php://input');
        if ($input) {
            $json = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($json['clearRealm'])) {
                $clearRealm = !!$json['clearRealm'];
            }
        }
        // Also allow query param fallback
        if (isset($_GET['clearRealm'])) {
            $clearRealm = $_GET['clearRealm'] == '1' || $_GET['clearRealm'] === 'true';
        }
    }

    // Delete tokens file
    $tokensDeleted = false;
    if (file_exists(TOKENS_FILE)) {
        $tokensDeleted = unlink(TOKENS_FILE);
    }

    // Optionally clear realmId in config
    $realmCleared = false;
    if ($clearRealm) {
        $config = loadQuickBooksConfig();
        $config['realmId'] = '';
        saveQuickBooksConfig($config);
        $realmCleared = true;
    }

    echo json_encode([
        'success' => true,
        'tokensDeleted' => $tokensDeleted,
        'realmCleared' => $realmCleared,
        'message' => 'QuickBooks connection reset successfully.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
