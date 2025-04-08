import psycopg
from psycopg.rows import dict_row
from db_info import *

class QuestionAdder:
    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)
    
    def add_question(self, question_data):
        """Add a new question to the database."""
        connection = None
        try:
            # Extract common question data
            qtext = question_data.get('qtext')
            qtype = question_data.get('qtype')
            qlevel = question_data.get('qlevel')
            qtopic = question_data.get('qtopic')
            qactive = question_data.get('qactive', True)
            
            # Validate required fields
            if not qtext or not qtype or not qlevel or not qtopic:
                return {"error": "Missing required question fields"}, 400
            
            # Validate question type
            if qtype not in ['multiple_choice', 'true_false', 'code_blocks']:
                return {"error": "Invalid question type. Must be 'multiple_choice', 'true_false', or 'code_blocks'"}, 400
            
            # Connect to the database
            connection = self._connect()
            cursor = connection.cursor()
            
            # Insert into questions table - use the full form qtype values directly
            cursor.execute("""
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (%s, %s, %s, %s, %s) RETURNING qid
            """, (qtext, qtype, qlevel, qtopic, qactive))
            
            # Get the new question ID
            qid = cursor.fetchone()[0]
            
            # Insert type-specific data
            if qtype == 'multiple_choice':
                # Extract multiple choice data
                option1 = question_data.get('option1')
                option2 = question_data.get('option2')
                option3 = question_data.get('option3')
                option4 = question_data.get('option4')
                answer = question_data.get('answer')
                
                # Validate required fields
                if not option1 or not option2 or not option3 or not option4 or not answer:
                    # Roll back the transaction
                    connection.rollback()
                    return {"error": "Missing required multiple choice fields"}, 400
                    
                # Insert into multiple_choice table
                cursor.execute("""
                    INSERT INTO multiple_choice (qid, option1, option2, option3, option4, answer)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (qid, option1, option2, option3, option4, answer))
                
            elif qtype == 'true_false':
                # Extract true/false data
                correct = question_data.get('correct')
                
                # Validate required fields
                if correct is None:
                    # Roll back the transaction
                    connection.rollback()
                    return {"error": "Missing required true/false field"}, 400
                    
                # Insert into true_false table
                cursor.execute("""
                    INSERT INTO true_false (qid, correct)
                    VALUES (%s, %s)
                """, (qid, 1 if correct else 0))

            elif qtype == 'code_blocks':
                # Extract code blocks data
                block1 = question_data.get('block1', '')
                block2 = question_data.get('block2', '')
                block3 = question_data.get('block3', '')
                block4 = question_data.get('block4', '')
                block5 = question_data.get('block5', '')
                block6 = question_data.get('block6', '')
                block7 = question_data.get('block7', '')
                block8 = question_data.get('block8', '')
                block9 = question_data.get('block9', '')
                block10 = question_data.get('block10', '')
                answer = question_data.get('answer')
                
                # Validate required fields
                if not block1 or not answer:
                    # Roll back the transaction
                    connection.rollback()
                    return {"error": "Missing required code blocks fields"}, 400
                
                # Insert into code_blocks table
                cursor.execute("""
                    INSERT INTO code_blocks (qid, block1, block2, block3, block4, block5, 
                                            block6, block7, block8, block9, block10, answer)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (qid, block1, block2, block3, block4, block5, 
                     block6, block7, block8, block9, block10, answer))
            
            # Commit the transaction
            connection.commit()
            
            # Return success response with the new question ID
            return {
                "success": True,
                "message": "Question added successfully",
                "qid": qid
            }, 200
            
        except Exception as e:
            # Log the error for debugging
            print(f"Error adding question: {e}")
            
            # Roll back the transaction if connection exists
            if connection:
                connection.rollback()
            
            # Return error response
            return {"error": f"Failed to add question: {str(e)}"}, 500
            
        finally:
            # Close the connection if it exists
            if connection:
                connection.close()