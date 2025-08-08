<?php
/**
 * Mark Gmail Inquiry as Read
 * API endpoint to mark customer inquiries as read in Gmail
 */

require_once 'api.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['messageId'])) {
        throw new Exception('Message ID is required');
    }
    
    $messageId = $input['messageId'];
    $gmail = new GmailAPI();
    
    // Check if Gmail is configured and authenticated
    $status = $gmail->getConnectionStatus();
    
    if (!$status['configured']) {
        throw new Exception('Gmail API not configured');
    }
    
    if (!$status['authenticated']) {
        throw new Exception('Gmail not authenticated');
    }
    
    // Mark message as read
    $success = $gmail->markAsRead($messageId);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Inquiry marked as read'
        ]);
    } else {
        throw new Exception('Failed to mark inquiry as read');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
