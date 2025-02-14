import os
<<<<<<< HEAD
from flask import Flask, render_template, jsonify, request
from services.tf_question_pull import QuestionService
=======
from flask import Flask, render_template, jsonify
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher# type: ignore
import os 
>>>>>>> 82c959656dd0185da8bc9c817b013ab784c320aa

# get absolute path of current file's directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# configure paths relative to the base directory
frontend_dir = os.path.join(base_dir, 'frontend')
db_path = os.path.join(base_dir, 'backend', 'qa.db')

app = Flask(__name__, 
            template_folder=frontend_dir, 
            static_folder=frontend_dir)

question_service = QuestionService(db_path=db_path)

@app.route('/')
def home():
    return render_template('index.html')

<<<<<<< HEAD
@app.route('/api/questions/<int:qid>', methods=['GET'])
def api_get_question(qid):
    question = question_service.get_question_by_id(qid)
    if question:
        return jsonify(question)
    else:
        return jsonify({"error": "Question not found"}), 404
=======
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

>>>>>>> 82c959656dd0185da8bc9c817b013ab784c320aa

if __name__ == '__main__':
    app.run(debug=True)