<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust as needed for security

$response = ['success' => false, 'message' => ''];
$inputFilePath = '../data/user_inputs.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if the file exists before attempting to clear it
    if (file_exists($inputFilePath)) {
        // Open the file in write mode ('w') which truncates it to zero length
        if (file_put_contents($inputFilePath, json_encode([], JSON_PRETTY_PRINT)) !== false) {
            $response['success'] = true;
            $response['message'] = 'User inputs cleared successfully.';
        } else {
            $response['message'] = 'Failed to clear user inputs file.';
        }
    } else {
        $response['success'] = true; // Consider it successful if file doesn't exist (nothing to clear)
        $response['message'] = 'User inputs file does not exist, nothing to clear.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>