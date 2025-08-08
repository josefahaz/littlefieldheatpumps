<?php
/**
 * Invoice Lookup API Endpoint
 * 
 * This file handles invoice lookup requests and returns payment information.
 */

header('Content-Type: application/json');

// CORS headers for API access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['invoiceNumber']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Load QuickBooks API
require_once(__DIR__ . '/quickbooks/api.php');

// Initialize QuickBooks API
$qbApi = new QuickBooksAPI();

// Check if QuickBooks is configured
if (!$qbApi->isConfigured()) {
    http_response_code(503);
    echo json_encode(['error' => 'QuickBooks integration not configured']);
    exit;
}

// Check if QuickBooks is authenticated
if (!$qbApi->isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'QuickBooks API not authenticated']);
    exit;
}

// Clean inputs
$invoiceNumber = trim($data['invoiceNumber']);
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Verify invoice belongs to customer
$invoice = $qbApi->verifyInvoiceCustomer($invoiceNumber, $email);

if (!$invoice) {
    http_response_code(404);
    echo json_encode(['error' => 'Invoice not found or does not belong to this email address']);
    exit;
}

// Get payment URL
$paymentUrl = getQuickBooksPaymentUrl($invoice['Id']);

// Format response
$response = [
    'success' => true,
    'invoice' => [
        'id' => $invoice['Id'],
        'number' => $invoice['DocNumber'],
        'date' => $invoice['TxnDate'],
        'dueDate' => $invoice['DueDate'],
        'balance' => $invoice['Balance'],
        'total' => $invoice['TotalAmt'],
        'paymentUrl' => $paymentUrl
    ],
    'customer' => [
        'name' => $invoice['CustomerRef']['name']
    ]
];

// Check if invoice has line items
if (isset($invoice['Line']) && is_array($invoice['Line'])) {
    $response['invoice']['items'] = [];
    
    foreach ($invoice['Line'] as $line) {
        if (isset($line['SalesItemLineDetail'])) {
            $item = [
                'description' => $line['Description'],
                'quantity' => $line['SalesItemLineDetail']['Qty'],
                'unitPrice' => $line['SalesItemLineDetail']['UnitPrice'],
                'amount' => $line['Amount']
            ];
            
            $response['invoice']['items'][] = $item;
        }
    }
}

// Return invoice data
echo json_encode($response);
exit;
