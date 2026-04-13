<?php
session_start();
include "dp.php";

if(!isset($_SESSION['username'])){
    echo "session_expired";
    exit;
}

$username = $_SESSION['username'];
$otp = trim($_POST['otp']);

$stmt = $conn->prepare("SELECT otp FROM users WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if($row && $otp == $row['otp']){
    echo "success";
} else {
    echo "invalid";
}
?>