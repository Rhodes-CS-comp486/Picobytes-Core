import random
import os
import psycopg
from psycopg.rows import dict_row
from db_info import *

class FR_QuestionFetcher:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)


    def get_all_fr_questions(self):
        """Fetch all questions from the multiple_choice table."""
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.qid, q.qtext, q.topic, q.qlevel 
                FROM questions q 
                WHERE q.qtype = 'free_response' AND q.qactive = True
            """)
            all_questions = cursor.fetchall()
            conn.close()
            return all_questions
        except Exception as e:
            print(f"Error fetching FR questions: {e}")
            return []

    def get_question_by_id(self, question_id):
        """Fetch a specific question by its ID."""
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, qtype, qtopic, qlevel, prof_answer from questions natural join free_response where qactive = True and qid = %s", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question
