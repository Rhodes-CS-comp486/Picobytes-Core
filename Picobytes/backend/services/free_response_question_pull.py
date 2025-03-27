import sqlite3
import random
import os

class FR_QuestionFetcher:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)


    def get_all_fr_questions(self):
        """Fetch all questions from the free_response table."""
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.qid, q.qtext, fr.prof_answer, q.qlevel 
                FROM questions q 
                JOIN free_response fr ON q.qid = fr.qid 
                WHERE q.qtype = 'free_response' AND q.qactive = 1
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
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, qtype, qtopic, qlevel, prof_answer from questions natural join free_response where qactive = 1 and qid = ?", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question

    def get_random_question(self):
        """Fetch a random question from the multiple_choice table."""
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, qtopic, qlevel from questions where qactive = 1 and qtyoe = 'free_response'")
        all_ids = [row[0] for row in cursor.fetchall()]
        if not all_ids:
            return None
        random_id = random.choice(all_ids)
        return self.get_question_by_id(random_id)

    '''def get_questions_by_category(self, category):
        """Fetch questions filtered by category, if the table has a 'category' column."""
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("SELECT id, question, option_a, option_b, option_c, option_d, correct_answer FROM multiple_choice WHERE category = ?", (category,))
        questions = cursor.fetchall()
        conn.close()
        return questions'''
