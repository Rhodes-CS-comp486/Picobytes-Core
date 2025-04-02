import base64
import sqlite3
import json
import requests
from sqlite3 import Error

class CodeExecutionService:
    def __init__(self, execution_endpoint=None):
        """
        Initialize the code execution service
        
        Args:
            execution_endpoint (str): The endpoint to send code execution requests to
        """
        self.execution_endpoint = execution_endpoint or "http://execution-team-endpoint/execute"
    
    def get_coding_question(self, qid):
        """
        Get a coding question by ID
        
        Args:
            qid (int): Question ID
            
        Returns:
            dict: The question data or an error message
        """
        try:
            conn = sqlite3.connect("pico.db")
            cursor = conn.cursor()
            
            # First get the question details
            cursor.execute("""
                SELECT q.qtext, q.qlevel, q.qtopic, c.starter, c.test_cases 
                FROM questions q 
                JOIN coding c ON q.qid = c.qid 
                WHERE q.qid = ? AND q.qtype = 'coding'
            """, (qid,))
            
            question_data = cursor.fetchone()
            
            if not question_data:
                return {"error": "Coding question not found"}
                
            # Format the response
            result = {
                "question_id": qid,
                "question_text": question_data[0],
                "question_level": question_data[1],
                "question_topic": question_data[2],
                "starter_code": question_data[3],
                "test_cases": question_data[4],
                "question_type": "coding"
            }
            
            conn.close()
            return result
            
        except Error as e:
            print(f"Database error: {e}")
            return {"error": f"Database error: {e}"}
        except Exception as e:
            print(f"Error: {e}")
            return {"error": f"Error: {e}"}
    
    def save_user_code(self, uid, qid, code):
        """
        Save a user's code submission
        
        Args:
            uid (str): User ID
            qid (int): Question ID
            code (str): The user's code submission
            
        Returns:
            dict: Success or error message
        """
        try:
            conn = sqlite3.connect("pico.db")
            cursor = conn.cursor()
            
            # Check if user has already submitted this question
            cursor.execute("SELECT 1 FROM user_coding WHERE uid = ? AND qid = ?", (uid, qid))
            if cursor.fetchone():
                # Update existing submission
                cursor.execute(
                    "UPDATE user_coding SET code = ? WHERE uid = ? AND qid = ?", 
                    (code, uid, qid)
                )
            else:
                # Insert new submission
                cursor.execute(
                    "INSERT INTO user_coding (uid, qid, code) VALUES (?, ?, ?)",
                    (uid, qid, code)
                )
            
            # Also insert or update the user_responses table
            cursor.execute("SELECT 1 FROM user_responses WHERE uid = ? AND qid = ?", (uid, qid))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO user_responses (uid, qid) VALUES (?, ?)",
                    (uid, qid)
                )
            
            conn.commit()
            conn.close()
            
            return {"success": True, "message": "Code saved successfully"}
            
        except Error as e:
            print(f"Database error: {e}")
            return {"error": f"Database error: {e}", "success": False}
        except Exception as e:
            print(f"Error: {e}")
            return {"error": f"Error: {e}", "success": False}
    
    def execute_code(self, qid, code):
        """
        Execute a user's code against test cases
        
        Args:
            qid (int): Question ID
            code (str): The user's code
            
        Returns:
            dict: Execution results or error message
        """
        try:
            conn = sqlite3.connect("pico.db")
            cursor = conn.cursor()
            
            # Get the test cases for this question
            cursor.execute("SELECT test_cases FROM coding WHERE qid = ?", (qid,))
            test_cases_row = cursor.fetchone()
            
            if not test_cases_row:
                return {"error": "Test cases not found for this question"}
            
            test_cases = test_cases_row[0]
            
            # Convert code and test cases to base64
            code_base64 = base64.b64encode(code.encode('utf-8')).decode('utf-8')
            test_cases_base64 = base64.b64encode(test_cases.encode('utf-8')).decode('utf-8')
            
            # Prepare the payload for the execution team
            payload = {
                "code": code_base64,
                "test_cases": test_cases_base64
            }
            
            # For now, we'll just return the encoded data instead of making a real request
            # In a production environment, we would send a request to the execution team
            # response = requests.post(self.execution_endpoint, json=payload)
            # return response.json()
            
            return {
                "success": True,
                "message": "Code and test cases prepared for execution",
                "payload": payload
            }
            
        except Error as e:
            print(f"Database error: {e}")
            return {"error": f"Database error: {e}", "success": False}
        except Exception as e:
            print(f"Error: {e}")
            return {"error": f"Error: {e}", "success": False} 