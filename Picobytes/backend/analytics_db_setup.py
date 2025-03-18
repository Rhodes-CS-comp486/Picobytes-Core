import sqlite3

def create_analytics_db():
    try:
        # Connect to the analytics database
        connection = sqlite3.connect("analytics.db")
        cursor = connection.cursor()

        # Create the question_analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                qid INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_correct BOOLEAN NOT NULL
            );
        """)

        connection.commit()
        print("question_analytics table created successfully")
        connection.close()

    except Exception as e:
        print(f"Error creating analytics database: {e}")

if __name__ == "__main__":
    create_analytics_db() 