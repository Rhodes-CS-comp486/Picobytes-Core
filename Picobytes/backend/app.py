# Treat this as app.py
import os
from flask import Flask, render_template, jsonify
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher
import hashlib
import os 

# get absolute path of current file's directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# configure paths relative to the base directory
frontend_dir = os.path.join(base_dir, 'frontend')
public_dir = os.path.join(base_dir, 'public')

app = Flask(__name__, 
            template_folder=frontend_dir, 
            static_folder=public_dir)

question_service = QuestionService()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/questions', methods=['GET'])
def api_get_questions():
    questions = question_service.pull_questions()
    return jsonify(questions)

@app.route('/api/question/<int:qid>', methods=['GET'])
def question(qid):
    """API endpoint to fetch a question by ID."""
    question_data = MC_QuestionFetcher.get_question_by_id(qid)
    if question_data:
        return jsonify(question_data)
    else:
        return jsonify({"error": "Question not found"}), 404



import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)


def get_user_by_credentials(uname, hashed_password):
    conn = sqlite3.connect('your_database.db')  # Replace with your actual DB
    cursor = conn.cursor()
    cursor.execute("SELECT uid FROM users WHERE uname = ? AND upassword = ?", (uname, hashed_password))
    user = cursor.fetchone()
    conn.close()
    return user[0] if user else -1


@app.route('/api/login', methods=['GET'])
def login():
    uname = request.args.get('uname')
    upassword = request.args.get('upassword')

    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400

    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = get_user_by_credentials(uname, hashed_password)

    return jsonify({'uid': uid})



if __name__ == '__main__':
    app.run(debug=True