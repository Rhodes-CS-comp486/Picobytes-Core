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
        
        Returns:
            list: A list of coding question dictionaries
        """
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT q.qid, q.qtext, q.qlevel as difficulty, q.qtopic as topic, 
                           c.starter as function_template, c.testcases as test_code
                    FROM questions q
                    JOIN coding c ON q.qid = c.qid
                    WHERE q.qtype = 'coding' AND q.qactive = True
                """)
                
                questions = cursor.fetchall()
                return questions
        except Exception as e:
            logger.error(f"Error fetching coding questions: {e}")
            # Fallback to hardcoded data for development/testing if DB fails
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
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT q.qid, q.qtext, q.qlevel as difficulty, q.qtopic as topic, 
                           c.starter as function_template, c.testcases as test_code
                    FROM questions q
                    JOIN coding c ON q.qid = c.qid
                    WHERE q.qtype = 'coding' AND q.qactive = True AND q.qid = %s
                """, (qid,))
                
                question = cursor.fetchone()
                return question
        except Exception as e:
            logger.error(f"Error fetching coding question {qid}: {e}")
            # Fallback to hardcoded list for development/testing if DB fails
            questions = self.get_coding_questions()
            for question in questions:
                if question["qid"] == qid:
                    return question
            return None
    
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
        
        # Add special validation for factorial problem
        if "factorial" in user_code and "factorial" in question.get("qtext", "").lower():
            # Check if the user has actually implemented the factorial function
            # Look for key implementation indicators
            has_implementation = False
            
            # Check for loop structures
            if ("for" in user_code and "i" in user_code and "++" in user_code) or "while" in user_code:
                has_implementation = True
            # Check for recursion implementation
            elif "return" in user_code and "factorial" in user_code and "*" in user_code:
                has_implementation = True
            # Check for multiplication operations
            elif "*=" in user_code or ("result" in user_code and "*" in user_code):
                has_implementation = True
            # Check if there's a return with calculation rather than just a simple return
            elif "return" in user_code and any(op in user_code for op in ["*", "+", "-", "/"]):
                has_implementation = True
            
            # If user hasn't actually implemented the function, it's not correct
            if not has_implementation:
                return {
                    "is_correct": False,
                    "execution_results": {
                        "compile": True,
                        "run": True,
                        "output": "Your function appears to be incomplete. Please implement the factorial calculation.",
                        "failed_tests": ["Implementation check"]
                    }
                }
        
        # Execute the code using our service
        try:
            # We append the user's code to the test code
            # This allows the test code to call the user's function
            execution_results = self.code_execution_service.execute_code(
                user_code, 
                question["test_code"]
            )
            
            # If the code failed to compile, return the actual compiler error
            if not execution_results.get("compile", False):
                return {
                    "is_correct": False,
                    "execution_results": execution_results
                }
            
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