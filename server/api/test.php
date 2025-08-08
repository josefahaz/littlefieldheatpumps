<?php
// Simple test file to verify PHP is working
header('Content-Type: application/json');

// Return basic JSON response
echo json_encode([
    'success' => true,
    'message' => 'PHP is working correctly',
    'time' => date('Y-m-d H:i:s')
]);
?>
