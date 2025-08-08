<?php
/**
 * QuickBooks Invoice Sync Endpoint
 * 
 * This endpoint retrieves all invoices from QuickBooks and returns them
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once(__DIR__ . '/api.php');

try {
    $qbApi = new QuickBooksAPI();
    
    // Check if API is configured and authenticated
    if (!$qbApi->isConfigured()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'QuickBooks API is not configured. Please configure your app credentials.'
        ]);
        exit;
    }
    
    if (!$qbApi->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'QuickBooks API is not authenticated. Please authorize the application.'
        ]);
        exit;
    }
    
    // Get pagination parameters
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Retrieve invoices from QuickBooks
    $invoices = $qbApi->getInvoices($limit, $offset);
    
    // Process and format invoice data
    $formattedInvoices = [];
    foreach ($invoices as $invoice) {
        $formattedInvoices[] = [
            'id' => $invoice['Id'] ?? '',
            'docNumber' => $invoice['DocNumber'] ?? '',
            'txnDate' => $invoice['TxnDate'] ?? '',
            'dueDate' => $invoice['DueDate'] ?? '',
            'totalAmt' => $invoice['TotalAmt'] ?? 0,
            'balance' => $invoice['Balance'] ?? 0,
            'customerRef' => [
                'value' => $invoice['CustomerRef']['value'] ?? '',
                'name' => $invoice['CustomerRef']['name'] ?? ''
            ],
            'billAddr' => $invoice['BillAddr'] ?? null,
            'shipAddr' => $invoice['ShipAddr'] ?? null,
            'emailStatus' => $invoice['EmailStatus'] ?? '',
            'printStatus' => $invoice['PrintStatus'] ?? '',
            'privateNote' => $invoice['PrivateNote'] ?? '',
            'customerMemo' => isset($invoice['CustomerMemo']['value']) ? $invoice['CustomerMemo']['value'] : '',
            'line' => $invoice['Line'] ?? []
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'invoices' => $formattedInvoices,
            'count' => count($formattedInvoices),
            'limit' => $limit,
            'offset' => $offset
        ],
        'message' => 'Invoices retrieved successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to sync invoices: ' . $e->getMessage()
    ]);
}
?>
