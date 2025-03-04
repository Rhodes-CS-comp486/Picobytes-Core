from flask import jsonify

import os
import sqlite3

from Picobytes.backend.app import cb_question_service
from Picobytes.backend.services.free_response_question_pull import FR_QuestionFetcher
from Picobytes.backend.services.mc_question_pull import MC_QuestionFetcher
from Picobytes.backend.services.tf_question_pull import QuestionService
from Picobytes.backend.services.code_blocks_question_pull import CB_QuestionFetcher

mc_question_service = MC_QuestionFetcher()
tf_question_service = QuestionService()
fr_question_service = FR_QuestionFetcher()
cb_question_service = CB_QuestionFetcher()



class GetQuestions:

    def __init__(self, db_filename="qa.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))



    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)




    def get_question(self, qid):

        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT qtype 
                FROM questions
                WHERE qid = ?""",
                (qid,)
            )
            type = cursor.fetchone()
            q_type = type[0]
            print(q_type)
            conn.close()

            if q_type is None:
                return jsonify("Question not found")

            elif q_type == 'multiple_choice':
                print(qid)
                question_data = mc_question_service.get_question_by_id(qid)
                print(question_data)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'option_1': question_data['option1'],
                    'option_2': question_data['option2'],
                    'option_3': question_data['option3'],
                    'option_4': question_data['option4'],
                    'answer': question_data['answer'],
                    'question_type': question_data['qtype'],
                    'question_level': question_data['qlevel'],
                    'question_topic': question_data['qtopic']
                }
                return jsonify(response)

            elif q_type == 'true_false':
                question_data = tf_question_service.get_question_by_id(qid)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'correct_answer': question_data['correct'],
                    'question_type': question_data['qtype'],
                    'question_level': question_data['qlevel'],
                    'question_topic': question_data['qtopic']
                }
                return jsonify(response)

            elif q_type == 'free_response':
                question_data = fr_question_service.get_question_by_id(qid)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'question_type': question_data['qtype'],
                    'question_topic': question_data['qtopic'],
                    'question_level': question_data['qlevel'],
                }
                return jsonify(response)

            elif q_type == 'code_blocks':
                question_data = cb_question_service.get_question_by_id(qid)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'question_type': question_data['qtype'],
                    'question_topic': question_data['qtopic'],
                    'question_level': question_data['qlevel'],
                    'block1': question_data['block1'],
                    'block2': question_data['block2'],
                    'block3': question_data['block3'],
                    'block4': question_data['block4'],
                    'block5': question_data['block5'],
                    'block6': question_data['block6'],
                    'block7': question_data['block7'],
                    'block8': question_data['block8'],
                    'block9': question_data['block9'],
                    'block10': question_data['block10'],
                    'answer': question_data['answer'],
                }
                return jsonify(response)


            else:
                return jsonify("Server Error. Please try again later.")

        except Exception as e:
            print(f"Error fetching MC questions: {e}")
            return []


