<?php
// ==========================================
// Spotify Now Playing Proxy with Caching
// ==========================================

error_reporting(0); // Suppress warnings

// Load credentials
$config = require __DIR__ . '/config.php';

$clientId = $config['clientId'];
$clientSecret = $config['clientSecret'];
$refreshToken = $config['refreshToken'];

$CACHE_FILE = __DIR__ . '/spotify_cache.json';
$CACHE_TIME = 10; // Cache duration in seconds

// ==========================================

header('Content-Type: application/json');

// 1. Check Cache
if (file_exists($CACHE_FILE) && (time() - filemtime($CACHE_FILE) < $CACHE_TIME)) {
    $cachedData = file_get_contents($CACHE_FILE);
    if ($cachedData) {
        echo $cachedData;
        exit;
    }
}

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
    curl_close($ch); 
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        // Don't cache errors, just return
        echo json_encode(['error' => 'Spotify Token Error']);
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
    curl_close($ch);

    if ($httpCode === 204) {
        return null; // No content
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
    curl_close($ch);
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

$output = [];
if ($track) {
    $artistNames = array_map(function($artist) { return $artist['name']; }, $track['artists']);
    
    $output = [
        'isPlaying' => true,
        'isLive' => ($status === "LISTENING TO"),
        'status' => $status,
        'title' => $track['name'],
        'artist' => implode(', ', $artistNames),
        'albumArt' => $track['album']['images'][0]['url'],
        'url' => $track['external_urls']['spotify']
    ];
} else {
    $output = ['isPlaying' => false];
}

$jsonOutput = json_encode($output);

// Save to cache
file_put_contents($CACHE_FILE, $jsonOutput);

echo $jsonOutput;
?>