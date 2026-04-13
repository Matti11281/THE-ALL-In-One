from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import base64
import os
from dotenv import load_dotenv # <-- New import

# Load the secret variables from the .env file
load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"

# Securely grab the token from .env instead of typing it here
HF_TOKEN = os.getenv("HF_API_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}", 
    "Content-Type": "application/json"
}

@app.route("/")
def home():
    if not os.path.exists("image.html"):
        return "Error: image.html not found in the current directory.", 404
    return send_from_directory(".", "image.html")


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return jsonify({"error": "Prompt required"}), 400

        # Call Hugging Face API
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json={"inputs": prompt}
        )

        print("STATUS:", response.status_code)

        if response.status_code != 200:
            print("ERROR RESPONSE:", response.text)
            
            try:
                hf_error = response.json().get("error", response.text)
            except:
                hf_error = response.text
                
            if "is currently loading" in hf_error:
                return jsonify({"error": "Model is waking up. Please wait 20 seconds and try again!"}), 503
                
            return jsonify({"error": f"Hugging Face Error: {hf_error}"}), response.status_code

        image_bytes = response.content
        img_base64 = base64.b64encode(image_bytes).decode()

        return jsonify({
            "image": "data:image/png;base64," + img_base64
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)