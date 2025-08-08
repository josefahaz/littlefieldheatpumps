<?php
/**
 * Get QuickBooks Authorization URL
 * 
 * This file generates the OAuth authorization URL for QuickBooks.
 */

header('Content-Type: application/json');

// CORS headers for API access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Start session
session_start();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load QuickBooks API
require_once(__DIR__ . '/api.php');

// Initialize QuickBooks API
$qbApi = new QuickBooksAPI();

// Check if configured
if (!$qbApi->isConfigured()) {
    echo json_encode(['success' => false, 'error' => 'QuickBooks not configured']);
    exit;
}

// Get authorization URL
$authUrl = $qbApi->getAuthorizationUrl();

// Return URL
echo json_encode([
    'success' => true,
    'authUrl' => $authUrl
]);
