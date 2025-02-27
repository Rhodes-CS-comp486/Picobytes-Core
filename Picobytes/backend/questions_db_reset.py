import sqlite3

def reset_tables():
    try:
        with sqlite3.connect("qa.db") as connection:
            cursor = connection.cursor()

            # Disable foreign key constraints to avoid issues
            cursor.execute("PRAGMA foreign_keys = OFF;")

            # Dropping tables
            tables = ["questions", "true_false", "multiple_choice", "user_response", "user_free_response"]
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
