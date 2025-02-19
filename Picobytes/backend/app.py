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

CORS(app)

tf_question_service = QuestionService()
mc_question_service = MC_QuestionFetcher()
user_service = UserFuncs()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/questions', methods=['GET'])
def api_get_questions():
    questions = tf_question_service.pull_questions()
    return jsonify(
        {
            "questions": questions,
            "total_questions": len(questions)
        }
    )

@app.route('/api/question/<int:qid>', methods=['GET'])
def question(qid):
    """API endpoint to fetch a question by ID."""
    question_data = mc_question_service.get_question_by_id(qid)
    if question_data:
        return jsonify(question_data)
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