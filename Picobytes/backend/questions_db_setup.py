import sqlite3

def create_table():
    try:

        #creating questions table
        connection = sqlite3.connect("qa.db")
        cursor = connection.cursor()

        cursor.execute("""
                CREATE TABLE IF NOT EXISTS questions (
                qid INTEGER PRIMARY KEY AUTOINCREMENT,
                qtext TEXT NOT NULL,
                qtype TEXT NOT NULL,
                qlevel TEXT NOT NULL,
                qtopic TEXT NOT NULL,
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

        print("true_false table created successfully")



##############################################
##########  STORING USER RESPONSES  ##########
##############################################



        #User responses
        cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_responses (
                        uid STRING PRIMARY KEY,
                        qid INTEGER NOT NULL
                        );""")

        connection.commit()

        print("user_response table created successfully")


        #User response to free_response
        cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_free_response (
                        uid STRING PRIMARY KEY,
                        qid INTEGER NOT NULL,
                        answer STRING NOT NULL
                        );""")

        connection.commit()
        connection.close()

        print("user free response table created successfully")

    except Exception as e:
        print(f"Error creating table: {e}")


if __name__ == "__main__":
  create_table()