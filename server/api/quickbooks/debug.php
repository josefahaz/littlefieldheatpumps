<?php
/**
 * Debug helper for QuickBooks API
 * Access this file directly to see what might be wrong
 */

header('Content-Type: text/html');
echo '<h1>QuickBooks API Debug</h1>';

// Display PHP info
echo '<h2>PHP Information</h2>';
echo '<p>PHP Version: ' . phpversion() . '</p>';

// Check config directory
echo '<h2>Config Directory Check</h2>';
$configDir = __DIR__ . '/../../config';
echo '<p>Config directory path: ' . $configDir . '</p>';
echo '<p>Config directory exists: ' . (file_exists($configDir) ? 'Yes' : 'No') . '</p>';

// Create config directory if it doesn't exist
if (!file_exists($configDir)) {
    echo '<p>Attempting to create config directory...</p>';
    $created = mkdir($configDir, 0755, true);
    echo '<p>Config directory creation: ' . ($created ? 'Success' : 'Failed') . '</p>';
    if (!$created) {
        echo '<p>Error: ' . error_get_last()['message'] . '</p>';
    }
}

// Check permissions
echo '<p>Config directory writable: ' . (is_writable($configDir) ? 'Yes' : 'No') . '</p>';

// Try to create sample files
$testFile = $configDir . '/test.json';
echo '<h2>File Write Test</h2>';
echo '<p>Test file path: ' . $testFile . '</p>';
$writeResult = file_put_contents($testFile, json_encode(['test' => true]));
echo '<p>Write test: ' . ($writeResult !== false ? 'Success' : 'Failed') . '</p>';
if ($writeResult === false) {
    echo '<p>Error: ' . error_get_last()['message'] . '</p>';
}

// Load QuickBooks config file
echo '<h2>QuickBooks Config</h2>';
define('CONFIG_FILE', $configDir . '/quickbooks_config.json');
echo '<p>Config file path: ' . CONFIG_FILE . '</p>';
echo '<p>Config file exists: ' . (file_exists(CONFIG_FILE) ? 'Yes' : 'No') . '</p>';

// Create a template config file if it doesn't exist
if (!file_exists(CONFIG_FILE)) {
    echo '<p>Creating template config file...</p>';
    $config = [
        'clientId' => '',
        'clientSecret' => '',
        'realmId' => '',
        'environment' => 'sandbox',
        'redirectUri' => '',
        'scope' => 'com.intuit.quickbooks.accounting',
    ];
    $writeResult = file_put_contents(CONFIG_FILE, json_encode($config, JSON_PRETTY_PRINT));
    echo '<p>Template creation: ' . ($writeResult !== false ? 'Success' : 'Failed') . '</p>';
}

echo '<h2>Next Steps</h2>';
echo '<p>1. Ensure the config directory is writable by the web server</p>';
echo '<p>2. Access the QuickBooks settings page and enter your API credentials</p>';
echo '<p>3. Try saving settings and authorizing again</p>';
?>
