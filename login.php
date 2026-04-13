<?php
session_start();
include "dp.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){

        $row = $result->fetch_assoc();

        if(password_verify($password, $row['password'])){

            $otp = rand(10000, 99999);

            $update = $conn->prepare("UPDATE users SET otp=? WHERE username=?");
            $update->bind_param("is", $otp, $username);
            $update->execute();

            $_SESSION['username'] = $username;

            echo "otp";
            exit;

        } else {
            echo "wrong";
            exit;
        }

    } else {
        echo "notfound";
        exit;
    }
}
?>