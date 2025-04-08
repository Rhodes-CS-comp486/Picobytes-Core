import sqlite3
import random
import os
import psycopg
from psycopg.rows import dict_row
from db_info import *
class Topic_Puller:
    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        #return psycopg.connect(self.db_url, row_factory=dict_row)
        return psycopg.connect(self.db_url)


    def get_fr_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute(
                "select qid, qtext, prof_answer, qtype, qlevel"
                " from free_response natural join questions where qactive = True and qtopic = %s",
                (topic,))
            questions = cursor.fetchall()
            conn.close()
            return questions
        except Exception as e:
            print(f"Error fetching FR questions: {e}")
            return []

    def get_cb_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute(
                "select qid, qtext, answer, qtype, qlevel"
                " from code_blocks natural join questions where qactive = True and qtopic = %s",
                (topic,))
            question = cursor.fetchall()
            conn.close()
            return question
        except Exception as e:
            print(f"Error fetching CB questions: {e}")
            return []

    def get_mc_by_topic(self, topic):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute(
                "select qid, qtext, option1, option2, option3, option4, answer, qtype, qlevel"
                " from multiple_choice natural join questions where qactive = True and qtopic = %s",
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
                " from true_false natural join questions where qactive = True and qtopic = %s",
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
                   WHERE qactive = True AND qtopic = %s""",
                (topic,)
            )
            mc_questions = cursor.fetchall()

            # Fetch True/False Questions
            cursor.execute(
                """SELECT qid, qtype, qtext, correct, qlevel 
                   FROM true_false 
                   NATURAL JOIN questions 
                   WHERE qactive = True AND qtopic = %s""",
                (topic,)
            )
            tf_questions = cursor.fetchall()

            cursor.execute(
                "select qid, qtype, qtext, answer, qlevel"
                " from code_blocks natural join questions where qactive = True and qtopic = %s",
                (topic,))
            cb_questions = cursor.fetchall()

            cursor.execute(
                "select qid, qtype, qtext, prof_answer, qlevel"
                " from free_response natural join questions where qactive = True and qtopic = %s",
                (topic,))
            fr_questions = cursor.fetchall()


            # Combine both lists
            all_questions = mc_questions + tf_questions + fr_questions + cb_questions

            # Optional: Sort questions by qid or any other order you need
            all_questions = sorted(all_questions, key=lambda x: x[0])  # Sorting by qid

            conn.close()
            return all_questions

        except Exception as e:
            print(f"Error fetching all questions: {e}")
            return []

    def get_topic_list(self):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""SELECT qtopic FROM questions""")
            topics = cursor.fetchall()
            conn.close()
            # Extract the first element from each tuple to return a list of strings
            return [topic[0] for topic in topics]
        except Exception as e:
            print(f"Error fetching all topics: {e}")
            return []

if __name__ == '__main__':
    service = Topic_Puller()
    questions = service.get_all_questions_by_topic("Science")
    # Commenting out the loop that prints each question
    # for question in questions:
    #     print(question)
