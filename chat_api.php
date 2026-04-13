<?php
// chat_api.php
header('Content-Type: application/json');

// 1. Silence HTML errors to prevent breaking JSON
error_reporting(0);
ini_set('display_errors', 0);

// 2. Updated filename reference
$configFile = 'Confi.php';

if (!file_exists($configFile)) {
    echo json_encode(['error' => "Configuration file ($configFile) not found."]);
    exit;
}

require_once $configFile;

// 3. Process the Incoming Request
$input = json_decode(file_get_contents('php://input'), true);
$userMsg = $input['message'] ?? '';
$sysPrompt = $input['system_prompt'] ?? '';

if (empty($userMsg)) {
    echo json_encode(['error' => 'No message provided.']);
    exit;
}

// 4. Verify the variable from Confi.php
if (!isset($OPENROUTER_API_KEY) || empty($OPENROUTER_API_KEY)) {
    echo json_encode(['error' => 'API Key variable is missing inside Confi.php']);
    exit;
}

// 5. OpenRouter API Request
$url = "https://openrouter.ai/api/v1/chat/completions";
$headers = [
    "Authorization: Bearer " . trim($OPENROUTER_API_KEY),
    "Content-Type: application/json"
];

$postData = json_encode([
    "model" => "meta-llama/llama-3-8b-instruct",
    "messages" => [
        ["role" => "system", "content" => $sysPrompt],
        ["role" => "user", "content" => $userMsg]
    ],
    "temperature" => 0.7
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);

if(curl_errno($ch)) {
    echo json_encode(['error' => 'cURL Connection Error: ' . curl_error($ch)]);
} else {
    echo $response;
}

curl_close($ch);
?>