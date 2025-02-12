# Treat this as app.py
from flask import Flask, render_template
from services.tf_question_pull import pull_questions

app = Flask(__name__, template_folder='../frontend', static_folder='../../public')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/questions', methods=['GET'])
def api_get_questions():
    questions = pull_questions()
    return jsonify(questions)


if __name__ == '__main__':
    app.run(debug=True)