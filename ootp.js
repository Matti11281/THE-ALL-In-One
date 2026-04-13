document.addEventListener("DOMContentLoaded", () => {

const inputs = document.querySelectorAll(".otp-input");
const verifyBtn = document.getElementById("verify-btn");

// 🔥 AUTO MOVE INPUT
inputs.forEach((input, index) => {

input.addEventListener("input", () => {
if(input.value.length === 1 && inputs[index + 1]){
inputs[index + 1].focus();
}
});

input.addEventListener("keydown", (e) => {
if(e.key === "Backspace" && !input.value && inputs[index - 1]){
inputs[index - 1].focus();
}
});

});

// 🔥 VERIFY BUTTON CLICK
verifyBtn.addEventListener("click", () => {

let otp = "";

inputs.forEach(input => otp += input.value);

if(otp.length !== 5){
alert("Enter complete 5 digit OTP");
return;
}

// 🔥 DEBUG CHECK
console.log("Sending OTP:", otp);

fetch("otp_verify.php",{
method:"POST",
headers:{"Content-Type":"application/x-www-form-urlencoded"},
body:"otp="+otp
})
.then(res => res.text())
.then(data => {

data = data.trim();

console.log("Server Response:", data);

if(data === "success"){
alert("Login Successful");
window.location = "Jar.html";
}
else if(data === "session_expired"){
alert("Session expired. Login again.");
window.location = "login.html";
}
else{
alert("Wrong OTP");

// shake effect
let box = document.getElementById("otpContainer");
box.classList.add("shake");

setTimeout(()=>{
box.classList.remove("shake");
},400);

inputs.forEach(i => i.value="");
inputs[0].focus();
}

})
.catch(err => {
console.error("Fetch Error:", err);
alert("Server error");
});

});

});