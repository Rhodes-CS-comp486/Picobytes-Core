import psycopg
from db_info import *

def update_database_schema():
    """Update the database schema to support code execution integration."""
    db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"
    
    try:
        # Connect to the database
        conn = psycopg.connect(db_url)
        cursor = conn.cursor()
        
        # Check if tests column exists in code_blocks table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='code_blocks' AND column_name='tests'
        """)
        
        if not cursor.fetchone():
            print("Adding 'tests' column to code_blocks table...")
            cursor.execute("""
                ALTER TABLE code_blocks 
                ADD COLUMN tests TEXT
            """)
            print("Added 'tests' column to code_blocks table")
        else:
            print("'tests' column already exists in code_blocks table")
        
        # Add additional columns to user_code_blocks table
        # Check if output column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_code_blocks' AND column_name='output'
        """)
        
        if not cursor.fetchone():
            print("Adding 'output' column to user_code_blocks table...")
            cursor.execute("""
                ALTER TABLE user_code_blocks 
                ADD COLUMN output TEXT
            """)
            print("Added 'output' column to user_code_blocks table")
        else:
            print("'output' column already exists in user_code_blocks table")
        
        # Check if compile_status column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_code_blocks' AND column_name='compile_status'
        """)
        
        if not cursor.fetchone():
            print("Adding 'compile_status' column to user_code_blocks table...")
            cursor.execute("""
                ALTER TABLE user_code_blocks 
                ADD COLUMN compile_status BOOLEAN
            """)
            print("Added 'compile_status' column to user_code_blocks table")
        else:
            print("'compile_status' column already exists in user_code_blocks table")
        
        # Check if run_status column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_code_blocks' AND column_name='run_status'
        """)
        
        if not cursor.fetchone():
            print("Adding 'run_status' column to user_code_blocks table...")
            cursor.execute("""
                ALTER TABLE user_code_blocks 
                ADD COLUMN run_status BOOLEAN
            """)
            print("Added 'run_status' column to user_code_blocks table")
        else:
            print("'run_status' column already exists in user_code_blocks table")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("Database schema update completed successfully")
        
    except Exception as e:
        print(f"Error updating database schema: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    update_database_schema() 