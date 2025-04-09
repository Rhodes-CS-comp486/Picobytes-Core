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




    def save_question(self, uid, qid, response):
        try:
            #Step 1. Save Answer
            conn = self._connect()
            cursor = conn.cursor()
            is_correct : bool = False
            currtime = time.time()

            # Use a single database connection for all operations
            conn = self._connect()
            cursor = conn.cursor()

            # Fetch question type and check if already answered in a single transaction
            cursor.execute('''
                SELECT q.qtype, 
                       CASE WHEN ur.qid IS NOT NULL THEN true ELSE false END as already_answered
                FROM questions q
                LEFT JOIN user_responses ur ON ur.qid = q.qid AND ur.uid = %s
                WHERE q.qid = %s
            ''', (uid, qid))
            
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

            # If not already answered, insert user response record
            if not already_answered:
                cursor.execute('insert into user_responses (uid, qid) values (%s, %s)', (uid, qid))

            if already_answered:
                return jsonify('question already answered')

            conn.commit()

            # Process based on question type
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
                    
                if int(response) == int(answer) - 1:  # Compare as integers and adjust for zero-indexing
                    is_correct = True
                
                if not already_answered:
                    cursor.execute('INSERT INTO user_multiple_choice (uid, qid, response, correct) VALUES (%s, %s, %s, %s)', (uid, qid, response, answer))
                conn.commit()

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
                
                if not already_answered:
                    cursor.execute('INSERT INTO user_true_false (uid, qid, response, correct) VALUES (%s, %s, %s, %s)', 
                                  (uid, qid, response, answer))
                    conn.commit()

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
                    
                if response == answer:
                    is_correct = True
                
                if not already_answered:
                    cursor.execute('INSERT INTO user_code_blocks (uid, qid, submission, correct) VALUES (%s, %s, %s, %s)',
                                 (uid, qid, response, answer))
                    conn.commit()

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
                
                if not already_answered:
                    cursor.execute('INSERT INTO user_free_response (uid, qid, uanswer, profanswer) VALUES (%s, %s, %s, %s)',
                                 (uid, qid, response, answer))
                    conn.commit()

            # When question is already answered don't update points, and just return if it's correct
            if already_answered:
                conn.close()
                return jsonify({'is_correct': is_correct})

            # Update user stats in batch if not already answered
            if is_correct:
                # Update streak, reset incorrect count, and increment correct count in one transaction
                streaks_service.update_streak(uid, currtime)
                #Step 4: Update Points
                cursor.execute('UPDATE users SET uincorrect = 0 WHERE uid = %s', (uid,))
                conn.commit()
                cursor.execute('select ucorrect from users where uid = %s', (uid,))
                result = cursor.fetchone()
                try:
                    num_correct = result['ucorrect'] 
                except (TypeError, KeyError):
                    num_correct = result[0]
                    
                cursor.execute('update users set ucorrect = %s where uid = %s', (num_correct+1, uid,))
                conn.commit()
                new_points = 1*get_multiplier(num_correct)

            else:
                # Reset correct count and increment incorrect count in one transaction
                cursor.execute('''
                    UPDATE users 
                    SET ucorrect = 0,
                        uincorrect = uincorrect + 1
                    WHERE uid = %s
                    RETURNING uincorrect
                ''', (uid,))
                result = cursor.fetchone()
                try:
                    num_wrong = result['uincorrect']
                except (TypeError, KeyError):
                    num_wrong = result[0]
                    
                new_points = -1 * get_multiplier(num_wrong)

            # Update points in a single query
            cursor.execute('''
                UPDATE users 
                SET upoints = upoints + %s 
                WHERE uid = %s
            ''', (new_points, uid))
            
            conn.commit()

            # Record analytics asynchronously
            analytics_service.record_question_attempt(int(qid), is_correct, uid)

            conn.commit()

            return {'is_correct': is_correct}
            
        except Exception as e:
            print(f"Error saving response: {e}")
            return jsonify({"error": str(e)})






