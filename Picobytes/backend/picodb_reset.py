import sqlite3

def reset_tables():
    try:
        with sqlite3.connect("pico.db") as connection:
            cursor = connection.cursor()

            # Disable foreign key constraints to avoid issues
            cursor.execute("PRAGMA foreign_keys = OFF;")

            # Dropping tables
            tables = ["questions", "true_false", "multiple_choice", 'coding', 'code_blocks', "user_response", "user_free_response", 'user_multiple_choice', 'user_true_false', 'user_code_blocks', 'user_coding', 'free_response', 'users', 'question_analytics']
            for table in tables:
                cursor.execute(f"DROP TABLE IF EXISTS {table};")
                print(f"{table} table dropped")

            # Ensure changes are committed
            connection.commit()


    except Exception as e:
        print(f"Error dropping tables: {e}")

    connection.close()

if __name__ == "__main__":
    reset_tables()
