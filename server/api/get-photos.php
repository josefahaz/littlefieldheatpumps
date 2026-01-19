<?php
/**
 * Get Gallery Photos
 * Returns all photos from the gallery database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load photos database
$dbFile = __DIR__ . '/../data/gallery.json';

if (!file_exists($dbFile)) {
    echo json_encode([
        'success' => true,
        'photos' => []
    ]);
    exit;
}

$content = file_get_contents($dbFile);
$photos = json_decode($content, true);

if ($photos === null) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to read gallery database'
    ]);
    exit;
}

// Filter by category if specified
if (isset($_GET['category'])) {
    $category = $_GET['category'];
    $photos = array_filter($photos, function($photo) use ($category) {
        return $photo['category'] === $category;
    });
    $photos = array_values($photos); // Re-index array
}

echo json_encode([
    'success' => true,
    'photos' => $photos
]);
?>
