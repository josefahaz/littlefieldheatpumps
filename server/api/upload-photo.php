<?php
/**
 * Photo Upload Handler
 * Handles secure photo uploads for the gallery
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

// Validate required fields
if (!isset($_POST['title']) || !isset($_POST['category'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate file upload
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['photo'];
$title = trim($_POST['title']);
$category = trim($_POST['category']);
$description = isset($_POST['description']) ? trim($_POST['description']) : '';

// Validate category
$validCategories = ['installations', 'maintenance', 'gas'];
if (!in_array($category, $validCategories)) {
    echo json_encode(['success' => false, 'error' => 'Invalid category']);
    exit;
}

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'File size exceeds 5MB limit']);
    exit;
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, GIF, and WebP allowed']);
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../../uploads/gallery/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('photo_', true) . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
    exit;
}

// Load existing photos database
$dbFile = __DIR__ . '/../data/gallery.json';
$dbDir = dirname($dbFile);

if (!file_exists($dbDir)) {
    mkdir($dbDir, 0755, true);
}

$photos = [];
if (file_exists($dbFile)) {
    $content = file_get_contents($dbFile);
    $photos = json_decode($content, true) ?: [];
}

// Create photo record
$photoId = uniqid('photo_', true);
$photoRecord = [
    'id' => $photoId,
    'title' => $title,
    'description' => $description,
    'category' => $category,
    'filename' => $filename,
    'path' => '/Littlefield_Heat_Pumps/uploads/gallery/' . $filename,
    'uploadDate' => date('Y-m-d H:i:s'),
    'fileSize' => $file['size'],
    'mimeType' => $mimeType
];

// Add to photos array
$photos[] = $photoRecord;

// Save to database
if (file_put_contents($dbFile, json_encode($photos, JSON_PRETTY_PRINT))) {
    echo json_encode([
        'success' => true,
        'message' => 'Photo uploaded successfully',
        'photo' => $photoRecord
    ]);
} else {
    // Clean up uploaded file if database save fails
    unlink($filepath);
    echo json_encode(['success' => false, 'error' => 'Failed to save to database']);
}
?>
