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
from services.code_execution_service import CodeExecutionService  # Import the new service
import json
from services.analytics_service import AnalyticsService
from services.streak import Streaks
from services.verification import Verification
import sqlite3

from apscheduler.schedulers.background import BackgroundScheduler
from email_notifications.handle_emails import handle_emails



# get absolute path of current file's directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# configure paths relative to the base directory
frontend_dir = os.path.join(base_dir, 'frontend')
public_dir = os.path.join(base_dir, 'public')

#Scheduling stuff for email notifications

sched = BackgroundScheduler(daemon=True)
sched.add_job(handle_emails, 'interval', hours=24)
sched.start()

app = Flask(__name__,
            template_folder=frontend_dir,
            static_folder=public_dir)

# Update CORS configuration to explicitly allow requests from your frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
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
analytics_service = AnalyticsService()
streak_service = Streaks()
verification_service = Verification()
code_execution_service = CodeExecutionService()  # Initialize the code execution service


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/get_user_stats/<string:uid>')
def get_user_stats(uid):
    print(f"Received uid: {uid}")
    if verification_service.verify_user(uid):
        curr_streak, curr_points = streak_service.get_stats(uid)
        if curr_streak == -1:
            return jsonify({'error getting streak'}), 500
        response = {
            'streak': curr_streak,
            'points': curr_points,
            'uid': uid
        }
        #return response
        return jsonify(response), 200
    else:
        #print("error")
        return jsonify({'error': 'User not found'}), 401


@app.route('/api/get_top_10')
def getleaderboard():
    try:
        top_10 = streak_service.get_top_10()
        return top_10, 200;
    except Exception as e:
        return jsonify({'error!': str(e)}), 500


####UPDATED#####
@app.route('/api/question/<int:qid>', methods=['GET'])
def question(qid):
    """API endpoint to fetch a question by ID."""
    #if verification_service.verify_user(uid):
    response = question_fetcher_service.get_question(qid)
    return response
    #else:
      #  return jsonify({'error': 'User not found'}), 401





# Helper function to validate admin access
def validate_admin_access(uid):
    if not uid:
        return False
    return user_service.is_admin(uid)

@app.route('/api/admin/dashboard/active-users-list', methods=['GET'])
def get_active_users_list():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    period = request.args.get('period', '24h')
    users = admin_service.get_active_users_list(period)
    return jsonify(users)




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


@app.route('/api/admin/update-user-status', methods=['POST'])
def update_user_status():
    data = request.get_json()
    uid = data.get('uid')
    
    # Check if the requesting user is an admin
    if not validate_admin_access(uid):
        return jsonify({'success': False, 'error': 'Unauthorized access'}), 403
        
    uid_to_update = data.get('uid_to_update')
    is_admin = data.get('is_admin')

    if uid_to_update is None or is_admin is None:
        return jsonify({'success': False, 'error': 'Missing required parameters'}), 400

    success = admin_service.update_user_admin_status(uid_to_update, is_admin)

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

@app.route('/api/topics', methods=['GET'])
def get_topics():
    return  jsonify(topic_service.get_topic_list())

