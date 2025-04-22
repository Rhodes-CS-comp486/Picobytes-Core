
import random
import os
import psycopg
from psycopg.rows import dict_row
from db_info import *

class CB_QuestionFetcher:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url)



    def get_all_cd_questions(self):
        """Fetch all questions from the multiple_choice table."""
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.qid, q.qtext, q.qtopic, q.qlevel, c.block1, c.block2, c.block3, c.block4, c.block5, c.block6, c.block7, c.block8, c.block9, c.block10, c.answer
                FROM questions q NATURAL JOIN code_blocks c
                WHERE q.qtype = 'code_blocks' AND q.qactive = True
            """)
            all_questions = cursor.fetchall()
            conn.close()
            return all_questions
        except Exception as e:
            print(f"Error fetching CB questions: {e}")
            return []

    def get_question_by_id(self, question_id):
        """Fetch a specific question by its ID."""
        conn = psycopg.connect(self.db_url, row_factory=dict_row)
        cursor = conn.cursor()
        cursor.execute("SELECT q.qid, q.qtext, q.qtype, q.qtopic, q.qlevel, c.block1, c.block2, c.block3, c.block4, c.block5, c.block6, c.block7, c.block8, c.block9, c.block10, c.answer FROM questions q NATURAL JOIN code_blocks c where q.qactive = True and q.qid = %s", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question


