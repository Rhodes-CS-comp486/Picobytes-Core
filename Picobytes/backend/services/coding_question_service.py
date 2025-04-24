import psycopg
from psycopg.rows import dict_row
import sys
import os
import logging

# Fix import paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db_info import *
from .code_execution_service import CodeExecutionService

logger = logging.getLogger(__name__)

class CodingQuestionService:
    """Service for managing coding questions, fetching them from the database and validating submissions."""
    
    def __init__(self):
        """Initialize the CodingQuestionService with database connection and code execution service."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"
        self.code_execution_service = CodeExecutionService()
    
    def _connect(self):
        """Establish and return a database connection with dictionary row factory."""
        conn = psycopg.connect(self.db_url)
        conn.row_factory = dict_row
        return conn
    
    def get_coding_questions(self):
        """
        Fetch all active coding questions from the database.
        
        For now, this returns a hard-coded list of sample coding questions
        as we're leaving the database schema unchanged.
        
        Returns:
            list: A list of coding question dictionaries
        """
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.qid, q.qtext, q.topic, q.qlevel 
                FROM questions q 
                WHERE q.qtype = 'coding' AND q.qactive = True
            """)
            all_questions = cursor.fetchall()
            conn.close()
            return all_questions
        except Exception as e:
            print(f"Error fetching FR questions: {e}")
            return []
    
    def get_coding_question(self, qid):
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("select qid, qtype, qtext, qtopic, starter, testcases, correctcode, qlevel  from questions natural join coding where qactive = True and qid = %s", (qid,))
        question = cursor.fetchone()
        conn.close()
        return question
    
    def validate_coding_submission(self, qid, user_code):
        """
        Validate a user's coding submission using the CodeExecutionService.
        
        Args:
            qid (int): The question ID
            user_code (str): The user's submitted code
            
        Returns:
            dict: Result of validation including compile status, test results, etc.
        """
        # Get the question and extract its test code
        question = self.get_coding_question(qid)
        if not question:
            return {
                "error": f"Question with ID {qid} not found",
                "is_correct": False
            }
        
        # Execute the code using our service
        try:
            # We append the user's code to the test code
            # This allows the test code to call the user's function
            execution_results = self.code_execution_service.execute_code(
                user_code, 
                question["test_code"]
            )
            
            # Determine if the submission is correct
            # A submission is correct if:
            # 1. It compiles successfully
            # 2. All tests pass (no test failures)
            # 3. There are no critical errors (valgrind errors are ignored)
            is_correct = (
                execution_results.get("compile", False) and 
                not execution_results.get("failed_tests", []) and
                "error" not in execution_results
            )
            
            # Handle the case where there's a valgrind error but tests pass
            if not is_correct and "error" in execution_results and "valgrind" in execution_results.get("error", "").lower():
                # If it's just a valgrind error, the code might still be correct
                is_correct = execution_results.get("compile", False) and not execution_results.get("failed_tests", [])
            
            return {
                "is_correct": is_correct,
                "execution_results": execution_results
            }
            
        except Exception as e:
            logger.error(f"Error validating coding submission: {e}")
            return {
                "error": str(e),
                "is_correct": False
            } 