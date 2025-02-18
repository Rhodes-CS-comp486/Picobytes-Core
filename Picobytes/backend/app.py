import os
from flask import Flask, render_template, jsonify
from services.tf_question_pull import TF_QuestionFetcher as QuestionService
import logging

# get absolute path of current file's directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# configure paths relative to the base directory
frontend_dir = os.path.join(base_dir, 'frontend')

app = Flask(__name__, 
            template_folder=frontend_dir, 
            static_folder=frontend_dir)

question_service = QuestionService()

# configure logging
logging.basicConfig(level=logging.DEBUG)


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
    logging.debug(f"Fetching question with ID: {qid}")
    question_data = question_service.get_question_by_id(qid)
    if question_data:
        logging.debug(f"Question data: {question_data}")
        return jsonify({
            "qid": question_data[0],
            "qtext": question_data[1],
            "qlevel": question_data[2],
            "correct": question_data[3]
        })
    else:
        logging.debug("Question not found")
        return jsonify({"error": "Question not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)