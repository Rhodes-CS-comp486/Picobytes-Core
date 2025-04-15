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
        # This is a temporary implementation until we update the database schema
        # In a real implementation, we would fetch from the database
        return [
            {
                "qid": 1001,
                "qtext": "Write a function that reverses a string in-place",
                "difficulty": "Medium",
                "topic": "Strings",
                "function_template": "void strrev(char *str) {\n    // Your code here\n}",
                "test_code": """
#include <stdio.h>
#include <string.h>
#include <assert.h>

// Test cases
int main() {
    // Test case 1: Basic string
    char str1[] = "hello";
    strrev(str1);
    assert(strcmp(str1, "olleh") == 0);
    
    // Test case 2: Empty string
    char str2[] = "";
    strrev(str2);
    assert(strcmp(str2, "") == 0);
    
    // Test case 3: Single character
    char str3[] = "a";
    strrev(str3);
    assert(strcmp(str3, "a") == 0);
    
    // Test case 4: Even length string
    char str4[] = "abcd";
    strrev(str4);
    assert(strcmp(str4, "dcba") == 0);
    
    printf("All tests passed!\\n");
    return 0;
}
"""
            },
            {
                "qid": 1002,
                "qtext": "Implement a function to find the maximum element in an array",
                "difficulty": "Easy",
                "topic": "Arrays",
                "function_template": "int find_max(int arr[], int size) {\n    // Your code here\n}",
                "test_code": """
#include <stdio.h>
#include <assert.h>

int main() {
    // Test case 1: Basic array
    int arr1[] = {1, 3, 5, 2, 4};
    assert(find_max(arr1, 5) == 5);
    
    // Test case 2: Array with negative numbers
    int arr2[] = {-1, -3, -5, -2, -4};
    assert(find_max(arr2, 5) == -1);
    
    // Test case 3: Array with one element
    int arr3[] = {42};
    assert(find_max(arr3, 1) == 42);
    
    // Test case 4: Array with duplicate max
    int arr4[] = {10, 5, 10, 3, 7};
    assert(find_max(arr4, 5) == 10);
    
    printf("All tests passed!\\n");
    return 0;
}
"""
            }
        ]
    
    def get_coding_question(self, qid):
        """
        Fetch a specific coding question by its ID.
        
        Args:
            qid (int): The question ID to fetch
            
        Returns:
            dict: The coding question data or None if not found
        """
        # Find the question in our hard-coded list for now
        questions = self.get_coding_questions()
        for question in questions:
            if question["qid"] == qid:
                return question
        return None
    
    def validate_coding_submission(self, qid, user_code):
        """
        Validate a user's coding submission using the CodeExecutionService.
        Also stores the result in the database if user is authenticated.
        
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
            
            # Save submission to database if user ID is provided in the session
            from flask import session
            if 'user_id' in session:
                uid = session.get('user_id')
                self._save_coding_submission(uid, qid, user_code, is_correct, execution_results)
            
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
            
    def _save_coding_submission(self, uid, qid, code, is_correct, execution_results=None):
        """
        Save the coding submission to the database.
        
        Args:
            uid (str): User ID
            qid (int): Question ID
            code (str): Submitted code
            is_correct (bool): Whether the submission was correct
            execution_results (dict, optional): Full execution results with compile_status, etc.
        """
        try:
            # Connect to database
            conn = self._connect()
            cursor = conn.cursor()
            
            # Extract execution details
            compile_status = True  # Default to True
            run_status = is_correct  # Default to is_correct
            output = ""
            
            if execution_results:
                compile_status = execution_results.get("compile", True)
                output = execution_results.get("output", "")
                if "error" in execution_results:
                    output += "\n" + execution_results.get("error", "")
            
            # Check if a submission already exists
            cursor.execute(
                "SELECT uid FROM user_coding WHERE uid = %s AND qid = %s", 
                (uid, qid)
            )
            
            if cursor.fetchone():
                # Update existing record
                cursor.execute(
                    """UPDATE user_coding 
                       SET code = %s, 
                           compile_status = %s, 
                           run_status = %s, 
                           output = %s 
                       WHERE uid = %s AND qid = %s""", 
                    (code, compile_status, run_status, output, uid, qid)
                )
            else:
                # Insert new record
                cursor.execute(
                    """INSERT INTO user_coding 
                       (uid, qid, code, compile_status, run_status, output) 
                       VALUES (%s, %s, %s, %s, %s, %s)""", 
                    (uid, qid, code, compile_status, run_status, output)
                )
            
            # Also update the question_analytics table for tracking success rates
            cursor.execute(
                "INSERT INTO question_analytics (qid, uid, is_correct) VALUES (%s, %s, %s)",
                (qid, uid, is_correct)
            )
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving coding submission to database: {e}") 