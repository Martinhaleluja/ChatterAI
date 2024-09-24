from flask import Flask, request, jsonify, render_template
import os
import google.generativeai as genai
from PIL import Image

app = Flask(__name__)

os.environ['GOOGLE_API_KEY'] = "AIzaSyC57yVveetigd4zVdTusGovd-yMr2eZB-k"
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

model = genai.GenerativeModel('gemini-pro')
vision_model = genai.GenerativeModel('gemini-pro-vision')

chat_sessions = []

@app.route('/')
def index():
    return render_template('index.html', chat_sessions=chat_sessions)

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('prompt')
    response = model.generate_content(user_input)
    
    if len(chat_sessions) == 0 or 'messages' in chat_sessions[-1]:
        chat_sessions.append({'topic': user_input, 'messages': []})
    
    chat_sessions[-1]['messages'].append({'user': user_input, 'bot': response.text})
    
    return jsonify({'response': response.text})

@app.route('/new_session', methods=['POST'])
def new_session():
    chat_sessions.append({'topic': '', 'messages': []})
    return jsonify({'status': 'New session started'})

@app.route('/image_chat', methods=['POST'])
def image_chat():
    file = request.files['file']
    if file:
        image = Image.open(file.stream)
        response = vision_model.generate_content(["Explain the picture?", image])
        chat_sessions[-1]['messages'].append({'user': 'Image uploaded', 'bot': response.text})
        return jsonify({'response': response.text})
    return jsonify({'error': 'No image uploaded'}), 400

if __name__ == '__main__':
    app.run(debug=True)
