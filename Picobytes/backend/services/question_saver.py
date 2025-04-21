

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
        conn = psycopg.connect(self.db_url, row_factory=dict_row)
        return conn


    def save_mc_response(self, uid, qid, response, is_correct):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute("""
                select correct from multiple_choice where qid = %s
                """, (qid))
            correct_answer = cursor.fetchone()['correct']

            cursor.execute("""
                INSERT INTO user_multiple_choice (uid, qid, response, correct_answer)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response+1, correct_answer,))

            if response == correct_answer:
                is_correct = True

            conn.commit()
            conn.close()
            return is_correct
        except Exception as e:
            print(f"Error saving response4: {e}")
            return 0


    def save_tf_response(self, uid, qid, response, is_correct):
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
            correct_answer = cursor.fetchone()['answer']

            if correct_answer == response:
                is_correct = True
            else:
                is_correct = False

            cursor.execute("""
                INSERT INTO user_true_false (uid, qid, response, correct)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, correct_answer,))

            conn.commit()
            conn.close()
            return is_correct
        except Exception as e:
            print(f"Error saving response3: {e}")
            return 0


    def save_free_response(self, uid, qid, response, is_correct):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (%s, %s)
            """, (uid, qid))

            cursor.execute("""
                select prof_answer from free_response where qid = %s
                """, (qid))
            correct_answer = cursor.fetchone()['prof_answer']


            cursor.execute("""
                INSERT INTO user_free_response (uid, qid, uanswer, profanswer)
                VALUES (%s, %s, %s, %s)
             """, (uid, qid, response, correct_answer,))

            conn.commit()
            conn.close()
            return is_correct
        except Exception as e:
            print(f"Error saving response3: {e}")
            return 0

    def save_cb_response(self, uid, qid, response, is_correct):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                   INSERT INTO user_responses (uid, qid)
                   VALUES (%s, %s)
               """, (uid, qid))

            cursor.execute("""
                   select answer from code_blocks where qid = %s
                   """, (qid))
            correct_answer = cursor.fetchone()['answer']

            if correct_answer == response:
                is_correct = True
            else:
                is_correct = False

            cursor.execute("""
                   INSERT INTO user_code_blocks (uid, qid, submission, correct_answer, is_correct)
                   VALUES (%s, %s, %s, %s, %s)
                """, (uid, qid, response, correct_answer,is_correct))

            conn.commit()
            conn.close()
            return is_correct
        except Exception as e:
            print(f"Error saving response3: {e}")
            return 0




    def save_question(self, uid, qid, response):
            try:
                #Step 1. Save Answer - Use a single database connection for all operations
                conn = self._connect()
                cursor = conn.cursor()
                currtime = time.time()
                is_correct = False

                cursor.execute('''select uid from user_responses where uid = %s and qid = %s''')
                is_answered = cursor.fetchone()['uid']
                if is_answered is not None:
                    return ({'is_correct': False, 'message': 'Question already answered'})



                cursor.execute('''select qtype from questions where qid = %s''', (qid,))
                qtype = cursor.fetchone()['qtype']

                if result is None:
                    conn.close()
                    return ({'Error, no question type found'})



                # Support both dictionary and tuple results
                '''try:
                    qtype = result['qtype']
                except (TypeError, KeyError):'''
                    # If not a dictionary, assume it's a tuple
                    #qtype = result[0]
                    #already_answered = result[1]

                # If already answered, return early to avoid unnecessary processing
                #if already_answered:
                 #   conn.close()
                  #  return ({'is_correct': False, 'message': 'Question already answered'})


                # Process based on question type - fetch answer and insert response in a more efficient way
                answer = None

                if qtype == 'multiple_choice':
                    correct_answer = self.save_mc_response(uid, qid, response, is_correct)
                    print(correct_answer)
                    conn.commit()
                    conn.close()
                    return {'is_correct': correct_answer}

                if qtype == 'true_false':
                    correct_answer = self.save_tf_response(uid, qid, response, is_correct)
                    print(correct_answer)
                    conn.commit()
                    conn.close()
                    return {'is_correct': correct_answer}

                if qtype == 'free_response':
                    prof_answer = self.save_free_response(uid, qid, response, is_correct)
                    print(prof_answer)
                    conn.commit()
                    conn.close()
                    return {'is_correct': prof_answer}

                if qtype == 'code_blocks':
                    correct_answer = self.save_cb_response(uid, qid, response, is_correct)
                    print(correct_answer)
                    conn.commit()
                    conn.close()
                    return {'is_correct': correct_answer}

                if qtype == 'coding':
                    cursor.execute('SELECT correctcode FROM coding WHERE qid = %s', (qid,))
                    correct_code = cursor.fetchone()['correctcode']
                    if result is None:
                        conn.close()
                        return {"error": "Unable to submit"}


                    # Get test code for this question
                    cursor.execute('SELECT testcases FROM coding WHERE qid = %s', (qid,))
                    testcases = cursor.fetchone()['testcases']

                    # Use code execution service to validate the answer
                    if test_cases:
                        is_correct, execution_results = code_execution_service.validate_code_answer(response, test_code)

                        # Store execution results along with the submission
                        output = execution_results.get('output', '')
                        compile_status = execution_results.get('compile', False)
                        run_status = execution_results.get('run', False)

                        cursor.execute('''
                                            INSERT INTO user_coding 
                                            (uid, qid, usercode, compile_status, run_status) 
                                            VALUES (%s, %s, %s, %s, %s)
                                        ''', (uid, qid, response, compile_status, run_status))
                    else:
                        return {"error": "Unable to submit"}


                # Commit all changes and close connection

                else:
                    conn.commit()
                    conn.close()
                    return ({'error': 'Invalid question type'})





            except Exception as e:
                print(f"Error saving response: {e}")
                return ({"error": str(e)})


