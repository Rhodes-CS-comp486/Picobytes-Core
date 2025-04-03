import sqlite3
import random
import os
from .streak import Streaks
from .analytics_service import AnalyticsService
import time
from flask import jsonify



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
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)


    def save_mc_response(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_responses (uid, qid)
                VALUES (?, ?)
            """, (uid, qid))

            cursor.execute("""
                select answer from multiple_choice where qid = ?
                """, (qid))
            correct_answer = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_multiple_choice (uid, qid, response, correct_answer)
                VALUES (?, ?, ?, ?)
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
                VALUES (?, ?)
            """, (uid, qid))

            cursor.execute("""
                select answer from true_false where qid = ?
                """, (qid))
            correct_answer = cursor.fetchone()

            cursor.execute("""
                INSERT INTO user_multiple_choice (uid, qid, response, correct_answer)
                VALUES (?, ?, ?, ?)
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
                VALUES (?, ?)
            """, (uid, qid))

            cursor.execute("""
                INSERT INTO user_free_response (uid, qid, response)
                VALUES (?, ?, ?)
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

            cursor.execute('select qtype from questions where qid = ?', (qid,))

            qtype = cursor.fetchone()
            if qtype is None:
                return -1

            cursor.execute('select qid from user_responses where uid = ? and qid = ?', (uid,qid))
            exists = cursor.fetchone()


            if exists is not None:
                return jsonify({'error': 'user has already answered this question'})

            cursor.execute('insert into user_responses (uid, qid) values (?, ?)', (uid, qid))

            conn.commit()

            qtype = qtype[0]
            print("check 1")

            if qtype == 'multiple_choice':
                print("check 1.1")
                cursor.execute('select answer from multiple_choice where qid = ?', (qid,))
                print("check 1.2")
                answer = cursor.fetchone()[0]
                print(f"answer: {answer}")
                print(f"response: {response}")
                if response == answer -1:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                print("check 1.3")
                cursor.execute('INSERT INTO user_multiple_choice (uid, qid, response, correct) VALUES (?, ?, ?, ?)', (uid, qid, response, answer))
                print("check 1.4")
                conn.commit()


            elif qtype == 'true_false':
                cursor.execute('select correct from true_false where qid = ?', (qid,))
                answer = cursor.fetchone()
                if response == answer:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                cursor.execute('insert into user_true_false (uid, qid, response, correct)', (uid, qid, response, answer))
                conn.commit()


            elif qtype == 'code_blocks':
                cursor.execute('select answer from code_blocks where qid = ?', (qid,))
                answer = cursor.fetchone()
                if response == answer:
                    is_correct = True
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                cursor.execute('insert into user_code_blocks (uid, qid, submission, correct)',
                               (uid, qid, response, answer))
                conn.commit()


            elif qtype == 'free_response':
                cursor.execute('select prof_answer from free_response where qid = ?', (qid,))
                answer = cursor.fetchone()
                if answer is None:
                    return jsonify({"error": "Unable to submit"}), 404
                cursor.execute('insert into user_free_response (uid, qid, uanswer, profanswer)',
                               (uid, qid, response, answer))
                conn.commit()

            print("check 2")


            #Step 3: Update streak if answer is correct
            if is_correct:
                streaks_service.update_streak(uid, currtime)
            #Step 4: Update Points
                cursor.execute('UPDATE users SET uincorrect = 0 WHERE uid = ?', (uid,))
                conn.commit()
                cursor.execute('select ucorrect from users where uid = ?', (uid,))
                num_correct = cursor.fetchone()[0]
                cursor.execute('update users set ucorrect = ? where uid = ?', (num_correct+1, uid,))
                conn.commit()
                new_points = 1*get_multiplier(num_correct)


            else:
                cursor.execute('UPDATE users SET ucorrect = 0 WHERE uid = ?', (uid,))
                conn.commit()
                cursor.execute('select uincorrect from users where uid = ?', (uid,))
                num_wrong = cursor.fetchone()[0]

                new_points = -1*get_multiplier(num_wrong)
                cursor.execute('update users set uincorrect = ? where uid = ?', (num_wrong + 1, uid,))
                conn.commit()

            print("check 3")

            cursor.execute('select upoints from users where uid = ?', (uid,))
            curr_points = cursor.fetchone()[0]

            print(f"Current Points: {curr_points}")
            print(f"New Points: {new_points}")
            print(f"Total: {curr_points + new_points}")
            cursor.execute('update users set upoints = ? where uid = ?', (curr_points+new_points, uid,))




            #Step 5 Add to analytics
            analytics_service.record_question_attempt(int(qid), is_correct, uid)

            conn.commit()

            return jsonify({"is_correct": is_correct})
            
        except Exception as e:
            print(f"Error saving response: {e}")
            return jsonify({"error": {e}})






