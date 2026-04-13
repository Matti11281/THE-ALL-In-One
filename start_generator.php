<?php
$python = 'C:\\Users\\rehma\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
$script = 'C:\\xampp\\htdocs\\login_system\\genrate.py';
$log = 'C:\\xampp\\htdocs\\login_system\\generator.log';

$host = '127.0.0.1';
$port = 5001;
$timeoutSeconds = 15;

function isGeneratorRunning($host, $port) {
    $connection = @fsockopen($host, $port, $errno, $errstr, 1);
    if ($connection) {
        fclose($connection);
        return true;
    }
    return false;
}

if (!isGeneratorRunning($host, $port)) {
    $command = 'start /B "" "' . $python . '" "' . $script . '" > "' . $log . '" 2>&1';
    pclose(popen($command, 'r'));

    $startTime = time();
    while ((time() - $startTime) < $timeoutSeconds) {
        if (isGeneratorRunning($host, $port)) {
            break;
        }
        usleep(500000);
    }
}

header('Location: http://127.0.0.1:5001/');
exit;
