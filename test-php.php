<?php
/**
 * PHP Test File
 * This file tests if PHP is working on the server
 */

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'PHP is working correctly!',
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
