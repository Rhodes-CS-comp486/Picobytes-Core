# Treat this as app.py
import os
from flask import Flask, render_template, jsonify, request

from services.free_response_question_pull import FR_QuestionFetcher
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher# type: ignore
from services.user_funcs import UserFuncs
from services.topic_pull import Topic_Puller
import os
import hashlib
from flask_cors import CORS
from services.admin_service import AdminService
from services.question_saver import QuestionSave
import json

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
            'question_text': question_data['qtext'],
            'option_1': question_data['option1'],
            'option_2': question_data['option2'],
            'option_3': question_data['option3'],
            'option_4': question_data['option4'],
            'answer': question_data['answer'],
            'question_type': question_data['qtype'],
            'question_level': question_data['qlevel'],
            'question_topic': question_data['qtopic']
        }

        return jsonify(response)
    else:
        return jsonify({"error": "Question not found"}), 404
    

@app.route('/api/admin/dashboard/active-users-list', methods=['GET'])
def get_active_users_list():
    # In a production environment, you should add admin authentication here
    period = request.args.get('period', '24h')
    users = admin_service.get_active_users_list(period)
    return jsonify(users)


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

### Free Response Questions ###

@app.route('/api/fr_question/<int:qid>', methods=['GET'])
def fr_question(qid):
    """API endpoint to fetch a question by ID."""
    question_data = fr_question_service.get_question_by_id(qid)
    if question_data:
        response = {
            'question_id': question_data['qid'],
            'question_type': question_data['qtype'],
            'question_text': question_data['qtext'],
            'question_level': question_data['qlevel'],
            'question_topic': question_data['qtopic']
        }

        return jsonify(response)
    else:
        return jsonify({"error": "Question not found"}), 404




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

@app.route('/api/topic_selection', methods=['GET'])
def topic_selection(qtype, topic):
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

    #print(json.dumps({'topics': responses}, indent=4))
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

##########################################
##########      ADMIN SHIT      ##########
##########################################

@app.route('/api/admin/check', methods=['GET'])
def check_admin():
    # This is a simple verification that would need to be replaced with
    # proper authentication in a production environment
    uid = request.args.get('uid')
    is_admin = user_service.is_admin(uid)
    return jsonify({'is_admin': is_admin})

@app.route('/api/admin/dashboard/active-users', methods=['GET'])
def get_active_users():
    # In a production environment, you should add admin authentication here
    period = request.args.get('period', '24h')
    data = admin_service.get_active_users(period)
    return jsonify(data)

@app.route('/api/admin/dashboard/performance', methods=['GET'])
def get_performance_metrics():
    # In a production environment, you should add admin authentication here
    data = admin_service.get_performance_metrics()
    return jsonify(data)

@app.route('/api/admin/dashboard/question-stats', methods=['GET'])
def get_question_stats():
    # In a production environment, you should add admin authentication here
    data = admin_service.get_question_stats()
    return jsonify(data)

@app.route('/api/admin/dashboard/usage-stats', methods=['GET'])
def get_usage_stats():
    # In a production environment, you should add admin authentication here
    data = admin_service.get_usage_stats()
    return jsonify(data)


if __name__ == '__main__':
    with app.app_context():
        print(topic_selection("MC", "Science"))
    app.run(debug=True)