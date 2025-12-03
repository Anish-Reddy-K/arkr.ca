<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust as needed for security

$response = ['success' => false, 'message' => ''];
$inputFilePath = '../data/user_inputs.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (isset($data['userInput']) && !empty(trim($data['userInput']))) {
        $userInput = trim($data['userInput']);
        
        // Ensure the data directory exists and is writable
        if (!is_dir(dirname($inputFilePath))) {
            mkdir(dirname($inputFilePath), 0777, true);
        }

        // Initialize file with empty array if it doesn't exist or is invalid JSON
        if (!file_exists($inputFilePath) || filesize($inputFilePath) == 0) {
            file_put_contents($inputFilePath, json_encode([], JSON_PRETTY_PRINT));
        }

        $currentData = json_decode(file_get_contents($inputFilePath), true);
        if ($currentData === null) { // Handle case where JSON is malformed
            $currentData = [];
        }

        $newEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'input' => $userInput
        ];

        $currentData[] = $newEntry;

        if (file_put_contents($inputFilePath, json_encode($currentData, JSON_PRETTY_PRINT))) {
            $response['success'] = true;
            $response['message'] = 'User input saved successfully.';
        } else {
            $response['message'] = 'Failed to write to file.';
        }
    } else {
        $response['message'] = 'No user input provided.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>