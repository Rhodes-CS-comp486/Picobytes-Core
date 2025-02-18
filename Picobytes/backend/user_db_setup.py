import sqlite3


def create_table():
    try:

        #creating questions table
        connection = sqlite3.connect("../backend/users.db")
        cursor = connection.cursor()

        cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                uid INTEGER PRIMARY KEY AUTOINCREMENT,
                uname TEXT NOT NULL,
                upassword TEXT NOT NULL,
                uadmin INTEGER CHECK (uadmin between 0 AND 1)
            );""")

        connection.commit()
        print("users table created successfully")

        connection.close()


    except Exception as e:
        print(f"Error creating table: {e}")


if __name__ == "__main__":
    create_table()