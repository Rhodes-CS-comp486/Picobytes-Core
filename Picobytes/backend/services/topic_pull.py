import sqlite3
import random
import os

class Topic_Puller:

    def __init__(self, db_filename="qa.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)

    def get_mc_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute(
                "select qid, qtext, option1, option2, option3, option4, answer, qtype, qlevel"
                " from multiple_choice natural join questions where qactive = 1 and qtopic = ?",
                (topic,))
            question = cursor.fetchall()
            conn.close()
            return question
        except Exception as e:
            print(f"Error fetching MC questions: {e}")
            return []

    def get_tf_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute(
                "select qid, qtext, correct, qtype, qlevel"
                " from true_false natural join questions where qactive = 1 and qtopic = ?",
                (topic,))
            question = cursor.fetchall()
            conn.close()
            return question
        except Exception as e:
            print(f"Error fetching MC questions: {e}")
            return []

    def get_all_questions_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()

            # Fetch Multiple Choice Questions
            cursor.execute(
                """SELECT qid, qtype, qtext, option1, option2, option3, option4, answer, qlevel 
                   FROM multiple_choice 
                   NATURAL JOIN questions 
                   WHERE qactive = 1 AND qtopic = ?""",
                (topic,)
            )
            mc_questions = cursor.fetchall()

            # Fetch True/False Questions
            cursor.execute(
                """SELECT qid, qtype, qtext, correct, qlevel 
                   FROM true_false 
                   NATURAL JOIN questions 
                   WHERE qactive = 1 AND qtopic = ?""",
                (topic,)
            )
            tf_questions = cursor.fetchall()

            # Combine both lists
            all_questions = mc_questions + tf_questions

            # Optional: Sort questions by qid or any other order you need
            all_questions = sorted(all_questions, key=lambda x: x[0])  # Sorting by qid

            conn.close()
            return all_questions

        except Exception as e:
            print(f"Error fetching all questions: {e}")
            return []


if __name__ == '__main__':
    service = Topic_Puller()
    questions = service.get_all_questions_by_topic("Science")
    # Commenting out the loop that prints each question
    # for question in questions:
    #     print(question)
