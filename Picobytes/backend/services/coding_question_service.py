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

                    SELECT q.qid, q.qtext, q.qtype, q.qlevel as difficulty, q.qtopic as topic, 
                           c.starter as function_template, c.testcases as test_code, c.correctcode as correct_code
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
                    SELECT q.qid, q.qtext, q.qtype, q.qlevel as difficulty, q.qtopic as topic, 
                           c.starter as function_template, c.testcases as test_code, c.correctcode as correct_code
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
        
        # Ensure test code has success message
        test_code = question["test_code"]
        # Make sure test code has "All tests passed!" message for validation
        if "printf(\"All tests passed" not in test_code and "printf('All tests passed" not in test_code:
            # Find run_tests function or main function
            if "void run_tests()" in test_code:
                test_code = test_code.replace("void run_tests() {", 
                                             "void run_tests() {\n  printf(\"All tests passed!\\\\n\");")
            elif "int main(" in test_code:
                # Add before the last return statement
                if "return 0;" in test_code:
                    test_code = test_code.replace("return 0;", "printf(\"All tests passed!\\\\n\");\n  return 0;")
        
        # Check if the user code matches the starter code
        if user_code.strip() == question["function_template"].strip():
            return {
                "is_correct": False,
                "error": "Submission is identical to the starter code. Please add your implementation.",
            }
        
        # Extract function name from template
        function_name = ""
        template_lines = question["function_template"].strip().split("\n")[0].strip()
        if "(" in template_lines:
            function_name = template_lines.split("(")[0].split()[-1]
        
        # More rigorous check for actual implementation
        user_code_lines = user_code.strip().split("\n")
        implementation_lines = [line for line in user_code_lines if line.strip() and 
                              not line.strip().startswith("//") and 
                              not line.strip().startswith("/*") and
                              not line.strip().startswith("*") and
                              not line.strip().startswith("*/") and
                              not line.strip().startswith("{") and
                              not line.strip().startswith("}")]
        
        function_body_lines = []
        in_function_body = False
        
        # Extract only the code inside the function body
        for line in implementation_lines:
            if function_name in line and not in_function_body:
                in_function_body = True
                continue
            elif line.strip() == "}" and in_function_body:
                in_function_body = False
                continue
            
            if in_function_body:
                function_body_lines.append(line)
        
        # Better detection of minimal implementations
        has_meaningful_code = False
        has_variables_only = True
        
        # Check for meaningful code in function body
        for line in function_body_lines:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith("//") or line.startswith("/*"):
                continue
                
            # Check if line contains just variable declarations like "int i = 0;"
            if line.endswith(";") and ("=" in line) and any(type_name in line for type_name in ["int", "char", "float", "double"]):
                # Check if it's just a simple assignment like "i = 0;"
                assignment_part = line.split("=")[1].strip().rstrip(";")
                if assignment_part.isdigit() or assignment_part == "0" or assignment_part == "NULL" or assignment_part == "nullptr":
                    # This is just a simple variable assignment
                    continue
            
            # If we get here, the line contains some meaningful code
            has_variables_only = False
            has_meaningful_code = True
            break
        
        # Check if the code is too simple (just variable declarations or empty)
        if has_variables_only or not function_body_lines:
            return {
                "is_correct": False,
                "error": "Your solution appears to be incomplete. Please implement the required functionality.",
            }
        
        # For string reversal function specifically, check for essential operations
        if function_name == "strrev" and qid == 32:  # Assuming qid 32 is the strrev question
            has_string_ops = False
            for line in function_body_lines:
                # Look for common string operations
                if any(op in line for op in ["[]", "strlen", "swap", "temp", "tmp", "length", "while", "for", "++", "--"]):
                    has_string_ops = True
                    break
            
            if not has_string_ops:
                return {
                    "is_correct": False,
                    "error": "Your solution doesn't appear to manipulate the string. Please implement a proper string reversal algorithm.",
                }
        
        # Execute the code using our service
        try:
            # Execute the code with test cases
            execution_results = self.code_execution_service.execute_code(
                user_code, 
                test_code
            )
            
            # Ensure compilation errors are explicitly reported
            if not execution_results.get("compile", False):
                return {
                    "is_correct": False,
                    "execution_results": execution_results,
                    "error": "Compilation failed. Please fix the errors and try again.",
                }
            
            # Check for execution errors or failed assertions
            if execution_results.get("error") or execution_results.get("failed_tests"):
                return {
                    "is_correct": False,
                    "execution_results": execution_results,
                    "error": execution_results.get("error") or "Your code failed one or more test cases. Please review and try again."
                }
            
            # Check if the output indicates successful test completion
            output = execution_results.get("output", "").strip()
            if "All tests passed" not in output and "tests passed" not in output.lower():
                return {
                    "is_correct": False,
                    "execution_results": execution_results,
                    "error": "Your code did not pass all the test cases. Please review and try again."
                }
            
            # Determine if the submission is correct
            is_correct = (
                execution_results.get("compile", False) and 
                not execution_results.get("failed_tests", []) and
                "error" not in execution_results and
                ("All tests passed" in output or "tests passed" in output.lower())
            )
            
            return {
                "is_correct": is_correct,
                "execution_results": execution_results
            }
            
        except Exception as e:
            logger.error(f"Error validating coding submission: {e}")
            return {
                "is_correct": False,
                "error": f"An error occurred during validation: {str(e)}"
            }