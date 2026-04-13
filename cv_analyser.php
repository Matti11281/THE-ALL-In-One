<?php
$projectDir = __DIR__;
$targetUrl = 'http://127.0.0.1:5000/';
$host = '127.0.0.1';
$port = 5000;

// Much faster and more reliable way to check if Flask is running without hanging
function isServerUp($host, $port) {
    // 1-second timeout to prevent script freezing
    $connection = @fsockopen($host, $port, $errno, $errstr, 1); 
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    return false;
}

if (!isServerUp($host, $port)) {
    // Escape directory path for Windows CMD safely
    $escapedDir = escapeshellarg($projectDir);

    // CRITICAL FIX: Added '> NUL 2>&1' to the end of every command. 
    // This entirely disconnects Python's output from PHP, stopping the 120s timeout.
    $launchCommands = [
        'cd /d ' . $escapedDir . ' && pythonw app.py > NUL 2>&1',
        'cd /d ' . $escapedDir . ' && py -3 app.py > NUL 2>&1',
        'cd /d ' . $escapedDir . ' && python app.py > NUL 2>&1'
    ];

    foreach ($launchCommands as $command) {
        // Execute in the background and close the PHP connection to it immediately
        @pclose(@popen('start "" /B cmd /C "' . $command . '"', 'r'));

        // Check if the server has started (Wait up to 5 seconds total per command)
        for ($i = 0; $i < 10; $i++) {
            usleep(500000); // Wait 0.5 seconds
            if (isServerUp($host, $port)) {
                // Server is up, redirect immediately!
                header('Location: ' . $targetUrl);
                exit;
            }
        }
    }
}

// If already running (or successfully started), redirect to Flask
header('Location: ' . $targetUrl);
exit;