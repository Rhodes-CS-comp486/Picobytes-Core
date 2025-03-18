import sqlite3
import os
import string
import random

from conda_index.index.convert_cache import db_path


class UserFuncs:

    def __init__(self, db_filename="users.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    ########################################
    ########## CREATING NEW USERS ##########
    ########################################

    def generate_unique_uid(self, cursor):
        while True:
            # Generate a random 10-character alphanumeric string
            uid = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            # Check if the UID already exists in the database
            cursor.execute("SELECT 1 FROM users WHERE uid = ?", (uid,))
            if not cursor.fetchone():
                return uid

    def add_user(self, uname, hashed_password, uadmin):
        try:
            connection = sqlite3.connect(self.db_path)
            cursor = connection.cursor()

            # Generate a unique UID
            uid = self.generate_unique_uid(cursor)

            # Insert the new user
            cursor.execute("INSERT INTO users (uid, uname, upassword, uadmin) VALUES (?, ?, ?, ?)",
                           (uid, uname, hashed_password, uadmin))
            connection.commit()
            print(f"User {uname} added successfully with UID: {uid}")
            connection.close()
            return uid

        except Exception as e:
            print(f"Error adding user: {e}")


    ##################################################
    ########## AUTHENTICATING CURRENT USERS ##########
    ##################################################

    def get_user_by_credentials(self, uname, hashed_password):
        conn = sqlite3.connect(self.db_path)  # Replace with your actual DB
        cursor = conn.cursor()
        cursor.execute("SELECT uid FROM users WHERE uname = ? AND upassword = ?", (uname, hashed_password))
        user = cursor.fetchone()
        conn.close()
        return user[0] if user else -1
    


    ##################################################
    ##########        ADMIN CHECK           ##########
    ##################################################

    def is_admin(self, uid):
        if not uid:
            return False
            
        try:
            connection = sqlite3.connect(self.db_path)
            cursor = connection.cursor()
            
            # Execute the query
            cursor.execute("SELECT uadmin FROM users WHERE uid = ?", (uid,))
            result = cursor.fetchone()
            
            # Close the connection
            connection.close()
            
            # Return True if user is admin (uadmin = 1), False otherwise
            return bool(result and result[0] == 1)
        except Exception as e:
            print(f"Error checking admin status: {e}")
            return False

if __name__ == '__main__':
    service = UserFuncs()
    service.add_user('will', 'testing123', 0)




