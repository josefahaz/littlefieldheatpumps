<?php
/**
 * Save QuickBooks Configuration
 * 
 * This file handles saving QuickBooks configuration from the admin settings.
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
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['clientId']) || !isset($data['clientSecret']) || !isset($data['realmId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Load QuickBooks config functions
require_once(__DIR__ . '/config.php');

// Prepare config array
$config = [
    'clientId' => $data['clientId'],
    'clientSecret' => $data['clientSecret'],
    'realmId' => $data['realmId'],
    'environment' => $data['environment'] ?? 'sandbox',
    'redirectUri' => $data['redirectUri'] ?? '',
    'scope' => 'com.intuit.quickbooks.accounting',
];

// Save configuration
if (saveQuickBooksConfig($config)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save configuration']);
}
