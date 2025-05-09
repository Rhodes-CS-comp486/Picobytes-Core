from flask import jsonify

import os
import psycopg
from psycopg.rows import dict_row
from db_info import *

# Change absolute imports to relative imports
from services.code_blocks_question_pull import CB_QuestionFetcher
from services.free_response_question_pull import FR_QuestionFetcher
from services.mc_question_pull import MC_QuestionFetcher
from services.tf_question_pull import QuestionService
from services.coding_question_service import CodingQuestionService
import json

mc_question_service = MC_QuestionFetcher()
tf_question_service = QuestionService()
fr_question_service = FR_QuestionFetcher()
cb_question_service = CB_QuestionFetcher()
cd_question_service = CodingQuestionService()


class GetQuestions:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)

    def get_question(self, qid):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT qtype 
                FROM questions
                WHERE qid = %s""",
                (qid,)
            )
            type = cursor.fetchone()
            conn.close()
            
            if type is None:
                return jsonify("Question not found")
            q_type = type.get('qtype', 'default_value')

            if q_type == 'multiple_choice':
                question_data = mc_question_service.get_question_by_id(qid)
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
                    'question_topic': question_data['qtopic'],
                    #'uid': uid
                }

                return jsonify(response)
                #return response

            elif q_type == 'true_false':
                question_data = tf_question_service.get_question_by_id(qid)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'correct_answer': question_data['correct'],
                    'question_type': question_data['qtype'],
                    'question_level': question_data['qlevel'],
                    'question_topic': question_data['qtopic'],
                    #'uid': uid
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
                    'professor_answer': question_data['prof_answer'],
                    #'uid': uid
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
                    #'uid': uid
                }
                return jsonify(response)
            elif q_type == 'coding':
                question_data = cd_question_service.get_coding_question(qid)
                response = {
                    'question_id': question_data['qid'],
                    'question_text': question_data['qtext'],
                    'question_type': question_data['qtype'],
                    'question_topic': question_data['topic'],
                    'question_level': question_data['difficulty'],
                    'starter_code': question_data['function_template'],
                    'test_cases': question_data['test_code'],
                    'correct_code': question_data['correct_code'],
                }
                return jsonify(response)

            else:
                return jsonify("Server Error. Please try again later.")
        except Exception as e:
            print(f"Error fetching questions: {e}")
            return jsonify({"error": str(e)}), 500

    def get_answer(self, qid):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            
            # First determine the question type
            cursor.execute("SELECT qtype FROM questions WHERE qid = %s", (qid,))
            type_result = cursor.fetchone()
            
            if not type_result:
                print(f"Question type not found for qid: {qid}")
                conn.close()
                return None
                
            qtype = type_result['qtype']
            print(f"Question type for qid {qid}: {qtype}")
            
            # Directly query the appropriate table for the answer
            if qtype == 'multiple_choice':
                cursor.execute("SELECT answer FROM multiple_choice WHERE qid = %s", (qid,))
                result = cursor.fetchone()
                if not result:
                    print(f"Multiple choice answer not found for qid: {qid}")
                    conn.close()
                    return None
                    
                try:
                    answer = result['answer'] if result else None
                    print(f"Retrieved multiple choice answer: {answer} for qid: {qid}")
                except (TypeError, KeyError) as e:
                    print(f"Error accessing multiple choice answer: {e}")
                    answer = result[0] if result and len(result) > 0 else None
                    print(f"Fallback multiple choice answer: {answer}")
                
            elif qtype == 'true_false':
                cursor.execute("SELECT correct FROM true_false WHERE qid = %s", (qid,))
                result = cursor.fetchone()
                if not result:
                    print(f"True/False answer not found for qid: {qid}")
                    conn.close()
                    return None
                    
                try:
                    answer = result['correct'] if result else None
                except (TypeError, KeyError) as e:
                    print(f"Error accessing true/false answer: {e}")
                    answer = result[0] if result and len(result) > 0 else None
                
            elif qtype == 'code_blocks':
                cursor.execute("SELECT answer FROM code_blocks WHERE qid = %s", (qid,))
                result = cursor.fetchone()
                if not result:
                    print(f"Code blocks answer not found for qid: {qid}")
                    conn.close()
                    return None
                    
                try:
                    answer = result['answer'] if result else None
                except (TypeError, KeyError) as e:
                    print(f"Error accessing code blocks answer: {e}")
                    answer = result[0] if result and len(result) > 0 else None
                
            elif qtype == 'free_response':
                cursor.execute("SELECT prof_answer FROM free_response WHERE qid = %s", (qid,))
                result = cursor.fetchone()
                if not result:
                    print(f"Free response answer not found for qid: {qid}")
                    conn.close()
                    return None
                    
                try:
                    answer = result['prof_answer'] if result else None
                except (TypeError, KeyError) as e:
                    print(f"Error accessing free response answer: {e}")
                    answer = result[0] if result and len(result) > 0 else None
                
            else:
                print(f"Unknown question type: {qtype} for qid: {qid}")
                answer = None
                
            conn.close()
            return answer
            
        except Exception as e:
            print(f"Error getting answer for qid {qid}: {e}")
            return None

