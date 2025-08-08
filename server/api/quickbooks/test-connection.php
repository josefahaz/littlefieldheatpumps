<?php
/**
 * Test QuickBooks Connection
 * 
 * This file tests QuickBooks API connection and authentication.
 */

header('Content-Type: application/json');

// CORS headers for API access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load QuickBooks API
require_once(__DIR__ . '/api.php');

// Initialize QuickBooks API
$qbApi = new QuickBooksAPI();

// Check if configured
$isConfigured = $qbApi->isConfigured();
$isAuthenticated = false;
$config = null;
$apiTest = false;

// Get configuration data
if ($isConfigured) {
    $config = loadQuickBooksConfig();
    $isAuthenticated = $qbApi->isAuthenticated();
    
    // If authenticated, test a simple API call
    if ($isAuthenticated) {
        try {
            $companyInfo = $qbApi->makeApiRequest('companyinfo/1');
            $apiTest = isset($companyInfo['QueryResponse']) || isset($companyInfo['CompanyInfo']);
        } catch (Exception $e) {
            $apiTest = false;
        }
    }
}

// Return comprehensive status
echo json_encode([
    'success' => $isConfigured,
    'authenticated' => $isAuthenticated,
    'config' => $config,
    'apiTest' => $apiTest
]);
