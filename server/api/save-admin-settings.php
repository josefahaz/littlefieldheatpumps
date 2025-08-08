<?php
/**
 * Save Admin Settings API
 * 
 * This file handles saving admin settings for the site.
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

// Validate input
if (!isset($data['section']) || empty($data['section'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing section parameter']);
    exit;
}

// Handle different sections
switch ($data['section']) {
    case 'quickbooks':
        // Forward to QuickBooks config endpoint
        require_once(__DIR__ . '/quickbooks/save-config.php');
        break;
        
    case 'general':
        // Save general settings
        // Implementation would go here
        echo json_encode(['success' => true]);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unknown section']);
        exit;
}
