<?php
require_once 'config.php';
header('Content-Type: application/json');

if (isset($_GET['city'])) {
    $city = urlencode($_GET['city']);
    $url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q={$city}&appid={$OPENWEATHER_API_KEY}";
    
    // Fetch the data from OpenWeather
    $response = @file_get_contents($url);
    
    if ($response !== false) {
        echo $response; // Send it to JavaScript
    } else {
        http_response_code(404);
        echo json_encode(["error" => "City not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No city provided"]);
}
?>