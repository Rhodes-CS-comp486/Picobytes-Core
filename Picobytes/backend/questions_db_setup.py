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

        print("multiple choice table created successfully")






        # creating code blocks choice Table
        cursor.execute("""
                           CREATE TABLE IF NOT EXISTS code_blocks (
                               qid INTEGER PRIMARY KEY,  -- Matches qid from questions
                               block1 STRING NOT NULL,
                               block2 STRING NOT NULL,
                               block3 STRING NOT NULL,
                               block4 STRING NOT NULL,
                               block5 STRING NOT NULL,
                               block6 STRING NOT NULL,
                               block7 STRING NOT NULL,
                               block8 STRING NOT NULL,
                               block9 STRING NOT NULL,
                               block10 STRING NOT NULL,
                               answer STRING NOT NULL,
                               FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                               );""")

        connection.commit()

        print("code_blocks table created successfully")






        # User response to multiple_choice
        cursor.execute("""
                                          CREATE TABLE IF NOT EXISTS coding (
                                              qid INTEGER PRIMARY KEY,
                                              starter STRING NOT NULL,
                                              FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                                              );""")

        connection.commit()



##############################################
##########  STORING USER RESPONSES  ##########
##############################################

        #User responses
        cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_responses (
                        uid STRING NOT NULL,
                        qid INTEGER NOT NULL,
                        PRIMARY KEY (uid, qid)
                        );""")

        connection.commit()

        print("user_response table created successfully")


        #User response to free_response
        cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_free_response (
                        uid STRING NOT NULL,
                        qid INTEGER NOT NULL,
                        answer STRING NOT NULL,
                        PRIMARY KEY (uid, qid)
                        );""")

        connection.commit()

        print("user free_response table created successfully")



        # User response to multiple_choice
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_multiple_choice (
                uid STRING NOT NULL,
                qid INTEGER NOT NULL,
                response STRING NOT NULL,
                correct INTEGER CHECK (correct BETWEEN 1 AND 4),
                PRIMARY KEY (uid, qid)
            );
        """)
        connection.commit()

        print("user multiple_choice table created successfully")



        # User response to multiple_choice
        cursor.execute("""
                                    CREATE TABLE IF NOT EXISTS user_coding (
                                        uid STRING NOT NULL,
                                        qid INTEGER NOT NULL,
                                        code STRING NOT NULL,
                                        PRIMARY KEY (uid, qid)
                                        );""")

        connection.commit()

        print("user coding table created successfully")




        # User response to multiple_choice
        cursor.execute("""
                                            CREATE TABLE IF NOT EXISTS user_code_blocks (
                                                uid STRING NOT NULL,
                                                qid INTEGER NOT NULL,
                                                submission STRING NOT NULL,
                                                correct STRING NOT NULL,
                                                PRIMARY KEY (uid, qid)
                                                );""")

        connection.commit()

        print("user_code_blocks table created successfully")


        # User response to multiple_choice
        cursor.execute("""
                                    CREATE TABLE IF NOT EXISTS user_true_false (
                                        uid STRING NOT NULL,
                                        qid INTEGER NOT NULL,
                                        response STRING NOT NULL,
                                        correct BOOLEAN NOT NULL,
                                        PRIMARY KEY (uid, qid)
                                        );""")

        connection.commit()
        connection.close()

        print("user true false table created successfully")




    except Exception as e:
        print(f"Error creating table: {e}")


if __name__ == "__main__":
  create_table()