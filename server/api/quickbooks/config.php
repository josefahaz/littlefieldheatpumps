<?php
/**
 * QuickBooks API Configuration
 * 
 * This file handles loading credentials and configuration for QuickBooks API.
 * IMPORTANT: This file should be secured with proper file permissions.
 */

// Define constants for file paths
define('CONFIG_FILE', 'c:/xampp/htdocs/Littlefield_Heat_Pumps/server/config/quickbooks_config.json');
define('TOKENS_FILE', 'c:/xampp/htdocs/Littlefield_Heat_Pumps/server/config/quickbooks_tokens.json');

/**
 * Load QuickBooks configuration
 * 
 * @return array Configuration array
 */
function loadQuickBooksConfig() {
    if (file_exists(CONFIG_FILE)) {
        $config = json_decode(file_get_contents(CONFIG_FILE), true);
        return $config;
    }
    
    return [
        'clientId' => '',
        'clientSecret' => '',
        'realmId' => '',
        'environment' => 'sandbox',
        'redirectUri' => '',
        'scope' => 'com.intuit.quickbooks.accounting',
    ];
}

/**
 * Save QuickBooks configuration
 * 
 * @param array $config Configuration array
 * @return boolean Success status
 */
function saveQuickBooksConfig($config) {
    // Create config directory if it doesn't exist
    if (!file_exists(dirname(CONFIG_FILE))) {
        mkdir(dirname(CONFIG_FILE), 0755, true);
    }
    
    // Save only the necessary configuration items (not tokens)
    $saveConfig = [
        'clientId' => $config['clientId'],
        'clientSecret' => $config['clientSecret'],
        'realmId' => $config['realmId'],
        'environment' => $config['environment'],
        'redirectUri' => $config['redirectUri'],
        'scope' => $config['scope'],
    ];
    
    return file_put_contents(CONFIG_FILE, json_encode($saveConfig, JSON_PRETTY_PRINT));
}

/**
 * Load OAuth tokens
 * 
 * @return array Token array
 */
function loadOAuthTokens() {
    if (file_exists(TOKENS_FILE)) {
        $tokens = json_decode(file_get_contents(TOKENS_FILE), true);
        return $tokens;
    }
    
    return [
        'access_token' => '',
        'refresh_token' => '',
        'expires_at' => 0,
    ];
}

/**
 * Save OAuth tokens
 * 
 * @param array $tokens Token array
 * @return boolean Success status
 */
function saveOAuthTokens($tokens) {
    // Create config directory if it doesn't exist
    if (!file_exists(dirname(TOKENS_FILE))) {
        mkdir(dirname(TOKENS_FILE), 0755, true);
    }
    
    return file_put_contents(TOKENS_FILE, json_encode($tokens, JSON_PRETTY_PRINT));
}

/**
 * Get QuickBooks API base URL
 * 
 * @param string $environment 'sandbox' or 'production'
 * @return string API base URL
 */
function getQuickBooksApiBaseUrl($environment = 'sandbox') {
    return ($environment === 'production')
        ? 'https://quickbooks.api.intuit.com/'
        : 'https://sandbox-quickbooks.api.intuit.com/';
}

/**
 * Get QuickBooks OAuth URL
 * 
 * @param string $environment 'sandbox' or 'production'
 * @return string OAuth URL
 */
function getQuickBooksOAuthUrl($environment = 'sandbox') {
    // Both sandbox and production use the same OAuth endpoint
    // The difference is in the API base URL, not the OAuth URL
    return 'https://oauth.platform.intuit.com/oauth2/v1/';
}
