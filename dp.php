<?php
$host = "localhost";
$user = "root";
$pass = "";
$dp = "login_system";

$conn = new mysqli("localhost","root","","login_system");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>