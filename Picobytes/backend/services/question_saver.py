import sqlite3
import random
import os

from numpy.lib.npyio import savez


class QuestionSave:

    def __init__(self, db_filename="qa.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)




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
            print(f"Error saving response: {e}")
            return 0




    def save_question(self, uid, qid, response):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT qtype FROM questions WHERE uid=? """, (qid,))

            q_type = cursor.fetchone()

            conn.close()
            if q_type is None:
                raise Exception("No valid question type for given qid")
            if q_type == 'free_response':
                return self.save_fr_response(uid, qid, response)
        except Exception as e:
            print(f"Error saving response: {e}")
            return 0
