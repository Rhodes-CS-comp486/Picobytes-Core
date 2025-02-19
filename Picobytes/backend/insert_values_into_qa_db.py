import sqlite3

def insert_sample_questions():
    try:
        # Connect to the database
        connection = sqlite3.connect("qa.db")
        cursor = connection.cursor()
        
        # Multiple choice questions
        mc_questions = [
            (
                "What is the capital of France?",
                "multiple_choice",
                "easy",
                "Geography",
                1,
                "Paris",
                "London",
                "Berlin",
                "Madrid",
                1  # 1 indicates first option (Paris) is correct
            ),
            (
                "Which planet is known as the Red Planet?",
                "multiple_choice",
                "easy",
                "Science",
                1,
                "Mars",
                "Venus",
                "Jupiter",
                "Saturn",
                1  # 1 indicates first option (Mars) is correct
            ),
            (
                "What is the largest organ in the human body?",
                "multiple_choice",
                "medium",
                "Biology",
                1,
                "Skin",
                "Heart",
                "Liver",
                "Brain",
                1  # 1 indicates first option (Skin) is correct
            )
        ]
        
        # True/false questions
        tf_questions = [
            (
                "The Earth is flat.",
                "true_false",
                "easy",
                "Science",
                1,
                False
            ),
            (
                "Water boils at 100 degrees Celsius at sea level.",
                "true_false",
                "easy",
                "Science",
                1,
                True
            ),
            (
                "Python is a compiled programming language.",
                "true_false",
                "medium",
                "Programming",
                1,
                False
            )
        ]
        
        # Insert multiple choice questions
        for q in mc_questions:
            # Insert into questions table
            cursor.execute("""
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (?, ?, ?, ?, ?)
            """, (q[0], q[1], q[2], q[3], q[4]))
            
            qid = cursor.lastrowid
            
            # Insert into multiple_choice table
            cursor.execute("""
                INSERT INTO multiple_choice (qid, option1, option2, option3, option4, answer)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (qid, q[5], q[6], q[7], q[8], q[9]))
        
        # Insert true/false questions
        for q in tf_questions:
            # Insert into questions table
            cursor.execute("""
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (?, ?, ?, ?, ?)
            """, (q[0], q[1], q[2], q[3], q[4]))
            
            qid = cursor.lastrowid
            
            # Insert into true_false table
            cursor.execute("""
                INSERT INTO true_false (qid, correct)
                VALUES (?, ?)
            """, (qid, q[5]))
        
        # Commit the changes
        connection.commit()
        print("Successfully inserted sample questions!")
        
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        connection.rollback()
    
    finally:
        # Close the connection
        connection.close()

if __name__ == "__main__":
    insert_sample_questions()