<?php
// ==========================================
// Spotify Now Playing Proxy
// ==========================================

error_reporting(0); // Suppress warnings to ensure clean JSON

// Load credentials securely
$config = require __DIR__ . '/config.php';

$clientId = $config['clientId'];
$clientSecret = $config['clientSecret'];
$refreshToken = $config['refreshToken'];

// ==========================================

header('Content-Type: application/json');
function getAccessToken($clientId, $clientSecret, $refreshToken) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://accounts.spotify.com/api/token');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'refresh_token',
        'refresh_token' => $refreshToken,
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . base64_encode($clientId . ':' . $clientSecret),
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    // curl_close($ch); // Removed deprecated call
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        // Debug: Output the exact error from Spotify
        echo json_encode(['error' => 'Spotify Token Error: ' . $data['error'] . ' - ' . ($data['error_description'] ?? '')]);
        exit;
    }

    return $data['access_token'] ?? null;
}

function getNowPlaying($accessToken) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.spotify.com/v1/me/player/currently-playing');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // curl_close($ch); // Removed deprecated call

    if ($httpCode === 204) {
        return null; // No content (not playing anything)
    }
    
    return json_decode($response, true);
}

function getRecentlyPlayed($accessToken) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.spotify.com/v1/me/player/recently-played?limit=1');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    return json_decode($response, true);
}

// Main Logic
$accessToken = getAccessToken($clientId, $clientSecret, $refreshToken);

if (!$accessToken) {
    echo json_encode(['error' => 'Failed to get access token']);
    exit;
}

$data = getNowPlaying($accessToken);
$status = "LISTENING TO";
$track = null;

if ($data && isset($data['item'])) {
    $track = $data['item'];
    if (isset($data['is_playing']) && $data['is_playing'] === false) {
        $status = "LAST PLAYED";
    }
} else {
    // Fallback to recently played
    $recent = getRecentlyPlayed($accessToken);
    if ($recent && isset($recent['items'][0]['track'])) {
        $track = $recent['items'][0]['track'];
        $status = "LAST PLAYED";
    }
}

if ($track) {
    // Simplify the response for the frontend
    $artistNames = array_map(function($artist) { return $artist['name']; }, $track['artists']);
    
    echo json_encode([
        'isPlaying' => true, // Always show widget if we have track data
        'isLive' => ($status === "LISTENING TO"), // Distinguish live vs recent
        'status' => $status,
        'title' => $track['name'],
        'artist' => implode(', ', $artistNames),
        'albumArt' => $track['album']['images'][0]['url'], // Largest image
        'url' => $track['external_urls']['spotify']
    ]);
} else {
    echo json_encode(['isPlaying' => false]);
}
?>