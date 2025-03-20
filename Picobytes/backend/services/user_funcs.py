import sqlite3
import os
import string
import random
import time



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
            currtime = time.time()

            # Insert the new user
            cursor.execute("INSERT INTO users (uid, uname, upassword, uadmin, ustreak, ulastanswertime, upoints) VALUES (?, ?, ?, ?, 1, ?, 0)",
                           (uid, uname, hashed_password, uadmin, currtime))
            connection.commit()
            print(f"User {uname} added successfully with UID: {uid}")
            connection.close()
            return uid

        except Exception as e:
            print(f"Error adding user: {e}")
    
    def get_users(self):
        try:
            connection = sqlite3.connect(self.db_path)
            cursor = connection.cursor()

            cursor.execute("SELECT uid, uname FROM users")

            names = cursor.fetchall()
            connection.close

            return names

        except Exception as e:
            print(f"Error fetching list of users: {e}")


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
    '''def is_admin(self, uid):
        """Check if a user is an admin"""
        if not uid:
            return False
            
        conn = self._get_db_connection()
        cursor = conn.execute(
            "SELECT is_admin FROM users WHERE uid = ?", 
            (uid,)
        )
        result = cursor.fetchone()
        conn.close()
        
        return bool(result and result['is_admin'] == 1)'''

    def change_password(self, uname, hashed_password):
        try:
            connection = sqlite3.connect(self.db_path)
            cursor = connection.cursor()

            cursor.execute("UPDATE users SET upassword = ? WHERE uname = ?", (uname, hashed_password))
            cursor.execute("select uid from users where uname = ?", (uname,))
            uid = cursor.fetchone()
            connection.commit()

            print(f"Successfully updated {uname}'s password")
            connection.close()
            return uid

        except Exception as e:
            print(f"Error adding user: {e}")
            return False
            


if __name__ == '__main__':
    service = UserFuncs()
    service.add_user('will', 'testing123', 0)




