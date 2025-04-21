import time
from flask import jsonify
import psycopg
from psycopg.rows import dict_row
from .streak import Streaks
from .analytics_service import AnalyticsService
from .code_execution_service import CodeExecutionService
from db_info import DBUSER, DBPASS

streaks_service = Streaks()
analytics_service = AnalyticsService()
code_execution_service = CodeExecutionService()

def get_multiplier(num_correct):
    if num_correct < 4:
        return 1
    elif num_correct < 7:
        return 1.25
    elif num_correct < 10:
        return 1.5
    else:
        return 3


class QuestionSave:
    def __init__(self):
        """Initialize the connection string for Postgres."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Return a psycopg connection with dict_row factory."""
        return psycopg.connect(self.db_url, row_factory=dict_row)

    def save_mc_response(self, uid, qid, response):
        """Save a multiple-choice response and return True if correct."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO user_responses (uid, qid) VALUES (%s, %s)", (uid, qid))
                cur.execute("SELECT answer FROM multiple_choice WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return False
                correct_answer = row['answer']
                user_choice = response + 1
                is_correct = (user_choice == correct_answer)
                cur.execute(
                    "INSERT INTO user_multiple_choice (uid, qid, response, correct) VALUES (%s, %s, %s, %s)",
                    (uid, qid, user_choice, correct_answer)
                )
                return is_correct
        except Exception as e:
            print(f"Error in save_mc_response: {e}")
            return False

    def save_tf_response(self, uid, qid, response):
        """Save a true/false response and return True if correct."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO user_responses (uid, qid) VALUES (%s, %s)", (uid, qid))
                cur.execute("SELECT answer FROM true_false WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return False
                correct_answer = row['answer']  # Already a boolean
                new_response = bool(response)
                is_correct = (new_response == correct_answer)
                cur.execute(
                    "INSERT INTO user_true_false (uid, qid, response, correct) VALUES (%s, %s, %s, %s)",
                    (uid, qid, new_response, correct_answer)
                )
                return is_correct
        except Exception as e:
            print(f"Error in save_tf_response: {e}")
            return False

    def save_free_response(self, uid, qid, response):
        """Save a free-text response and return True if it matches the prof_answer exactly."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO user_responses (uid, qid) VALUES (%s, %s)", (uid, qid))
                cur.execute("SELECT prof_answer FROM free_response WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return False
                correct_answer = row['prof_answer']
                is_correct = (str(response).strip() == str(correct_answer).strip())
                cur.execute(
                    "INSERT INTO user_free_response (uid, qid, uanswer, profanswer) VALUES (%s, %s, %s, %s)",
                    (uid, qid, response, correct_answer)
                )
                return is_correct
        except Exception as e:
            print(f"Error in save_free_response: {e}")
            return False

    def save_cb_response(self, uid, qid, response):
        """Save a code blocks response and return True if it matches exactly."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO user_responses (uid, qid) VALUES (%s, %s)", (uid, qid))
                cur.execute("SELECT answer FROM code_blocks WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return False
                correct_answer = row['answer']
                is_correct = (response == correct_answer)
                cur.execute(
                    "INSERT INTO user_code_blocks (uid, qid, submission, correct_answer, is_correct) VALUES (%s, %s, %s, %s, %s)",
                    (uid, qid, response, correct_answer, is_correct)
                )
                return is_correct
        except Exception as e:
            print(f"Error in save_cb_response: {e}")
            return False

    def save_coding_response(self, uid, qid, response):
        """Save a coding response by running testcases via the code execution service."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("INSERT INTO user_responses (uid, qid) VALUES (%s, %s)", (uid, qid))
                cur.execute("SELECT correctcode, testcases FROM coding WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return False
                testcases = row['testcases']
                is_correct, results = code_execution_service.validate_code_answer(response, testcases)
                compile_status = results.get('compile', False)
                run_status = results.get('run', False)
                cur.execute(
                    "INSERT INTO user_coding (uid, qid, usercode, compile_status, run_status) VALUES (%s, %s, %s, %s, %s)",
                    (uid, qid, response, compile_status, run_status)
                )
                return is_correct
        except Exception as e:
            print(f"Error in save_coding_response: {e}")
            return False

    def save_question(self, uid, qid, response):
        """Dispatch to the appropriate save_* method based on question type."""
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute("SELECT 1 FROM user_responses WHERE uid = %s AND qid = %s", (uid, qid))
                if cur.fetchone():
                    return {'message': 'Question already answered'}
                cur.execute("SELECT qtype FROM questions WHERE qid = %s", (qid,))
                row = cur.fetchone()
                if not row:
                    return {'error': 'Question not found'}
                qtype = row['qtype']
            if qtype == 'multiple_choice':
                return {self.save_mc_response(uid, qid, response)}
            elif qtype == 'true_false':
                return { self.save_tf_response(uid, qid, response)}
            elif qtype == 'free_response':
                return { self.save_free_response(uid, qid, response)}
            elif qtype == 'code_blocks':
                return {self.save_cb_response(uid, qid, response)}
            elif qtype == 'coding':
                return {self.save_coding_response(uid, qid, response)}
            else:
                return {'error': f'Unsupported question type: {qtype}'}
        except Exception as e:
            print(f"Error in save_question: {e}")
            return {'error': str(e)}


