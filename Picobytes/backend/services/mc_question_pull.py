
import random
import os
import psycopg
from psycopg.rows import dict_row
from Picobytes.backend.db_info import *


class MC_QuestionFetcher:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)


    def get_all_mc_questions(self):
        """Fetch all questions from the multiple_choice table."""
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.qid, q.qtext, mc.option1, mc.option2, mc.option3, mc.option4, 
                    mc.answer, q.qlevel 
                FROM questions q 
                JOIN multiple_choice mc ON q.qid = mc.qid 
                WHERE q.qtype = 'multiple_choice' AND q.qactive = True
            """)
            all_questions = cursor.fetchall()
            conn.close()
            return all_questions
        except Exception as e:
            print(f"Error fetching MC questions: {e}")
            return []

    def get_question_by_id(self, question_id):
        """Fetch a specific question by its ID."""
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, option1, option2, option3, option4, answer, qtype, qlevel, qtopic from multiple_choice natural join questions where qactive = True and multiple_choice.qid = %s", (question_id,))
        #cursor.execute("select qid, qtext, qtype, qlevel from questions where qid = ?", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question



