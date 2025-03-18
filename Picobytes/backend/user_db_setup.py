import sqlite3


def create_table():
    try:
        # Creating users table
        connection = sqlite3.connect("../backend/users.db")
        cursor = connection.cursor()

        cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                uid TEXT PRIMARY KEY,
                uname TEXT NOT NULL,
                upassword TEXT NOT NULL,
                ustreak INTEGER NOT NULL,
                ulastanswer FLOAT NOT NULL,
                upoints INTEGER NOT NULL,
                uadmin INTEGER CHECK (uadmin BETWEEN 0 AND 1)
            );""")

        connection.commit()
        print("users table created successfully")
        connection.close()

    except Exception as e:
        print(f"Error creating table: {e}")

if __name__ == "__main__":
    create_table()
