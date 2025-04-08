import psycopg
from db_info import *

def reset_tables():
    try:
        with psycopg.connect(
                f"host=dbclass.rhodescs.org dbname=practice user={DBUSER} password={DBPASS}") as connection:
            with connection.cursor() as cursor:  # Use 'with' to auto-close cursor

                # List of tables (drop in the correct order to avoid FK issues)
                tables = [
                    "questions", "true_false", "multiple_choice", "coding", "code_blocks",
                    "user_response", "user_free_response", "user_multiple_choice",
                    "user_true_false", "user_code_blocks", "user_coding", "free_response",
                    "users", "question_analytics"
                ]

                # Drop tables with CASCADE to remove dependencies
                for table in tables:
                    cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                    print(f"Dropped table: {table}")

                # Commit changes
                connection.commit()

    except Exception as e:
        print(f"Error dropping tables: {e}")


if __name__ == "__main__":
    reset_tables()
