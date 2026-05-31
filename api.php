<?php
/**
 * Smart Diet Planner - PHP API Gateway for Gemini API
 * Highly polished, secure, and production-ready.
 */

// Establish headers for CORS & JSON response
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Support POST requests exclusively
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed. Use POST.']);
    exit;
}

// 1. Obtain Gemini API Key from environment or local configuration
$apiKey = getenv('GEMINI_API_KEY') ?: getenv('API_KEY') ?: '';

// Fallback search in a local .env file if available
if (!$apiKey && file_exists(__DIR__ . '/.env')) {
    $envContent = file_get_contents(__DIR__ . '/.env');
    if (preg_match('/(?:GEMINI_API_KEY|API_KEY)\s*=\s*["\']?([^"\'\r\n]+)/', $envContent, $matches)) {
        $apiKey = trim($matches[1]);
    }
}

// Hardcoded fallback variable or custom instructions can go here if needed
if (!$apiKey) {
    http_response_code(500);
    echo json_encode([
        'error' => 'تنظیمات کلید API یافت نشد.',
        'details' => 'Please set the GEMINI_API_KEY environment variable or create a .env file in the root directory.'
    ]);
    exit;
}

// 2. Read and parse incoming structured payload
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!$data || !isset($data['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload. "prompt" is required.']);
    exit;
}

$prompt = $data['prompt'];
$systemInstruction = isset($data['systemInstruction']) ? $data['systemInstruction'] : '';
$responseSchema = isset($data['responseSchema']) ? $data['responseSchema'] : null;
$temperature = isset($data['temperature']) ? floatval($data['temperature']) : 0.5;
$model = isset($data['model']) ? $data['model'] : 'gemini-2.5-flash';

// 3. Formulate the official payload for Google Gemini API (v1beta JSON format)
$geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ]
];

if (!empty($systemInstruction)) {
    $payload['systemInstruction'] = [
        'parts' => [
            ['text' => $systemInstruction]
        ]
    ];
}

$generationConfig = [
    'temperature' => $temperature
];

if ($responseSchema !== null) {
    $generationConfig['responseMimeType'] = 'application/json';
    $generationConfig['responseSchema'] = $responseSchema;
}

$payload['generationConfig'] = $generationConfig;

// 4. Initialize cURL transaction
$ch = curl_init($geminiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// Timeout protection
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $curlError = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'خطا در ارتباط با سرور هوش مصنوعی', 'details' => $curlError]);
    exit;
}

curl_close($ch);

// 5. Audit output response and bridge it to client
if ($httpCode !== 200) {
    http_response_code($httpCode);
    $parsedError = json_decode($response, true);
    if (isset($parsedError['error'])) {
        echo json_encode([
            'error' => 'خطای سرور گوگل جمی‌آی', 
            'details' => $parsedError['error']['message'] ?? $response
        ]);
    } else {
        echo json_encode(['error' => "Gemini API returned HTTP $httpCode", 'details' => $response]);
    }
    exit;
}

// Success transition! Parse and deliver raw content text inside candidate
$geminiResult = json_decode($response, true);
if (isset($geminiResult['candidates'][0]['content']['parts'][0]['text'])) {
    $responseText = $geminiResult['candidates'][0]['content']['parts'][0]['text'];
    
    // Check if it's already a JSON payload or return it
    echo $responseText;
} else {
    http_response_code(502);
    echo json_encode([
        'error' => 'پاسخ نامعتبر از سرور هوش مصنوعی',
        'details' => 'No text found in candidate content parts.',
        'raw' => $geminiResult
    ]);
}
