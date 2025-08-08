<?php
/**
 * Gmail OAuth Callback Handler for Littlefield Heat Pumps
 * Processes the OAuth callback from Google and exchanges code for tokens
 */

require_once 'api.php';

header('Content-Type: application/json');

try {
    if (!isset($_GET['code'])) {
        throw new Exception('Authorization code not received');
    }
    
    $code = $_GET['code'];
    $gmail = new GmailAPI();
    
    // Exchange code for tokens
    $tokens = $gmail->exchangeCodeForTokens($code);
    
    if ($tokens) {
        // Redirect to settings page with success message
        $redirectUrl = '../../../admin/settings.html?gmail_auth=success';
        header("Location: $redirectUrl");
        exit;
    } else {
        throw new Exception('Failed to exchange code for tokens');
    }
    
} catch (Exception $e) {
    // Redirect to settings page with error message
    $redirectUrl = '../../../admin/settings.html?gmail_auth=error&message=' . urlencode($e->getMessage());
    header("Location: $redirectUrl");
    exit;
}
?>
