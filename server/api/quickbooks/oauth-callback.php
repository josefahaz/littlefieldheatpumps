<?php
/**
 * QuickBooks OAuth Callback Handler
 * 
 * This file handles the OAuth callback from QuickBooks after authorization.
 */

// Start session
session_start();

// Load QuickBooks API
require_once(__DIR__ . '/api.php');

// Initialize QuickBooks API
$qbApi = new QuickBooksAPI();

// Check for error response
if (isset($_GET['error'])) {
    $error = $_GET['error'];
    $errorDescription = $_GET['error_description'] ?? 'Unknown error';
    
    // Redirect back to admin settings with error
    header('Location: /admin/settings.html?tab=quickbooks&error=' . urlencode($errorDescription));
    exit;
}

// Check for authorization code
if (!isset($_GET['code']) || !isset($_GET['state'])) {
    // Redirect back to admin settings with error
    header('Location: /admin/settings.html?tab=quickbooks&error=Missing+required+parameters');
    exit;
}

// Process OAuth callback
$code = $_GET['code'];
$state = $_GET['state'];

if ($qbApi->processCallback($code, $state)) {
    // Redirect back to admin settings with success
    header('Location: /admin/settings.html?tab=quickbooks&success=1');
    exit;
} else {
    // Redirect back to admin settings with error
    header('Location: /admin/settings.html?tab=quickbooks&error=Failed+to+process+authorization');
    exit;
}
