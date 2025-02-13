import sqlite3

def create_table():
    try:

        #creating questions table
        connection = sqlite3.connect("../backend/qa.db")
        cursor = connection.cursor()

        cursor.execute("""
                CREATE TABLE IF NOT EXISTS questions (
                qid INTEGER PRIMARY KEY AUTOINCREMENT,
                qtext TEXT NOT NULL,
                qtype TEXT NOT NULL,
                qlevel TEXT NOT NULL,
                qactive BOOLEAN NOT NULL
            );""")

        connection.commit()
        print("questions table created successfully")



        #creating True/False Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS true_false (
                qid INTEGER PRIMARY KEY,  -- Matches qid from questions
                correct BOOLEAN NOT NULL,
                FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                );""")

        connection.commit()

        print("true_false table created successfully")


        # creating Multiple choice Table
        cursor.execute("""
                    CREATE TABLE IF NOT EXISTS multiple_choice (
                        qid INTEGER PRIMARY KEY,  -- Matches qid from questions
                        option1 STRING NOT NULL,
                        option2 STRING NOT NULL,
                        option3 STRING NOT NULL,
                        option4 STRING NOT NULL,
                        answer INTEGER CHECK (answer BETWEEN 1 AND 4),
                        FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                        );""")

        connection.commit()
        connection.close()

        print("true_false table created successfully")

    except Exception as e:
        print(f"Error creating table: {e}")

def insert_sample_data():
    try:
        connection = sqlite3.connect("../backend/qa.db")
        cursor = connection.cursor()
        
        # Insert a true/false question
        cursor.execute("""
            INSERT INTO questions (qtext, qtype, qlevel, qactive)
            VALUES (?, ?, ?, ?)
        """, ("The sky is blue", "tf", "easy", True))
        
        # Get the qid of the inserted question
        qid = cursor.lastrowid
        
        # Insert the true/false answer
        cursor.execute("""
            INSERT INTO true_false (qid, correct)
            VALUES (?, ?)
        """, (qid, True))
        
        connection.commit()
        connection.close()
        print("Sample data inserted successfully")
        
    except Exception as e:
        print(f"Error inserting sample data: {e}")


if __name__ == "__main__":
    create_table()
    insert_sample_data()