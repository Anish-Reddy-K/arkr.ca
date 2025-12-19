<?php
/**
 * Spotify API Configuration
 * Loads credentials from environment variables
 */

// Simple .env file parser for local development
function loadEnvFile($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE format
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            // Set environment variable if not already set
            if (!getenv($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
            }
        }
    }
}

// Load .env file from project root (for local development)
$envPath = dirname(__DIR__) . '/.env';
loadEnvFile($envPath);

// Get credentials from environment variables
$clientId = getenv('SPOTIFY_CLIENT_ID') ?: $_ENV['SPOTIFY_CLIENT_ID'] ?? null;
$clientSecret = getenv('SPOTIFY_CLIENT_SECRET') ?: $_ENV['SPOTIFY_CLIENT_SECRET'] ?? null;
$refreshToken = getenv('SPOTIFY_REFRESH_TOKEN') ?: $_ENV['SPOTIFY_REFRESH_TOKEN'] ?? null;

// Validate that all required credentials are present
if (!$clientId || !$clientSecret || !$refreshToken) {
    error_log('Spotify API credentials are missing. Please set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN environment variables.');
    throw new Exception('Spotify API credentials are not configured. Please check your .env file or environment variables.');
}

return [
    'clientId' => $clientId,
    'clientSecret' => $clientSecret,
    'refreshToken' => $refreshToken
];
?>