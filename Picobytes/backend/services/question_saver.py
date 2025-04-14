import sqlite3
import random
import os
from .streak import Streaks
from .analytics_service import AnalyticsService
from .code_execution_service import CodeExecutionService
import time
from flask import jsonify
import psycopg
from psycopg.rows import dict_row
from db_info import *


streaks_service = Streaks()
analytics_service = AnalyticsService()
code_execution_service = CodeExecutionService()  # Initialize with default URL


def get_multiplier(num_correct):
    if num_correct < 4:
        return 1
    elif num_correct < 7:
        return 1.25
    elif num_correct < 10:
        return 1.5
    elif num_correct >= 10:
        return 3


class QuestionSave:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        conn = psycopg.connect(self.db_url)
        conn.row_factory = dict_row
        return conn


    def save_mc_response(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute("""
                select answer from multiple_choice where qid = %s
                """, (qid))
            correct_answer = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_multiple_choice (uid, qid, response, correct_answer)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, correct_answer,))

            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response4: {e}")
            return 0



    def save_tf_response(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute("""
                select answer from true_false where qid = %s
                """, (qid))
            correct_answer = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_multiple_choice (uid, qid, response, correct_answer)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, correct_answer,))

            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response3: {e}")
            return 0



    def save_fr_response(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute("""
                INSERT INTO user_free_response (uid, qid, response)
                VALUES (%s, %s, %s)
             """, (uid, qid, response))

            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response2: {e}")
            return 0


    def save_code_blocks(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute('''select answer from code_blocks where qid = %s''', (qid,))
            correct_answer = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_code_blocks (uid, qid, response, correct)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, correct_answer,))

            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response2: {e}")
            return 0

    def save_coding(self, uid, qid, response, compilestat, runstat):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute('''select correctcode from coding where qid = %s''', (qid,))
            correct_code = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_code_blocks (uid, qid, usercode, compilestatus, runstatus)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, compilestat, runstat,))

            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response2: {e}")
            return 0




    def save_question(self, uid, qid, response, compilestat=None, runstat=None):
        if compilestat == None and runstat == None:
            try:
                #Step 1. Save Answer - Use a single database connection for all operations
                conn = self._connect()
                cursor = conn.cursor()
                is_correct = False
                currtime = time.time()

                # Combined query to fetch question type, check if already answered, and get the answer in a single transaction
                query_type = ''
                query_params = (uid, qid)



                cursor.execute('''
                    SELECT q.qtype, 
                           CASE WHEN ur.qid IS NOT NULL THEN true ELSE false END as already_answered
                    FROM questions q
                    LEFT JOIN user_responses ur ON ur.qid = q.qid AND ur.uid = %s
                    WHERE q.qid = %s
                ''', query_params)

                result = cursor.fetchone()
                if result is None:
                    conn.close()
                    return jsonify({"error": "Question not found"}), 404

                # Support both dictionary and tuple results
                try:
                    qtype = result['qtype']
                    already_answered = result['already_answered']
                except (TypeError, KeyError):
                    # If not a dictionary, assume it's a tuple
                    qtype = result[0]
                    already_answered = result[1]

                # If already answered, return early to avoid unnecessary processing
                if already_answered:
                    conn.close()
                    return jsonify({'is_correct': False, 'message': 'Question already answered'})

                # Insert user response record
                cursor.execute('INSERT INTO user_responses (uid, qid) VALUES (%s, %s)', (uid, qid))

                # Process based on question type - fetch answer and insert response in a more efficient way
                answer = None

                if qtype == 'multiple_choice':
                    cursor.execute('SELECT answer FROM multiple_choice WHERE qid = %s', (qid,))
                    result = cursor.fetchone()
                    if result is None:
                        conn.close()
                        return jsonify({"error": "Unable to submit"}), 404

                    try:
                        answer = result['answer']
                    except (TypeError, KeyError):
                        answer = result[0]

                    # Print debug info about the comparison
                    print(f"MC Question {qid}: User response: '{response}' (type: {type(response)}) | Correct answer: '{answer}' (type: {type(answer)})")

                    # Convert both to integers for comparison
                    try:
                        # Handle string responses (like '0', '1', '2', '3' or 'A', 'B', 'C', 'D')
                        user_response_int = None
                        if isinstance(response, str):
                            if response.isdigit():
                                user_response_int = int(response)
                            elif response.upper() in ['A', 'B', 'C', 'D']:
                                # Convert letter choices to 0-indexed numbers
                                user_response_int = ord(response.upper()) - ord('A')
                        elif isinstance(response, int):
                            user_response_int = response

                        # Convert answer to int if it's a string
                        correct_answer_int = int(answer) if answer is not None else None

                        # Debug the converted values
                        print(f"Converted values - User: {user_response_int}, Correct: {correct_answer_int}")

                        # Compare with zero-indexing adjustment
                        if user_response_int is not None and correct_answer_int is not None:
                            # Correct answer in database is 1-indexed, UI may be 0-indexed
                            # Compare user response directly and with adjustment
                            if user_response_int == correct_answer_int - 1:
                                is_correct = True
                                print(f"Correct answer with zero-indexing adjustment")
                            elif user_response_int == correct_answer_int:
                                is_correct = True
                                print(f"Correct answer without adjustment")
                            else:
                                print(f"Incorrect answer: {user_response_int} != {correct_answer_int} or {correct_answer_int-1}")

                    except (ValueError, TypeError) as e:
                        print(f"Error converting answers to int: {e}")
                        # Fallback to direct string comparison
                        if str(response) == str(answer):
                            is_correct = True
                            print("Direct string comparison matched")

                    cursor.execute('INSERT INTO user_multiple_choice (uid, qid, response, correct) VALUES (%s, %s, %s, %s)',
                                  (uid, qid, response, answer))

                elif qtype == 'true_false':
                    cursor.execute('SELECT correct FROM true_false WHERE qid = %s', (qid,))
                    result = cursor.fetchone()
                    if result is None:
                        conn.close()
                        return jsonify({"error": "Unable to submit"}), 404

                    try:
                        answer = result['correct']
                    except (TypeError, KeyError):
                        answer = result[0]

                    if response == answer:
                        is_correct = True

                    cursor.execute('INSERT INTO user_true_false (uid, qid, response, correct) VALUES (%s, %s, %s, %s)',
                                  (uid, qid, response, answer))

                elif qtype == 'code_blocks':
                    cursor.execute('SELECT answer FROM code_blocks WHERE qid = %s', (qid,))
                    result = cursor.fetchone()
                    if result is None:
                        conn.close()
                        return jsonify({"error": "Unable to submit"}), 404

                    try:
                        answer = result['answer']
                    except (TypeError, KeyError):
                        answer = result[0]

                    # Get test code for this question
                    cursor.execute('SELECT tests FROM code_blocks WHERE qid = %s', (qid,))
                    test_result = cursor.fetchone()
                    test_code = None
                    if test_result:
                        try:
                            test_code = test_result['tests']
                        except (TypeError, KeyError):
                            test_code = test_result[0]

                    # Use code execution service to validate the answer
                    if test_code:
                        is_correct, execution_results = code_execution_service.validate_code_answer(response, test_code)

                        # Store execution results along with the submission
                        output = execution_results.get('output', '')
                        compile_status = execution_results.get('compile', False)
                        run_status = execution_results.get('run', False)

                        cursor.execute('''
                            INSERT INTO user_code_blocks 
                            (uid, qid, submission, correct, output, compile_status, run_status) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ''', (uid, qid, response, answer, output, compile_status, run_status))
                    else:
                        # Fallback to direct comparison if no test code is available
                        if response == answer:
                            is_correct = True

                        cursor.execute('INSERT INTO user_code_blocks (uid, qid, submission, correct) VALUES (%s, %s, %s, %s)',
                                    (uid, qid, response, answer))

                elif qtype == 'free_response':
                    cursor.execute('SELECT prof_answer FROM free_response WHERE qid = %s', (qid,))
                    result = cursor.fetchone()
                    if result is None:
                        conn.close()
                        return jsonify({"error": "Unable to submit"}), 404

                    try:
                        answer = result['prof_answer']
                    except (TypeError, KeyError):
                        answer = result[0]

                    cursor.execute('INSERT INTO user_free_response (uid, qid, uanswer, profanswer) VALUES (%s, %s, %s, %s)',
                                  (uid, qid, response, answer))

                # Update user stats in a more efficient way
                # First record the analytics data
                analytics_service.record_question_attempt(int(qid), is_correct, uid)

                # Update user stats based on is_correct (combine queries)
                if is_correct:
                    # Use a single transaction for updating streaks and user stats
                    try:
                        # Update streak - we'll handle this separately to avoid stalling the response
                        streaks_service.update_streak(uid, currtime)
                    except Exception as e:
                        print(f"Error updating streak (non-critical): {e}")

                    # Update user stats with a single query
                    cursor.execute('''
                        UPDATE users 
                        SET uincorrect = 0,
                            ucorrect = ucorrect + 1,
                            upoints = upoints + %s
                        WHERE uid = %s
                        RETURNING ucorrect
                    ''', (get_multiplier(0), uid))  # We'll use base multiplier for now
                else:
                    # Update user stats with a single query for incorrect answers
                    cursor.execute('''
                        UPDATE users 
                        SET ucorrect = 0,
                            uincorrect = uincorrect + 1,
                            upoints = upoints - %s
                        WHERE uid = %s
                    ''', (get_multiplier(0), uid))  # We'll use base multiplier for now

                # Commit all changes and close connection
                conn.commit()
                conn.close()

                return {'is_correct': is_correct}

            except Exception as e:
                print(f"Error saving response: {e}")
                return jsonify({"error": str(e)})


        else:








