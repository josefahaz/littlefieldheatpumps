<?php
/**
 * Update Photo Information
 * Updates title and description of a photo
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
$newTitle = isset($input['title']) ? trim($input['title']) : null;
$newDescription = isset($input['description']) ? trim($input['description']) : null;

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

// Find and update photo
$found = false;
foreach ($photos as &$photo) {
    if ($photo['id'] === $photoId) {
        if ($newTitle !== null) {
            $photo['title'] = $newTitle;
        }
        if ($newDescription !== null) {
            $photo['description'] = $newDescription;
        }
        $photo['lastModified'] = date('Y-m-d H:i:s');
        $found = true;
        break;
    }
}

if (!$found) {
    echo json_encode(['success' => false, 'error' => 'Photo not found']);
    exit;
}

// Save updated database
if (file_put_contents($dbFile, json_encode($photos, JSON_PRETTY_PRINT))) {
    echo json_encode([
        'success' => true,
        'message' => 'Photo updated successfully'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to save changes']);
}
?>
