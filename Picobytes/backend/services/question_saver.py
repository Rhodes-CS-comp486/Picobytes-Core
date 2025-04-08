import sqlite3
import random
import os
from .streak import Streaks
from .analytics_service import AnalyticsService
import time
from flask import jsonify
import psycopg
from psycopg.rows import dict_row
from db_info import *



streaks_service = Streaks()
analytics_service = AnalyticsService()


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
        return psycopg.connect(self.db_url, row_factory=dict_row)


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




    def save_question(self, uid, qid, response):
        try:
            #Step 1. Save Answer

            is_correct : bool = False
            currtime = time.time()

            conn = self._connect()
            cursor = conn.cursor()

            cursor.execute('select qtype from questions where qid = %s', (qid,))

            qtype = cursor.fetchone()
            if qtype is None:
                return -1

            cursor.execute('select qid from user_responses where uid = %s and qid = %s', (uid,qid))
            exists = cursor.fetchone()

            already_answered = False

            if exists is not None:
                already_answered = True

            if not already_answered:
                cursor.execute('insert into user_responses (uid, qid) values (%s, %s)', (uid, qid))

            conn.commit()

            qtype = qtype['qtype']  # Get the qtype string from the dictionary

            if qtype == 'multiple_choice':
                cursor.execute('select answer from multiple_choice where qid = %s', (qid,))
                answer = cursor.fetchone()['answer']
                if response == answer -1:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                
                if not already_answered:
                    cursor.execute('INSERT INTO user_multiple_choice (uid, qid, response, correct) VALUES (%s, %s, %s, %s)', (uid, qid, response, answer))
                conn.commit()


            elif qtype == 'true_false':
                cursor.execute('select correct from true_false where qid = %s', (qid,))
                answer = cursor.fetchone()['correct']
                if response == answer:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                if not already_answered:
                    cursor.execute('insert into user_true_false (uid, qid, response, correct) VALUES (%s, %s, %s, %s)', (uid, qid, response, answer))
                conn.commit()


            elif qtype == 'code_blocks':
                cursor.execute('select answer from code_blocks where qid = %s', (qid,))
                answer = cursor.fetchone()['answer']
                if response == answer:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                if not already_answered:
                    cursor.execute('insert into user_code_blocks (uid, qid, submission, correct) VALUES (%s, %s, %s, %s)',
                               (uid, qid, response, answer))
                conn.commit()


            elif qtype == 'free_response':
                cursor.execute('select prof_answer from free_response where qid = %s', (qid,))
                answer = cursor.fetchone()['prof_answer']
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                if not already_answered:
                    cursor.execute('insert into user_free_response (uid, qid, uanswer, profanswer) VALUES (%s, %s, %s, %s)',
                               (uid, qid, response, answer))
                conn.commit()


            # When question is already answered don't update points, and just return if it's correct
            if already_answered:
                return jsonify({'is_correct': is_correct})


            #Step 3: Update streak if answer is correct
            if is_correct:
                streaks_service.update_streak(uid, currtime)
            #Step 4: Update Points
                cursor.execute('UPDATE users SET uincorrect = 0 WHERE uid = %s', (uid,))
                conn.commit()
                cursor.execute('select ucorrect from users where uid = %s', (uid,))
                num_correct = cursor.fetchone()['ucorrect']
                cursor.execute('update users set ucorrect = %s where uid = %s', (num_correct+1, uid))
                conn.commit()
                new_points = 1*get_multiplier(num_correct)


            else:
                cursor.execute('UPDATE users SET ucorrect = 0 WHERE uid = %s', (uid,))
                conn.commit()
                cursor.execute('select uincorrect from users where uid = %s', (uid,))
                num_wrong = cursor.fetchone()['uincorrect']

                new_points = -1*get_multiplier(num_wrong)
                cursor.execute('update users set uincorrect = %s where uid = %s', (num_wrong + 1, uid))
                conn.commit()

            cursor.execute('select upoints from users where uid = %s', (uid,))
            curr_points = cursor.fetchone()['upoints']

            cursor.execute('update users set upoints = %s where uid = %s', (curr_points+new_points, uid))




            #Step 5 Add to analytics
            analytics_service.record_question_attempt(int(qid), is_correct, uid)

            conn.commit()

            return jsonify({"is_correct": is_correct})
            
        except Exception as e:
            print(f"Error saving response: {e}")
            return jsonify({"error": {e}})






