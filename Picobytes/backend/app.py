# Treat this as app.py
import os
from flask import Flask, render_template, jsonify
from services.tf_question_pull import QuestionService # type: ignore
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


if __name__ == '__main__':
    app.run(debug=True)