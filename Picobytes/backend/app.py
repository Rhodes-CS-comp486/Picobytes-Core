# Treat this as app.py
import os
from flask import Flask, render_template, jsonify, request
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher# type: ignore
from services.user_funcs import UserFuncs
import os
from flask_cors import CORS

# get absolute path of current file's directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# configure paths relative to the base directory
frontend_dir = os.path.join(base_dir, 'frontend')
public_dir = os.path.join(base_dir, 'public')

app = Flask(__name__, 
            template_folder=frontend_dir, 
            static_folder=public_dir)

# Update CORS configuration to explicitly allow requests from your frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
        }
})

tf_question_service = QuestionService()
mc_question_service = MC_QuestionFetcher()
user_service = UserFuncs()

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/questions', methods=['GET'])
def api_get_questions():
    try:
        tf_questions = tf_question_service.pull_questions()
        mc_questions = mc_question_service.get_all_mc_questions()  # Changed to use the correct method

        print(f"TF Questions: {tf_questions}")
        print(f"MC Questions: {mc_questions}")

        questions = {
            'tf': tf_questions,
            'mc': mc_questions
        }
        
        response = {
            'questions': questions,
            'total_questions': len(tf_questions) + len(mc_questions)
        }
        
        print(f"Sending response: {response}")  # Debug log
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in api_get_questions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/question/<int:qid>', methods=['GET'])
def question(qid):
    """API endpoint to fetch a question by ID."""
    question_data = mc_question_service.get_question_by_id(qid)
    if question_data:
        response = {
            'question_id': question_data['qid'],
            'question_type': question_data['qtype'],
            'question_text': question_data['qtext'],
            'option1': question_data['option1'],
            'option2': question_data['option2'],
            'option3': question_data['option3'],
            'option4': question_data['option4'],
            'answer': question_data['answer'],
            'question_level': question_data['qlevel'],
            'question_topic': question_data['qtopic']
        }

        return jsonify(response)
    else:
        return jsonify({"error": "Question not found"}), 404

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')

    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400


    #hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = user_service.get_user_by_credentials(uname, upassword)
    if uid is None:
        return jsonify({'error': 'Invalid username or password'}), 401
    return jsonify({'uid': uid})


if __name__ == '__main__':
    app.run(debug=True)