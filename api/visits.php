<?php
session_start();
header('Content-Type: application/json');

$file = '../data/visits.json';

// Initialize if not exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode(['count' => 0]));
}

// Read current count
$data = json_decode(file_get_contents($file), true);
$count = isset($data['count']) ? $data['count'] : 0;

// Check if user has already visited in this session
if (!isset($_SESSION['has_visited'])) {
    // First visit in this session
    $count++;
    
    // Save new count
    $data['count'] = $count;
    file_put_contents($file, json_encode($data));
    
    // Mark as visited
    $_SESSION['has_visited'] = true;
}

// Return count
echo json_encode(['visits' => $count]);
?>