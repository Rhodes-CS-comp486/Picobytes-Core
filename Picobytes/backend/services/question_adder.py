import sqlite3

class QuestionAdder:
    def __init__(self):
        self.db_path = "qa.db"
    
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
            if qtype not in ['multiple_choice', 'true_false']:
                return {"error": "Invalid question type. Must be 'multiple_choice' or 'true_false'"}, 400
            
            # Connect to the database
            connection = sqlite3.connect(self.db_path)
            cursor = connection.cursor()
            
            # Insert into questions table - use the short form qtype values directly
            cursor.execute("""
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (?, ?, ?, ?, ?)
            """, (qtext, qtype, qlevel, qtopic, qactive))
            
            # Get the new question ID
            qid = cursor.lastrowid
            
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
                    VALUES (?, ?, ?, ?, ?, ?)
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
                    VALUES (?, ?)
                """, (qid, 1 if correct else 0))
            
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