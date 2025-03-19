import os
from flask import Flask, render_template, jsonify, request
from services.free_response_question_pull import FR_QuestionFetcher
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher  # type: ignore
from services.user_funcs import UserFuncs
from services.topic_pull import Topic_Puller
import os
import hashlib
from flask_cors import CORS
from services.admin_service import AdminService
from services.question_saver import QuestionSave
from services.question_adder import QuestionAdder  # Import the new service
from services.get_question import GetQuestions
from services.code_blocks_question_pull import CB_QuestionFetcher
from services.verification import Verification
import json
from services.analytics_service import AnalyticsService

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
admin_service = AdminService()
fr_question_service = FR_QuestionFetcher()
question_save_service = QuestionSave()
topic_service = Topic_Puller()
question_adder_service = QuestionAdder()  # Initialize the new service
question_fetcher_service = GetQuestions()
cb_question_service = CB_QuestionFetcher()
verification_service = Verification()
analytics_service = AnalyticsService()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/questions/<string:uid>', methods=['GET'])
def api_get_questions(uid):
    try:
        if verification_service.verify_user(uid):
            tf_questions = tf_question_service.pull_questions()
            mc_questions = mc_question_service.get_all_mc_questions()  # Changed to use the correct method

            questions = {
                'tf': tf_questions,
                'mc': mc_questions
            }

            response = {
                'questions': questions,
                'total_questions': len(tf_questions) + len(mc_questions),
                'uid': uid
            }

            return jsonify(response)
        else:
            return jsonify({'error': 'User not found'}), 401

    except Exception as e:
        print(f"Error in api_get_questions: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/question/<int:qid>/<string:uid>', methods=['GET'])
def question(qid, uid):
    """API endpoint to fetch a question by ID."""
    if verification_service.verify_user(uid):
        response = question_fetcher_service.get_question(qid, uid)
        return response
    else:
        return jsonify({'error': 'Not authorized'}), 401


@app.route('/api/admin/dashboard/active-users-list/<string:uid>', methods=['GET'])
def get_active_users_list(uid):
    if verification_service.verify_admin(uid):
        period = request.args.get('period', '24h')
        users = admin_service.get_active_users_list(period)
        return jsonify(users)
    else:
        return jsonify({'error': 'Not authorized'}), 401


@app.route('/api/admin/update-user-status', methods=['POST'])
def update_user_status():
    # In a production environment, you should add admin authentication here
    data = request.get_json()
    uid = data.get('uid')
    is_admin = data.get('is_admin')

    if uid is None or is_admin is None:
        return jsonify({'success': False, 'error': 'Missing required parameters'}), 400

    success = admin_service.update_user_admin_status(uid, is_admin)

    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Failed to update user status'}), 500


@app.route('/api/submit_question', methods=['POST'])
def submit_question():
    data = request.get_json()
    uid = data.get('uid')
    qid = data.get('qid')
    response = data.get('response')

    if not uid:
        return jsonify({"error": "Missing user id"}), 400
    if not qid:
        return jsonify({"error": "Missing question id"}), 400
    if not response:
        return jsonify({"error": "Missing response"}), 400

    question_save_service.save_question(uid, qid, response)

    return jsonify({'uid': uid})


@app.route('/api/topic_selection/<string:uid>', methods=['GET'])
def topic_selection(uid):
    qtype = request.args.get('qtype', 'ALL')  # Default to 'ALL' if not provided
    topic = request.args.get('topic', '')  # Default to empty string if not provided

    if qtype == "ALL":
        topic_data = topic_service.get_all_questions_by_topic(topic)
        responses = []
        for topic in topic_data:
            if topic[1] == 'true_false':
                responses.append({
                    'question_id': topic[0],
                    'question_type': topic[1],
                    'question_text': topic[2],
                    'correct': topic[3],
                    'qlevel': topic[4],
                })
            elif topic[1] == 'multiple_choice':
                responses.append({
                    'question_id': topic[0],
                    'question_type': topic[1],
                    'question_text': topic[2],
                    'option1': topic[3],
                    'option2': topic[4],
                    'option3': topic[5],
                    'option4': topic[6],
                    'answer': topic[7],
                    'qlevel': topic[8],
                })
            else:
                return jsonify({"error": "Topic not found"}), 404
    elif qtype == "MC":
        topic_data = topic_service.get_mc_by_topic(topic)
        responses = []
        for topic in topic_data:
            responses.append({
                'question_id': topic[0],
                'question_type': topic[1],
                'question_text': topic[2],
                'option1': topic[3],
                'option2': topic[4],
                'option3': topic[5],
                'option4': topic[6],
                'answer': topic[7],
                'qlevel': topic[8],
            })
    elif qtype == "TF":
        topic_data = topic_service.get_tf_by_topic(topic)
        responses = []
        for topic in topic_data:
            responses.append({
                'question_id': topic[0],
                'question_type': topic[1],
                'question_text': topic[2],
                'correct': topic[3],
                'qlevel': topic[4],
            })
    else:
        return jsonify({"error": "Topic not found"}), 404

    # print(json.dumps({'topics': responses}, indent=4))
    return jsonify({'topics': responses}), 200


##########################################
##########  USER AUTHENTICATION ##########
##########################################

@app.route('/api/create_account', methods=['POST'])
def create_account():
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')

    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = user_service.add_user(uname, hashed_password, 0)
    if uid is None:
        return jsonify({'error': 'Error Creating Account. Please Try Again Later.'}), 401
    return jsonify({'uid': uid})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')

    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = user_service.get_user_by_credentials(uname, hashed_password)
    if uid is None:
        return jsonify({'error': 'Invalid username or password'}), 401
    return jsonify({'uid': uid})


@app.route('/api/update_password', methods=['POST'])
def update_password():
    print("updating password")
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')
    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = user_service.change_password(uname, hashed_password)
    return jsonify({uid})


##########################################
##########      ADMIN SHIT      ##########
##########################################

@app.route('/api/admin/add_question', methods=['POST'])
def add_question():
    """API endpoint to add a new question to the database."""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400
        uid = data.get('uid')

        if verification_service.verify_admin(uid):
            result, status_code = question_adder_service.add_question(data)

            return jsonify(result), status_code
        else:
            return jsonify({"error": "No admin access found"}), 401

    except Exception as e:
        print(f"Error in add_question endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


'''@app.route('/api/admin/check', methods=['GET'])
def check_admin():
    # This is a simple verification that would need to be replaced with
    # proper authentication in a production environment
    uid = request.args.get('uid')
    is_admin = user_service.is_admin(uid)
    return jsonify({'is_admin': is_admin})'''


@app.route('/api/admin/dashboard/active-users/<string:uid>', methods=['GET'])
def get_active_users(uid):
    if verification_service.verify_admin(uid):
        period = request.args.get('period', '24h')
        data = admin_service.get_active_users(period)
        return jsonify(data)
    else:
        return jsonify({"error": "No admin access found"}), 401


@app.route('/api/admin/dashboard/performance/<string:uid>', methods=['GET'])
def get_performance_metrics(uid):
    if verification_service.verify_admin(uid):
        data = admin_service.get_performance_metrics()
        return jsonify(data)
    else:
        return jsonify({"error": "No admin access found"}), 401


@app.route('/api/admin/dashboard/question-stats/<string:uid>', methods=['GET'])
def get_question_stats(uid):
    if verification_service.verify_admin(uid):
        data = admin_service.get_question_stats()
        return jsonify(data)
    else:
        return jsonify({"error": "No admin access found"}), 401


@app.route('/api/admin/dashboard/usage-stats/<string:uid>', methods=['GET'])
def get_usage_stats(uid):
    # In a production environment, you should add admin authentication here
    if verification_service.verify_admin(uid):
        data = admin_service.get_usage_stats()
        return jsonify(data)
    else:
        return jsonify({"error": "No admin access found"}), 401


@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        selected_answer = data.get('selected_answer')

        if not question_id:
            return jsonify({"error": "Missing question_id"}), 400
        if selected_answer is None:
            return jsonify({"error": "Missing selected_answer"}), 400

        # Get the question to verify the correct answer
        question_data = mc_question_service.get_question_by_id(int(question_id))
        if not question_data:
            return jsonify({"error": "Question not found"}), 404

        correct_answer_index = question_data['answer'] - 1  # Convert from 1-based to 0-based index
        is_correct = selected_answer[correct_answer_index] and selected_answer.count(True) == 1

        # Record this question attempt in analytics
        analytics_service.record_question_attempt(int(question_id), is_correct)

        # Here you would typically save the user's answer to your database
        # For now, we'll just return whether it was correct or not

        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer_index': correct_answer_index
        })

    except Exception as e:
        print(f"Error in submit_answer: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # with app.app_context():
    # print(topic_selection("MC", "Science"))
    app.run(debug=True)