import sqlite3

class QuestionService:
    def __init__(self, db_path):
        self.db_path = db_path

    def get_question_by_id(self, qid):
        connection = sqlite3.connect(self.db_path)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT q.qtext, tf.correct
            FROM questions q
            JOIN true_false tf ON q.qid = tf.qid
            WHERE q.qid = ?
        """, (qid,))
        row = cursor.fetchone()
        connection.close()
        if row:
            return {
                "qid": qid,
                "qtext": row[0],
                "options": ["True", "False"],
                "correct": row[1]
            }
        else:
            return None