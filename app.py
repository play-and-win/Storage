from flask import Flask, request, send_file
from gtts import gTTS
import io

app = Flask(__name__)

@app.route('/speak')
def speak():
    # App se bheja gaya text read karega
    text = request.args.get('text', '')
    if not text:
        return "Text input is missing", 400
        
    # Aditi (co.in) accent ke sath pure Hindi/English voice generate karega
    tts = gTTS(text=text, lang='en', tld='co.in', slow=False)
    
    # Audio ko bina save kiye direct memory se high-speed stream karega
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    
    return send_file(fp, mimetype='audio/mp3')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
