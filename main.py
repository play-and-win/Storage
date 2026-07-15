import os
import requests
from dotenv import load_dotenv

# .env फाइल से API key लोड करें
load_dotenv()
api_key = os.getenv("XAI_API_KEY")

def generate_image(prompt_text):
    url = "https://api.x.xai/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "grok-imagine-image-quality",
        "prompt": prompt_text
    }

    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        print("इमेज जेनरेट हो गई है!")
        print(response.json())
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

# यहाँ अपना प्रॉम्प्ट लिखें
my_prompt = "A beautiful futuristic city with flying cars, cinematic lighting"
generate_image(my_prompt)
