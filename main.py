import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# पोर्ट रेंडर खुद देगा, अगर नहीं तो 8080 का उपयोग करें
port = int(os.environ.get("PORT", 8080))

@app.route('/')
def home():
    return "API is running!"

@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.json.get('prompt', 'A futuristic city')
    api_key = os.getenv("XAI_API_KEY")
    
    url = "https://api.x.xai/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {"model": "grok-imagine-image-quality", "prompt": prompt}
    
    response = requests.post(url, headers=headers, json=data)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
