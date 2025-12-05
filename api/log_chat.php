<?php
/**
 * Chat Logging API
 * 
 * Logs user questions and AI responses for analytics.
 * Stores data persistently in JSON format.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => ''];
$logFilePath = __DIR__ . '/../data/chat_logs.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate required fields
    if (!isset($data['question']) || empty(trim($data['question']))) {
        $response['message'] = 'Question is required.';
        echo json_encode($response);
        exit();
    }

    $question = trim($data['question']);
    $aiResponse = isset($data['response']) ? trim($data['response']) : '';
    $status = isset($data['status']) ? $data['status'] : 'unknown';

    // Ensure data directory exists
    $dataDir = dirname($logFilePath);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    // Initialize log file if needed
    if (!file_exists($logFilePath) || filesize($logFilePath) == 0) {
        file_put_contents($logFilePath, json_encode([], JSON_PRETTY_PRINT));
    }

    // Read existing logs
    $logs = json_decode(file_get_contents($logFilePath), true);
    if ($logs === null) {
        $logs = [];
    }

    // Create new log entry
    $logEntry = [
        'id' => uniqid('chat_'),
        'timestamp' => date('c'),
        'question' => $question,
        'response' => $aiResponse,
        'status' => $status,
        'metadata' => [
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'ip_hash' => hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), // Hashed for privacy
        ]
    ];

    $logs[] = $logEntry;

    // Save logs
    if (file_put_contents($logFilePath, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        $response['success'] = true;
        $response['message'] = 'Chat logged successfully.';
        $response['id'] = $logEntry['id'];
    } else {
        $response['message'] = 'Failed to write log file.';
    }
} else {
    http_response_code(405);
    $response['message'] = 'Method not allowed. Use POST.';
}

echo json_encode($response);
