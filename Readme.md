# 🚀 Multi-Feature Web App (6-in-1 Project)

This is a full-stack web application that contains **6 powerful mini apps in one platform**:

### 🌟 Features

1. 🌦️ Weather App (API Based)
2. 🤖 AI Chatbot (API Based)
3. ⌨️ Typing Speed Game
4. 🎨 Image Generator (Hugging Face API)
5. 📄 CV Analyzer
6. ✅ To-Do App

Also includes:

* 🔐 Login & Signup System (PHP + MySQL)
* 📬 Contact Us Page
* ℹ️ About Us Page
* 🚪 Logout System

---

# 📦 Requirements

Before running the project, install the following:

## 🔹 1. Install XAMPP

* Download XAMPP
* Install it
* Open **XAMPP Control Panel**
* Start:

  * Apache ✅
  * MySQL ✅

---

## 🔹 2. Install Python (For CV Analyzer)

* Download Python (latest version recommended)
* During installation, **check "Add Python to PATH"**

### Install Required Python Libraries:

Open terminal / CMD and run:

```bash
pip install flask and flask_cors
pip install os 
pip install coe
pip install scikit-learn
pip install pypdf2
pip install diffuser or stable diffuser 
```

(Optional but recommended):

```bash
python -m spacy download en_core_web_sm
```

---

# ⚙️ Project Setup

## 🔹 Step 1: Move Project Folder

* Copy your project folder
* Paste it inside:

```
C:\xampp\htdocs\
```

---

## 🔹 Step 2: Setup Database

1. Open browser:

```
http://localhost/phpmyadmin
```

2. Create a new database (e.g., `myapp_db`)

3. Import the provided `login_system.sql` file:

* Click **Import**
* Select your `.sql` file
* Click **Go**

---

## 🔹 Step 3: Configure API Keys

### 📁 File: `config.php`

```php
$GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; //From open weather website go to api key section and create API key and copy that and paste here 
$OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY_HERE"; //From gemini API section copy the new API
```

---

### 📁 File: `Confi.php`

```php
$OPENROUTER_API_KEY = "Your-OpenRouter-API-Key-Here";
```
From open route website go to api key section and create API key and copy that and paste here 
---

### 📁 File: `.env`

```env
HF_API_TOKEN="Your Hugging Face API token here"
```
From hugging face website it look like hf-....... make a new one not already created one
---

# ▶️ Running the Project

## 🔹 Step 1: Start XAMPP

* Start **Apache**
* Start **MySQL**

---
## 🔹 Step 2: Open in Browser

```bash
http://localhost/your_project_folder
```

---

# 🔐 Login System

* You can **register a new account**
* Or use existing credentials (if provided)
* Database handles user authentication

---
When you Login it ask for otp.....   Go to your Db Section in users and refresh it and in otp column you got your otp
# 📌 How Each Feature Works

### 🌦️ Weather App

* Uses OpenWeather API
* Fetches real-time weather data

### 🤖 Chatbot

* Uses OpenRouter / Gemini API
* AI-based responses

### ⌨️ Typing Game

* Pure frontend logic
* Calculates speed & accuracy

### 🎨 Image Generator

* Uses Hugging Face API
* Generates images from prompts

### 📄 CV Analyzer

* Uses Python backend
* Analyzes resumes using NLP

### ✅ To-Do App

* Add, delete, manage tasks
* Stored locally or in database

---

# ⚠️ Important Notes

* ❗ Do NOT upload real API keys to GitHub

* Always use:

  * `config.example.php`
  * `.env.example`

* Add `.env` to `.gitignore`

---

# 📁 Project Structure (Simplified)

```
/project-folder
│── config.php
│── Confi.php
│── .env
│── index.php
│── login.php
│── signup.php
│── /assets
│── /python-backend
│── database.sql
```

---

# 💡 Future Improvements

* Add JWT Authentication
* Deploy on cloud (AWS / Vercel)
* Improve UI/UX
* Add more AI features

---

# 👨‍💻 Author

MATTI UR REHMAN 

---

# ⭐ Support

If you like this project:

* Star ⭐ the repo
* Share with others 🚀

---