@app.route('/api/topic_selection', methods=['GET'])
def topic_selection():
    qtype = request.args.get('qtype', 'ALL')  # Default to 'ALL' if not provided
    topic = request.args.get('topic', '')  # Default to empty string if not provided

    if qtype == "ALL":
        topic_data = topic_service.get_all_questions_by_topic(topic)
        responses = []
        for item in topic_data:
            if item[1] == 'true_false':
                responses.append({
                    'question_id': item[0],
                    'question_type': item[1],
                    'question_text': item[2],
                    'correct': item[3],
                    'qlevel': item[4],
                })
            elif item[1] == 'multiple_choice':
                responses.append({
                    'question_id': item[0],
                    'question_type': item[1],
                    'question_text': item[2],
                    'option1': item[3],
                    'option2': item[4],
                    'option3': item[5],
                    'option4': item[6],
                    'answer': item[7],
                    'qlevel': item[8],
                })
            elif item[1] == 'free_response':
                responses.append({
                'question_id': item[0],
                'question_text': item[2],
                'prof_answer': item[3],
                'question_type': item[1],
                'qlevel': item[4],
                })
            elif item[1] == 'code_blocks':
                responses.append({
                'question_id': item[0],
                'question_text': item[2],
                'answer': item[3],
                'question_type': item[1], # answer
                'qlevel': item[4],
                })
    elif qtype == "MC":
        topic_data = topic_service.get_mc_by_topic(topic)
        responses = []
        for item in topic_data:
            responses.append({
                'question_id': item[0],
                'question_text': item[1],
                'option4': item[2],
                'option1': item[3],
                'option2': item[4],
                'option3': item[5],
                'answer': item[6],
                'question_type': item[7],
                'qlevel': item[8],
            })
    elif qtype == "TF":
        topic_data = topic_service.get_tf_by_topic(topic)
        responses = []
        for item in topic_data:
            responses.append({
                'question_id': item[0],
                'question_text': item[1],
                'correct': item[2],
                'question_type': item[3],
                'qlevel': item[4],
            })
    elif qtype == "FR":
        topic_data = topic_service.get_fr_by_topic(topic)
        responses = []
        for item in topic_data:
            responses.append({
                'question_id': item[0],
                'question_text': item[1],
                'prof_answer': item[2],
                'question_type': item[3],
                'qlevel': item[4],
            })
    elif qtype == "CB":
        topic_data = topic_service.get_cb_by_topic(topic)
        responses = []
        for item in topic_data:
            responses.append({
                'question_id': item[0],
                'question_text': item[1],
                'answer': item[2],
                'question_type': item[3],
                'qlevel': item[4],
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
    uemail = data.get('uemail')

    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    uid = user_service.add_user(uname, hashed_password, uemail, 0)
    if uid is None:
        return jsonify({'error': 'Error Creating Account. Please Try Again Later.'}), 401
    return jsonify({'uid': uid})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')

    print(f"Login attempt: User={uname}, Password length={len(upassword) if upassword else 0}")

    if not uname or not upassword:
        print("Login failed: Missing username or password")
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    print(f"Generated hash: {hashed_password}")
    uid = user_service.get_user_by_credentials(uname, hashed_password)
    if uid is None:
        print(f"Login failed: Invalid credentials for user {uname}")
        return jsonify({'error': 'Invalid username or password'}), 401
        
    # Check if the user is an admin
    is_admin = user_service.is_admin(uid)
    
    print(f"Login successful: User={uname}, UID={uid}, Admin={is_admin}")
    return jsonify({'uid': uid, 'is_admin': is_admin})


@app.route('/api/update_password', methods=['POST'])
def update_password():
    print("updating password")
    data = request.get_json()
    uname = data.get('uname')
    upassword = data.get('upassword')
    if not uname or not upassword:
        return jsonify({'error': 'Missing username or password'}), 400
    hashed_password = hashlib.sha256(upassword.encode()).hexdigest()
    success = user_service.change_password(uname, hashed_password)
    return jsonify({'success': success})


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

        result, status_code = question_adder_service.add_question(data)

        return jsonify(result), status_code

    except Exception as e:
        print(f"Error in add_question endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/admin/check', methods=['GET'])
def check_admin():
    uid = request.args.get('uid')
    is_admin = user_service.is_admin(uid)
    return jsonify({'is_admin': is_admin})


@app.route('/api/admin/dashboard/active-users', methods=['GET'])
def get_active_users():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    period = request.args.get('period', '24h')
    data = admin_service.get_active_users(period)
    return jsonify(data)


@app.route('/api/admin/dashboard/performance', methods=['GET'])
def get_performance_metrics():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    data = admin_service.get_performance_metrics()
    return jsonify(data)


@app.route('/api/admin/dashboard/question-stats', methods=['GET'])
def get_question_stats():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    data = admin_service.get_question_stats()
    return jsonify(data)


@app.route('/api/admin/dashboard/usage-stats', methods=['GET'])
def get_usage_stats():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    data = admin_service.get_usage_stats()
    return jsonify(data)


@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        selected_answer = data.get('selected_answer')
        uid = data.get('uid')  # Extract UID from request

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

        # Record this question attempt in analytics with the UID if available
        analytics_service.record_question_attempt(int(question_id), is_correct, uid)

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


@app.route('/api/check_user/<string:username>', methods=['GET'])
def check_user(username):
    """Debug endpoint to check if a user exists in the database."""
    conn = sqlite3.connect(os.path.abspath(os.path.join(os.path.dirname(__file__), "pico.db")))
    cursor = conn.cursor()
    cursor.execute("SELECT uid, uname, upassword FROM users WHERE uname = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        uid, uname, password_hash = user
        return jsonify({
            'exists': True,
            'uid': uid,
            'username': uname,
            'password_hash': password_hash
        })
    else:
        return jsonify({
            'exists': False
        }), 404


@app.route('/api/admin/dashboard/activity-summary', methods=['GET'])
def get_activity_summary():
    uid = request.args.get('uid')
    if not validate_admin_access(uid):
        return jsonify({'error': 'Unauthorized access'}), 403
        
    time_range = request.args.get('range', '30d')
    data = admin_service.get_activity_summary(time_range)
    return jsonify(data)


@app.route('/api/admin/all_questions', methods=['GET'])
def get_all_questions():
    """API endpoint to get all questions for admin management."""
    try:
        uid = request.args.get('uid')
        
        if not validate_admin_access(uid):
            return jsonify({'error': 'Unauthorized access'}), 403
        
        conn = sqlite3.connect('pico.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all questions with their active status
        cursor.execute("""
            SELECT qid, qtext, qtype, qlevel, qtopic, qactive
            FROM questions
            ORDER BY qid DESC
        """)
        
        questions = []
        for row in cursor.fetchall():
            questions.append({
                'qid': row['qid'],
                'qtext': row['qtext'],
                'qtype': row['qtype'],
                'qlevel': row['qlevel'],
                'qtopic': row['qtopic'],
                'qactive': row['qactive'] == 1
            })
        
        conn.close()
        
        return jsonify({'questions': questions}), 200
        
    except Exception as e:
        print(f"Error in get_all_questions endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/admin/update_question', methods=['POST'])
def update_question():
    """API endpoint to update a question's properties."""
    try:
        data = request.get_json()
        uid = data.get('uid')
        qid = data.get('qid')
        updates = data.get('updates', {})
        
        if not validate_admin_access(uid):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        if not qid:
            return jsonify({"error": "Missing question ID"}), 400
            
        if not updates:
            return jsonify({"error": "No updates provided"}), 400
        
        conn = sqlite3.connect('pico.db')
        cursor = conn.cursor()
        
        # Build the update query dynamically based on the provided updates
        update_fields = []
        update_values = []
        
        valid_fields = ['qtext', 'qlevel', 'qtopic', 'qactive']
        for field, value in updates.items():
            if field in valid_fields:
                update_fields.append(f"{field} = ?")
                # Convert boolean to integer for SQLite
                if field == 'qactive' and isinstance(value, bool):
                    update_values.append(1 if value else 0)
                else:
                    update_values.append(value)
        
        if not update_fields:
            return jsonify({"error": "No valid update fields provided"}), 400
            
        # Add qid to values
        update_values.append(qid)
        
        # Execute the update
        query = f"UPDATE questions SET {', '.join(update_fields)} WHERE qid = ?"
        cursor.execute(query, update_values)
        conn.commit()
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Question not found or no changes made"}), 404
            
        conn.close()
        
        return jsonify({"success": True, "message": "Question updated successfully"}), 200
        
    except Exception as e:
        print(f"Error in update_question endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/admin/bulk_update_questions', methods=['POST'])
def bulk_update_questions():
    """API endpoint to update multiple questions at once."""
    try:
        data = request.get_json()
        uid = data.get('uid')
        question_ids = data.get('question_ids', [])
        updates = data.get('updates', {})
        
        if not validate_admin_access(uid):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        if not question_ids:
            return jsonify({"error": "No question IDs provided"}), 400
            
        if not updates:
            return jsonify({"error": "No updates provided"}), 400
        
        conn = sqlite3.connect('pico.db')
        cursor = conn.cursor()
        
        # Build the update query dynamically based on the provided updates
        update_fields = []
        update_values = []
        
        valid_fields = ['qlevel', 'qtopic', 'qactive']
        for field, value in updates.items():
            if field in valid_fields:
                update_fields.append(f"{field} = ?")
                # Convert boolean to integer for SQLite
                if field == 'qactive' and isinstance(value, bool):
                    update_values.append(1 if value else 0)
                else:
                    update_values.append(value)
        
        if not update_fields:
            return jsonify({"error": "No valid update fields provided"}), 400
        
        # Use parameterized query with placeholders for the IN clause
        placeholders = ','.join('?' for _ in question_ids)
        query = f"UPDATE questions SET {', '.join(update_fields)} WHERE qid IN ({placeholders})"
        
        # Combine update values with question IDs
        cursor.execute(query, update_values + question_ids)
        conn.commit()
        
        # Get the number of updated rows
        updated_count = cursor.rowcount
        
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": f"Successfully updated {updated_count} questions"
        }), 200
        
    except Exception as e:
        print(f"Error in bulk_update_questions endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/admin/delete_question', methods=['POST'])
def delete_question():
    """API endpoint to delete a question."""
    try:
        data = request.get_json()
        uid = data.get('uid')
        qid = data.get('qid')
        
        if not validate_admin_access(uid):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        if not qid:
            return jsonify({"error": "Missing question ID"}), 400
        
        conn = sqlite3.connect('pico.db')
        cursor = conn.cursor()
        
        # Get the question type
        cursor.execute("SELECT qtype FROM questions WHERE qid = ?", (qid,))
        question = cursor.fetchone()
        
        if not question:
            conn.close()
            return jsonify({"error": "Question not found"}), 404
            
        qtype = question[0]
        
        # Begin transaction
        conn.execute("BEGIN TRANSACTION")
        
        try:
            # Delete from the type-specific table
            if qtype == 'multiple_choice':
                cursor.execute("DELETE FROM multiple_choice WHERE qid = ?", (qid,))
            elif qtype == 'true_false':
                cursor.execute("DELETE FROM true_false WHERE qid = ?", (qid,))
            elif qtype == 'free_response':
                cursor.execute("DELETE FROM free_response WHERE qid = ?", (qid,))
            elif qtype == 'code_blocks':
                cursor.execute("DELETE FROM code_blocks WHERE qid = ?", (qid,))
            
            # Delete user responses
            cursor.execute("DELETE FROM user_responses WHERE qid = ?", (qid,))
            
            # Delete from questions table
            cursor.execute("DELETE FROM questions WHERE qid = ?", (qid,))
            
            # Commit the transaction
            conn.commit()
        except Exception as e:
            # Rollback in case of error
            conn.rollback()
            conn.close()
            raise e
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Question deleted successfully"
        }), 200
        
    except Exception as e:
        print(f"Error in delete_question endpoint: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/coding/question/<int:qid>', methods=['GET'])
def get_coding_question(qid):
    """API endpoint to fetch a coding question by ID."""
    response = code_execution_service.get_coding_question(qid)
    return jsonify(response)

@app.route('/api/coding/submit', methods=['POST'])
def submit_coding_solution():
    """API endpoint to save a user's code submission."""
    data = request.get_json()
    uid = data.get('uid')
    qid = data.get('qid')
    code = data.get('code')
    
    if not uid:
        return jsonify({"error": "Missing user ID"}), 400
    if not qid:
        return jsonify({"error": "Missing question ID"}), 400
    if not code:
        return jsonify({"error": "Missing code submission"}), 400
    
    # Verify user
    if not verification_service.verify_user(uid):
        return jsonify({"error": "Invalid user ID"}), 401
    
    # Save the user's code submission
    save_result = code_execution_service.save_user_code(uid, qid, code)
    
    if save_result.get('error'):
        return jsonify(save_result), 500
    
    return jsonify(save_result)

@app.route('/api/coding/execute', methods=['POST'])
def execute_code():
    """API endpoint to execute a user's code against test cases."""
    data = request.get_json()
    qid = data.get('qid')
    code = data.get('code')
    
    if not qid:
        return jsonify({"error": "Missing question ID"}), 400
    if not code:
        return jsonify({"error": "Missing code submission"}), 400
    
    # Execute the code
    execution_result = code_execution_service.execute_code(qid, code)
    
    if execution_result.get('error'):
        return jsonify(execution_result), 500
    
    return jsonify(execution_result)

@app.route('/api/admin/add_coding_question', methods=['POST'])
def add_coding_question():
    """API endpoint to add a new coding question."""
    data = request.get_json()
    uid = data.get('uid')
    
    # Verify admin access
    if not validate_admin_access(uid):
        return jsonify({"error": "Unauthorized access"}), 403
    
    question_text = data.get('question_text')
    topic = data.get('topic')
    level = data.get('level')
    starter_code = data.get('starter_code')
    test_cases = data.get('test_cases')
    header_files = data.get('header_files', '')
    
    if not question_text or not topic or not level or not starter_code or not test_cases:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = sqlite3.connect("pico.db")
        cursor = conn.cursor()
        
        # Insert into questions table
        cursor.execute("""
            INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
            VALUES (?, ?, ?, ?, ?)
        """, (question_text, 'coding', level, topic, True))
        
        # Get the ID of the inserted question
        qid = cursor.lastrowid
        
        # Insert into coding table
        cursor.execute("""
            INSERT INTO coding (qid, starter, test_cases, header_files)
            VALUES (?, ?, ?, ?)
        """, (qid, starter_code, test_cases, header_files))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Coding question added successfully", "qid": qid})
        
    except Exception as e:
        print(f"Error adding coding question: {e}")
        return jsonify({"error": f"Error adding coding question: {e}"}), 500


if __name__ == '__main__':
    # with app.app_context():
    # print(topic_selection("MC", "Science"))
    #print(get_user_stats("pvCYNLaP7Z"))
    app.run(host='0.0.0.0', port=5001, use_reloader=False, debug=True)
