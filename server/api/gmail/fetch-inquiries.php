<?php
/**
 * Fetch Customer Inquiries from Gmail
 * API endpoint to retrieve customer inquiries for the admin dashboard
 */

require_once 'api.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $gmail = new GmailAPI();
    
    // Check if Gmail is configured and authenticated
    $status = $gmail->getConnectionStatus();
    
    if (!$status['configured']) {
        throw new Exception('Gmail API not configured. Please set up credentials in settings.');
    }
    
    if (!$status['authenticated']) {
        throw new Exception('Gmail not authenticated. Please authorize access in settings.');
    }
    
    // Get the number of results to fetch (default 50)
    $maxResults = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    
    // Fetch customer inquiries
    $inquiries = $gmail->getCustomerInquiries($maxResults);
    
    // Format inquiries for the frontend
    $formattedInquiries = [];
    foreach ($inquiries as $inquiry) {
        $formattedInquiries[] = [
            'id' => $inquiry['id'],
            'date' => $inquiry['date'],
            'customer_name' => $inquiry['customer_name'] ?? 'Unknown',
            'contact_info' => $inquiry['contact_info'] ?? $inquiry['from'],
            'reason' => $inquiry['reason'] ?? 'General Inquiry',
            'preferred_response' => $inquiry['preferred_response'] ?? 'Email',
            'message' => $inquiry['message'] ?? $inquiry['snippet'],
            'subject' => $inquiry['subject'],
            'status' => $inquiry['status'],
            'from_email' => $inquiry['from']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'count' => count($formattedInquiries),
        'inquiries' => $formattedInquiries
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
