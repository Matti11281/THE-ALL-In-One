const flipCard = document.getElementById("flipCard");
const toRegister = document.getElementById("toRegister");
const toLogin = document.getElementById("toLogin");

toRegister.addEventListener("click", (e) => {
    e.preventDefault();
    flipCard.style.transform = "rotateY(180deg)";
});

toLogin.addEventListener("click", (e) => {
    e.preventDefault();
    flipCard.style.transform = "rotateY(0deg)";
});

const formOuter = document.querySelector(".form-outer form");
const nextBtns = document.querySelectorAll(".next");
const prevBtns = document.querySelectorAll(".prev");
const progressSteps = document.querySelectorAll(".step");
let current = 1;

progressSteps[0].classList.add("active");

nextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        formOuter.style.marginLeft = `-${current * 100}%`;
        progressSteps[current - 1].classList.add("completed");
        progressSteps[current - 1].querySelector(".check").classList.add("active");
        current++;
        progressSteps[current - 1].classList.add("active");
    });
});

prevBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        current--;
        formOuter.style.marginLeft = `-${(current - 1) * 100}%`;
        progressSteps[current].classList.remove("completed", "active");
        progressSteps[current].querySelector(".check").classList.remove("active");
    });
});
document.getElementById("signupForm").addEventListener("submit", async (e) => {
e.preventDefault();

showLoader();

const formData = new FormData(e.target);

try {
const response = await fetch('signup.php', { method: 'POST', body: formData });
const result = await response.text();

hideLoader();

if (result.includes("Signup successful")) {
alert("Signup successful! Please login.");
location.reload();
} else {
alert(result);
}

} catch (error) {
hideLoader();
alert("Server error.");
}
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
e.preventDefault();

showLoader(); // 🔥 START LOADER

const formData = new FormData(e.target);

try {
const response = await fetch('login.php', { method: 'POST', body: formData });
const result = (await response.text()).trim();

hideLoader(); // 🔥 STOP LOADER

if (result === "wrong") {
alert("Incorrect password");
} 
else if (result === "notfound") {
alert("User not found");
} 
else if (result === "otp") {
window.location.href = "otp.html";
}

} catch (error) {
hideLoader();
alert("Login failed.");
}
});

function showLoader(){
document.getElementById("loader").style.display = "flex";
}

function hideLoader(){
document.getElementById("loader").style.display = "none";
}