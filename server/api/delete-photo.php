<?php
/**
 * Delete Photo
 * Removes a photo from the gallery and deletes the file
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    echo json_encode(['success' => false, 'error' => 'Photo ID required']);
    exit;
}

$photoId = $input['id'];

// Load photos database
$dbFile = __DIR__ . '/../data/gallery.json';

if (!file_exists($dbFile)) {
    echo json_encode(['success' => false, 'error' => 'Gallery database not found']);
    exit;
}

$content = file_get_contents($dbFile);
$photos = json_decode($content, true);

if ($photos === null) {
    echo json_encode(['success' => false, 'error' => 'Failed to read gallery database']);
    exit;
}

// Find and remove photo
$found = false;
$photoToDelete = null;
$newPhotos = [];

foreach ($photos as $photo) {
    if ($photo['id'] === $photoId) {
        $photoToDelete = $photo;
        $found = true;
    } else {
        $newPhotos[] = $photo;
    }
}

if (!$found) {
    echo json_encode(['success' => false, 'error' => 'Photo not found']);
    exit;
}

// Delete physical file
$uploadDir = __DIR__ . '/../../uploads/gallery/';
$filepath = $uploadDir . $photoToDelete['filename'];

if (file_exists($filepath)) {
    if (!unlink($filepath)) {
        echo json_encode(['success' => false, 'error' => 'Failed to delete file']);
        exit;
    }
}

// Save updated database
if (file_put_contents($dbFile, json_encode($newPhotos, JSON_PRETTY_PRINT))) {
    echo json_encode([
        'success' => true,
        'message' => 'Photo deleted successfully'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to save changes']);
}
?>
