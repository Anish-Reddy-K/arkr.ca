<?php
header('Content-Type: application/json');

$file = '../data/visits.json';

// Initialize if not exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode(['count' => 0]));
}

// Read current count
$data = json_decode(file_get_contents($file), true);
$count = isset($data['count']) ? $data['count'] : 0;

// Increment count
$count++;

// Save new count
$data['count'] = $count;
file_put_contents($file, json_encode($data));

// Return count
echo json_encode(['visits' => $count]);
?>